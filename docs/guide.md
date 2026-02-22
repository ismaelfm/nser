# Nser Developer Guide

> A practical guide for working with this Wails (Go + React) desktop app.
> Written for developers coming from Python.

---

## Quick Reference

| What | Command | Run from |
|------|---------|----------|
| **Dev mode** (live reload) | `wails dev` | project root |
| **Production build** | `wails build` | project root |
| **Check Go errors** | `go build ./...` | project root |
| **Check TypeScript errors** | `npx tsc --noEmit` | `frontend/` |
| **Install Go dep** | `go get <package>` | project root |
| **Install JS dep** | `npm install <package>` | `frontend/` |

---

## How This Project Works

```
You (user) ←→ React UI (TypeScript) ←→ Wails Bridge ←→ Go Backend ←→ SQLite
```

**Wails** is a framework that lets you build desktop apps with a Go backend and a web frontend. Think of it like Electron, but instead of Node.js on the backend you have Go. The frontend is a normal React app, but instead of running in a browser, it runs inside a native desktop window.

### The Python Analogy

| Python world | Nser equivalent |
|---|---|
| `flask run` / `uvicorn` | `wails dev` |
| `pip install <pkg>` | `go get <pkg>` (Go) or `npm install <pkg>` (JS) |
| `requirements.txt` | `go.mod` (Go) + `package.json` (JS) |
| `pip freeze` / lockfile | `go.sum` (Go) + `package-lock.json` (JS) |
| Flask route returning JSON | Exported Go method on `App` struct |
| `import requests` | `import "net/http"` |
| `python -m py_compile *.py` | `go build ./...` |
| `mypy --check` | `npx tsc --noEmit` |

---

## Running the App

### Dev Mode (what you'll use 99% of the time)

```bash
wails dev
```

This does three things simultaneously:
1. Compiles and runs the Go backend
2. Starts the Vite dev server for the React frontend (with hot reload)
3. Opens a desktop window showing the app

**Hot reload behavior:**
- **Frontend changes** (`.tsx`, `.css`): instant — the browser-like window updates without restarting
- **Backend changes** (`.go`): Wails detects the change, recompiles Go, and restarts the app

### Production Build

```bash
wails build
```

Produces a standalone binary at `build/bin/nser`. This bundles the frontend into the Go binary — no separate web server needed.

---

## Checking for Errors

### Backend Errors (Go)

```bash
# From project root
go build ./...
```

The `./...` means "all packages in this project, recursively." This is Go's equivalent of running `python -m py_compile` on every `.py` file. If it prints nothing, everything compiled successfully.

**Common Go error patterns:**

```
# Unused import (Go is strict about this — no warnings, it's an error)
./app.go:5:2: "fmt" imported and not used

# Wrong type
./app.go:42:18: cannot use x (variable of type string) as int value

# Undefined function
./app.go:30:5: undefined: DoSomething
```

> **Key Go difference from Python:** Go checks types at compile time. If `go build` passes, you won't get `TypeError` at runtime. The trade-off is that compilation is stricter.

### Frontend Errors (TypeScript)

```bash
# From frontend/ directory
npx tsc --noEmit
```

`tsc` is the TypeScript compiler. `--noEmit` means "check for errors but don't output files" (Vite handles the actual bundling). This is like running `mypy` on your Python code.

```bash
# Or build the frontend bundle to also catch bundling issues
cd frontend && npx vite build
```

**Common TypeScript error patterns:**

```
# Wrong prop type (like a mypy error)
src/App.tsx(15,3): error TS2322: Type 'string' is not assignable to type 'number'.

# Missing property
src/App.tsx(20,5): error TS2741: Property 'name' is missing in type '{}'.

# Import not found
src/App.tsx(1,27): error TS2307: Cannot find module './Foo'.
```

### Both at Once

```bash
# Quick "does everything compile?" check
cd /Users/filalis/Projects/nser && go build ./... && cd frontend && npx tsc --noEmit
```

---

## Project Structure Explained

```
nser/
├── main.go                 # App entry point — configures the window and starts Wails
├── app.go                  # The "API" — Go methods here become callable from React
├── wails.json              # Wails config (window title, build commands)
├── go.mod / go.sum         # Go dependencies (like requirements.txt + lock)
│
├── internal/               # Private Go packages (see internal/README.md)
│   ├── db/                 # SQLite database
│   ├── tool/               # Tool execution engine (see internal/tool/README.md)
│   └── ai/                 # AI client placeholder
│
├── frontend/               # React app (see frontend/README.md)
│   ├── package.json        # JS dependencies
│   ├── src/                # Your React components
│   └── wailsjs/            # Auto-generated bridge code
│
├── build/                  # Build assets (icons, etc.)
└── docs/                   # Documentation & plans
```

---

## How Go-to-React Bindings Work

This is the key concept in Wails. Any **exported method** on the `App` struct in `app.go` automatically becomes a JavaScript function you can call from React.

### Go side (`app.go`):

```go
// This method is "exported" because it starts with a capital letter.
// Wails auto-generates a JS wrapper for it.
func (a *App) GetWorkspaces() ([]Workspace, error) {
    // ... query database ...
    return workspaces, nil
}
```

### React side (`App.tsx`):

```tsx
// This import points to auto-generated code in wailsjs/
import { GetWorkspaces } from "../wailsjs/go/main/App";

// Call it like any async function — it returns a Promise
const workspaces = await GetWorkspaces();
```

**The rule:** if you add or change a method on `App` in `app.go`, Wails regenerates the JS bindings in `frontend/wailsjs/` when you run `wails dev`. You don't edit those files by hand.

### Python analogy

```python
# This is roughly what Wails does for you automatically:

# Go side (app.go)
@app.route("/api/workspaces")
def get_workspaces():
    return jsonify(db.query("SELECT * FROM workspaces"))

# JS side (auto-generated)
async function GetWorkspaces() {
    return await fetch("/api/workspaces").then(r => r.json())
}
```

Except there's no HTTP — Wails uses an internal bridge that's faster.

---

## Adding New Features (Workflow)

### 1. Add a Go method

Edit `app.go` and add an exported method:

```go
func (a *App) CreateWorkspace(name string, description string) error {
    _, err := a.db.ExecContext(a.ctx,
        "INSERT INTO workspaces (name, description) VALUES (?, ?)",
        name, description,
    )
    return err
}
```

### 2. Restart `wails dev`

Wails detects the change and regenerates `frontend/wailsjs/go/main/App.js`. The new `CreateWorkspace` function appears automatically.

### 3. Call it from React

```tsx
import { CreateWorkspace } from "../wailsjs/go/main/App";

await CreateWorkspace("my-project", "A test workspace");
```

### 4. Verify

```bash
go build ./...          # Does Go compile?
cd frontend && npx tsc --noEmit  # Does TypeScript compile?
```

---

## Common Tasks

### Install a Go dependency

```bash
go get github.com/some/package
```

This updates `go.mod` and `go.sum` (like `pip install` updating `requirements.txt`).

### Install a JavaScript dependency

```bash
cd frontend && npm install some-package
```

### Run only the frontend (no Go backend)

```bash
cd frontend && npm run dev
```

Useful for working on UI layout without waiting for Go to compile. The Wails bindings will fail at runtime (no Go backend), but the UI renders.

### View the SQLite database

```bash
sqlite3 ~/.nser/nser.db

# Inside sqlite3:
.tables                          -- list all tables
SELECT * FROM workspaces;        -- query data
.schema workspaces               -- see table definition
.quit                            -- exit
```

### Clean rebuild

```bash
# If things get weird
cd frontend && rm -rf node_modules && npm install
cd .. && wails dev
```

---

## Go Crash Course (for Python devs)

| Concept | Python | Go |
|---------|--------|----|
| Variable | `x = 5` | `x := 5` |
| Function | `def foo(x: int) -> str:` | `func foo(x int) string {` |
| Method | `def greet(self, name):` | `func (a *App) Greet(name string) string {` |
| Error handling | `try/except` | `if err != nil { return err }` |
| Import | `from db import open` | `import "nser/internal/db"` |
| Package = module | one `.py` file | one directory (all `.go` files in it share a package) |
| Public/private | `_private` convention | Lowercase = private, Uppercase = public |
| Null / None | `None` | `nil` |

### The `error` pattern

Go doesn't have exceptions. Instead, functions return errors as a second value:

```go
// Go                              # Python equivalent
result, err := doSomething()       # try:
if err != nil {                    #     result = do_something()
    return err                     # except Exception as e:
}                                  #     raise e
```

### The `internal/` convention

In Go, any package under `internal/` can only be imported by code in the same module. It's Go's way of saying "these are private implementation details." External packages can't reach in.

---

## React + TypeScript Crash Course (for Python devs)

### Components = Functions that return HTML

```tsx
// A React component — like a Jinja2 template that can have logic
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}
```

### State = Variables that trigger re-renders

```tsx
const [count, setCount] = useState(0);
// Calling setCount(5) re-renders the component with count = 5
// Like a reactive variable — the UI updates whenever state changes
```

### useEffect = "Run this when the component loads"

```tsx
useEffect(() => {
  // This runs once when the component first appears on screen.
  // Perfect for loading data from the Go backend.
  GetWorkspaces().then(setWorkspaces);
}, []);  // [] = "only run once"
```

### TypeScript = Python type hints but enforced

```tsx
// TypeScript                      # Python
interface User {                   # class User(TypedDict):
  name: string;                    #     name: str
  age: number;                     #     age: int
}                                  #
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `wails dev` says "wails: command not found" | Install Wails: `go install github.com/wailsapp/wails/v2/cmd/wails@latest` |
| Frontend shows blank white page | Check browser devtools (right-click → Inspect in the Wails window). Look at Console tab for JS errors |
| Go changes don't take effect | `wails dev` should auto-restart. If not, Ctrl+C and re-run |
| `npm install` fails with ERESOLVE | Delete `node_modules` and `package-lock.json`, then `npm install` again |
| "imported and not used" error | Remove the unused import. Go doesn't allow dead imports |
| SQLite "database is locked" | Make sure only one instance of the app is running |
