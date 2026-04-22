// Vector Search Database Schema
// SQL schema design for feed vector indexing

/// SQL schema for feed items table with vector support
pub const FEED_ITEMS_WITH_VECTOR_SCHEMA: &str = r#"
-- Feed items table with vector support
CREATE TABLE IF NOT EXISTS feed_items (
    id TEXT PRIMARY KEY,
    feed_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- Vector search columns (will be enabled when sqlite-vec is available)
    content_vector BLOB,  -- 384-dimensional vector from all-MiniLM-L6-v2
    vector_generated_at TIMESTAMP,
    vector_version INTEGER DEFAULT 1,
    
    FOREIGN KEY (feed_id) REFERENCES feeds(id)
);

-- Index for traditional keyword search
CREATE INDEX IF NOT EXISTS idx_feed_items_keyword ON feed_items(content);

-- Index for feed lookup
CREATE INDEX IF NOT EXISTS idx_feed_items_feed ON feed_items(feed_id);
"#;

/// SQL schema for vector index (sqlite-vec virtual table)
/// This will be created when sqlite-vec extension is loaded
pub const VECTOR_INDEX_SCHEMA: &str = r#"
-- Vector search index (requires sqlite-vec extension)
-- This is a virtual table that enables efficient KNN search
CREATE VIRTUAL TABLE IF NOT EXISTS feed_vector_index USING vec0(
    content_vector BLOB,  -- The vector column from feed_items
    id TEXT              -- Reference back to feed_items
);

-- Populate the vector index from feed_items
-- This would be run after sqlite-vec is loaded
INSERT INTO feed_vector_index (content_vector, id)
SELECT content_vector, id FROM feed_items WHERE content_vector IS NOT NULL;
"#;

/// SQL for creating vector index trigger
pub const VECTOR_INDEX_TRIGGER: &str = r#"
-- Trigger to keep vector index in sync
CREATE TRIGGER IF NOT EXISTS trg_feed_items_vector_update
AFTER INSERT ON feed_items
FOR EACH ROW
WHEN NEW.content_vector IS NOT NULL
BEGIN
    INSERT INTO feed_vector_index (content_vector, id)
    VALUES (NEW.content_vector, NEW.id);
END;

CREATE TRIGGER IF NOT EXISTS trg_feed_items_vector_update
AFTER UPDATE ON feed_items
FOR EACH ROW
WHEN NEW.content_vector IS NOT NULL
BEGIN
    DELETE FROM feed_vector_index WHERE id = OLD.id;
    INSERT INTO feed_vector_index (content_vector, id)
    VALUES (NEW.content_vector, NEW.id);
END;

CREATE TRIGGER IF NOT EXISTS trg_feed_items_vector_delete
AFTER DELETE ON feed_items
FOR EACH ROW
WHEN OLD.content_vector IS NOT NULL
BEGIN
    DELETE FROM feed_vector_index WHERE id = OLD.id;
END;
"#;

/// SQL for vector search query
pub fn build_vector_search_query(limit: usize) -> String {
    format!(r#"
        -- KNN search using sqlite-vec
        -- Returns the top {limit} most similar items
        SELECT 
            f.id, 
            f.feed_id, 
            f.title, 
            f.content, 
            f.created_at,
            -- Calculate cosine similarity
            vec_cosine_similarity(f.content_vector, ?) as similarity
        FROM 
            feed_items f
        JOIN 
            feed_vector_index v ON f.id = v.id
        ORDER BY 
            similarity DESC
        LIMIT {limit};
    "#)
}

/// SQL for hybrid search query (keyword + vector)
pub fn build_hybrid_search_query(limit: usize) -> String {
    format!(r#"
        -- Hybrid search: combine keyword and vector results
        -- Uses reciprocal rank fusion (RRF) for merging
        WITH 
        keyword_results AS (
            SELECT 
                id, 
                feed_id, 
                title, 
                content, 
                created_at,
                1.0 as keyword_score,
                0.0 as vector_score
            FROM 
                feed_items
            WHERE 
                content LIKE '%' || ? || '%'
                OR title LIKE '%' || ? || '%'
            LIMIT 50
        ),
        vector_results AS (
            SELECT 
                f.id, 
                f.feed_id, 
                f.title, 
                f.content, 
                f.created_at,
                0.0 as keyword_score,
                vec_cosine_similarity(f.content_vector, ?) as vector_score
            FROM 
                feed_items f
            JOIN 
                feed_vector_index v ON f.id = v.id
            ORDER BY 
                vector_score DESC
            LIMIT 50
        ),
        combined AS (
            SELECT * FROM keyword_results
            UNION ALL
            SELECT * FROM vector_results
        ),
        ranked AS (
            SELECT 
                id, 
                feed_id, 
                title, 
                content, 
                created_at,
                keyword_score,
                vector_score,
                -- Reciprocal Rank Fusion
                (1.0 / (1.0 + COALESCE((SELECT COUNT(*) FROM combined c2 WHERE c2.id = c.id AND c2.keyword_score > 0), 0))) +
                (1.0 / (1.0 + COALESCE((SELECT COUNT(*) FROM combined c2 WHERE c2.id = c.id AND c2.vector_score > 0), 0))) as rrf_score
            FROM 
                combined c
        )
        SELECT 
            id, 
            feed_id, 
            title, 
            content, 
            created_at,
            keyword_score,
            vector_score,
            rrf_score
        FROM 
            ranked
        ORDER BY 
            rrf_score DESC
        LIMIT {limit};
    "#)
}

/// SQL for checking vector index status
pub const VECTOR_INDEX_STATUS_QUERY: &str = r#"
SELECT 
    COUNT(*) as total_items,
    SUM(CASE WHEN content_vector IS NOT NULL THEN 1 ELSE 0 END) as vector_items,
    SUM(CASE WHEN content_vector IS NULL THEN 1 ELSE 0 END) as pending_items,
    ROUND((SUM(CASE WHEN content_vector IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as completion_percentage
FROM 
    feed_items;
"#;

/// SQL for updating vector index in batches
pub const UPDATE_VECTOR_INDEX_BATCH: &str = r#"
-- Update vector index for a batch of items
INSERT OR REPLACE INTO feed_vector_index (content_vector, id)
SELECT content_vector, id FROM feed_items
WHERE 
    id IN (SELECT id FROM feed_items 
          WHERE content_vector IS NOT NULL
          AND (vector_generated_at IS NULL OR vector_version < ?)
          LIMIT ?);
"#;

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_schema_contains_vector_columns() {
        assert!(FEED_ITEMS_WITH_VECTOR_SCHEMA.contains("content_vector"));
        assert!(FEED_ITEMS_WITH_VECTOR_SCHEMA.contains("vector_generated_at"));
        assert!(FEED_ITEMS_WITH_VECTOR_SCHEMA.contains("vector_version"));
    }
    
    #[test]
    fn test_vector_index_uses_vec0() {
        assert!(VECTOR_INDEX_SCHEMA.contains("USING vec0"));
        assert!(VECTOR_INDEX_SCHEMA.contains("content_vector"));
    }
    
    #[test]
    fn test_search_query_contains_similarity() {
        let query = build_vector_search_query(10);
        assert!(query.contains("vec_cosine_similarity"));
        assert!(query.contains("ORDER BY"));
        assert!(query.contains("similarity DESC"));
    }
    
    #[test]
    fn test_hybrid_query_contains_rrf() {
        let query = build_hybrid_search_query(10);
        assert!(query.contains("Reciprocal Rank Fusion"));
        assert!(query.contains("rrf_score"));
    }
}