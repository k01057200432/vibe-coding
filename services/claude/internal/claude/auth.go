package claude

import (
	"fmt"
	"os"
	"strings"
)

// SetupMCPServers is a no-op placeholder for future MCP server registration.
func SetupMCPServers() {}

// BuildClaudeCmd returns a shell command string to run Claude CLI.
// resumeMode: "" (new session), "continue" (resume last), "resume" (interactive picker).
// oauthToken: Claude setup-token (long-lived). If set, injected as CLAUDE_CODE_OAUTH_TOKEN.
func BuildClaudeCmd(mode, oauthToken, binaryPath, resumeMode string) string {
	sp := BuildSystemPrompt(mode)

	var envVars []string
	envVars = append(envVars, `export PATH="$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin"`)
	envVars = append(envVars, "export LANG=C.UTF-8")
	envVars = append(envVars, "export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1")

	if oauthToken != "" {
		envVars = append(envVars, fmt.Sprintf("export CLAUDE_CODE_OAUTH_TOKEN=%q", oauthToken))
	}
	envVars = append(envVars, fmt.Sprintf("export CLAUDE_SP=%q", sp))

	var setup []string
	setup = append(setup, `cd /workspace`)

	resumeFlag := ""
	switch resumeMode {
	case "continue":
		resumeFlag = " --continue"
	case "resume":
		resumeFlag = " --resume"
	}

	workDir := "/workspace"
	if v := os.Getenv("WORKSPACE_DIR"); v != "" {
		workDir = v
	}

	var cmd string
	switch mode {
	case "admin":
		cmd = fmt.Sprintf(`exec %s --dangerously-skip-permissions --add-dir %q --append-system-prompt "$CLAUDE_SP" --teammate-mode in-process%s`, binaryPath, workDir, resumeFlag)
	case "shell":
		cmd = "exec bash"
	default:
		tools := AllowedTools(mode)
		if tools != "" {
			cmd = fmt.Sprintf(`exec %s --allowedTools '%s' --add-dir %q --append-system-prompt "$CLAUDE_SP" --teammate-mode in-process%s`, binaryPath, tools, workDir, resumeFlag)
		} else {
			cmd = fmt.Sprintf(`exec %s --add-dir %q --append-system-prompt "$CLAUDE_SP" --teammate-mode in-process%s`, binaryPath, workDir, resumeFlag)
		}
	}

	return strings.Join(envVars, "\n") + "\n" + strings.Join(setup, "\n") + "\n" + cmd + "\n"
}
