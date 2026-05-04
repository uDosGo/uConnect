-- Migration 002 — name registry (uname)

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS name_registry (
    stamp_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    word_count INTEGER CHECK(word_count IN (2, 3)),
    style_mode TEXT CHECK(style_mode IN ('github-style', 'uDosStyle', 'wutang', 'combo')),
    seed_inputs TEXT,
    reserved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    claimed BOOLEAN DEFAULT 0,
    claimed_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_name_slug ON name_registry(slug);
CREATE INDEX IF NOT EXISTS idx_name_claimed ON name_registry(claimed);
