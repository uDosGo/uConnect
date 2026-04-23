-- Migration 001 — initial spatial tables (voxels, ucubes, cells, blocks)
-- Apply in order after empty DB, or use ../schema.sql for full baseline.

PRAGMA foreign_keys = ON;

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

CREATE INDEX IF NOT EXISTS idx_cells_voxel ON cells(voxel_id);
CREATE INDEX IF NOT EXISTS idx_cells_index ON cells(cell_index);
CREATE INDEX IF NOT EXISTS idx_blocks_ucube ON blocks(ucube_id);
