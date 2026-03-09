#!/bin/bash
set -e

# Fix PVC ownership after UID migration
if [ -d "$HOME" ] && [ "$(stat -c %u "$HOME" 2>/dev/null)" != "$(id -u)" ]; then
  echo "Fixing PVC ownership ($(stat -c %u "$HOME") → $(id -u))..."
  sudo chown -R "$(id -u):$(id -g)" "$HOME"
fi

# Initialize PVC home directory (first mount only)
if [ ! -f "$HOME/.claude.json" ]; then
  echo '{"hasCompletedOnboarding":true}' > "$HOME/.claude.json"
fi

# Install Claude CLI if missing or broken
if ! claude --version &>/dev/null; then
  echo "Installing Claude CLI (missing or broken binary)..."
  rm -f "$HOME/.local/bin/claude"
  curl -fsSL https://claude.ai/install.sh | bash
fi

# Ensure .profile for bash login sessions
cat > "$HOME/.profile" <<'PROFILE'
export PATH="$HOME/.local/bin:/usr/local/go/bin:$HOME/go/bin:$PATH"
export GOROOT=/usr/local/go
export GOPATH=$HOME/go
export SHELL=/bin/bash
export LANG=C.UTF-8
PROFILE
cp "$HOME/.profile" "$HOME/.bashrc"

# Git config (idempotent)
git config --global user.email "claude@vibe-coding.local"
git config --global user.name "Claude Code"

# Ensure workspace directory exists
mkdir -p /workspace

exec tini -- /app/claude-server "$@"
