package defs

import "nser/internal/tool"

func init() {
	r := tool.DefaultRegistry

	r.Register(tool.ToolDef{
		Name:        "nmap",
		Category:    tool.CategoryScanning,
		Binary:      "nmap",
		DefaultArgs: nil,
		NeedsRoot:   true, // SYN scans, OS detection require root
		Description: "Network discovery and security auditing with port scanning",
		InstallHint: map[string]string{
			"linux":   "apt install nmap",
			"darwin":  "brew install nmap",
			"windows": "choco install nmap",
		},
		VersionFlag: "--version",
	})

	r.Register(tool.ToolDef{
		Name:        "masscan",
		Category:    tool.CategoryScanning,
		Binary:      "masscan",
		DefaultArgs: nil,
		NeedsRoot:   true,
		Description: "Fastest Internet port scanner, supports async SYN scanning",
		InstallHint: map[string]string{
			"linux":   "apt install masscan",
			"darwin":  "brew install masscan",
			"windows": "download from https://github.com/robertdavidgraham/masscan",
		},
		VersionFlag: "--version",
	})

	r.Register(tool.ToolDef{
		Name:        "nuclei",
		Category:    tool.CategoryScanning,
		Binary:      "nuclei",
		DefaultArgs: []string{"-silent"},
		NeedsRoot:   false,
		Description: "Template-based vulnerability scanner with community-driven templates",
		InstallHint: map[string]string{
			"linux":   "go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest",
			"darwin":  "brew install nuclei",
			"windows": "go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest",
		},
		VersionFlag: "-version",
	})

	r.Register(tool.ToolDef{
		Name:        "gobuster",
		Category:    tool.CategoryScanning,
		Binary:      "gobuster",
		DefaultArgs: nil,
		NeedsRoot:   false,
		Description: "Directory and DNS brute-force scanner for web applications",
		InstallHint: map[string]string{
			"linux":   "go install github.com/OJ/gobuster/v3@latest",
			"darwin":  "brew install gobuster",
			"windows": "go install github.com/OJ/gobuster/v3@latest",
		},
		VersionFlag: "version",
	})

	r.Register(tool.ToolDef{
		Name:        "ffuf",
		Category:    tool.CategoryScanning,
		Binary:      "ffuf",
		DefaultArgs: nil,
		NeedsRoot:   false,
		Description: "Fast web fuzzer for content discovery and parameter brute-forcing",
		InstallHint: map[string]string{
			"linux":   "go install github.com/ffuf/ffuf/v2@latest",
			"darwin":  "brew install ffuf",
			"windows": "go install github.com/ffuf/ffuf/v2@latest",
		},
		VersionFlag: "-V",
	})

	r.Register(tool.ToolDef{
		Name:        "nikto",
		Category:    tool.CategoryScanning,
		Binary:      "nikto",
		DefaultArgs: nil,
		NeedsRoot:   false,
		Description: "Web server scanner that tests for dangerous files and outdated software",
		InstallHint: map[string]string{
			"linux":   "apt install nikto",
			"darwin":  "brew install nikto",
			"windows": "download from https://github.com/sullo/nikto",
		},
		VersionFlag: "-Version",
	})
}
