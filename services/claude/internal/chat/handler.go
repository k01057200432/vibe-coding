package chat

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/exec"
	"strings"

	"git.gobau.dev/k00432/trading-claude/internal/claude"
	"git.gobau.dev/k00432/trading-claude/internal/store"
)

// Request is the chat API request body.
type Request struct {
	Prompt string `json:"prompt"`
	Mode   string `json:"mode"`
}

// Response is the chat API response body.
type Response struct {
	Content string `json:"content"`
	Error   string `json:"error,omitempty"`
}

// Handler handles one-shot Claude CLI chat requests.
type Handler struct {
	store  store.Repository
	logger *slog.Logger
}

// NewHandler creates a new chat handler.
func NewHandler(repo store.Repository, logger *slog.Logger) *Handler {
	return &Handler{store: repo, logger: logger}
}

// HandleChat processes POST /api/chat requests.
func (h *Handler) HandleChat(w http.ResponseWriter, r *http.Request) {
	var req Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, Response{Error: "invalid request body"})
		return
	}
	if req.Prompt == "" {
		writeJSON(w, http.StatusBadRequest, Response{Error: "prompt is required"})
		return
	}
	if req.Mode == "" {
		req.Mode = "advisory"
	}

	giteaToken, _ := h.store.GetSetting(r.Context(), "gitea_api_token")

	binary := "claude"
	if v := os.Getenv("CLAUDE_BINARY"); v != "" {
		binary = v
	}
	repoDir := "/home/trading/trading-platform"
	if v := os.Getenv("REPO_DIR"); v != "" {
		repoDir = v
	}

	hasGitea := giteaToken != ""
	sp := claude.BuildSystemPrompt(req.Mode, repoDir, hasGitea)
	tools := claude.AllowedTools(req.Mode, hasGitea)

	args := []string{
		"-p", req.Prompt,
		"--output-format", "text",
		"--system-prompt", sp,
		"--allowedTools", tools,
	}

	cmd := exec.CommandContext(r.Context(), binary, args...)

	// Always set working directory so Claude CLI picks up project MCP config.
	if info, err := os.Stat(repoDir); err == nil && info.IsDir() {
		cmd.Dir = repoDir
	}

	env := os.Environ()
	env = append(env, "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1")
	if hasGitea {
		env = append(env, "GITEA_TOKEN="+giteaToken)
	}
	cmd.Env = env

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	h.logger.Info("chat: executing", "mode", req.Mode)

	if err := cmd.Run(); err != nil {
		errMsg := strings.TrimSpace(stderr.String())
		h.logger.Error("chat: execution failed", "err", err, "stderr", errMsg)
		writeJSON(w, http.StatusInternalServerError, Response{Error: fmt.Sprintf("claude CLI: %s", errMsg)})
		return
	}

	writeJSON(w, http.StatusOK, Response{Content: stdout.String()})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}
