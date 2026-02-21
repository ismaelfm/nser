package tool

import (
	"os/exec"
	"runtime"
	"strings"
)

// ToolHealth reports the availability status of a single tool.
type ToolHealth struct {
	Name        string `json:"name"`
	Category    string `json:"category"`
	Installed   bool   `json:"installed"`
	Version     string `json:"version"`
	Path        string `json:"path"`
	NeedsRoot   bool   `json:"needsRoot"`
	InstallHint string `json:"installHint"`
}

// PrivilegeInfo reports the current privilege status of the running process.
type PrivilegeInfo struct {
	Elevated bool   `json:"elevated"`
	Username string `json:"username"`
	OS       string `json:"os"`
}

// CheckAll returns the health status of every registered tool.
func (r *Registry) CheckAll() []ToolHealth {
	defs := r.List()
	results := make([]ToolHealth, 0, len(defs))

	for _, def := range defs {
		h := ToolHealth{
			Name:      def.Name,
			Category:  string(def.Category),
			NeedsRoot: def.NeedsRoot,
		}

		// Install hint for current OS.
		h.InstallHint = def.InstallHint[runtime.GOOS]

		// Check if binary is in PATH.
		path, err := exec.LookPath(def.Binary)
		if err != nil {
			h.Installed = false
			results = append(results, h)
			continue
		}

		h.Installed = true
		h.Path = path

		// Try to get version.
		if def.VersionFlag != "" {
			h.Version = getVersion(path, def.VersionFlag)
		}

		results = append(results, h)
	}

	return results
}

// getVersion runs "binary <versionFlag>" and returns the first non-empty
// line of output. Returns "" on any error.
func getVersion(binaryPath, versionFlag string) string {
	out, err := exec.Command(binaryPath, versionFlag).CombinedOutput()
	if err != nil {
		// Some tools return non-zero exit code with --version.
		// We still try to extract version from output.
		if len(out) == 0 {
			return ""
		}
	}

	// Return the first non-empty line — usually contains the version.
	for _, line := range strings.Split(string(out), "\n") {
		line = strings.TrimSpace(line)
		if line != "" {
			return line
		}
	}
	return ""
}
