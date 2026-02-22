package main

import (
	"context"
	"database/sql"
	"fmt"

	"nser/internal/db"
	"nser/internal/tool"
)

// App struct
type App struct {
	ctx    context.Context
	db     *sql.DB
	runner *tool.Runner
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Open database (handles path, migrations, seeding internally)
	conn, err := db.Open()
	if err != nil {
		fmt.Printf("database open: %v\n", err)
		return
	}
	a.db = conn

	// Create tool runner backed by the global registry
	a.runner = tool.NewRunner(tool.DefaultRegistry, a.db)
}

// shutdown is called when the app exits
func (a *App) shutdown(ctx context.Context) {
	if a.db != nil {
		a.db.Close()
	}
}

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

// ─── Workspace CRUD ──────────────────────────────────────────────────────────

// CreateWorkspace creates a new workspace.
func (a *App) CreateWorkspace(name, description, target string) (*Workspace, error) {
	res, err := a.db.ExecContext(a.ctx,
		`INSERT INTO workspaces (name, description, target) VALUES (?, ?, ?)`,
		name, description, target,
	)
	if err != nil {
		return nil, fmt.Errorf("creating workspace: %w", err)
	}
	id, _ := res.LastInsertId()
	return a.GetWorkspaceByID(id)
}

// GetWorkspaces returns all workspaces.
func (a *App) GetWorkspaces() ([]Workspace, error) {
	rows, err := a.db.QueryContext(a.ctx,
		`SELECT id, name, description, COALESCE(target,''), created_at, updated_at FROM workspaces ORDER BY updated_at DESC`,
	)
	if err != nil {
		return nil, fmt.Errorf("listing workspaces: %w", err)
	}
	defer rows.Close()

	var result []Workspace
	for rows.Next() {
		var ws Workspace
		if err := rows.Scan(&ws.ID, &ws.Name, &ws.Description, &ws.Target, &ws.CreatedAt, &ws.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scanning workspace: %w", err)
		}
		result = append(result, ws)
	}
	return result, rows.Err()
}

// GetWorkspaceByID returns a workspace by ID.
func (a *App) GetWorkspaceByID(id int64) (*Workspace, error) {
	var ws Workspace
	err := a.db.QueryRowContext(a.ctx,
		`SELECT id, name, description, COALESCE(target,''), created_at, updated_at FROM workspaces WHERE id = ?`, id,
	).Scan(&ws.ID, &ws.Name, &ws.Description, &ws.Target, &ws.CreatedAt, &ws.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("getting workspace: %w", err)
	}
	return &ws, nil
}

// DeleteWorkspace deletes a workspace.
func (a *App) DeleteWorkspace(id int64) error {
	_, err := a.db.ExecContext(a.ctx, `DELETE FROM workspaces WHERE id = ?`, id)
	return err
}

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

// ─── Tool Documentation ─────────────────────────────────────────────────────

// GetToolDocs returns the documentation and examples for a tool.
func (a *App) GetToolDocs(toolName string) (*ToolDocumentation, error) {
	var docText string
	err := a.db.QueryRowContext(a.ctx,
		`SELECT COALESCE(documentation,'') FROM tool_docs WHERE tool_name = ?`, toolName,
	).Scan(&docText)
	if err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("getting tool docs: %w", err)
	}

	rows, err := a.db.QueryContext(a.ctx,
		`SELECT id, tool_name, title, COALESCE(description,''), command, sort_order
		 FROM tool_examples WHERE tool_name = ? ORDER BY sort_order`, toolName,
	)
	if err != nil {
		return nil, fmt.Errorf("getting tool examples: %w", err)
	}
	defer rows.Close()

	var examples []ToolExample
	for rows.Next() {
		var ex ToolExample
		if err := rows.Scan(&ex.ID, &ex.ToolName, &ex.Title, &ex.Description, &ex.Command, &ex.SortOrder); err != nil {
			return nil, fmt.Errorf("scanning example: %w", err)
		}
		examples = append(examples, ex)
	}

	return &ToolDocumentation{
		Documentation: docText,
		Examples:      examples,
	}, rows.Err()
}

// ─── Command History ─────────────────────────────────────────────────────────

// GetWorkspaceHistory returns past tool runs for a workspace.
func (a *App) GetWorkspaceHistory(workspaceID int64) ([]CommandRun, error) {
	rows, err := a.db.QueryContext(a.ctx,
		`SELECT id, workspace_id, tool_name, target,
		        COALESCE(args,''), COALESCE(command_line,''),
		        status, exit_code,
		        started_at, COALESCE(completed_at,'')
		 FROM tool_runs
		 WHERE workspace_id = ?
		 ORDER BY started_at DESC`,
		workspaceID,
	)
	if err != nil {
		return nil, fmt.Errorf("querying command history: %w", err)
	}
	defer rows.Close()

	var result []CommandRun
	for rows.Next() {
		var r CommandRun
		if err := rows.Scan(&r.ID, &r.WorkspaceID, &r.ToolName, &r.Target,
			&r.Args, &r.CommandLine, &r.Status, &r.ExitCode,
			&r.StartedAt, &r.CompletedAt); err != nil {
			return nil, fmt.Errorf("scanning tool run: %w", err)
		}
		result = append(result, r)
	}
	return result, rows.Err()
}

// GetRunOutput returns the raw output of a specific tool run.
func (a *App) GetRunOutput(runID int64) (string, error) {
	var output []byte
	err := a.db.QueryRowContext(a.ctx,
		`SELECT COALESCE(raw_output, '') FROM tool_runs WHERE id = ?`, runID,
	).Scan(&output)
	if err != nil {
		return "", fmt.Errorf("getting run output: %w", err)
	}
	return string(output), nil
}

// DeleteRun deletes a tool run record.
func (a *App) DeleteRun(runID int64) error {
	_, err := a.db.ExecContext(a.ctx, `DELETE FROM tool_runs WHERE id = ?`, runID)
	return err
}
