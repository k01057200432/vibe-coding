package server

import (
	"log/slog"
	"net/http"
	"os"

	"github.com/k00432/vibe-coding/services/claude/internal/chat"
	"github.com/k00432/vibe-coding/services/claude/internal/session"
	"github.com/k00432/vibe-coding/services/claude/internal/store"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

// New creates a chi router with all routes registered.
func New(mgr *session.Manager, repo store.Repository, logger *slog.Logger) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Recoverer)
	r.Use(middleware.RealIP)

	sessHandler := session.NewHandler(mgr, logger)
	chatHandler := chat.NewHandler(repo, logger)

	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	r.Get("/claude/api/auth-status", func(w http.ResponseWriter, r *http.Request) {
		ok := os.Getenv("CLAUDE_CODE_OAUTH_TOKEN") != ""
		if !ok {
			// Also check credentials file written by `claude login`
			home, err := os.UserHomeDir()
			if err == nil {
				_, err = os.Stat(home + "/.claude/.credentials.json")
				ok = err == nil
			}
		}
		w.Header().Set("Content-Type", "application/json")
		if ok {
			w.Write([]byte(`{"ok":true}`))
		} else {
			w.Write([]byte(`{"ok":false}`))
		}
	})

	r.Route("/claude", func(r chi.Router) {
		r.Use(requireSession)

		r.Get("/", handleChatPage)
		r.Get("/chat", handleChatPage)

		r.Get("/fonts/{file}", handleFontFile)

		r.Route("/api", func(r chi.Router) {
			r.Get("/sessions", sessHandler.HandleSessionList)
			r.Post("/sessions", sessHandler.HandleSessionCreate)
			r.Get("/sessions/{id}", sessHandler.HandleSessionGet)
			r.Delete("/sessions/{id}", sessHandler.HandleSessionDelete)
			r.Post("/chat", chatHandler.HandleChat)
		})

		r.Get("/ws/session/{id}", sessHandler.HandleSession)
	})

	return r
}
