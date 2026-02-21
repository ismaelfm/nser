package defs

import "nser/internal/tool"

func init() {
	r := tool.DefaultRegistry

	r.Register(tool.ToolDef{
		Name:        "subfinder",
		Category:    tool.CategoryRecon,
		Binary:      "subfinder",
		DefaultArgs: []string{"-silent"},
		NeedsRoot:   false,
		Description: "Fast passive subdomain enumeration tool using multiple sources",
		InstallHint: map[string]string{
			"linux":   "go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest",
			"darwin":  "brew install subfinder",
			"windows": "go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest",
		},
		VersionFlag: "-version",
	})

	r.Register(tool.ToolDef{
		Name:        "amass",
		Category:    tool.CategoryRecon,
		Binary:      "amass",
		DefaultArgs: []string{"enum", "-passive"},
		NeedsRoot:   false,
		Description: "In-depth attack surface mapping and asset discovery via DNS",
		InstallHint: map[string]string{
			"linux":   "go install -v github.com/owasp-amass/amass/v4/...@master",
			"darwin":  "brew install amass",
			"windows": "go install -v github.com/owasp-amass/amass/v4/...@master",
		},
		VersionFlag: "-version",
	})

	r.Register(tool.ToolDef{
		Name:        "theharvester",
		Category:    tool.CategoryRecon,
		Binary:      "theHarvester",
		DefaultArgs: []string{"-b", "all"},
		NeedsRoot:   false,
		Description: "Gathers emails, subdomains, hosts, and open ports from public sources",
		InstallHint: map[string]string{
			"linux":   "pip install theHarvester",
			"darwin":  "pip install theHarvester",
			"windows": "pip install theHarvester",
		},
		VersionFlag: "--help", // theHarvester prints version in help output
	})

	r.Register(tool.ToolDef{
		Name:        "whois",
		Category:    tool.CategoryRecon,
		Binary:      "whois",
		DefaultArgs: nil,
		NeedsRoot:   false,
		Description: "Query WHOIS databases for domain registration and ownership info",
		InstallHint: map[string]string{
			"linux":   "apt install whois",
			"darwin":  "pre-installed on macOS",
			"windows": "choco install whois",
		},
		VersionFlag: "",
	})

	r.Register(tool.ToolDef{
		Name:        "dig",
		Category:    tool.CategoryRecon,
		Binary:      "dig",
		DefaultArgs: nil,
		NeedsRoot:   false,
		Description: "DNS lookup utility for querying DNS records",
		InstallHint: map[string]string{
			"linux":   "apt install dnsutils",
			"darwin":  "pre-installed on macOS",
			"windows": "choco install bind-toolsonly",
		},
		VersionFlag: "-v",
	})
}
