package session

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/exec"
	"sync"
	"time"

	"github.com/creack/pty/v2"
	"github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"
)

const (
	pingInterval = 15 * time.Second
	pongWait     = 30 * time.Second
	writeWait    = 10 * time.Second
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Handler handles WebSocket terminal connections.
type Handler struct {
	manager *Manager
	logger  *slog.Logger
}

// NewHandler creates a new WebSocket handler.
func NewHandler(mgr *Manager, logger *slog.Logger) *Handler {
	return &Handler{manager: mgr, logger: logger}
}

type resizeMsg struct {
	Type string `json:"type"`
	Cols uint16 `json:"cols"`
	Rows uint16 `json:"rows"`
}

// connWriter serializes all writes to a websocket.Conn.
type connWriter struct {
	mu   sync.Mutex
	conn *websocket.Conn
}

func (cw *connWriter) write(msgType int, data []byte) error {
	cw.mu.Lock()
	defer cw.mu.Unlock()
	cw.conn.SetWriteDeadline(time.Now().Add(writeWait))
	return cw.conn.WriteMessage(msgType, data)
}

func (cw *connWriter) ping() error {
	cw.mu.Lock()
	defer cw.mu.Unlock()
	cw.conn.SetWriteDeadline(time.Now().Add(writeWait))
	return cw.conn.WriteMessage(websocket.PingMessage, nil)
}

// HandleSession upgrades to WebSocket and relays to the session PTY.
func (h *Handler) HandleSession(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing session id", http.StatusBadRequest)
		return
	}

	sess, err := h.manager.Get(r.Context(), id)
	if err != nil {
		http.Error(w, "session not found", http.StatusNotFound)
		return
	}
	if sess.Status != "running" {
		http.Error(w, "session not running", http.StatusConflict)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		h.logger.Error("websocket upgrade failed", "err", err)
		return
	}
	defer conn.Close()

	cw := &connWriter{conn: conn}
	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	// Pong handler extends read deadline
	conn.SetReadDeadline(time.Now().Add(pongWait))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	// Ping ticker — keepalive
	go func() {
		ticker := time.NewTicker(pingInterval)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				if err := cw.ping(); err != nil {
					cancel()
					return
				}
			case <-ctx.Done():
				return
			}
		}
	}()

	if sess.TeammateMode == "in-process" {
		h.handleInProcess(ctx, cancel, id, cw, conn)
	} else {
		h.handleTmux(ctx, cancel, id, sess, cw, conn)
	}
}

// handleInProcess handles WebSocket relay for in-process sessions using the broadcaster pattern.
func (h *Handler) handleInProcess(ctx context.Context, cancel context.CancelFunc, id string, cw *connWriter, conn *websocket.Conn) {
	sub, replay, writePtmx, err := h.manager.Subscribe(id)
	if err != nil {
		h.logger.Error("subscribe failed", "id", id, "err", err)
		conn.WriteMessage(websocket.TextMessage, []byte("Failed to subscribe: "+err.Error()))
		return
	}
	defer h.manager.Unsubscribe(id, sub)

	// Send replay buffer (recent output history)
	if len(replay) > 0 {
		if err := cw.write(websocket.BinaryMessage, replay); err != nil {
			return
		}
	}

	// Subscriber channel → WebSocket
	go func() {
		for {
			select {
			case data, ok := <-sub.Ch:
				if !ok {
					cancel()
					return
				}
				if err := cw.write(websocket.BinaryMessage, data); err != nil {
					cancel()
					return
				}
			case <-ctx.Done():
				return
			}
		}
	}()

	// WebSocket → PTY
	go func() {
		for {
			msgType, data, err := conn.ReadMessage()
			if err != nil {
				cancel()
				return
			}
			if msgType == websocket.TextMessage {
				var resize resizeMsg
				if json.Unmarshal(data, &resize) == nil && resize.Type == "resize" {
					pty.Setsize(writePtmx, &pty.Winsize{
						Cols: resize.Cols,
						Rows: resize.Rows,
					})
					continue
				}
			}
			if _, err := writePtmx.Write(data); err != nil {
				cancel()
				return
			}
		}
	}()

	<-ctx.Done()
	h.logger.Info("websocket session ended (in-process)", "id", id)
}

// handleTmux handles WebSocket relay for tmux sessions with reattach support.
func (h *Handler) handleTmux(ctx context.Context, cancel context.CancelFunc, id string, sess *Session, cw *connWriter, conn *websocket.Conn) {
	ptmx, cmd, err := h.manager.Attach(sess)
	if err != nil {
		h.logger.Error("attach failed", "id", id, "err", err)
		conn.WriteMessage(websocket.TextMessage, []byte("Failed to attach: "+err.Error()))
		return
	}

	var ptyMu sync.Mutex
	var closeReason string

	// PTY → WebSocket (with reattach on transient error)
	go func() {
		buf := make([]byte, 32768)
		for {
			ptyMu.Lock()
			currentPtmx := ptmx
			currentCmd := cmd
			ptyMu.Unlock()

			n, readErr := currentPtmx.Read(buf)
			if n > 0 {
				if werr := cw.write(websocket.BinaryMessage, buf[:n]); werr != nil {
					closeReason = fmt.Sprintf("pty→ws write: %v", werr)
					cancel()
					return
				}
			}
			if readErr != nil {
				if h.manager.isTmuxAlive(sess.TmuxName) {
					h.logger.Info("pty read error but tmux alive, reattaching",
						"id", id, "err", readErr)
					currentPtmx.Close()
					detachCmd(currentCmd)
					time.Sleep(500 * time.Millisecond)

					newPtmx, newCmd, attachErr := h.manager.Attach(sess)
					if attachErr == nil {
						ptyMu.Lock()
						ptmx = newPtmx
						cmd = newCmd
						ptyMu.Unlock()
						continue
					}
					h.logger.Warn("reattach failed", "id", id, "err", attachErr)
				}
				closeReason = fmt.Sprintf("pty read: %v", readErr)
				cancel()
				return
			}
		}
	}()

	// WebSocket → PTY
	go func() {
		for {
			msgType, data, err := conn.ReadMessage()
			if err != nil {
				closeReason = fmt.Sprintf("ws read: %v", err)
				cancel()
				return
			}

			ptyMu.Lock()
			currentPtmx := ptmx
			ptyMu.Unlock()

			if msgType == websocket.TextMessage {
				var resize resizeMsg
				if json.Unmarshal(data, &resize) == nil && resize.Type == "resize" {
					pty.Setsize(currentPtmx, &pty.Winsize{
						Cols: resize.Cols,
						Rows: resize.Rows,
					})
					continue
				}
			}

			if _, err := currentPtmx.Write(data); err != nil {
				closeReason = fmt.Sprintf("pty write: %v", err)
				cancel()
				return
			}
		}
	}()

	<-ctx.Done()

	ptyMu.Lock()
	finalPtmx := ptmx
	finalCmd := cmd
	ptyMu.Unlock()

	finalPtmx.Close()
	detachCmd(finalCmd)

	h.logger.Info("websocket session ended (tmux)", "id", id, "reason", closeReason)
}

// HandleSessionList handles GET /api/sessions.
func (h *Handler) HandleSessionList(w http.ResponseWriter, r *http.Request) {
	sessions, err := h.manager.List(r.Context())
	if err != nil {
		h.logger.Error("list sessions failed", "err", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if sessions == nil {
		sessions = []Session{}
	}
	writeJSON(w, sessions)
}

// HandleSessionCreate handles POST /api/sessions.
func (h *Handler) HandleSessionCreate(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name         string `json:"name"`
		Mode         string `json:"mode"`
		TeammateMode string `json:"teammate_mode"`
		Resume       string `json:"resume"` // "" | "continue" | "resume"
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.Name == "" {
		req.Name = "untitled"
	}
	if req.Mode == "" {
		req.Mode = "advisory"
	}
	if req.Mode != "admin" && req.Mode != "advisory" && req.Mode != "shell" {
		http.Error(w, "mode must be admin, advisory, or shell", http.StatusBadRequest)
		return
	}
	if req.TeammateMode == "" {
		req.TeammateMode = "in-process"
	}
	if req.TeammateMode != "tmux" && req.TeammateMode != "in-process" {
		http.Error(w, "teammate_mode must be tmux or in-process", http.StatusBadRequest)
		return
	}
	if req.Resume != "" && req.Resume != "continue" && req.Resume != "resume" {
		http.Error(w, "resume must be empty, continue, or resume", http.StatusBadRequest)
		return
	}

	sess, err := h.manager.Create(r.Context(), req.Name, req.Mode, req.TeammateMode, req.Resume)
	if err != nil {
		h.logger.Error("create session failed", "err", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	writeJSON(w, sess)
}

// HandleSessionGet handles GET /api/sessions/{id}.
func (h *Handler) HandleSessionGet(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	sess, err := h.manager.Get(r.Context(), id)
	if err != nil {
		http.Error(w, "session not found", http.StatusNotFound)
		return
	}
	writeJSON(w, sess)
}

// HandleSessionDelete handles DELETE /api/sessions/{id}.
func (h *Handler) HandleSessionDelete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.manager.Kill(r.Context(), id); err != nil {
		h.logger.Error("kill session failed", "id", id, "err", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// detachCmd gracefully detaches a tmux attach process.
func detachCmd(cmd *exec.Cmd) {
	if cmd == nil || cmd.Process == nil {
		return
	}
	cmd.Process.Signal(os.Interrupt)
	waitDone := make(chan struct{})
	go func() { cmd.Wait(); close(waitDone) }()
	select {
	case <-waitDone:
	case <-time.After(3 * time.Second):
		cmd.Process.Kill()
	}
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}
