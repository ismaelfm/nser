# Project: Nser 🦅
**Description:** A locally hosted penetration testing assistant designed to automate reconnaissance, organize target data, map findings to the MITRE ATT&CK framework, and leverage AI for actionable attack paths and reporting. 

**Target OS:** Linux
**Architecture Concept:** Portable, single-user desktop application executed via local binary.

## Tech Stack
* **Application Framework:** Wails (Desktop app bridging Go and React without an embedded browser engine)
* **Backend:** Go (System execution, data normalization, AI API routing)
* **Frontend:** React (UI/Dashboard, state management)
* **Database:** SQLite3 (Local, highly portable single-file database)
* **AI Integration:** OpenRouter API (LLM routing)

## Core Design Principles
1.  **Modularity First:** Reconnaissance tools (Nmap, Amass, Nuclei, etc.) must not be hardcoded as monolithic blocks. The Go backend must use interfaces to make adding or removing tools effortless.
2.  **Native Execution:** Nser does not rely on external cloud parsers. Tools are executed directly on the host Linux machine via system calls (`os/exec`), and outputs are captured and parsed locally.
3.  **Ultimate Portability:** The entire application state (workspaces, target data, parsed logs, AI insights) lives in a single SQLite database file. Users should be able to drop in, export, or back up their `.db` file instantly.

## Feature Requirements
### 1. Data Management (SQLite3)
* Isolated workspaces for different targets/engagements.
* Tables for assets (IPs, domains, ports, services).
* Tables for raw tool logs and normalized parsed outputs.

### 2. Tool Integration Pipeline (Go)
* A strict interface structure for executing binaries and parsing their standard output/XML/JSON or storing in DB.

### 3. AI co-pilot
* Analyse & suggest: Read parsed database entries to suggest MITRE ATT&ACK or OWASP
* Command Generation: Provide cli commands or custom scripts needed for next step
* Reporting: Aggregate workspace data into a structured final client report
