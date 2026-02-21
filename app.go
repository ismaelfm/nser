package main

import (
	"context"
	"encoding/json"
	"fmt"
	"path/filepath"

	"nser/internal/ai"
	"nser/internal/database"
	"nser/internal/recon/tools"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Initialize database
	dbPath := getDBPath()
	if err := database.Init(ctx, dbPath); err != nil {
		fmt.Printf(err)
	}

	// Load AI config (optional - wont fail if missing)
	if _, err := ai.LoadConfig(""); err != nil {
		fmt.Printf(err)
	}
}

func getDBPath() string {
	home, _ := filepath.UserHomeDir()
	return filepath.Join(home, ".nser", "nser.db")
}

// WorkspaceResponse is the API response for workspaces
type WorkspaceResponse struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

// CreateWorkspace creates a new workspace
func (a *App) CreateWorkspace(name, description string) (*WorkspaceResponse, error) {
	ws, err := database.CreateWorkspace(a.ctx, name, description)
	if err != nil {
		return nil, fmt.Errorf("creating workspace: %w", err)
	}
	return &WorkspaceResponse{
		ID:          ws.ID,
		Name:        ws.Name,
		Description: ws.Description,
		CreatedAt:   ws.CreatedAt,
		UpdatedAt:   ws.UpdatedAt,
	}, nil
}

// ListWorkspaces returns all workspaces
func (a *App) ListWorkspaces() ([]WorkspaceResponse, error) {
	workspaces, err := database.ListWorkspaces(a.ctx)
	if err != nil {
		return nil, fmt.Errorf("listing workspaces: %w", err)
	}

	result := make([]WorkspaceResponse, len(workspaces))
	for i, ws := range workspaces {
		result[i] = WorkspaceResponse{
			ID:          ws.ID,
			Name:        ws.Name,
			Description: ws.Description,
			CreatedAt:   ws.CreatedAt,
			UpdatedAt:   ws.UpdatedAt,
		}
	}
	return result, nil
}

// GetWorkspace returns a workspace by ID
func (a *App) GetWorkspace(id int64) (*WorkspaceResponse, error) {
	ws, err := database.GetWorkspace(a.ctx, id)
	if err != nil {
		return nil, fmt.Errorf("getting workspace: %w", err)
	}
	return &WorkspaceResponse{
		ID:          ws.ID,
		Name:        ws.Name,
		Description: ws.Description,
		CreatedAt:   ws.CreatedAt,
		UpdatedAt:   ws.UpdatedAt,
	}, nil
}

// DeleteWorkspace deletes a workspace
func (a *App) DeleteWorkspace(id int64) error {
	return database.DeleteWorkspace(a.ctx, id)
}

// ToolResultResponse is the API response for tool execution
type ToolResultResponse struct {
	ToolName    string                   `json:"tool_name"`
	Target      string                   `json:"target"`
	RawOutput   string                   `json:"raw_output"`
	ExecutionID int64                    `json:"execution_id"`
	Error       string                   `json:"error,omitempty"`
}

// ExecuteTool runs a recon tool and stores the results
func (a *App) ExecuteTool(workspaceID int64, toolName, target string, args ...string) (*ToolResultResponse, error) {
	// Get tool from registry
	tool, err := tools.Get(toolName)
	if err != nil {
		return nil, fmt.Errorf("getting tool: %w", err)
	}

	// Validate tool is available
	if err := tool.Validate(); err != nil {
		return nil, fmt.Errorf("tool validation: %w", err)
	}

	// Execute tool
	rawOutput, err := tool.Execute(a.ctx, target, args...)
	if err != nil {
		return nil, fmt.Errorf("executing tool: %w", err)
	}

	// Save execution to database
	execution, err := database.CreateToolExecution(a.ctx, workspaceID, toolName, target, string(rawOutput))
	if err != nil {
		return nil, fmt.Errorf("saving execution: %w", err)
	}

	// Parse output
	parsed, err := tool.Parse(rawOutput)
	if err != nil {
		return nil, fmt.Errorf("parsing output: %w", err)
	}

	// Save assets
	for _, asset := range parsed.Assets {
		metadata := "{}"
		if asset.Metadata != nil {
			b, _ := json.Marshal(asset.Metadata)
			metadata = string(b)
		}
		database.CreateAsset(a.ctx, workspaceID, asset.Type, asset.Value, metadata)
	}

	// Note: In a full implementation, we would also save ports and findings
	// For simplicity, we just return the execution result here

	return &ToolResultResponse{
		ToolName:    toolName,
		Target:      target,
		RawOutput:   string(rawOutput),
		ExecutionID: execution.ID,
	}, nil
}

// GetFindings returns findings for a workspace
func (a *App) GetFindings(workspaceID int64, severity string) ([]map[string]interface{}, error) {
	findings, err := database.GetFindingsByWorkspace(a.ctx, workspaceID, severity)
	if err != nil {
		return nil, fmt.Errorf("getting findings: %w", err)
	}

	result := make([]map[string]interface{}, len(findings))
	for i, f := range findings {
		result[i] = map[string]interface{}{
			"severity":    f.Severity,
			"title":       f.Title,
			"description": f.Description,
		}
	}
	return result, nil
}
