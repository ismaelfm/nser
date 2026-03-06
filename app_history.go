package main

import "fmt"

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
