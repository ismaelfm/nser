# `frontend/` — React + TypeScript UI

> The entire frontend is a standard React app built with Vite.
> Wails embeds it into a desktop window instead of serving it in a browser.

---

## Key Files

```
frontend/
├── index.html              # Entry point — loads main.tsx
├── package.json            # JS dependencies (like requirements.txt)
├── vite.config.ts          # Vite bundler config + Tailwind plugin
├── tsconfig.json           # TypeScript compiler settings
│
├── src/
│   ├── main.tsx            # React bootstrap — mounts <App /> into the DOM
│   ├── App.tsx             # Root component — layout + data loading
│   ├── style.css           # Global styles (just `@import "tailwindcss"`)
│   └── components/
│       └── Sidebar.tsx     # Navigation sidebar
│
└── wailsjs/                # ⚠️ AUTO-GENERATED — don't edit
    ├── go/main/App.js      # JS wrappers for Go methods
    ├── go/main/App.d.ts    # TypeScript type declarations
    └── runtime/            # Wails runtime (window controls, events, etc.)
```

---

## How the pieces connect

```
index.html
  └── loads main.tsx
        └── renders <App />
              ├── renders <Sidebar />
              └── calls GetWorkspaces() from wailsjs/go/main/App.js
                    └── which calls the Go method App.GetWorkspaces() in app.go
                          └── which queries SQLite
```

---

## Styling: Tailwind CSS v4

We use [Tailwind CSS v4](https://tailwindcss.com/docs) — a utility-first CSS framework. Instead of writing CSS classes, you compose styles directly in HTML:

```tsx
// Tailwind (what we use)
<div className="flex h-screen bg-gray-950 text-white">

// Equivalent vanilla CSS
// .container { display: flex; height: 100vh; background: #030712; color: #fff; }
```

**Configuration:** Tailwind v4 uses a Vite plugin (`@tailwindcss/vite`) instead of a config file. The only CSS file is `style.css` containing `@import "tailwindcss"`.

**Useful Tailwind reference:** https://tailwindcss.com/docs

---

## `wailsjs/` — The Bridge

This directory is **auto-generated** by Wails. Never edit files here directly — they get overwritten.

### `go/main/App.js`

For every exported method on the `App` struct in `app.go`, Wails generates a JS function:

```js
// Auto-generated: maps to Go's App.GetWorkspaces()
export function GetWorkspaces() {
    return window['go']['main']['App']['GetWorkspaces']();
}
```

### `go/main/App.d.ts`

TypeScript type declarations so your editor gets autocomplete:

```ts
export function GetWorkspaces(): Promise<Array<any>>;
```

### `runtime/`

Wails runtime utilities — window management, events, clipboard, etc:

```tsx
import { WindowMinimise, WindowMaximise, Quit } from "../wailsjs/runtime/runtime";
```

### When do bindings regenerate?

Every time you run `wails dev` or `wails build`. If you add a new Go method and the JS side can't find it, restart `wails dev`.

---

## Common frontend tasks

### Add a new component

1. Create `src/components/MyComponent.tsx`:

```tsx
interface MyComponentProps {
  title: string;
}

export default function MyComponent({ title }: MyComponentProps) {
  return <h2 className="text-xl font-bold text-white">{title}</h2>;
}
```

2. Import and use it in `App.tsx`:

```tsx
import MyComponent from "./components/MyComponent";

// Inside the JSX:
<MyComponent title="Hello" />
```

### Call a Go function from React

```tsx
import { SomeGoMethod } from "../wailsjs/go/main/App";

// All Go bindings return Promises (they're async)
const result = await SomeGoMethod(arg1, arg2);
```

### Add a JS dependency

```bash
npm install some-library
# Then import it in your .tsx files
```

### Check for TypeScript errors

```bash
npx tsc --noEmit
```

### Build the frontend only (for debugging)

```bash
npx vite build
```

The output goes to `dist/` which Wails embeds into the Go binary.

---

## React concepts used here

| Pattern | Where | What it does |
|---------|-------|-------------|
| `useState` | `App.tsx` | Stores data that triggers re-renders when changed |
| `useEffect` | `App.tsx` | Runs code when the component first appears (data loading) |
| Props | `Sidebar.tsx` | Data passed from parent to child component |
| Conditional rendering | `App.tsx` | `{error ? <Error /> : <Content />}` — like Python's ternary |
