// MCP Vector Search Module
// Semantic search capabilities for feed system

pub mod mock;
pub mod schema;
pub mod tools;

pub use mock::*;
pub use schema::*;
pub use tools::*;

/// Feature flag for vector search
pub const VECTOR_SEARCH_ENABLED: bool = false; // Default to disabled until sqlite-vec is available

/// Embedding dimensions for all-MiniLM-L6-v2 model
pub const EMBEDDING_DIMENSIONS: usize = 384;