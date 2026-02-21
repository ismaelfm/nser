# `internal/tool/` — Tool Execution Engine

> This package is the core of Nser's tool integration. Adding a new tool
> means writing **one struct definition** — no execution code, no new files.

---

## Architecture

```
defs/              registry.go         runner.go          health.go
(tool structs)  →  (stores them)    →  (runs them)     →  (checks them)
                   Registry             Runner             CheckAll()
                   .Get("nmap")         .Run(ctx, ...)     CheckPrivileges()
```

## Adding a New Tool

Open the appropriate file in `defs/` (or create a new one) and add a struct:

```go
r.Register(tool.ToolDef{
    Name:        "mytool",                    // unique name, used in API calls
    Category:    tool.CategoryRecon,           // recon | scanning | exploit
    Binary:      "mytool",                    // executable name in $PATH
    DefaultArgs: []string{"--quiet"},          // always-on flags (can be nil)
    NeedsRoot:   false,                       // needs sudo/admin?
    InstallHint: map[string]string{           // shown on health dashboard
        "linux":   "apt install mytool",
        "darwin":  "brew install mytool",
        "windows": "choco install mytool",
    },
    VersionFlag: "--version",                 // flag to get version string
})
```

That's it. The tool will:
- Appear in the health check dashboard
- Be executable via `RunTool("mytool", ...)`
- Have its output stored in the `tool_runs` database table

## File Guide

| File | Purpose |
|------|---------|
| `registry.go` | `ToolDef` struct + `Registry` (stores all tools, thread-safe) |
| `runner.go` | `Runner.Run()` — subprocess execution, stdout/stderr capture, DB storage |
| `health.go` | `CheckAll()` — checks which tools are installed, gets versions |
| `privilege_unix.go` | `CheckPrivileges()` for Linux/macOS (checks `uid == 0`) |
| `privilege_windows.go` | `CheckPrivileges()` for Windows (checks via `net session`) |
| `defs/recon.go` | Tool definitions: subfinder, amass, theHarvester, whois, dig |
| `defs/scanning.go` | Tool definitions: nmap, masscan, nuclei, gobuster, ffuf, nikto |
| `defs/exploit.go` | Tool definitions: sqlmap, hydra |

## How the Runner Works

```
Runner.Run("nmap", workspace=1, target="10.0.0.1", args=["-sV"])
  │
  ├─ 1. Look up "nmap" in registry → ToolDef
  ├─ 2. Check binary exists: exec.LookPath("nmap")
  ├─ 3. Build command: nmap + DefaultArgs + userArgs + target
  ├─ 4. INSERT INTO tool_runs (status='running')
  ├─ 5. exec.CommandContext with 5-min timeout
  ├─ 6. Capture stdout + stderr
  ├─ 7. UPDATE tool_runs (status='completed'|'failed', raw_output=...)
  └─ 8. Return RunResult { output, exitCode, duration, runID }
```

## How Health Check Works

```
Registry.CheckAll()
  │
  for each registered ToolDef:
  ├─ exec.LookPath(binary)  →  installed? path?
  ├─ exec.Command(binary, versionFlag)  →  version string
  └─ return ToolHealth { name, installed, version, path, installHint }
```

## Registered Tools

| Name | Category | Binary | Needs Root |
|------|----------|--------|-----------|
| subfinder | recon | `subfinder` | No |
| amass | recon | `amass` | No |
| theharvester | recon | `theHarvester` | No |
| whois | recon | `whois` | No |
| dig | recon | `dig` | No |
| nmap | scanning | `nmap` | Yes |
| masscan | scanning | `masscan` | Yes |
| nuclei | scanning | `nuclei` | No |
| gobuster | scanning | `gobuster` | No |
| ffuf | scanning | `ffuf` | No |
| nikto | scanning | `nikto` | No |
| sqlmap | exploit | `sqlmap` | No |
| hydra | exploit | `hydra` | No |
