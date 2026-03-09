package session

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"time"

	"git.gobau.dev/k00432/trading-claude/internal/claude"
	"git.gobau.dev/k00432/trading-claude/internal/store"
	"github.com/creack/pty/v2"
	"github.com/google/uuid"
)

const (
	ringBufMax         = 65536 // 64KB per-session output buffer
	sessionGracePeriod = 60 * time.Second
)

// ringBuf is a thread-safe circular byte buffer.
type ringBuf struct {
	mu   sync.Mutex
	data []byte
	max  int
}

func (r *ringBuf) Write(p []byte) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.data = append(r.data, p...)
	if len(r.data) > r.max {
		r.data = r.data[len(r.data)-r.max:]
	}
}

func (r *ringBuf) Snapshot() []byte {
	r.mu.Lock()
	defer r.mu.Unlock()
	snap := make([]byte, len(r.data))
	copy(snap, r.data)
	return snap
}

// InProcSub is a subscriber to an in-process session's output.
type InProcSub struct {
	Ch chan []byte
}

// inProc holds a directly-spawned Claude CLI process (no tmux).
type inProc struct {
	ptmx *os.File
	cmd  *exec.Cmd
	done chan struct{} // closed when process exits

	subMu sync.Mutex
	buf   ringBuf
	subs  map[*InProcSub]struct{}
}

// broadcast reads from PTY and fans out to all subscribers + ring buffer.
// Runs until PTY read error (process exit). Closes all subscriber channels on exit.
func (p *inProc) broadcast() {
	buf := make([]byte, 32768)
	for {
		n, err := p.ptmx.Read(buf)
		if n > 0 {
			data := make([]byte, n)
			copy(data, buf[:n])
			p.buf.Write(data)

			p.subMu.Lock()
			for sub := range p.subs {
				select {
				case sub.Ch <- data:
				default: // slow consumer, drop
				}
			}
			p.subMu.Unlock()
		}
		if err != nil {
			p.subMu.Lock()
			for sub := range p.subs {
				close(sub.Ch)
				delete(p.subs, sub)
			}
			p.subMu.Unlock()
			return
		}
	}
}

// Manager manages Claude CLI sessions (in-process PTY).
type Manager struct {
	store     store.Repository
	repoDir   string
	binary    string
	logger    *slog.Logger
	cloneOnce sync.Once

	mu    sync.Mutex
	procs map[string]*inProc
}

// NewManager creates a new session manager.
func NewManager(repo store.Repository, logger *slog.Logger) *Manager {
	repoDir := "/home/trading/trading"
	if v := os.Getenv("REPO_DIR"); v != "" {
		repoDir = v
	}
	binary := "claude"
	if v := os.Getenv("CLAUDE_BINARY"); v != "" {
		binary = v
	}

	// 서비스 시작 시 MCP 서버 등록
	claude.SetupMCPServers()

	return &Manager{
		store:   repo,
		repoDir: repoDir,
		binary:  binary,
		logger:  logger,
		procs:   make(map[string]*inProc),
	}
}

// ensureRepo clones the monorepo if it doesn't exist yet.
func (m *Manager) ensureRepo(ctx context.Context) {
	m.cloneOnce.Do(func() {
		gitDir := filepath.Join(m.repoDir, ".git")
		if _, err := os.Stat(gitDir); err == nil {
			m.logger.Info("repo already exists", "dir", m.repoDir)
			return
		}

		giteaToken, _ := m.store.GetSetting(ctx, "gitea_api_token")
		if giteaToken == "" {
			os.MkdirAll(m.repoDir, 0775)
			m.logger.Warn("no gitea token, created empty repo dir")
			return
		}

		home := os.Getenv("HOME")
		if home == "" {
			home = "/home/trading"
		}
		credFile := filepath.Join(home, ".git-credentials")
		os.WriteFile(credFile, []byte(fmt.Sprintf("https://%s:x-oauth-basic@git.gobau.dev\n", giteaToken)), 0600)
		exec.Command("git", "config", "--global", "credential.helper", "store").Run()

		m.logger.Info("cloning repo", "dir", m.repoDir)
		cmd := exec.CommandContext(ctx, "git", "clone", "--recurse-submodules",
			"https://git.gobau.dev/hw.kim/trading.git", m.repoDir)
		if output, err := cmd.CombinedOutput(); err != nil {
			m.logger.Error("repo clone failed", "err", err, "output", string(output))
			return
		}

		m.logger.Info("repo cloned", "dir", m.repoDir)
	})
}

// Create starts a new session running Claude CLI via in-process PTY.
func (m *Manager) Create(ctx context.Context, name, mode, resumeMode string) (*store.Session, error) {
	id := uuid.New().String()

	m.ensureRepo(ctx)

	giteaToken, _ := m.store.GetSetting(ctx, "gitea_api_token")
	oauthToken := m.extractOAuthToken(ctx)

	script := claude.BuildClaudeCmd(mode, giteaToken, oauthToken, m.repoDir, m.binary, resumeMode)

	scriptPath := filepath.Join(os.TempDir(), fmt.Sprintf("claude-%s.sh", id[:8]))
	if err := os.WriteFile(scriptPath, []byte("#!/bin/bash\n"+script), 0755); err != nil {
		return nil, fmt.Errorf("write script: %w", err)
	}

	var procCmd *exec.Cmd
	if mode == "advisory" {
		procCmd = exec.Command("sudo", "-u", "trading-advisory", "-H",
			"env",
			"PATH=/home/trading/.local/bin:/usr/local/bin:/usr/bin:/bin",
			"HOME=/home/trading-advisory",
			"TERM=xterm-256color",
			"SHELL=/bin/bash",
			"bash", scriptPath,
		)
	} else {
		procCmd = exec.Command("bash", scriptPath)
	}
	procCmd.Env = append(os.Environ(), "TERM=xterm-256color", "SHELL=/bin/bash")
	ptmx, err := pty.StartWithSize(procCmd, &pty.Winsize{Cols: 200, Rows: 50})
	if err != nil {
		return nil, fmt.Errorf("pty start: %w", err)
	}

	sess := &store.Session{
		ID:        id,
		Name:      name,
		Mode:      mode,
		Status:    "running",
		CreatedAt: time.Now(),
	}
	if err := m.store.SaveSession(ctx, sess); err != nil {
		ptmx.Close()
		procCmd.Process.Kill()
		return nil, fmt.Errorf("save session: %w", err)
	}

	p := &inProc{
		ptmx: ptmx,
		cmd:  procCmd,
		done: make(chan struct{}),
		subs: make(map[*InProcSub]struct{}),
		buf:  ringBuf{max: ringBufMax},
	}

	go func() {
		procCmd.Wait()
		close(p.done)
	}()

	go p.broadcast()

	m.mu.Lock()
	m.procs[id] = p
	m.mu.Unlock()

	m.logger.Info("session created", "id", id, "name", name, "mode", mode)
	return sess, nil
}

// Subscribe registers a subscriber to an in-process session's output.
// Returns the subscriber, replay buffer, and PTY file for writing input.
func (m *Manager) Subscribe(id string) (*InProcSub, []byte, *os.File, error) {
	m.mu.Lock()
	p, ok := m.procs[id]
	m.mu.Unlock()
	if !ok {
		return nil, nil, nil, fmt.Errorf("session %s not found", id)
	}

	select {
	case <-p.done:
		return nil, nil, nil, fmt.Errorf("session %s has exited", id)
	default:
	}

	sub := &InProcSub{Ch: make(chan []byte, 256)}
	replay := p.buf.Snapshot()

	p.subMu.Lock()
	p.subs[sub] = struct{}{}
	p.subMu.Unlock()

	return sub, replay, p.ptmx, nil
}

// Unsubscribe removes a subscriber from an in-process session.
func (m *Manager) Unsubscribe(id string, sub *InProcSub) {
	m.mu.Lock()
	p, ok := m.procs[id]
	m.mu.Unlock()
	if !ok {
		return
	}

	p.subMu.Lock()
	delete(p.subs, sub)
	p.subMu.Unlock()
}

// List returns all sessions, syncing status with in-process liveness.
func (m *Manager) List(ctx context.Context) ([]store.Session, error) {
	sessions, err := m.store.ListSessions(ctx)
	if err != nil {
		return nil, err
	}

	alive := sessions[:0]
	for i := range sessions {
		if sessions[i].Status == "running" {
			if !m.isInProcAlive(sessions[i].ID) {
				if time.Since(sessions[i].CreatedAt) < sessionGracePeriod {
					alive = append(alive, sessions[i])
					continue
				}
				m.logger.Info("auto-deleting stopped session", "id", sessions[i].ID)
				m.cleanupInProc(sessions[i].ID)
				m.store.DeleteSession(ctx, sessions[i].ID)
				continue
			}
			sessions[i].CurrentCommand = "claude"
		}
		if sessions[i].Status == "stopped" {
			m.store.DeleteSession(ctx, sessions[i].ID)
			continue
		}
		alive = append(alive, sessions[i])
	}
	return alive, nil
}

// Get returns a single session by ID.
func (m *Manager) Get(ctx context.Context, id string) (*store.Session, error) {
	sess, err := m.store.GetSession(ctx, id)
	if err != nil {
		return nil, err
	}

	if sess.Status == "running" {
		if !m.isInProcAlive(sess.ID) {
			sess.Status = "stopped"
			m.cleanupInProc(sess.ID)
			m.store.UpdateSessionStatus(ctx, sess.ID, "stopped")
		} else {
			sess.CurrentCommand = "claude"
		}
	}
	return sess, nil
}

// Kill terminates a session and removes it from DB.
func (m *Manager) Kill(ctx context.Context, id string) error {
	m.cleanupInProc(id)

	if err := m.store.DeleteSession(ctx, id); err != nil {
		return fmt.Errorf("delete session: %w", err)
	}

	m.logger.Info("session killed", "id", id)
	return nil
}

// RepoDir returns the configured repo directory.
func (m *Manager) RepoDir() string { return m.repoDir }

// Binary returns the configured claude binary path.
func (m *Manager) Binary() string { return m.binary }

// isInProcAlive checks if an in-process session is still running.
func (m *Manager) isInProcAlive(id string) bool {
	m.mu.Lock()
	p, ok := m.procs[id]
	m.mu.Unlock()
	if !ok {
		return false
	}
	select {
	case <-p.done:
		return false
	default:
		return true
	}
}

// cleanupInProc kills and cleans up an in-process session.
func (m *Manager) cleanupInProc(id string) {
	m.mu.Lock()
	p, ok := m.procs[id]
	if ok {
		delete(m.procs, id)
	}
	m.mu.Unlock()
	if !ok {
		return
	}
	p.cmd.Process.Kill()
	<-p.done
	p.ptmx.Close()
}

// extractOAuthToken reads the Claude OAuth token from DB settings.
func (m *Manager) extractOAuthToken(ctx context.Context) string {
	token, _ := m.store.GetSetting(ctx, "claude_code_oauth_token")
	return token
}
