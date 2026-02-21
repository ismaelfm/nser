package tool

import (
	"testing"
)

func TestRegistryRegisterAndGet(t *testing.T) {
	r := NewRegistry()

	def := ToolDef{
		Name:     "testtool",
		Category: CategoryRecon,
		Binary:   "echo",
	}

	r.Register(def)

	got, err := r.Get("testtool")
	if err != nil {
		t.Fatalf("Get returned error: %v", err)
	}
	if got.Name != "testtool" {
		t.Errorf("got name %q, want %q", got.Name, "testtool")
	}
}

func TestRegistryGetUnknown(t *testing.T) {
	r := NewRegistry()

	_, err := r.Get("nonexistent")
	if err == nil {
		t.Fatal("expected error for unknown tool, got nil")
	}
}

func TestRegistryDuplicatePanics(t *testing.T) {
	r := NewRegistry()

	def := ToolDef{Name: "dup", Category: CategoryRecon, Binary: "echo"}
	r.Register(def)

	defer func() {
		if recover() == nil {
			t.Fatal("expected panic on duplicate registration")
		}
	}()

	r.Register(def) // should panic
}

func TestCheckPrivileges(t *testing.T) {
	info := CheckPrivileges()
	if info.OS == "" {
		t.Error("CheckPrivileges returned empty OS")
	}
}
