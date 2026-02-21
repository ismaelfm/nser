# Tool Documentation UI Plan

## Overview

When a user clicks on a tool in the sidebar tools list, navigate to a full tool documentation page. The page displays the tool's description, rich markdown documentation, and usage examples.

## Data Source (Backend Bindings)

All data comes from existing Go backend bindings:

| Binding | Returns | Purpose |
|---------|---------|---------|
| `GetTools()` | `ToolDef[]` | Tool list with `name`, `category`, `description` |
| `GetToolDocs(toolName)` | `ToolDocumentation` | Markdown docs + examples array |
| `SaveToolDocs(toolName, markdown)` | `error` | Upsert documentation |
| `SaveToolExample(id, toolName, title, desc, cmd, order)` | `error` | Create (id=0) or update example |
| `DeleteToolExample(id)` | `error` | Remove an example |

### ToolDocumentation shape

```json
{
  "toolName": "nmap",
  "documentation": "# Nmap\n\n...",
  "examples": [
    {
      "id": 1,
      "toolName": "nmap",
      "title": "Quick SYN scan",
      "description": "Fast SYN scan of top 1000 ports",
      "command": "nmap -sS 10.0.0.1",
      "sortOrder": 1
    }
  ]
}
```

## Pages & Components

### 1. Tool List (sidebar — extend existing)

The existing sidebar tools list already uses `GetTools()`. Changes:

- Show the `description` field as a subtitle under each tool name
- Make each tool row clickable → navigates to `/tools/:toolName`

### 2. Tool Documentation Page (`/tools/:toolName`)

Full-page view with the following sections stacked vertically:

#### Header
- Tool name (large heading)
- Category badge (recon / scanning / exploit)
- One-line description from `ToolDef.Description`
- Install status indicator (use `GetToolHealth()` data if available)

#### Documentation Section
- Render `documentation` field as markdown (use a markdown renderer like `react-markdown`)
- This contains key features, common flags tables, and usage notes

#### Examples Section
- Card grid of examples, each card shows:
  - **Title** (bold)
  - **Description** (subtitle text)
  - **Command** in a monospace code block with a copy-to-clipboard button
- Optional: "Use in workspace" button that pre-fills the workspace tool picker

### 3. Component Breakdown

```
ToolDocPage/
├── ToolDocHeader        — name, category, description, install status
├── ToolDocContent       — markdown renderer for documentation
└── ToolExamplesGrid/
    └── ExampleCard      — title, description, command with copy button
```

## Routing

Add a new route to the React router:

```
/tools/:toolName  →  <ToolDocPage />
```

The sidebar tool list items should `navigate(`/tools/${tool.name}`)` on click.

## Styling Guidelines

- Documentation section: clean reading typography, similar to GitHub markdown rendering
- Examples: card-based layout, 1-2 columns depending on viewport
- Code blocks: dark background, monospace font, copy button in top-right corner
- Category badge: use existing category color scheme (recon = blue, scanning = orange, exploit = red)

## Implementation Steps

1. Create `ToolDocPage` component with route parameter handling
2. Create `ToolDocHeader` component
3. Install/configure markdown renderer (`react-markdown` + `remark-gfm` for tables)
4. Create `ToolDocContent` component
5. Create `ExampleCard` and `ToolExamplesGrid` components
6. Add route to router
7. Update sidebar tool list items to be clickable links
8. Style all components
