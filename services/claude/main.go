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

	"git.gobau.dev/k00432/trading-claude/internal/server"
	"git.gobau.dev/k00432/trading-claude/internal/session"
	"git.gobau.dev/k00432/trading-claude/internal/store"
	totelotel "git.gobau.dev/k00432/trading-claude/pkg/otel"
)

func main() {
	var (
		dsn  = flag.String("dsn", "", "PostgreSQL connection string")
		addr = flag.String("addr", ":8081", "listen address")
	)
	flag.Parse()

	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	if *dsn == "" {
		*dsn = os.Getenv("DATABASE_URL")
	}
	if *dsn == "" {
		logger.Error("dsn is required (--dsn or DATABASE_URL)")
		os.Exit(1)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// OpenTelemetry
	shutdownTracer, err := totelotel.Init(ctx, "trading-claude")
	if err != nil {
		logger.Error("failed to init otel", "err", err)
		os.Exit(1)
	}
	defer shutdownTracer(context.Background())

	repo, err := store.New(ctx, *dsn)
	if err != nil {
		logger.Error("failed to connect to database", "err", err)
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
