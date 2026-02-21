package db

import (
	"database/sql"
	_ "embed"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

//go:embed schema.sql
var schemaSQL string

func dbPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("get home dir: %w", err)
	}
	dir := filepath.Join(home, ".nser")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", fmt.Errorf("create data dir: %w", err)
	}
	return filepath.Join(dir, "nser.db"), nil
}

func Open() (*sql.DB, error) {
	path, err := dbPath()
	if err != nil {
		return nil, err
	}

	db, err := sql.Open("sqlite", path+"?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)&_pragma=busy_timeout(5000)")
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}
	db.SetMaxOpenConns(1)

	if _, err := db.Exec(schemaSQL); err != nil {
		db.Close()
		return nil, fmt.Errorf("run schema migration: %w", err)
	}

	// Additive column migrations for existing databases.
	// SQLite does not support IF NOT EXISTS on ALTER TABLE ADD COLUMN,
	// so we ignore errors caused by duplicate column names.
	migrations := []string{
		"ALTER TABLE workspaces ADD COLUMN target TEXT DEFAULT ''",
		"ALTER TABLE tool_runs ADD COLUMN args TEXT DEFAULT ''",
		"ALTER TABLE tool_runs ADD COLUMN command_line TEXT DEFAULT ''",
		"ALTER TABLE tool_runs ADD COLUMN exit_code INTEGER DEFAULT 0",
	}
	for _, m := range migrations {
		// Ignore "duplicate column name" errors (SQLite error code 1).
		db.Exec(m) //nolint:errcheck — intentionally ignored
	}

	// Seed tool documentation and examples on first run (INSERT OR IGNORE).
	seedToolDocs(db)

	return db, nil
}

// seedToolDocs populates tool_docs and tool_examples with initial content.
// Uses INSERT OR IGNORE so user edits are never overwritten.
func seedToolDocs(db *sql.DB) {
	docs := []struct {
		name string
		doc  string
	}{
		{"nmap", "# Nmap\n\nNmap (\"Network Mapper\") is a free, open-source utility for network discovery and security auditing. It uses raw IP packets to determine available hosts, services, OS versions, firewalls, and more.\n\n## Key Features\n- Host discovery and port scanning\n- Service and version detection (`-sV`)\n- OS fingerprinting (`-O`)\n- Scriptable interaction via NSE scripts (`--script`)\n- Multiple output formats (XML, grepable, normal)\n\n## Common Flags\n| Flag | Purpose |\n|------|--------|\n| `-sS` | TCP SYN scan (stealthy, needs root) |\n| `-sV` | Version detection |\n| `-O` | OS detection |\n| `-A` | Aggressive scan (OS + version + scripts + traceroute) |\n| `-p-` | Scan all 65535 ports |\n| `--top-ports N` | Scan top N most common ports |"},
		{"masscan", "# Masscan\n\nMasscan is the fastest Internet port scanner. It can scan the entire Internet in under 6 minutes, transmitting 10 million packets per second.\n\n## Key Features\n- Asynchronous SYN scanning\n- Banner grabbing\n- Supports IP ranges and CIDR notation\n- Output compatible with nmap XML format\n\n## Common Flags\n| Flag | Purpose |\n|------|--------|\n| `-p` | Port(s) to scan |\n| `--rate` | Packets per second |\n| `--banners` | Grab service banners |\n| `-oX` | XML output (nmap compatible) |"},
		{"nuclei", "# Nuclei\n\nNuclei is used to send requests across targets based on templates, leading to zero false positives and providing fast scanning on a large number of hosts.\n\n## Key Features\n- Template-based scanning (YAML)\n- Community-driven template library (nuclei-templates)\n- Supports HTTP, DNS, TCP, and more\n- Severity-based filtering\n\n## Common Flags\n| Flag | Purpose |\n|------|--------|\n| `-t` | Template or directory to use |\n| `-severity` | Filter by severity (info, low, medium, high, critical) |\n| `-as` | Automatic web scan |\n| `-tags` | Execute templates by tags |"},
		{"gobuster", "# Gobuster\n\nGobuster is a tool used to brute-force URIs, DNS subdomains, virtual host names, and more.\n\n## Modes\n- `dir` — Directory/file brute-forcing\n- `dns` — DNS subdomain brute-forcing\n- `vhost` — Virtual host brute-forcing\n- `fuzz` — Fuzzing mode\n\n## Common Flags\n| Flag | Purpose |\n|------|--------|\n| `-u` | Target URL |\n| `-w` | Wordlist file path |\n| `-t` | Number of concurrent threads |\n| `-x` | File extensions to search for |"},
		{"ffuf", "# ffuf\n\nffuf (Fuzz Faster U Fool) is a fast web fuzzer written in Go. It's used for directory discovery, parameter fuzzing, and more.\n\n## Key Features\n- Extremely fast (Go-based concurrency)\n- Flexible keyword placement with FUZZ marker\n- Supports multiple wordlists\n- Filtering and matching by status, size, words, lines\n\n## Common Flags\n| Flag | Purpose |\n|------|--------|\n| `-u` | Target URL (place FUZZ keyword) |\n| `-w` | Wordlist path |\n| `-mc` | Match HTTP status codes |\n| `-fc` | Filter HTTP status codes |\n| `-fs` | Filter by response size |"},
		{"nikto", "# Nikto\n\nNikto is an open-source web server scanner which tests for dangerous files/CGIs, outdated server software, and other problems.\n\n## Key Features\n- Tests for 6700+ potentially dangerous files\n- Checks for outdated versions of 1250+ servers\n- Version specific problems on 270+ servers\n- SSL support\n\n## Common Flags\n| Flag | Purpose |\n|------|--------|\n| `-h` | Target host |\n| `-p` | Port to scan |\n| `-Tuning` | Scan tuning (test types) |\n| `-o` | Output file |"},
		{"subfinder", "# Subfinder\n\nSubfinder is a subdomain discovery tool that returns valid subdomains for websites using passive online sources.\n\n## Key Features\n- Passive enumeration (no direct contact with target)\n- Uses 40+ sources (Censys, Shodan, VirusTotal, etc.)\n- Fast and lightweight\n- JSON output support\n\n## Common Flags\n| Flag | Purpose |\n|------|--------|\n| `-d` | Target domain |\n| `-o` | Output file |\n| `-silent` | Show only results |\n| `-sources` | Comma-separated list of sources |"},
		{"amass", "# Amass\n\nThe OWASP Amass Project performs network mapping of attack surfaces and external asset discovery using open source intelligence.\n\n## Key Features\n- DNS enumeration and network mapping\n- Passive and active modes\n- Integration with multiple data sources\n- Graph database for relationship tracking\n\n## Subcommands\n| Subcommand | Purpose |\n|------|--------|\n| `enum` | Perform enumerations and network mapping |\n| `intel` | Discover targets for enumerations |\n| `db` | Manage the graph databases |"},
		{"theharvester", "# theHarvester\n\ntheHarvester gathers open source intelligence (OSINT) on a company or domain. It collects emails, names, subdomains, IPs, and URLs.\n\n## Key Features\n- Email harvesting\n- Subdomain enumeration\n- Virtual host discovery\n- Multiple search engine support\n\n## Common Flags\n| Flag | Purpose |\n|------|--------|\n| `-d` | Target domain |\n| `-b` | Data source (google, bing, linkedin, all) |\n| `-l` | Limit results |\n| `-f` | Output to HTML and XML files |"},
		{"whois", "# Whois\n\nWhois queries WHOIS databases for domain registration details including registrar, nameservers, creation/expiry dates, and registrant contact information.\n\n## Key Features\n- Domain ownership lookup\n- Registrar and nameserver info\n- Registration and expiry dates\n- IP address block information\n\n## Usage Notes\nWhois doesn't require flags for basic lookups — just pass the domain or IP as the target."},
		{"dig", "# Dig\n\nDig (Domain Information Groper) is a DNS lookup utility for querying DNS nameservers. It's the go-to tool for DNS troubleshooting.\n\n## Key Features\n- Query any DNS record type (A, AAAA, MX, NS, TXT, etc.)\n- Trace DNS delegation path\n- Reverse DNS lookups\n- Batch mode for multiple queries\n\n## Common Flags\n| Flag | Purpose |\n|------|--------|\n| `@server` | DNS server to query |\n| `+short` | Show only the answer |\n| `+trace` | Trace delegation path |\n| `-x` | Reverse DNS lookup |"},
		{"sqlmap", "# SQLMap\n\nSQLMap automates the detection and exploitation of SQL injection flaws. It supports a wide range of database management systems.\n\n## Key Features\n- Automatic SQL injection detection\n- Database fingerprinting\n- Data extraction from databases\n- File system access and OS command execution\n- Support for MySQL, PostgreSQL, Oracle, MSSQL, SQLite, and more\n\n## Common Flags\n| Flag | Purpose |\n|------|--------|\n| `-u` | Target URL with injectable parameter |\n| `--dbs` | Enumerate databases |\n| `--tables` | Enumerate tables |\n| `--dump` | Dump table contents |\n| `--batch` | Non-interactive mode |\n| `--risk` | Risk level (1-3, higher = more tests) |"},
		{"hydra", "# Hydra\n\nHydra is a fast and flexible network login cracker. It supports dozens of protocols including SSH, FTP, HTTP, SMB, and more.\n\n## Key Features\n- 50+ protocol support\n- Parallelized connections\n- Supports user/password lists and combo files\n- Session restore on interruption\n\n## Common Flags\n| Flag | Purpose |\n|------|--------|\n| `-l` / `-L` | Login name / Login name list |\n| `-p` / `-P` | Password / Password list |\n| `-t` | Number of parallel tasks |\n| `-s` | Port (if non-default) |\n| `-f` | Stop after first valid pair |"},
	}

	examples := []struct {
		tool, title, desc, cmd string
		order                  int
	}{
		{"nmap", "Quick SYN scan", "Fast SYN scan of top 1000 ports", "nmap -sS 10.0.0.1", 1},
		{"nmap", "Full port scan with version detection", "Scan all ports and detect service versions", "nmap -sV -p- 10.0.0.1", 2},
		{"nmap", "Aggressive scan", "OS detection, version detection, script scanning, and traceroute", "nmap -A 10.0.0.1", 3},
		{"masscan", "Scan common ports", "Scan top web ports at 10k packets/sec", "masscan -p80,443,8080 10.0.0.0/24 --rate=10000", 1},
		{"masscan", "Full port scan", "Scan all ports on a single host", "masscan -p0-65535 10.0.0.1 --rate=1000", 2},
		{"nuclei", "Automatic web scan", "Run automatic web technology detection and scanning", "nuclei -as -u https://example.com", 1},
		{"nuclei", "CVE templates only", "Scan using only CVE templates", "nuclei -t cves/ -u https://example.com", 2},
		{"gobuster", "Directory brute-force", "Discover directories using a common wordlist", "gobuster dir -u https://example.com -w /usr/share/wordlists/dirb/common.txt", 1},
		{"gobuster", "DNS subdomain enumeration", "Brute-force subdomains", "gobuster dns -d example.com -w /usr/share/wordlists/subdomains.txt", 2},
		{"ffuf", "Directory fuzzing", "Fuzz for directories with status code filtering", "ffuf -u https://example.com/FUZZ -w wordlist.txt -mc 200,301", 1},
		{"ffuf", "Parameter fuzzing", "Fuzz a GET parameter value", "ffuf -u https://example.com/page?id=FUZZ -w /usr/share/wordlists/nums.txt", 2},
		{"nikto", "Basic web scan", "Scan a web server for known vulnerabilities", "nikto -h https://example.com", 1},
		{"subfinder", "Enumerate subdomains", "Find subdomains for a domain passively", "subfinder -d example.com", 1},
		{"subfinder", "JSON output", "Output subdomains in JSON format", "subfinder -d example.com -oJ -silent", 2},
		{"amass", "Passive enumeration", "Passive subdomain enumeration", "amass enum -passive -d example.com", 1},
		{"theharvester", "Search all sources", "Gather emails and subdomains from all sources", "theHarvester -d example.com -b all", 1},
		{"whois", "Domain lookup", "Look up registration info for a domain", "whois example.com", 1},
		{"dig", "A record lookup", "Query A records for a domain", "dig example.com A", 1},
		{"dig", "Trace delegation", "Trace the full DNS delegation path", "dig +trace example.com", 2},
		{"sqlmap", "Test a URL parameter", "Test a GET parameter for SQL injection", "sqlmap -u 'https://example.com/page?id=1' --batch", 1},
		{"sqlmap", "Enumerate databases", "Detect injection and list databases", "sqlmap -u 'https://example.com/page?id=1' --dbs --batch", 2},
		{"hydra", "SSH brute-force", "Brute-force SSH login with a password list", "hydra -l admin -P /usr/share/wordlists/rockyou.txt ssh://10.0.0.1", 1},
		{"hydra", "HTTP form brute-force", "Brute-force a web login form", "hydra -l admin -P passwords.txt 10.0.0.1 http-post-form '/login:user=^USER^&pass=^PASS^:F=incorrect'", 2},
	}

	for _, d := range docs {
		db.Exec(`INSERT OR IGNORE INTO tool_docs (tool_name, documentation) VALUES (?, ?)`, d.name, d.doc) //nolint:errcheck
	}
	for _, e := range examples {
		db.Exec(`INSERT OR IGNORE INTO tool_examples (tool_name, title, description, command, sort_order) VALUES (?, ?, ?, ?, ?)`,
			e.tool, e.title, e.desc, e.cmd, e.order) //nolint:errcheck
	}
}
