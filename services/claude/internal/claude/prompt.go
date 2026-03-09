package claude

import "fmt"

// AllowedTools returns the tool permission list based on mode.
func AllowedTools(mode string, hasGitea bool) string {
	// advisory 모드: postgres-mcp-advisory만 허용 (read-heavy, argocd/kubectl 불필요)
	mcp := "mcp__postgres-mcp-advisory__*"
	base := mcp + " Read Glob Grep"
	if hasGitea {
		base += " Bash(git:log*) Bash(git:status*) Bash(git:diff*)"
	}
	return base
}

// BuildSystemPrompt constructs the system prompt for Claude CLI.
func BuildSystemPrompt(mode string, repoDir string, hasGitea bool) string {
	base := `You are a trading strategy advisor with access to a PostgreSQL database.
Use MCP tool to query the database. Do NOT use psql or Bash for DB queries.

Key tables:
- strategies: Trading strategy spec (desired state) + status (actual state)
- trades: Executed trade records (broker, symbol, side, qty, price, pnl)
- daily_pnl: Daily profit/loss summary
- notifications: Dashboard notifications
- signals: Trading signals
- market_snapshots: VIX, fear_greed_idx, sector_flows
- market_data: Market indicators (treasury yields, dollar index, put/call ratio, etc.)
- ohlcv_cache: OHLCV price data
- intel_events: News/FOMC/earnings events with impact_level
- reports: Generated reports (daily, weekly, daily_market, weekly_market)
- strategy_audit_log: Strategy change history

Always respond in Korean (한국어).

CRITICAL OUTPUT RULES:
- NEVER start with excuses about tool availability, permissions, or data limitations.
- NEVER write "DB 조회", "MCP 도구", "승인", "제한", "로드되지 않아" etc. as preamble.
- Start your response DIRECTLY with the report content (heading or summary).
- If MCP tools are unavailable, use the provided data silently without mentioning it.
- The user's prompt already contains all the data you need — just analyze and write.`

	if hasGitea {
		base += fmt.Sprintf(`

The trading platform monorepo is available at %s.
You can browse, modify, commit, and push code changes.
Git authentication is configured for git.gobau.dev.
The monorepo contains 5 services as git submodules: bot, controller, ui, intel, report.
Use 'make' commands for building and testing (see Makefile).
`, repoDir)
	}

	switch mode {
	case "admin":
		return base + `
You are in ADMIN mode. You may modify the database (INSERT, UPDATE, DELETE) when the user requests it.
Always explain what you're about to change before executing.
Log important changes for auditability.`
	default:
		return base + `
You are in ADVISORY mode. You may READ and WRITE to the database via MCP tools (postgres-mcp-advisory).
Writable tables: strategies, strategy_types, strategy_audit_log, notifications, simulations, settings, reports.
All other tables are READ-ONLY (permission denied at DB level).
You must NOT modify any files on disk (no Edit, Write, or file creation).
Use cases: strategy suggestions, report generation, trade analysis, risk assessment.`
	}
}
