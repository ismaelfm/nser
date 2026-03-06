package main

import (
	"database/sql"
	"fmt"
)

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
