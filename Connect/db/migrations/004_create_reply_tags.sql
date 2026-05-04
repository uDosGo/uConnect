-- Create reply tags table for categorization
CREATE TABLE IF NOT EXISTS reply_tags (
    reply_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (reply_id, tag),
    FOREIGN KEY (reply_id) REFERENCES replies(id)
);

-- Create index for tag lookups
CREATE INDEX IF NOT EXISTS idx_reply_tags_tag ON reply_tags(tag);