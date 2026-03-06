package main

import "nser/internal/tool"

// ─── Tool Execution ──────────────────────────────────────────────────────────

// RunToolStreaming starts a tool subprocess and returns immediately.
// Output is delivered via Wails events.
func (a *App) RunToolStreaming(workspaceID int64, toolName, target string, userArgs []string) (*tool.StreamStartResult, error) {
	return a.runner.RunStreaming(a.ctx, toolName, workspaceID, target, userArgs)
}

// ─── Tool Info ───────────────────────────────────────────────────────────────

// GetTools returns all registered tool definitions.
func (a *App) GetTools() []tool.ToolDef {
	return tool.DefaultRegistry.List()
}

// GetToolHealth returns the installation status of every registered tool.
func (a *App) GetToolHealth() []tool.ToolHealth {
	return tool.DefaultRegistry.CheckAll()
}

// GetPrivilegeStatus reports whether the app is running with elevated privileges.
func (a *App) GetPrivilegeStatus() tool.PrivilegeInfo {
	return tool.CheckPrivileges()
}
