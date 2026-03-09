package claude

// AllowedTools returns the tool permission list based on mode.
func AllowedTools(mode string) string {
	switch mode {
	case "admin":
		return "" // admin uses --dangerously-skip-permissions, no restriction
	case "shell":
		return "Bash"
	default:
		return "Bash Read Glob Grep"
	}
}

// BuildSystemPrompt constructs the system prompt for Claude CLI.
func BuildSystemPrompt(mode string) string {
	base := `You are a coding assistant in a vibe-coding sandbox.
You can create, edit, and run code freely.
The user's project files are in the current working directory.`

	switch mode {
	case "admin":
		return base + `
You are in ADMIN mode with full permissions.`
	case "shell":
		return base + `
You are in SHELL mode. Use bash commands to accomplish tasks.`
	default:
		return base
	}
}
