#!/bin/bash
set -e

# Fix PVC ownership after UID migration (Alpine uid=100 → Debian uid=1000)
if [ -d "$HOME" ] && [ "$(stat -c %u "$HOME" 2>/dev/null)" != "$(id -u)" ]; then
  echo "Fixing PVC ownership ($(stat -c %u "$HOME") → $(id -u))..."
  sudo chown -R "$(id -u):$(id -g)" "$HOME"
fi

# Initialize PVC home directory (first mount only)
if [ ! -f "$HOME/.claude.json" ]; then
  echo '{"hasCompletedOnboarding":true}' > "$HOME/.claude.json"
fi

if [ ! -f "$HOME/.tmux.conf" ]; then
  cat > "$HOME/.tmux.conf" <<'TMUX'
set -g history-limit 50000
set -g mouse on
set -g default-terminal "tmux-256color"
set -gq allow-passthrough on
TMUX
fi

# Install Claude CLI if missing or broken (PVC may have stale Alpine/musl binary)
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
git config --global user.email "claude@trading.gobau.dev"
git config --global user.name "Claude Code"

# Setup MCP servers + plugins
PLATFORM_DIR="$HOME/trading"
if [ -d "$PLATFORM_DIR" ]; then
  # Remove legacy .mcp.json (migrated to claude mcp add)
  rm -f "$PLATFORM_DIR/.mcp.json"

  # Ensure project .claude directory exists for MCP settings
  mkdir -p "$PLATFORM_DIR/.claude"
  echo '{}' > "$PLATFORM_DIR/.claude/settings.local.json"

  # --- Global settings (plugins + marketplaces) ---
  mkdir -p "$HOME/.claude"
  cat > "$HOME/.claude/settings.json" <<'SETTINGS'
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  },
  "permissions": {
    "defaultMode": "default"
  },
  "enabledPlugins": {
    "context7@claude-plugins-official": true,
    "frontend-design@claude-plugins-official": true,
    "superpowers@claude-plugins-official": true,
    "code-simplifier@claude-plugins-official": true,
    "pg@aiguide": true,
    "claude-hud@jarrodwatts": true
  },
  "extraKnownMarketplaces": {
    "aiguide": {
      "source": { "source": "github", "repo": "timescale/pg-aiguide" }
    }
  },
  "language": "한국어"
}
SETTINGS

  ADMIN_URI="${DATABASE_URL_ADMIN:-$DATABASE_URL}"
  ADVISORY_URI="${DATABASE_URL_ADVISORY:-$DATABASE_URL}"

  # trading repo를 advisory 유저도 읽을 수 있도록 other+rx
  chmod -R o+rX "$PLATFORM_DIR" 2>/dev/null || true

  # --- advisory 유저 홈 셋업 ---
  ADVISORY_HOME="/home/trading-advisory"
  sudo mkdir -p "$ADVISORY_HOME"
  sudo chown trading-advisory:trading-advisory "$ADVISORY_HOME"

  # advisory 유저 MCP 등록 (postgres-mcp-advisory 만)
  if [ -n "$ADVISORY_URI" ]; then
    sudo -u trading-advisory -H env \
      PATH="/home/trading/.local/bin:/usr/local/bin:/usr/bin:/bin" \
      HOME="$ADVISORY_HOME" \
      bash -c "
        claude mcp remove postgres-mcp-advisory 2>/dev/null || true
        claude mcp add \
          -e 'DATABASE_URI=$ADVISORY_URI' \
          -- postgres-mcp-advisory uvx postgres-mcp --access-mode=unrestricted \
          2>/dev/null || true
      "
  fi

  (
    cd "$HOME"

    # --- MCP Server: postgres-mcp-admin (admin 유저용) ---
    if [ -n "$ADMIN_URI" ]; then
      claude mcp remove postgres-mcp-admin 2>/dev/null || true
      claude mcp add \
        -e "DATABASE_URI=$ADMIN_URI" \
        -- postgres-mcp-admin uvx postgres-mcp --access-mode=unrestricted \
        2>/dev/null || true
    fi

    # --- MCP Server: argocd ---
    if [ -n "$ARGOCD_API_TOKEN" ]; then
      claude mcp remove argocd 2>/dev/null || true
      claude mcp add \
        -e "ARGOCD_BASE_URL=$ARGOCD_BASE_URL" \
        -e "ARGOCD_API_TOKEN=$ARGOCD_API_TOKEN" \
        -e "NODE_TLS_REJECT_UNAUTHORIZED=0" \
        -- argocd npx -y argocd-mcp@latest stdio \
        2>/dev/null || true
    fi

    # --- MCP Server: woodpecker ---
    if [ -n "$WOODPECKER_TOKEN" ]; then
      # Install woodpecker-mcp binary if missing (cached in PVC)
      if ! command -v woodpecker-mcp &>/dev/null; then
        echo "Installing woodpecker-mcp..."
        go install github.com/denysvitali/woodpecker-ci-mcp/cmd/woodpecker-mcp@latest 2>/dev/null || true
      fi
      # woodpecker-mcp requires config file (nested woodpecker: key)
      mkdir -p "$HOME/.config/woodpecker-mcp"
      cat > "$HOME/.config/woodpecker-mcp/config.yaml" <<WPCFG
woodpecker:
  url: "$WOODPECKER_SERVER"
  token: "$WOODPECKER_TOKEN"
WPCFG
      claude mcp remove woodpecker 2>/dev/null || true
      claude mcp add \
        -- woodpecker "$HOME/go/bin/woodpecker-mcp" serve \
        2>/dev/null || true
    fi

    # --- MCP Server: kubectl-mcp ---
    claude mcp remove kubectl-mcp 2>/dev/null || true
    claude mcp add \
      -- kubectl-mcp uvx --from kubectl-mcp-tool python -m kubectl_mcp_tool.mcp_server \
      2>/dev/null || true
  )

  # Pre-warm caches (avoid first-run delays in Claude sessions)
  uvx postgres-mcp --help &>/dev/null || true
  uvx --from kubectl-mcp-tool python -c "import kubectl_mcp_tool" &>/dev/null || true

  # Pre-warm npx cache for argocd-mcp and context7 (avoid first-run download delay)
  npx -y argocd-mcp@latest --help &>/dev/null || true
  npx -y @upstash/context7-mcp --help &>/dev/null || true
fi

exec tini -- /app/claude-server "$@"
