package store

import "time"

// Session represents a Claude CLI tmux session.
type Session struct {
	ID             string     `json:"id"`
	Name           string     `json:"name"`
	Mode           string     `json:"mode"`            // admin | advisory | shell
	TeammateMode   string     `json:"teammate_mode"`   // tmux | in-process
	TmuxName       string     `json:"tmux_name"`
	Status         string     `json:"status"`          // running | stopped
	CurrentCommand string     `json:"current_command"` // tmux pane current command (JSON only)
	CreatedAt      time.Time  `json:"created_at"`
	StoppedAt      *time.Time `json:"stopped_at,omitempty"`
}
