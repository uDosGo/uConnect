-- Create replies table for user interactions
CREATE TABLE IF NOT EXISTS replies (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    output TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at DATETIME NOT NULL DEFAULT (datetime('now')),
    embedding BLOB,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create index for thread lookups
CREATE INDEX IF NOT EXISTS idx_replies_thread ON replies(thread_id);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_replies_user ON replies(user_id);

-- Create index for created_at
CREATE INDEX IF NOT EXISTS idx_replies_created ON replies(created_at);