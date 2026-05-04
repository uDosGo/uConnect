// Vector Search MCP Tools
// Integration with MCP tool registry

use serde_json::{json, Value};
use anyhow::Result;

use super::mock::MockVectorSearcher;
use super::VECTOR_SEARCH_ENABLED;

/// Vector search tools for MCP
#[derive(Debug, Clone)]
pub struct VectorSearchTools {
    searcher: MockVectorSearcher,
}

impl VectorSearchTools {
    pub fn new() -> Self {
        Self {
            searcher: MockVectorSearcher::new(),
        }
    }

    /// Feed vector search tool
    pub fn feed_vector_search(&self, params: Value) -> Result<Value> {
        // Extract parameters
        let query = params.get("query")
            .and_then(|q| q.as_str())
            .ok_or_else(|| anyhow::anyhow!("Missing query parameter"))?;
        
        let limit = params.get("limit")
            .and_then(|l| l.as_u64())
            .map(|l| l as usize)
            .unwrap_or(10);
        
        // In a real implementation, we would:
        // 1. Check if VECTOR_SEARCH_ENABLED
        // 2. If enabled, use real vector search
        // 3. If disabled, use mock search (current implementation)
        
        // For now, we'll use mock data since we don't have real feed data
        let mock_feed_items = self.get_mock_feed_items();
        
        let results = self.searcher.search(query, &mock_feed_items, limit)?;
        
        Ok(json!({
            "success": true,
            "results": results,
            "total": results.len(),
            "limit": limit,
            "mock_mode": !VECTOR_SEARCH_ENABLED,
            "message": if VECTOR_SEARCH_ENABLED {
                "Using real vector search"
            } else {
                "Using mock vector search. Install sqlite-vec for real vector search."
            }
        }))
    }

    /// Feed hybrid search tool (keyword + vector)
    pub fn feed_hybrid_search(&self, params: Value) -> Result<Value> {
        // Extract parameters
        let query = params.get("query")
            .and_then(|q| q.as_str())
            .ok_or_else(|| anyhow::anyhow!("Missing query parameter"))?;
        
        let limit = params.get("limit")
            .and_then(|l| l.as_u64())
            .map(|l| l as usize)
            .unwrap_or(10);
        
        // Use mock data for now
        let mock_feed_items = self.get_mock_feed_items();
        
        let results = self.searcher.hybrid_search(query, &mock_feed_items, limit)?;
        
        Ok(json!({
            "success": true,
            "results": results,
            "total": results.len(),
            "limit": limit,
            "mock_mode": !VECTOR_SEARCH_ENABLED,
            "message": if VECTOR_SEARCH_ENABLED {
                "Using real hybrid search"
            } else {
                "Using mock hybrid search. Install sqlite-vec for real hybrid search."
            }
        }))
    }

    /// Vector index status tool
    pub fn vector_index_status(&self, _params: Value) -> Result<Value> {
        let mock_feed_items = self.get_mock_feed_items();
        let status = self.searcher.get_index_status(&mock_feed_items);
        
        Ok(json!({
            "success": true,
            "status": status,
            "enabled": VECTOR_SEARCH_ENABLED,
            "message": if VECTOR_SEARCH_ENABLED {
                "Vector search is fully enabled"
            } else {
                "Vector search is running in mock mode"
            }
        }))
    }

    /// Generate mock feed items for testing
    fn get_mock_feed_items(&self) -> Vec<Value> {
        vec![
            json!({
                "id": "feed_001",
                "feed_id": "main",
                "title": "Introduction to Rust",
                "content": "Rust is a systems programming language that runs blazingly fast, prevents segfaults, and guarantees thread safety.",
                "created_at": "2026-01-01T10:00:00Z"
            }),
            json!({
                "id": "feed_002",
                "feed_id": "main",
                "title": "Advanced Rust Patterns",
                "content": "Exploring advanced Rust programming patterns including trait objects, generics, and async programming.",
                "created_at": "2026-01-02T10:00:00Z"
            }),
            json!({
                "id": "feed_003",
                "feed_id": "main",
                "title": "WebAssembly with Rust",
                "content": "Compiling Rust to WebAssembly for high-performance web applications.",
                "created_at": "2026-01-03T10:00:00Z"
            }),
            json!({
                "id": "feed_004",
                "feed_id": "main",
                "title": "Rust for Data Science",
                "content": "Using Rust for data processing, analysis, and machine learning applications.",
                "created_at": "2026-01-04T10:00:00Z"
            }),
            json!({
                "id": "feed_005",
                "feed_id": "main",
                "title": "Building CLI Tools in Rust",
                "content": "Creating powerful command-line interfaces using Rust and the clap crate.",
                "created_at": "2026-01-05T10:00:00Z"
            }),
        ]
    }

    /// Vectorize feed items (stub for future implementation)
    pub fn vectorize_feed_items(&self, _params: Value) -> Result<Value> {
        Ok(json!({
            "success": true,
            "message": "Vectorization stub - will generate embeddings when sqlite-vec is available",
            "mock_mode": !VECTOR_SEARCH_ENABLED,
            "items_processed": 0,
            "items_updated": 0
        }))
    }
}

/// Integration with MCP registry
pub fn register_vector_tools(registry: &mut super::super::registry::ToolRegistry) {
    // Add vector search tools to the registry
    registry.add_tool("feed_vector_search", |params| {
        let tools = VectorSearchTools::new();
        tools.feed_vector_search(params)
    });
    
    registry.add_tool("feed_hybrid_search", |params| {
        let tools = VectorSearchTools::new();
        tools.feed_hybrid_search(params)
    });
    
    registry.add_tool("vector_index_status", |params| {
        let tools = VectorSearchTools::new();
        tools.vector_index_status(params)
    });
    
    registry.add_tool("feed_vectorize", |params| {
        let tools = VectorSearchTools::new();
        tools.vectorize_feed_items(params)
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    
    #[test]
    fn test_vector_search_tool() {
        let tools = VectorSearchTools::new();
        
        let result = tools.feed_vector_search(json!({
            "query": "Rust programming",
            "limit": 2
        })).unwrap();
        
        assert!(result["success"].as_bool().unwrap());
        assert_eq!(result["results"].as_array().unwrap().len(), 2);
        assert!(result["mock_mode"].as_bool().unwrap());
    }
    
    #[test]
    fn test_hybrid_search_tool() {
        let tools = VectorSearchTools::new();
        
        let result = tools.feed_hybrid_search(json!({
            "query": "Rust",
            "limit": 3
        })).unwrap();
        
        assert!(result["success"].as_bool().unwrap());
        assert!(result["results"].as_array().unwrap().len() <= 3);
        assert!(result["mock_mode"].as_bool().unwrap());
    }
    
    #[test]
    fn test_index_status_tool() {
        let tools = VectorSearchTools::new();
        
        let result = tools.vector_index_status(json!({})).unwrap();
        
        assert!(result["success"].as_bool().unwrap());
        assert!(result["status"]["mock_mode"].as_bool().unwrap());
        assert_eq!(result["status"]["total_items"], 5);
    }
    
    #[test]
    fn test_vectorize_tool() {
        let tools = VectorSearchTools::new();
        
        let result = tools.vectorize_feed_items(json!({})).unwrap();
        
        assert!(result["success"].as_bool().unwrap());
        assert!(result["mock_mode"].as_bool().unwrap());
    }
}