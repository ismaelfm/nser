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
