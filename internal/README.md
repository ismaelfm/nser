# `internal/` — Go Backend Packages

> In Go, `internal/` is a special directory name. Code here can only be imported
> by other code in the same project. Think of it as "truly private" modules.

---

## `db/` — Database Layer

**Files:** `db.go`, `schema.sql`

Manages the SQLite database stored at `~/.nser/nser.db`.

### What `db.go` does

```
db.Open()  →  creates/opens the SQLite file
           →  runs schema.sql to ensure tables exist
           →  returns a *sql.DB connection handle
```

The `*sql.DB` handle is Go's equivalent of a database connection pool. You pass it around and use it to run queries — similar to `sqlalchemy.create_engine()` or `sqlite3.connect()` in Python.

### Key pragmas set on the connection

| Pragma | What it does |
|--------|-------------|
| `foreign_keys(1)` | Enforces foreign key constraints (SQLite has them off by default!) |
| `journal_mode(WAL)` | Write-ahead logging — enables concurrent reads while writing |
| `busy_timeout(5000)` | Wait up to 5s if the DB is locked instead of failing immediately |

### `schema.sql` — The tables

| Table | Purpose |
|-------|---------|
| `workspaces` | Top-level project containers (name, description) |
| `assets` | IPs, domains, URLs belonging to a workspace |
| `ports` | Open ports discovered on assets |
| `tool_runs` | Log of every recon tool execution and its output |

Tables use `IF NOT EXISTS` so the schema runs safely every time the app starts.

---

## `tool/` — Tool Execution Engine

**See:** [tool/README.md](tool/README.md) for full documentation.

The core system for running external security tools. Three layers:

| File | Purpose |
|------|---------|
| `registry.go` | `ToolDef` struct + `Registry` — all tools defined as data |
| `runner.go` | `Runner.Run()` — generic subprocess executor |
| `health.go` | `CheckAll()` — checks which tools are installed + versions |
| `privilege_*.go` | OS-specific privilege detection (root/admin) |
| `defs/*.go` | Tool definitions organized by category |

**Adding a new tool = one struct.** No new code files needed. See `tool/README.md`.

---

## `ai/` — AI Client

**Files:** `ai.go`

Placeholder for the OpenRouter API client (LLM routing). Currently just a struct with a constructor. Will eventually handle sending prompts to LLMs via [OpenRouter](https://openrouter.ai/).

---

## Adding a new package

1. Create a new directory: `internal/mypackage/`
2. Create a `.go` file with `package mypackage` at the top
3. Import it from `app.go`: `import "nser/internal/mypackage"`
4. Run `go build ./...` to verify
