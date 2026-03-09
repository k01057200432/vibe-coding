#!/bin/bash
set -e

# Fix PVC ownership after UID migration
if [ -d "$HOME" ] && [ "$(stat -c %u "$HOME" 2>/dev/null)" != "$(id -u)" ]; then
  echo "Fixing PVC ownership ($(stat -c %u "$HOME") → $(id -u))..."
  sudo chown -R "$(id -u):$(id -g)" "$HOME"
fi

# Skip onboarding only when OAuth token is set (Max/Team/Enterprise)
# Without token, let CLI show its own onboarding/login flow
if [ -n "$CLAUDE_CODE_OAUTH_TOKEN" ]; then
  if [ ! -f "$HOME/.claude.json" ]; then
    echo '{"hasCompletedOnboarding":true,"theme":"dark"}' > "$HOME/.claude.json"
  else
    python3 -c "
import json
with open('$HOME/.claude.json') as f:
    d = json.load(f)
if not d.get('hasCompletedOnboarding'):
    d['hasCompletedOnboarding'] = True
    d.setdefault('theme', 'dark')
    with open('$HOME/.claude.json', 'w') as f:
        json.dump(d, f, indent=2)
" 2>/dev/null || true
  fi
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

# Auth setup: OAuth token required (Max/Team/Enterprise or Pro via claude login)
if [ -n "$CLAUDE_CODE_OAUTH_TOKEN" ]; then
  echo "Registering Claude OAuth token via setup-token..."
  timeout 10 bash -c 'echo "$CLAUDE_CODE_OAUTH_TOKEN" | claude setup-token' 2>&1 || true
fi

# Ensure workspace directory exists
mkdir -p /workspace

exec tini -- /app/claude-server "$@"
