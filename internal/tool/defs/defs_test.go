package defs

import (
	"testing"

	"nser/internal/tool"
)

func TestDefaultRegistryHasTools(t *testing.T) {
	// The default registry is populated by init() in this package.
	all := tool.DefaultRegistry.List()
	if len(all) == 0 {
		t.Fatal("DefaultRegistry is empty — defs init() may not have run")
	}

	// Spot-check a few tools from each category.
	for _, name := range []string{"nmap", "subfinder", "sqlmap"} {
		if _, err := tool.DefaultRegistry.Get(name); err != nil {
			t.Errorf("expected tool %q in DefaultRegistry: %v", name, err)
		}
	}
}

func TestCheckAllReturnsEntries(t *testing.T) {
	results := tool.DefaultRegistry.CheckAll()
	if len(results) == 0 {
		t.Fatal("CheckAll returned no results")
	}

	for _, h := range results {
		if h.Name == "" {
			t.Error("health result has empty name")
		}
		if h.Category == "" {
			t.Error("health result has empty category")
		}
	}
}
