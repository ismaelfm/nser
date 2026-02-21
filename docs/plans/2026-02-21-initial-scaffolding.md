# Initial Scaffolding Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bootstrap the Nser project as a running Wails desktop app with a dark dashboard shell, SQLite database initialization, and one working Go-to-React binding.

**Architecture:** Wails v2 bridges a Go backend to a React+TypeScript frontend via auto-generated JS bindings. The Go backend initializes a SQLite database on startup using `modernc.org/sqlite` (pure Go). The React frontend renders a dark-themed dashboard with a sidebar.

**Tech Stack:** Go, Wails v2, React, TypeScript, Vite, Tailwind CSS v4, SQLite via `modernc.org/sqlite`

---

### Task 1: Initialize Wails Project

**Files:**
- Create: `main.go`, `app.go`, `wails.json`, `go.mod`, `frontend/` (all via `wails init`)
- Preserve: `README.md`, `docs/`, `.gitignore`

**Step 1: Back up existing files**

```bash
cp README.md README.md.bak
cp .gitignore .gitignore.bak
cp -r docs docs.bak
```

**Step 2: Initialize Wails project in a temp directory and move files in**

```bash
cd /tmp && wails init -n nser -t react-ts
```

Then copy the generated files into the project root, skipping README.md and .gitignore:

```bash
cp /tmp/nser/main.go /Users/filalis/Projects/nser/
cp /tmp/nser/app.go /Users/filalis/Projects/nser/
cp /tmp/nser/wails.json /Users/filalis/Projects/nser/
cp /tmp/nser/go.mod /Users/filalis/Projects/nser/
cp /tmp/nser/go.sum /Users/filalis/Projects/nser/
cp -r /tmp/nser/build /Users/filalis/Projects/nser/
cp -r /tmp/nser/frontend /Users/filalis/Projects/nser/
```

**Step 3: Restore backed-up files**

```bash
cd /Users/filalis/Projects/nser
mv README.md.bak README.md
mv .gitignore.bak .gitignore
mv docs.bak/* docs/ && rmdir docs.bak
```

**Step 4: Merge .gitignore entries**

Append any Wails-specific entries from the generated `.gitignore` into our existing one (e.g., `build/bin`).

**Step 5: Install frontend dependencies and verify**

```bash
cd /Users/filalis/Projects/nser/frontend && npm install
```

**Step 6: Verify Wails runs**

```bash
cd /Users/filalis/Projects/nser && wails dev
```

Expected: A desktop window opens showing the default Wails React-TS greeting page.

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: initialize Wails project with react-ts template"
```

---

### Task 2: Add SQLite Database Package

**Files:**
- Create: `internal/db/db.go`
- Create: `internal/db/schema.sql`
- Modify: `go.mod` (via `go get`)

**Step 1: Install the SQLite driver**

```bash
cd /Users/filalis/Projects/nser && go get modernc.org/sqlite
```

**Step 2: Create the schema file**

Create `internal/db/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS workspaces (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    type         TEXT NOT NULL CHECK(type IN ('ip', 'domain', 'url')),
    value        TEXT NOT NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, type, value)
);

CREATE TABLE IF NOT EXISTS ports (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    port     INTEGER NOT NULL,
    protocol TEXT DEFAULT 'tcp',
    service  TEXT DEFAULT '',
    state    TEXT DEFAULT 'open',
    UNIQUE(asset_id, port, protocol)
);

CREATE TABLE IF NOT EXISTS tool_runs (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    tool_name    TEXT NOT NULL,
    target       TEXT NOT NULL,
    raw_output   BLOB,
    parsed_json  TEXT,
    status       TEXT DEFAULT 'completed' CHECK(status IN ('running', 'completed', 'failed')),
    started_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);
```

**Step 3: Create the database package**

Create `internal/db/db.go`:

```go
package db

import (
	"database/sql"
	"embed"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

//go:embed schema.sql
var schemaSQL string

func dbPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("get home dir: %w", err)
	}
	dir := filepath.Join(home, ".nser")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", fmt.Errorf("create data dir: %w", err)
	}
	return filepath.Join(dir, "nser.db"), nil
}

func Open() (*sql.DB, error) {
	path, err := dbPath()
	if err != nil {
		return nil, err
	}

	db, err := sql.Open("sqlite", path+"?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)&_pragma=busy_timeout(5000)")
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}
	db.SetMaxOpenConns(1)

	if _, err := db.Exec(schemaSQL); err != nil {
		db.Close()
		return nil, fmt.Errorf("run schema migration: %w", err)
	}

	return db, nil
}
```

**Step 4: Verify it compiles**

```bash
cd /Users/filalis/Projects/nser && go build ./...
```

Expected: No errors.

**Step 5: Commit**

```bash
git add internal/db/ go.mod go.sum && git commit -m "feat: add SQLite database package with schema"
```

---

### Task 3: Wire Database Into Wails App

**Files:**
- Modify: `app.go`

**Step 1: Update app.go to initialize the database and expose GetWorkspaces**

Replace the contents of `app.go` with:

```go
package main

import (
	"context"
	"database/sql"
	"log"
	"time"

	"nser/internal/db"
)

type Workspace struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

type App struct {
	ctx context.Context
	db  *sql.DB
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	database, err := db.Open()
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}
	a.db = database
}

func (a *App) shutdown(ctx context.Context) {
	if a.db != nil {
		a.db.Close()
	}
}

func (a *App) GetWorkspaces() ([]Workspace, error) {
	rows, err := a.db.QueryContext(a.ctx, "SELECT id, name, description, created_at, updated_at FROM workspaces ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var workspaces []Workspace
	for rows.Next() {
		var w Workspace
		var createdAt, updatedAt time.Time
		if err := rows.Scan(&w.ID, &w.Name, &w.Description, &createdAt, &updatedAt); err != nil {
			return nil, err
		}
		w.CreatedAt = createdAt.Format(time.RFC3339)
		w.UpdatedAt = updatedAt.Format(time.RFC3339)
		workspaces = append(w, workspaces)
	}
	return workspaces, rows.Err()
}
```

**Step 2: Register the shutdown lifecycle in main.go**

Add `OnShutdown: app.shutdown,` to the `wails.Run` options in `main.go`, after the `OnStartup` line.

**Step 3: Verify it compiles**

```bash
cd /Users/filalis/Projects/nser && go build ./...
```

Expected: No errors.

**Step 4: Run the app to verify DB creation**

```bash
wails dev
```

Expected: App opens. Check `~/.nser/nser.db` exists:

```bash
ls -la ~/.nser/nser.db
```

**Step 5: Commit**

```bash
git add app.go main.go && git commit -m "feat: wire SQLite into Wails app with GetWorkspaces binding"
```

---

### Task 4: Add Recon and AI Placeholder Packages

**Files:**
- Create: `internal/recon/tool.go`
- Create: `internal/ai/ai.go`

**Step 1: Create the recon tool interface**

Create `internal/recon/tool.go`:

```go
package recon

// Tool defines the interface for reconnaissance tool integrations.
// Each tool must be able to identify itself, execute against a target,
// and parse its raw output into structured data.
type Tool interface {
	Name() string
	Execute(target string) ([]byte, error)
	Parse(raw []byte) (map[string]interface{}, error)
}
```

**Step 2: Create the AI client placeholder**

Create `internal/ai/ai.go`:

```go
package ai

// Client handles communication with the OpenRouter API for LLM routing.
type Client struct {
	apiKey  string
	baseURL string
}

// NewClient creates a new OpenRouter API client.
func NewClient(apiKey string) *Client {
	return &Client{
		apiKey:  apiKey,
		baseURL: "https://openrouter.ai/api/v1",
	}
}
```

**Step 3: Verify it compiles**

```bash
cd /Users/filalis/Projects/nser && go build ./...
```

Expected: No errors.

**Step 4: Commit**

```bash
git add internal/recon/ internal/ai/ && git commit -m "feat: add recon tool interface and AI client placeholder"
```

---

### Task 5: Add Tailwind CSS v4 to Frontend

**Files:**
- Modify: `frontend/package.json` (via npm install)
- Modify: `frontend/vite.config.ts`
- Modify: `frontend/src/style.css`
- Delete: `frontend/src/App.css`

**Step 1: Install Tailwind CSS v4**

```bash
cd /Users/filalis/Projects/nser/frontend && npm install tailwindcss @tailwindcss/vite
```

**Step 2: Update vite.config.ts**

Replace contents of `frontend/vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

**Step 3: Replace style.css with Tailwind import**

Replace contents of `frontend/src/style.css`:

```css
@import "tailwindcss";
```

**Step 4: Delete App.css**

```bash
rm frontend/src/App.css
```

**Step 5: Verify Tailwind works**

Replace `frontend/src/App.tsx` with a quick test:

```tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <h1 className="text-3xl font-bold">Tailwind works!</h1>
    </div>
  );
}

export default App;
```

Run `wails dev` and confirm dark background with white text.

**Step 6: Commit**

```bash
cd /Users/filalis/Projects/nser
git add frontend/ && git commit -m "feat: add Tailwind CSS v4 to frontend"
```

---

### Task 6: Build the Dashboard Shell

**Files:**
- Create: `frontend/src/components/Sidebar.tsx`
- Modify: `frontend/src/App.tsx`

**Step 1: Create the Sidebar component**

Create `frontend/src/components/Sidebar.tsx`:

```tsx
const navItems = [
  { label: "Workspaces", icon: "folder", active: true },
  { label: "Recon", icon: "search", active: false },
  { label: "AI Copilot", icon: "cpu", active: false },
  { label: "Reports", icon: "file-text", active: false },
];

interface SidebarProps {
  activeItem: string;
  onItemClick: (label: string) => void;
}

export default function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-lg font-bold text-white tracking-wide">NSER</h1>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => item.active && onItemClick(item.label)}
            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
              activeItem === item.label
                ? "bg-gray-800 text-white"
                : item.active
                  ? "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                  : "text-gray-600 cursor-not-allowed"
            }`}
            disabled={!item.active}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
```

**Step 2: Build the main App layout**

Replace `frontend/src/App.tsx`:

```tsx
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import { GetWorkspaces } from "../wailsjs/go/main/App";

interface Workspace {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

function App() {
  const [activeItem, setActiveItem] = useState("Workspaces");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    GetWorkspaces()
      .then((ws) => setWorkspaces(ws || []))
      .catch((err) => setError(String(err)));
  }, []);

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />
      <main className="flex-1 flex items-center justify-center p-8">
        {error ? (
          <p className="text-red-400">Error: {error}</p>
        ) : workspaces.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 text-lg">No workspaces yet.</p>
            <p className="text-gray-600 text-sm mt-1">
              Create one to get started.
            </p>
          </div>
        ) : (
          <ul>
            {workspaces.map((ws) => (
              <li key={ws.id}>{ws.name}</li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default App;
```

**Step 3: Remove import of deleted App.css from main.tsx if present**

In `frontend/src/main.tsx`, ensure there is no `import './App.css'` line. Keep the `import './style.css'` line.

**Step 4: Run and verify**

```bash
cd /Users/filalis/Projects/nser && wails dev
```

Expected: Dark-themed dashboard with sidebar (NSER title, four nav items) and main area showing "No workspaces yet. Create one to get started."

**Step 5: Commit**

```bash
cd /Users/filalis/Projects/nser
git add frontend/src/ && git commit -m "feat: build dark-themed dashboard shell with sidebar"
```

---

### Task 7: Final Verification

**Step 1: Clean build**

```bash
cd /Users/filalis/Projects/nser && wails build
```

Expected: Builds successfully. Binary appears in `build/bin/`.

**Step 2: Run the built binary**

```bash
./build/bin/nser
```

Expected: Same dark dashboard as in dev mode.

**Step 3: Verify database**

```bash
sqlite3 ~/.nser/nser.db ".tables"
```

Expected output: `assets  ports  tool_runs  workspaces`

**Step 4: Commit any remaining changes**

```bash
git status
```

If clean, done. If not, commit remaining files.
