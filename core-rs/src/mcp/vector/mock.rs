// Mock Vector Search Implementation
// Provides realistic mock results for testing without sqlite-vec

use serde_json::json;
use anyhow::Result;
use rand::Rng;

/// Mock embedding generator
pub struct MockEmbeddingGenerator {
    // In a real implementation, this would use a real sentence transformer model
    // For now, we generate random vectors that look realistic
}

impl MockEmbeddingGenerator {
    pub fn new() -> Self {
        Self {}
    }

    /// Generate a mock embedding vector (384 dimensions)
    pub fn generate_embedding(&self, text: &str) -> Vec<f32> {
        let mut rng = rand::thread_rng();
        
        // Create a deterministic seed based on text for reproducible mocks
        let mut hasher = std::collections::hash_map::DefaultHasher::new();
        text.hash(&mut hasher);
        let seed = hasher.finish();
        
        // Use the seed to create a reproducible random sequence
        let mut local_rng = rand::rngs::StdRng::seed_from_u64(seed);
        
        // Generate 384 random floats between -1.0 and 1.0
        // This simulates the output of all-MiniLM-L6-v2
        (0..super::EMBEDDING_DIMENSIONS)
            .map(|_| local_rng.gen_range(-1.0..1.0))
            .collect()
    }

    /// Generate cosine similarity between two mock vectors
    /// Returns a value between 0.0 (completely different) and 1.0 (identical)
    pub fn cosine_similarity(&self, vec1: &[f32], vec2: &[f32]) -> f32 {
        // Simple cosine similarity calculation
        // dot_product / (magnitude1 * magnitude2)
        
        let dot_product: f32 = vec1.iter().zip(vec2.iter()).map(|(a, b)| a * b).sum();
        
        let magnitude1: f32 = vec1.iter().map(|x| x * x).sum::<f32>().sqrt();
        let magnitude2: f32 = vec2.iter().map(|x| x * x).sum::<f32>().sqrt();
        
        if magnitude1 == 0.0 || magnitude2 == 0.0 {
            0.0
        } else {
            (dot_product / (magnitude1 * magnitude2)).clamp(-1.0, 1.0)
        }
    }

    /// Generate a realistic mock similarity score based on text similarity
    pub fn generate_realistic_similarity(&self, text1: &str, text2: &str) -> f32 {
        // Simple heuristic: if texts share words, higher similarity
        let words1: Vec<&str> = text1.split_whitespace().collect();
        let words2: Vec<&str> = text2.split_whitespace().collect();
        
        let common_words = words1.iter()
            .filter(|w| words2.contains(w))
            .count();
        
        let total_words = (words1.len() + words2.len()) as f32 / 2.0;
        
        if total_words == 0.0 {
            0.0
        } else {
            // Base similarity on word overlap, then add some randomness
            let base_similarity = (common_words as f32 / total_words).min(1.0);
            let mut rng = rand::thread_rng();
            let random_factor = rng.gen_range(0.7..1.3);
            (base_similarity * random_factor).clamp(0.0, 1.0)
        }
    }
}

/// Mock vector searcher
pub struct MockVectorSearcher {
    generator: MockEmbeddingGenerator,
}

impl MockVectorSearcher {
    pub fn new() -> Self {
        Self {
            generator: MockEmbeddingGenerator::new(),
        }
    }

    /// Perform a mock vector search
    /// Returns realistic-looking results with similarity scores
    pub fn search(&self, query: &str, feed_items: &[serde_json::Value], limit: usize) -> Result<Vec<serde_json::Value>> {
        // Generate query embedding
        let query_embedding = self.generator.generate_embedding(query);
        
        // Score each feed item based on similarity to query
        let mut scored_items: Vec<(f32, &serde_json::Value)> = feed_items
            .iter()
            .map(|item| {
                let content = item["content"].as_str().unwrap_or("");
                let title = item["title"].as_str().unwrap_or("");
                let combined_text = format!("{} {}", title, content);
                
                let item_embedding = self.generator.generate_embedding(&combined_text);
                let similarity = self.generator.cosine_similarity(&query_embedding, &item_embedding);
                
                (similarity, item)
            })
            .collect();
        
        // Sort by similarity (highest first)
        scored_items.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));
        
        // Return top results with similarity scores added
        Ok(scored_items
            .into_iter()
            .take(limit)
            .enumerate()
            .map(|(rank, (similarity, item))| {
                let mut result = json!({
                    "id": item["id"],
                    "feed_id": item["feed_id"],
                    "title": item["title"],
                    "content": item["content"],
                    "created_at": item["created_at"],
                    "similarity": similarity,
                    "rank": rank + 1
                });
                result
            })
            .collect())
    }

    /// Perform a mock hybrid search (keyword + vector)
    pub fn hybrid_search(&self, query: &str, feed_items: &[serde_json::Value], limit: usize) -> Result<Vec<serde_json::Value>> {
        // Keyword search
        let keyword_results = self.keyword_search(query, feed_items, limit * 2)?;
        
        // Vector search
        let vector_results = self.search(query, feed_items, limit * 2)?;
        
        // Combine using reciprocal rank fusion
        let combined = self.fuse_results(keyword_results, vector_results, limit)?;
        
        Ok(combined)
    }

    /// Simple keyword search
    fn keyword_search(&self, query: &str, feed_items: &[serde_json::Value], limit: usize) -> Result<Vec<serde_json::Value>> {
        let query_lower = query.to_lowercase();
        
        let mut results: Vec<(i32, &serde_json::Value)> = feed_items
            .iter()
            .filter_map(|item| {
                let content = item["content"].as_str().unwrap_or("").to_lowercase();
                let title = item["title"].as_str().unwrap_or("").to_lowercase();
                
                // Count keyword matches
                let matches = query_lower.split_whitespace()
                    .filter(|word| content.contains(word) || title.contains(word))
                    .count() as i32;
                
                if matches > 0 {
                    Some((matches, item))
                } else {
                    None
                }
            })
            .collect();
        
        // Sort by match count
        results.sort_by(|a, b| b.0.cmp(&a.0));
        
        Ok(results
            .into_iter()
            .take(limit)
            .map(|(_, item)| item.clone())
            .collect())
    }

    /// Fuse results using reciprocal rank fusion
    fn fuse_results(&self, keyword_results: Vec<serde_json::Value>, vector_results: Vec<serde_json::Value>, limit: usize) -> Result<Vec<serde_json::Value>> {
        // Create a map of all results with their ranks
        let mut result_map: std::collections::HashMap<String, (usize, usize, f32)> = std::collections::HashMap::new();
        
        // Add keyword results
        for (rank, result) in keyword_results.iter().enumerate() {
            let id = result["id"].as_str().unwrap().to_string();
            result_map.entry(id)
                .and_modify(|(k_rank, v_rank, _)| {
                    *k_rank = rank + 1;
                })
                .or_insert((rank + 1, 0, 0.0));
        }
        
        // Add vector results
        for (rank, result) in vector_results.iter().enumerate() {
            let id = result["id"].as_str().unwrap().to_string();
            result_map.entry(id)
                .and_modify(|(k_rank, v_rank, _)| {
                    *v_rank = rank + 1;
                })
                .or_insert((0, rank + 1, 0.0));
        }
        
        // Calculate RRF scores
        let mut scored_results: Vec<(f32, serde_json::Value)> = result_map
            .into_iter()
            .filter_map(|(id, (k_rank, v_rank, _))| {
                // Reciprocal Rank Fusion
                let k_score = if k_rank > 0 { 1.0 / (60.0 + k_rank as f32) } else { 0.0 };
                let v_score = if v_rank > 0 { 1.0 / (60.0 + v_rank as f32) } else { 0.0 };
                let rrf_score = k_score + v_score;
                
                // Find the original item
                let item = feed_items.iter()
                    .find(|item| item["id"].as_str() == Some(&id))
                    .cloned();
                
                item.map(|item| (rrf_score, item))
            })
            .collect();
        
        // Sort by RRF score
        scored_results.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));
        
        Ok(scored_results
            .into_iter()
            .take(limit)
            .map(|(_, item)| item)
            .collect())
    }

    /// Get vector index status (mock)
    pub fn get_index_status(&self, feed_items: &[serde_json::Value]) -> serde_json::Value {
        let total_items = feed_items.len();
        let vector_items = feed_items.iter()
            .filter(|item| item.get("content_vector").is_some())
            .count();
        let pending_items = total_items - vector_items;
        
        let completion_percentage = if total_items > 0 {
            (vector_items as f32 / total_items as f32) * 100.0
        } else {
            0.0
        };
        
        json!({
            "total_items": total_items,
            "vector_items": vector_items,
            "pending_items": pending_items,
            "completion_percentage": completion_percentage,
            "status": if vector_items == total_items && total_items > 0 {
                "complete"
            } else if vector_items > 0 {
                "partial"
            } else {
                "empty"
            },
            "mock_mode": true,
            "message": "Vector search is running in mock mode. Install sqlite-vec to enable real vector search."
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    
    #[test]
    fn test_mock_embedding_generation() {
        let generator = MockEmbeddingGenerator::new();
        let embedding = generator.generate_embedding("test content");
        
        assert_eq!(embedding.len(), 384);
        assert!(embedding.iter().all(|&x| x >= -1.0 && x <= 1.0));
    }
    
    #[test]
    fn test_cosine_similarity() {
        let generator = MockEmbeddingGenerator::new();
        
        // Test identical vectors
        let vec1 = vec![1.0, 0.0, 0.0];
        let vec2 = vec![1.0, 0.0, 0.0];
        assert_eq!(generator.cosine_similarity(&vec1, &vec2), 1.0);
        
        // Test orthogonal vectors
        let vec3 = vec![1.0, 0.0, 0.0];
        let vec4 = vec![0.0, 1.0, 0.0];
        assert_eq!(generator.cosine_similarity(&vec3, &vec4), 0.0);
        
        // Test opposite vectors
        let vec5 = vec![1.0, 0.0, 0.0];
        let vec6 = vec![-1.0, 0.0, 0.0];
        assert_eq!(generator.cosine_similarity(&vec5, &vec6), -1.0);
    }
    
    #[test]
    fn test_realistic_similarity() {
        let generator = MockEmbeddingGenerator::new();
        
        let sim1 = generator.generate_realistic_similarity(
            "hello world",
            "hello world"
        );
        assert!(sim1 > 0.8, "Identical texts should be very similar: {}", sim1);
        
        let sim2 = generator.generate_realistic_similarity(
            "hello world",
            "goodbye universe"
        );
        assert!(sim2 < 0.5, "Different texts should have low similarity: {}", sim2);
    }
    
    #[test]
    fn test_mock_search() {
        let searcher = MockVectorSearcher::new();
        
        let test_items = vec![
            json!({
                "id": "item1",
                "feed_id": "main",
                "title": "Rust Programming",
                "content": "Learning Rust programming language",
                "created_at": "2026-01-01"
            }),
            json!({
                "id": "item2",
                "feed_id": "main",
                "title": "Web Development",
                "content": "Building web applications with JavaScript",
                "created_at": "2026-01-02"
            }),
        ];
        
        let results = searcher.search("programming language", &test_items, 1).unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0]["id"], "item1");
        assert!(results[0]["similarity"].as_f64().unwrap() > 0.5);
    }
    
    #[test]
    fn test_index_status() {
        let searcher = MockVectorSearcher::new();
        
        let test_items = vec![
            json!({
                "id": "item1",
                "feed_id": "main",
                "title": "Test",
                "content": "Test content",
                "created_at": "2026-01-01"
            }),
        ];
        
        let status = searcher.get_index_status(&test_items);
        assert_eq!(status["total_items"], 1);
        assert_eq!(status["vector_items"], 0);
        assert_eq!(status["pending_items"], 1);
        assert_eq!(status["status"], "empty");
        assert!(status["mock_mode"].as_bool().unwrap());
    }
}