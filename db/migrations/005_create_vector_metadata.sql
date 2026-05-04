-- Create vector metadata table for tracking embeddings
CREATE TABLE IF NOT EXISTS vector_metadata (
    reply_id TEXT PRIMARY KEY,
    model TEXT NOT NULL,
    dimension INTEGER NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (reply_id) REFERENCES replies(id)
);

-- Create index for model lookups
CREATE INDEX IF NOT EXISTS idx_vector_metadata_model ON vector_metadata(model);