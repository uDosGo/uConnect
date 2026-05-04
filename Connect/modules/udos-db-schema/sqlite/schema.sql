-- uDos Core SQLite Schema
-- CANONICAL SOURCE OF TRUTH (T1)
-- Version: 1.0
-- Location: modules/udos-db-schema/sqlite/schema.sql
-- Status: LOCKED — in-tree until fredporter/udos-db-schema exists
-- Pairs: uDosDev UDOS_FIVE_TIER_DATABASE_STRATEGY_LOCKED_v1.md

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- Voxels (define before ucubes / cells that reference voxel ids)
CREATE TABLE IF NOT EXISTS voxels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    total_cells INTEGER DEFAULT 6,
    total_qr INTEGER DEFAULT 36,
    total_storage INTEGER DEFAULT 180000,
    seed_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Physical uCubes (references voxels)
CREATE TABLE IF NOT EXISTS ucubes (
    id TEXT PRIMARY KEY,
    voxel_id TEXT NOT NULL,
    scale TEXT DEFAULT '48mm',
    block_size_mm INTEGER DEFAULT 8,
    total_blocks INTEGER DEFAULT 216,
    lego_compatible BOOLEAN DEFAULT 1,
    printed_at DATETIME,
    gcode_path TEXT,
    FOREIGN KEY(voxel_id) REFERENCES voxels(id)
);

-- Cells (local cache per voxel)
CREATE TABLE IF NOT EXISTS cells (
    id TEXT PRIMARY KEY,
    voxel_id TEXT NOT NULL,
    cell_index INTEGER NOT NULL,
    display_name TEXT,
    qr_data TEXT NOT NULL,
    storage_used INTEGER DEFAULT 30000,
    checksum TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(voxel_id, cell_index),
    CHECK(cell_index >= 0 AND cell_index <= 5)
);

-- Blocks (physical mapping)
CREATE TABLE IF NOT EXISTS blocks (
    id TEXT PRIMARY KEY,
    ucube_id TEXT NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    z INTEGER NOT NULL,
    qr_face_n TEXT,
    qr_face_s TEXT,
    qr_face_e TEXT,
    qr_face_w TEXT,
    qr_face_u TEXT,
    qr_face_d TEXT,
    color_code TEXT,
    UNIQUE(ucube_id, x, y, z)
);

-- Name registry (uname)
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

CREATE INDEX IF NOT EXISTS idx_cells_voxel ON cells(voxel_id);
CREATE INDEX IF NOT EXISTS idx_cells_index ON cells(cell_index);
CREATE INDEX IF NOT EXISTS idx_blocks_ucube ON blocks(ucube_id);
CREATE INDEX IF NOT EXISTS idx_name_slug ON name_registry(slug);
CREATE INDEX IF NOT EXISTS idx_name_claimed ON name_registry(claimed);
