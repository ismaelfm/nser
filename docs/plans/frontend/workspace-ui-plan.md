# Nser Frontend Plan — Workspace UI
*Date: 2026-02-21 | Based on existing React + Tailwind + Wails stack*

---

## Goal

Build a professional pentester workspace UI inside the existing Wails/React app. When a user opens a workspace, they see:

1. **Phase tabs** — MITRE ATT&CK ordered: Recon → Scanning → Exploit
2. **Tool picker** — tools filtered by the active phase
3. **Target input + arg builder** — pre-filled from workspace default target
4. **Live terminal stream** — real-time subprocess output, like a real terminal
5. **Command history panel** — every run, per workspace, with output replay

---

## Component Tree

```
App
├── Sidebar                          (existing — add workspace context)
│   ├── nav items
│   └── privilege badge
│
└── main
    ├── WorkspacesView               (existing — updated for CRUD + "Open" action)
    │   ├── WorkspaceCard            (existing card → now clickable to open WorkspaceDetail)
    │   └── NewWorkspaceModal        (NEW)
    │
    └── WorkspaceDetail              (NEW — the core workspace view)
        ├── WorkspaceHeader          (name, target, edit button, back button)
        ├── PhaseTabs                (Recon / Scanning / Exploit — MITRE order)
        │   └── PhaseTab             (one per phase)
        │
        ├── RunPanel                 (RIGHT side)
        │   ├── ToolPicker           (dropdown filtered by active phase)
        │   ├── TargetInput          (pre-filled from workspace.target)
        │   ├── ArgsInput            (freeform extra args)
        │   └── RunButton            (calls RunToolStreaming)
        │
        ├── TerminalStream           (NEW — live output panel)
        │   ├── xterm.js terminal OR custom div with monospace auto-scroll
        │   ├── Subscribes to: EventsOn("tool:output:<runID>", ...)
        │   └── Shows RunResult summary on EventsOn("tool:done:<runID>", ...)
        │
        └── CommandHistoryPanel      (BOTTOM or LEFT drawer)
            ├── HistoryEntry[]       (tool name, target, status badge, timestamp, duration)
            │   └── onClick → opens OutputModal
            └── OutputModal          (shows stored raw_output for a past run)
```

---

## Page: WorkspacesView (Existing — Extend)

**Changes needed:**

| What | How |
|---|---|
| "New Workspace" button | Wires up to `NewWorkspaceModal` |
| Workspace card click | Navigates to `WorkspaceDetail` (pass workspaceID as state) |
| Delete workspace | Calls `DeleteWorkspace(id)` from a kebab menu on each card |

**New bindings used:**
- `CreateWorkspace(name, desc, target)` 
- `DeleteWorkspace(id)`
- `GetWorkspaces()` (already exists)

---

## Page: WorkspaceDetail (New)

### State

```ts
interface WorkspaceDetailState {
  workspace: Workspace;
  activePhase: 'recon' | 'scanning' | 'exploit';
  tools: ToolDef[];
  selectedTool: ToolDef | null;
  target: string;          // defaults to workspace.target
  extraArgs: string;       // free-form string split on spaces
  currentRunId: number | null;
  streamLines: string[];   // live terminal lines
  isRunning: boolean;
  history: CommandRun[];
}
```

### PhaseTabs

Ordered by MITRE ATT&CK lifecycle:

| Tab | ATT&CK Phase | Tools |
|---|---|---|
| 🔍 Recon | Reconnaissance (TA0043) | subfinder, amass, theHarvester, whois, dig |
| 🔬 Scanning | Discovery (TA0007) | nmap, masscan, httpx, nuclei |
| 💥 Exploit | Execution / Initial Access | sqlmap, hydra, gobuster |

Each tab filters tools from `GetTools()` by `category`.

### TerminalStream Component

```
┌───────────────────────────────────────────────────────────────┐
│  $ nmap -sV -p 80,443 192.168.1.1                             │
│                                                                │
│  Starting Nmap 7.94 ( https://nmap.org )                      │
│  Nmap scan report for 192.168.1.1                             │
│  PORT    STATE SERVICE VERSION                                 │
│  80/tcp  open  http    nginx 1.21.6                           │
│  443/tcp open  https   nginx 1.21.6                           │
│                                                                │
│  ✓ Completed in 4.2s  •  Exit 0                              │
└───────────────────────────────────────────────────────────────┘
```

**Implementation approach:**
- A `<div>` with `overflow-y: auto` + `scroll-behavior: smooth`, auto-scroll on new lines
- Each line rendered as `<span className="font-mono text-sm text-green-300">`
- Error lines (stderr) rendered in amber/red
- On `tool:done` event, show summary bar (status badge, duration, exit code)
- `xterm.js` is an option for a richer terminal feel but adds bundle size — keep as optional upgrade

**Wails event subscription (React):**
```ts
import { EventsOn, EventsOff } from '../../wailsjs/runtime';

useEffect(() => {
  if (!currentRunId) return;
  const outputEvent = `tool:output:${currentRunId}`;
  const doneEvent = `tool:done:${currentRunId}`;

  EventsOn(outputEvent, (line: string) => {
    setStreamLines(prev => [...prev, line]);
  });
  EventsOn(doneEvent, (result: RunResult) => {
    setIsRunning(false);
    // refresh history
    GetWorkspaceHistory(workspaceId).then(setHistory);
  });

  return () => {
    EventsOff(outputEvent);
    EventsOff(doneEvent);
  };
}, [currentRunId]);
```

### CommandHistoryPanel

```
┌─ Command History ──────────────────────────────────────────────┐
│  🟢 nmap -sV 192.168.1.1       2m ago   4.2s                  │
│  🔴 sqlmap -u http://...        5m ago   failed                │
│  🟢 subfinder -silent ...       12m ago  2.1s   [view output]  │
└────────────────────────────────────────────────────────────────┘
```

- Calls `GetWorkspaceHistory(workspaceId)` on mount and after each run
- Each row: tool name, full `command_line`, status pill, `startedAt` relative time, duration
- Click → fetch `GetRunOutput(runId)` and display in `OutputModal`
- Delete button → `DeleteRun(runId)` then refresh

---

## Page: NewWorkspaceModal (New)

Simple modal form:
- **Name** (required, unique)
- **Description** (optional)
- **Default Target** (optional, e.g. `192.168.1.0/24` or `example.com`) — pre-fills target input in RunPanel

Calls `CreateWorkspace(name, desc, target)`.

---

## Navigation / Routing

The app currently uses a simple `activeItem` string in `App.tsx`. Extend this to support a "workspace detail" state:

```ts
type View =
  | { type: 'workspaces' }
  | { type: 'workspace-detail'; workspaceId: number }
  | { type: 'tools' }
  | { type: 'ai-copilot' }
  | { type: 'reports' };
```

The sidebar's workspace list can also show recently opened workspaces (read from `GetWorkspaces()`).

---

## New Wails Bindings Used (already implemented in Go)

| Frontend call | Go binding |
|---|---|
| `CreateWorkspace(name, desc, target)` | `app.CreateWorkspace` |
| `UpdateWorkspace(id, name, desc, target)` | `app.UpdateWorkspace` |
| `DeleteWorkspace(id)` | `app.DeleteWorkspace` |
| `GetWorkspaceByID(id)` | `app.GetWorkspaceByID` |
| `GetWorkspaceHistory(workspaceId)` | `app.GetWorkspaceHistory` |
| `GetRunOutput(runId)` | `app.GetRunOutput` |
| `DeleteRun(runId)` | `app.DeleteRun` |
| `GetTools()` | `app.GetTools` |
| `RunToolStreaming(wsId, tool, target, args)` | `app.RunToolStreaming` |
| `EventsOn("tool:output:<id>", cb)` | Wails runtime |
| `EventsOn("tool:done:<id>", cb)` | Wails runtime |

---

## Design Notes

- **Color language**: Recon = blue, Scanning = indigo, Exploit = red/amber — consistent with existing dark palette
- **Terminal bg**: `#0a0f18` (existing dark bg) with green/amber text for output
- **Status pills**: `completed` = emerald, `running` = blue pulse, `failed` = red
- **History sidebar**: collapsible drawer on the left at 280px, or bottom panel toggled with a keyboard shortcut (e.g. `H`)
- **Keyboard shortcut**: `⌘↵` to run the selected tool
- All animations should follow the existing `transition-all duration-200` / `duration-300` convention

---

## File Structure (new files to create)

```
frontend/src/
├── components/
│   ├── Sidebar.tsx                  (existing — minor update)
│   ├── WorkspacesView.tsx           (existing — add CRUD + navigation)
│   ├── ToolsView.tsx                (existing — no change)
│   ├── WorkspaceDetail.tsx          (NEW — main workspace page)
│   ├── PhaseTabs.tsx                (NEW — tab bar)
│   ├── RunPanel.tsx                 (NEW — tool picker + run button)
│   ├── TerminalStream.tsx           (NEW — live output)
│   ├── CommandHistoryPanel.tsx      (NEW — history list)
│   ├── OutputModal.tsx              (NEW — output replay modal)
│   └── NewWorkspaceModal.tsx        (NEW — create workspace form)
└── App.tsx                          (update view routing)
```

---

## Open Questions / Decisions for Implementation

> [!NOTE]
> These are decisions the implementer should confirm before writing React code:

1. **xterm.js vs custom scroll-div** — xterm.js is more authentic but adds ~500KB. For now the plan uses a custom div; xterm.js can be swapped in later.
2. **History panel position** — bottom slide-up panel vs left sidebar toggle. Left sidebar recommended to keep the terminal full-width.
3. **Args input** — free-form string split on spaces, or a tag-input for individual flags? Tag-input is more professional but more complex.
4. **Workspace switching** — clicking a workspace in the sidebar vs going back to the list. Recommend: sidebar shows top-3 recent workspaces directly.
