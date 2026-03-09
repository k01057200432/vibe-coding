package claude

import (
	"fmt"
	"net/url"
	"os"
	"os/exec"
	"strings"
)

// encodeDSN URL-encodes the password in a PostgreSQL connection URI.
// CNPG auto-generates passwords that may contain '/' which breaks URI parsing.
func encodeDSN(dsn string) string {
	u, err := url.Parse(dsn)
	if err != nil || u.User == nil {
		return dsn
	}
	return u.String()
}

// SetupMCPServers registers postgres-mcp-admin and postgres-mcp-advisory
// in ~/.claude.json at service startup. Safe to call multiple times (idempotent).
func SetupMCPServers() {
	adminURI := encodeDSN(os.Getenv("DATABASE_URL_ADMIN"))
	if adminURI == "" {
		adminURI = encodeDSN(os.Getenv("DATABASE_URL"))
	}
	advisoryURI := encodeDSN(os.Getenv("DATABASE_URL_ADVISORY"))
	if advisoryURI == "" {
		advisoryURI = adminURI
	}

	for _, entry := range []struct{ name, uri string }{
		{"postgres-mcp-admin", adminURI},
		{"postgres-mcp-advisory", advisoryURI},
	} {
		if entry.uri == "" {
			continue
		}
		exec.Command("claude", "mcp", "remove", entry.name).Run()
		exec.Command("claude", "mcp", "add",
			"-e", "DATABASE_URI="+entry.uri,
			"--", entry.name, "uvx", "postgres-mcp", "--access-mode=unrestricted",
		).Run()
	}
}

// BuildClaudeCmd returns a shell command string to run Claude CLI.
// teammateMode: "tmux" (default) or "in-process" (--teammate-mode in-process flag).
// resumeMode: "" (new session), "continue" (resume last), "resume" (interactive picker).
// oauthToken: Claude setup-token (long-lived). If set, injected as CLAUDE_CODE_OAUTH_TOKEN.
func BuildClaudeCmd(mode, giteaToken, oauthToken, repoDir, binaryPath, teammateMode, resumeMode string) string {
	hasGitea := giteaToken != ""
	sp := BuildSystemPrompt(mode, repoDir, hasGitea)

	var envVars []string
	if mode == "advisory" {
		// advisory는 trading-advisory 유저로 실행 — claude 바이너리는 trading 유저 경로 공유
		envVars = append(envVars, `export PATH="/home/trading/.local/bin:/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin"`)
	} else {
		envVars = append(envVars, `export PATH="$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin"`)
	}
	envVars = append(envVars, "export LANG=C.UTF-8")
	envVars = append(envVars, "export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1")
	envVars = append(envVars, "export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1")
	// 모드별 DATABASE_URL 분기 — admin은 풀 권한, advisory는 제한된 role 사용
	switch mode {
	case "admin":
		if dbURL := os.Getenv("DATABASE_URL_ADMIN"); dbURL != "" {
			envVars = append(envVars, fmt.Sprintf("export DATABASE_URL=%q", encodeDSN(dbURL)))
		} else if dbURL := os.Getenv("DATABASE_URL"); dbURL != "" {
			envVars = append(envVars, fmt.Sprintf("export DATABASE_URL=%q", encodeDSN(dbURL)))
		}
	case "advisory":
		if dbURL := os.Getenv("DATABASE_URL_ADVISORY"); dbURL != "" {
			envVars = append(envVars, fmt.Sprintf("export DATABASE_URL=%q", encodeDSN(dbURL)))
		} else if dbURL := os.Getenv("DATABASE_URL"); dbURL != "" {
			envVars = append(envVars, fmt.Sprintf("export DATABASE_URL=%q", encodeDSN(dbURL)))
		}
	default:
		if dbURL := os.Getenv("DATABASE_URL"); dbURL != "" {
			envVars = append(envVars, fmt.Sprintf("export DATABASE_URL=%q", encodeDSN(dbURL)))
		}
	}
	if hasGitea {
		envVars = append(envVars, fmt.Sprintf("export GITEA_TOKEN=%q", giteaToken))
	}
	if oauthToken != "" {
		envVars = append(envVars, fmt.Sprintf("export CLAUDE_CODE_OAUTH_TOKEN=%q", oauthToken))
	}
	envVars = append(envVars, fmt.Sprintf("export CLAUDE_SP=%q", sp))

	var setup []string

	// Setup git credentials for this user (for push/pull in session)
	if hasGitea {
		setup = append(setup,
			`git config --global credential.helper store`,
			`printf 'https://%s:x-oauth-basic@git.gobau.dev\n' "$GITEA_TOKEN" > ~/.git-credentials`,
		)
	}
	// Setup memory symlink so Claude Code can read/write memory files
	setup = append(setup,
		`mkdir -p "$HOME/.claude/projects/-home-trading-trading"`,
		fmt.Sprintf(`ln -sfn %q "$HOME/.claude/projects/-home-trading-trading/memory"`, repoDir+"/.claude/memory"),
	)
	switch mode {
	case "admin", "shell":
		setup = append(setup, `cd "$HOME"`)
	default:
		setup = append(setup, fmt.Sprintf("cd %q", repoDir))
	}



	teammateFlag := ""
	if teammateMode == "in-process" {
		teammateFlag = " --teammate-mode in-process"
	}

	resumeFlag := ""
	switch resumeMode {
	case "continue":
		resumeFlag = " --continue"
	case "resume":
		resumeFlag = " --resume"
	}

	var cmd string
	switch mode {
	case "admin":
		cmd = fmt.Sprintf(`exec %s --dangerously-skip-permissions --add-dir %q --append-system-prompt "$CLAUDE_SP"%s%s`, binaryPath, repoDir, teammateFlag, resumeFlag)
	case "advisory":
		tools := AllowedTools(mode, hasGitea)
		cmd = fmt.Sprintf(`exec %s --allowedTools '%s' --add-dir %q --append-system-prompt "$CLAUDE_SP"%s%s`, binaryPath, tools, repoDir, teammateFlag, resumeFlag)
	case "shell":
		cmd = "exec bash"
	default:
		cmd = "exec bash"
	}

	return strings.Join(envVars, "\n") + "\n" + strings.Join(setup, "\n") + "\n" + cmd + "\n"
}
