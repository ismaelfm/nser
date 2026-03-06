package main

// ─── Types (exported so Wails generates TS models) ───────────────────────────

// Workspace is the API model for workspaces.
type Workspace struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Target      string `json:"target"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

// CommandRun represents a past tool execution for the history panel.
type CommandRun struct {
	ID          int64  `json:"id"`
	WorkspaceID int64  `json:"workspaceId"`
	ToolName    string `json:"toolName"`
	Target      string `json:"target"`
	Args        string `json:"args"`
	CommandLine string `json:"commandLine"`
	Status      string `json:"status"`
	ExitCode    int    `json:"exitCode"`
	StartedAt   string `json:"startedAt"`
	CompletedAt string `json:"completedAt"`
}

// ToolDocumentation holds a tool's docs and examples.
type ToolDocumentation struct {
	Documentation string        `json:"documentation"`
	Examples      []ToolExample `json:"examples"`
}

// ToolExample is a single usage example for a tool.
type ToolExample struct {
	ID          int64  `json:"id"`
	ToolName    string `json:"toolName"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Command     string `json:"command"`
	SortOrder   int    `json:"sortOrder"`
}
