package server

import (
	"log/slog"
	"net/http"

	"git.gobau.dev/k00432/trading-claude/internal/chat"
	"git.gobau.dev/k00432/trading-claude/internal/session"
	"git.gobau.dev/k00432/trading-claude/internal/store"
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

	r.Route("/claude", func(r chi.Router) {
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
