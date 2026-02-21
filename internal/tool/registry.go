package tool

import (
	"fmt"
	"sync"
)

// Category groups tools by their purpose in the engagement lifecycle.
type Category string

const (
	CategoryRecon    Category = "recon"
	CategoryScanning Category = "scanning"
	CategoryExploit  Category = "exploit"
)

// ToolDef describes an external tool. Adding a new tool to Nser means
// creating one of these structs — no execution code needed.
type ToolDef struct {
	// Name is the unique identifier: "nmap", "subfinder", etc.
	Name string

	// Category groups the tool: recon, scanning, exploit.
	Category Category

	// Binary is the executable name looked up in $PATH: "nmap", "subfinder".
	Binary string

	// DefaultArgs are flags always prepended to user-supplied args.
	// Example: ["-silent"] for subfinder, ["-oX", "-"] for nmap XML output.
	DefaultArgs []string

	// NeedsRoot is true if the tool requires elevated privileges (e.g. nmap SYN scan).
	NeedsRoot bool

	// InstallHint maps OS identifiers to install commands shown in the health dashboard.
	// Keys: "linux", "darwin", "windows".
	InstallHint map[string]string

	// VersionFlag is the CLI flag to retrieve the tool version: "--version", "-V", etc.
	VersionFlag string

	// Description is a one-line summary shown in the tool picker.
	Description string
}

// Registry holds all known tool definitions. Tools register themselves via
// Register() — typically called from init() functions in the defs/ package.
type Registry struct {
	mu    sync.RWMutex
	tools map[string]ToolDef
}

// NewRegistry creates an empty tool registry.
func NewRegistry() *Registry {
	return &Registry{tools: make(map[string]ToolDef)}
}

// Register adds a tool definition to the registry. Panics on duplicate names
// (this is a programming error, caught at startup).
func (r *Registry) Register(def ToolDef) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.tools[def.Name]; exists {
		panic(fmt.Sprintf("tool %q already registered", def.Name))
	}
	r.tools[def.Name] = def
}

// Get returns a tool definition by name, or an error if not found.
func (r *Registry) Get(name string) (ToolDef, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	def, ok := r.tools[name]
	if !ok {
		return ToolDef{}, fmt.Errorf("unknown tool: %q", name)
	}
	return def, nil
}

// All returns every registered tool, grouped by category.
func (r *Registry) All() map[Category][]ToolDef {
	r.mu.RLock()
	defer r.mu.RUnlock()

	result := make(map[Category][]ToolDef)
	for _, def := range r.tools {
		result[def.Category] = append(result[def.Category], def)
	}
	return result
}

// List returns all registered tools as a flat slice.
func (r *Registry) List() []ToolDef {
	r.mu.RLock()
	defer r.mu.RUnlock()

	defs := make([]ToolDef, 0, len(r.tools))
	for _, def := range r.tools {
		defs = append(defs, def)
	}
	return defs
}

// DefaultRegistry is the global registry used by the defs/ package init() functions.
var DefaultRegistry = NewRegistry()
