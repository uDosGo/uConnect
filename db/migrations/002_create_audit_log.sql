-- Migration: Create audit log table
-- Timestamp: 2026-04-19T00:00:01Z

BEGIN TRANSACTION;

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    user_id TEXT,
    family_id TEXT,
    data TEXT NOT NULL,  -- JSON
    ip TEXT,
    user_agent TEXT,
    hash TEXT NOT NULL,  -- SHA256 hash of this entry
    previous_hash TEXT NOT NULL,  -- SHA256 hash of previous entry
    created_at DATETIME NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_type ON audit_log(type);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_family ON audit_log(family_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);

COMMIT;