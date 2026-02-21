CREATE TABLE IF NOT EXISTS workspaces (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    target      TEXT DEFAULT '',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    type         TEXT NOT NULL CHECK(type IN ('ip', 'domain', 'url')),
    value        TEXT NOT NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, type, value)
);

CREATE TABLE IF NOT EXISTS ports (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    port     INTEGER NOT NULL,
    protocol TEXT DEFAULT 'tcp',
    service  TEXT DEFAULT '',
    state    TEXT DEFAULT 'open',
    UNIQUE(asset_id, port, protocol)
);

CREATE TABLE IF NOT EXISTS tool_runs (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    tool_name    TEXT NOT NULL,
    target       TEXT NOT NULL,
    args         TEXT DEFAULT '',
    command_line TEXT DEFAULT '',
    raw_output   BLOB,
    parsed_json  TEXT,
    status       TEXT DEFAULT 'running' CHECK(status IN ('running', 'completed', 'failed')),
    exit_code    INTEGER DEFAULT 0,
    started_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);

CREATE TABLE IF NOT EXISTS tool_docs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_name     TEXT NOT NULL UNIQUE,
    documentation TEXT DEFAULT '',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tool_examples (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_name   TEXT NOT NULL,
    title       TEXT NOT NULL,
    description TEXT DEFAULT '',
    command     TEXT NOT NULL,
    sort_order  INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
