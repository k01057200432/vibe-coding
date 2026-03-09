package session

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
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

	h.handleInProcess(ctx, cancel, id, cw, conn)
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
	h.logger.Info("websocket session ended", "id", id)
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
		Name   string `json:"name"`
		Mode   string `json:"mode"`
		Resume string `json:"resume"` // "" | "continue" | "resume"
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
	if req.Resume != "" && req.Resume != "continue" && req.Resume != "resume" {
		http.Error(w, "resume must be empty, continue, or resume", http.StatusBadRequest)
		return
	}

	sess, err := h.manager.Create(r.Context(), req.Name, req.Mode, req.Resume)
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

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}
