package store

import (
	"context"
	"database/sql"
	_ "embed"
	"fmt"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

//go:embed schema.sql
var schema string

// SQLite implements Repository using database/sql with SQLite.
type SQLite struct {
	db *sql.DB
}

// NewSQLite creates a new SQLite repository and runs auto-migration.
func NewSQLite(dbPath string) (*SQLite, error) {
	db, err := sql.Open("sqlite3", dbPath+"?_journal_mode=WAL&_busy_timeout=5000")
	if err != nil {
		return nil, fmt.Errorf("open sqlite: %w", err)
	}
	if err := db.Ping(); err != nil {
		db.Close()
		return nil, err
	}

	if _, err := db.Exec(schema); err != nil {
		db.Close()
		return nil, fmt.Errorf("apply schema: %w", err)
	}

	return &SQLite{db: db}, nil
}

func (s *SQLite) SaveSession(ctx context.Context, sess *Session) error {
	_, err := s.db.ExecContext(ctx,
		`INSERT INTO claude_sessions (id, name, mode, status, created_at) VALUES (?, ?, ?, ?, ?)`,
		sess.ID, sess.Name, sess.Mode, sess.Status, sess.CreatedAt,
	)
	return err
}

func (s *SQLite) GetSession(ctx context.Context, id string) (*Session, error) {
	sess := &Session{}
	err := s.db.QueryRowContext(ctx,
		`SELECT id, name, mode, status, created_at, stopped_at FROM claude_sessions WHERE id = ?`, id,
	).Scan(&sess.ID, &sess.Name, &sess.Mode, &sess.Status, &sess.CreatedAt, &sess.StoppedAt)
	if err != nil {
		return nil, err
	}
	return sess, nil
}

func (s *SQLite) ListSessions(ctx context.Context) ([]Session, error) {
	rows, err := s.db.QueryContext(ctx,
		`SELECT id, name, mode, status, created_at, stopped_at FROM claude_sessions ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []Session
	for rows.Next() {
		var sess Session
		if err := rows.Scan(&sess.ID, &sess.Name, &sess.Mode, &sess.Status, &sess.CreatedAt, &sess.StoppedAt); err != nil {
			return nil, err
		}
		sessions = append(sessions, sess)
	}
	return sessions, rows.Err()
}

func (s *SQLite) UpdateSessionStatus(ctx context.Context, id, status string) error {
	var stoppedAt *time.Time
	if status == "stopped" {
		now := time.Now()
		stoppedAt = &now
	}
	_, err := s.db.ExecContext(ctx,
		`UPDATE claude_sessions SET status = ?, stopped_at = ? WHERE id = ?`,
		status, stoppedAt, id,
	)
	return err
}

func (s *SQLite) DeleteSession(ctx context.Context, id string) error {
	_, err := s.db.ExecContext(ctx, `DELETE FROM claude_sessions WHERE id = ?`, id)
	return err
}

func (s *SQLite) GetSetting(ctx context.Context, key string) (string, error) {
	var value string
	err := s.db.QueryRowContext(ctx,
		`SELECT value FROM settings WHERE key = ?`, key,
	).Scan(&value)
	if err != nil {
		return "", err
	}
	return value, nil
}

func (s *SQLite) SaveSetting(ctx context.Context, key, value string) error {
	_, err := s.db.ExecContext(ctx,
		`INSERT INTO settings (key, value) VALUES (?, ?)
		 ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
		key, value,
	)
	return err
}

func (s *SQLite) Close() {
	s.db.Close()
}
