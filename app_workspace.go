package main

import "fmt"

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
