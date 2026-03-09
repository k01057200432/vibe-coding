package store

import (
	"context"
	_ "embed"
	"fmt"
	"time"

	"github.com/exaring/otelpgx"
	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed schema.sql
var schema string

// Postgres implements Repository using pgxpool.
type Postgres struct {
	pool *pgxpool.Pool
}

// New creates a new Postgres repository and runs auto-migration.
func New(ctx context.Context, dsn string) (*Postgres, error) {
	cfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, fmt.Errorf("parse postgres dsn: %w", err)
	}
	cfg.ConnConfig.Tracer = otelpgx.NewTracer()

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}

	if _, err := pool.Exec(ctx, schema); err != nil {
		pool.Close()
		return nil, err
	}

	return &Postgres{pool: pool}, nil
}

func (p *Postgres) SaveSession(ctx context.Context, s *Session) error {
	_, err := p.pool.Exec(ctx,
		`INSERT INTO claude_sessions (id, name, mode, teammate_mode, tmux_name, status, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		s.ID, s.Name, s.Mode, s.TeammateMode, s.TmuxName, s.Status, s.CreatedAt,
	)
	return err
}

func (p *Postgres) GetSession(ctx context.Context, id string) (*Session, error) {
	s := &Session{}
	err := p.pool.QueryRow(ctx,
		`SELECT id, name, mode, teammate_mode, tmux_name, status, created_at, stopped_at
		 FROM claude_sessions WHERE id = $1`, id,
	).Scan(&s.ID, &s.Name, &s.Mode, &s.TeammateMode, &s.TmuxName, &s.Status, &s.CreatedAt, &s.StoppedAt)
	if err != nil {
		return nil, err
	}
	return s, nil
}

func (p *Postgres) ListSessions(ctx context.Context) ([]Session, error) {
	rows, err := p.pool.Query(ctx,
		`SELECT id, name, mode, teammate_mode, tmux_name, status, created_at, stopped_at
		 FROM claude_sessions ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []Session
	for rows.Next() {
		var s Session
		if err := rows.Scan(&s.ID, &s.Name, &s.Mode, &s.TeammateMode, &s.TmuxName, &s.Status, &s.CreatedAt, &s.StoppedAt); err != nil {
			return nil, err
		}
		sessions = append(sessions, s)
	}
	return sessions, rows.Err()
}

func (p *Postgres) UpdateSessionStatus(ctx context.Context, id, status string) error {
	var stoppedAt *time.Time
	if status == "stopped" {
		now := time.Now()
		stoppedAt = &now
	}
	_, err := p.pool.Exec(ctx,
		`UPDATE claude_sessions SET status = $1, stopped_at = $2 WHERE id = $3`,
		status, stoppedAt, id,
	)
	return err
}

func (p *Postgres) DeleteSession(ctx context.Context, id string) error {
	_, err := p.pool.Exec(ctx, `DELETE FROM claude_sessions WHERE id = $1`, id)
	return err
}

func (p *Postgres) GetSetting(ctx context.Context, key string) (string, error) {
	var value string
	err := p.pool.QueryRow(ctx,
		`SELECT value FROM settings WHERE key = $1`, key,
	).Scan(&value)
	if err != nil {
		return "", err
	}
	return value, nil
}

func (p *Postgres) SaveSetting(ctx context.Context, key, value string) error {
	_, err := p.pool.Exec(ctx,
		`INSERT INTO settings (key, value) VALUES ($1, $2)
		 ON CONFLICT (key) DO UPDATE SET value = $2`,
		key, value,
	)
	return err
}

func (p *Postgres) Close() {
	p.pool.Close()
}
