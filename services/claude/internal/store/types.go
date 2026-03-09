package store

import "time"

// Session represents a Claude CLI session.
type Session struct {
	ID             string     `json:"id"`
	Name           string     `json:"name"`
	Mode           string     `json:"mode"`            // admin | advisory | shell
	Status         string     `json:"status"`          // running | stopped
	CurrentCommand string     `json:"current_command"` // display label (JSON only)
	CreatedAt      time.Time  `json:"created_at"`
	StoppedAt      *time.Time `json:"stopped_at,omitempty"`
}
