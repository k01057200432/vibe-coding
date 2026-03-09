package main

import (
	"context"
	"flag"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/k00432/vibe-coding/services/claude/internal/server"
	"github.com/k00432/vibe-coding/services/claude/internal/session"
	"github.com/k00432/vibe-coding/services/claude/internal/store"
)

func main() {
	var (
		dbPath = flag.String("db", "/home/coder/sessions.db", "SQLite database file path")
		addr   = flag.String("addr", ":8081", "listen address")
	)
	flag.Parse()

	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	repo, err := store.NewSQLite(*dbPath)
	if err != nil {
		logger.Error("failed to open database", "err", err)
		os.Exit(1)
	}
	defer repo.Close()

	mgr := session.NewManager(repo, logger)
	router := server.New(mgr, repo, logger)

	srv := &http.Server{
		Addr:    *addr,
		Handler: router,
	}

	go func() {
		logger.Info("server starting", "addr", *addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("server failed", "err", err)
			os.Exit(1)
		}
	}()

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
	<-sig

	logger.Info("shutting down")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	srv.Shutdown(shutdownCtx)
}
