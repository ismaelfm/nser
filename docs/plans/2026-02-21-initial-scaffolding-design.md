# Design: Nser Initial Scaffolding

**Date:** 2026-02-21
**Status:** Approved

## Summary

Bootstrap the Nser project using `wails init` with the React-TS template, then layer on the Go backend packages and SQLite schema. The goal is a running desktop app with a dark-themed dashboard shell that proves the full stack is wired: Wails bridge, Go backend with SQLite, and React frontend.

## Decisions

| Decision | Choice |
|----------|--------|
| Approach | Wails CLI init + manual structure |
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS (dark theme only) |
| State management | React hooks (no library) |
| Go layout | Flat packages (`internal/db`, `internal/recon`, `internal/ai`) |
| SQLite driver | `modernc.org/sqlite` (pure Go, no CGO) |
| DB location | `~/.nser/nser.db` |
| Schema | workspaces, assets, ports, tool_runs |
| First-run proof | Dashboard shell + DB init + one working binding |

## Project Structure

```
nser/
├── main.go                    # Wails app entry point
├── app.go                     # Wails-bound App struct (bindings layer)
├── wails.json                 # Wails project config
├── go.mod / go.sum
├── internal/
│   ├── db/
│   │   ├── db.go              # SQLite connection init, migration runner
│   │   └── schema.sql         # DDL for workspaces, assets, logs tables
│   ├── recon/
│   │   └── tool.go            # Tool interface definition
│   └── ai/
│       └── ai.go              # OpenRouter client stub (placeholder)
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── src/
│   │   ├── main.tsx           # React entry
│   │   ├── App.tsx            # Root layout with sidebar + content area
│   │   ├── components/
│   │   │   └── Sidebar.tsx    # Navigation sidebar
│   │   └── styles/
│   │       └── globals.css    # Tailwind directives
│   └── wailsjs/               # Auto-generated Wails JS bindings
└── docs/
    └── plans/
```

## SQLite Schema

```sql
CREATE TABLE workspaces (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assets (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    type         TEXT NOT NULL CHECK(type IN ('ip', 'domain', 'url')),
    value        TEXT NOT NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, type, value)
);

CREATE TABLE ports (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    port     INTEGER NOT NULL,
    protocol TEXT DEFAULT 'tcp',
    service  TEXT DEFAULT '',
    state    TEXT DEFAULT 'open',
    UNIQUE(asset_id, port, protocol)
);

CREATE TABLE tool_runs (
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

## Go Backend

**app.go (Wails bindings):**
- On startup: initialize SQLite database, run schema migration
- Expose `GetWorkspaces() []Workspace` binding to frontend

**internal/db/db.go:**
- Open/create SQLite file at `~/.nser/nser.db`
- Run schema DDL on first init
- Expose `*sql.DB` handle

**internal/recon/tool.go:**
- `Tool` interface: `Name()`, `Execute()`, `Parse()` — no implementations yet

**internal/ai/ai.go:**
- Empty placeholder struct for OpenRouter integration

## React Frontend

**Layout:** Dark-themed dashboard with sidebar + main content area.

**Sidebar:** Navigation items — Workspaces, Recon, AI Copilot, Reports. Only Workspaces is wired.

**Main content:** Empty state — "No workspaces yet. Create one to get started."

**Styling:** Tailwind CSS, dark-mode only, no light theme toggle.

**No routing library** — conditional rendering is sufficient at this stage.

## Success Criteria

1. `wails dev` opens a desktop window with the dark dashboard
2. SQLite database created at `~/.nser/nser.db` with all tables
3. `GetWorkspaces()` binding callable from React (returns empty list)
4. Project compiles cleanly with `wails build`
