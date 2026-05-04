use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use lru::LruCache;
use serde::{Serialize, Deserialize};
use std::num::NonZeroUsize;

/// Cached code generation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedCode {
    pub generated_code: String,
    pub language: String,
    pub quality_score: f64,
    pub timestamp: u64,
    pub hit_count: u32,
}

/// Code cache using LRU (Least Recently Used) eviction
#[derive(Debug)]
pub struct CodeCache {
    cache: RwLock<LruCache<String, CachedCode>>,
    stats: RwLock<CacheStats>,
}

/// Cache statistics
#[derive(Debug, Default)]
pub struct CacheStats {
    pub hits: u64,
    pub misses: u64,
    pub evictions: u64,
    pub total_saved_cost: f64,
}

impl CodeCache {
    /// Create new code cache with specified capacity (in bytes)
    pub fn new(capacity_bytes: usize) -> Self {
        // Estimate average entry size (conservative)
        let avg_entry_size = 512; // bytes
        let max_entries = (capacity_bytes / avg_entry_size).max(16); // Minimum 16 entries
        
        let cache = LruCache::new(NonZeroUsize::new(max_entries).unwrap());
        
        CodeCache {
            cache: RwLock::new(cache),
            stats: RwLock::new(CacheStats::default()),
        }
    }
    
    /// Normalize prompt for caching (remove variations)
    fn normalize_prompt(prompt: &str) -> String {
        let mut normalized = prompt.to_lowercase();
        
        // Remove common variations
        normalized = normalized.replace("write a", "");
        normalized = normalized.replace("create a", "");
        normalized = normalized.replace("generate a", "");
        normalized = normalized.replace("in python", "");
        normalized = normalized.replace("in javascript", "");
        normalized = normalized.replace("in typescript", "");
        normalized = normalized.replace("  ", " "); // Remove double spaces
        
        normalized.trim().to_string()
    }
    
    /// Get cached code or generate new one
    pub fn get_or_generate<F>(
        &self,
        prompt: &str,
        language: &str,
        generate_func: F,
    ) -> CachedCode
    where
        F: FnOnce() -> CachedCode,
    {
        let normalized_key = Self::normalize_prompt(prompt);
        
        // Try to get from cache
        {
            let cache_read = self.cache.read().unwrap();
            if let Some(cached) = cache_read.get(&normalized_key) {
                // Cache hit
                let mut stats = self.stats.write().unwrap();
                stats.hits += 1;
                
                // Update hit count
                let mut cache_write = self.cache.write().unwrap();
                if let Some(mut cached_mut) = cache_write.get_mut(&normalized_key) {
                    cached_mut.hit_count += 1;
                }
                
                let mut cached_clone = cached.clone();
                cached_clone.hit_count += 1;
                
                return cached_clone;
            }
        }
        
        // Cache miss - generate new
        let mut stats = self.stats.write().unwrap();
        stats.misses += 1;
        
        let generated = generate_func();
        
        // Store in cache
        let mut cache_write = self.cache.write().unwrap();
        if cache_write.put(normalized_key.clone(), generated.clone()).is_some() {
            stats.evictions += 1;
        }
        
        generated
    }
    
    /// Get cache statistics
    pub fn get_stats(&self) -> CacheStats {
        self.stats.read().unwrap().clone()
    }
    
    /// Clear cache
    pub fn clear(&self) {
        let mut cache_write = self.cache.write().unwrap();
        cache_write.clear();
        
        let mut stats = self.stats.write().unwrap();
        *stats = CacheStats::default();
    }
    
    /// Get estimated cost savings
    pub fn get_cost_savings(&self) -> f64 {
        let stats = self.get_stats();
        
        // Estimate average cost per generation ($0.0002 per call)
        const AVERAGE_COST_PER_GENERATION: f64 = 0.0002;
        
        stats.hits as f64 * AVERAGE_COST_PER_GENERATION
    }
    
    /// Get cache info summary
    pub fn get_summary(&self) -> String {
        let stats = self.get_stats();
        let cache_read = self.cache.read().unwrap();
        
        let hit_rate = if stats.hits + stats.misses > 0 {
            (stats.hits as f64 / (stats.hits + stats.misses) as f64) * 100.0
        } else {
            0.0
        };
        
        format!(
            "Cache: {} entries, {:.1}% hit rate, {} hits, {} misses, ${:.4} saved",
            cache_read.len(),
            hit_rate,
            stats.hits,
            stats.misses,
            stats.total_saved_cost
        )
    }
}

/// Simple in-memory cache for testing (not LRU)
#[derive(Debug, Default)]
pub struct SimpleCodeCache {
    cache: HashMap<String, CachedCode>,
}

impl SimpleCodeCache {
    pub fn new() -> Self {
        Self::default()
    }
    
    pub fn get_or_generate<F>(
        &mut self,
        prompt: &str,
        language: &str,
        generate_func: F,
    ) -> CachedCode
    where
        F: FnOnce() -> CachedCode,
    {
        let normalized_key = CodeCache::normalize_prompt(prompt);
        
        if let Some(cached) = self.cache.get(&normalized_key) {
            let mut cached_clone = cached.clone();
            cached_clone.hit_count += 1;
            return cached_clone;
        }
        
        let generated = generate_func();
        self.cache.insert(normalized_key, generated.clone());
        generated
    }
    
    pub fn get_stats(&self) -> CacheStats {
        CacheStats {
            hits: self.cache.values().map(|c| c.hit_count).sum(),
            misses: 0, // Not tracked in simple cache
            evictions: 0,
            total_saved_cost: 0.0,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_cache_basic() {
        let cache = CodeCache::new(1024); // 1KB cache
        
        let result1 = cache.get_or_generate(
            "write a fibonacci function",
            "python",
            || CachedCode {
                generated_code: "def fib(n): return n if n <= 1 else fib(n-1) + fib(n-2)".to_string(),
                language: "python".to_string(),
                quality_score: 0.85,
                timestamp: 123456,
                hit_count: 0,
            }
        );
        
        // First call should generate
        assert_eq!(result1.language, "python");
        assert_eq!(result1.hit_count, 1);
        
        // Second call with similar prompt should hit cache
        let result2 = cache.get_or_generate(
            "write a fibonacci function in python",
            "python",
            || panic!("Should not be called")
        );
        
        assert_eq!(result2.hit_count, 2);
        
        // Check stats
        let stats = cache.get_stats();
        assert_eq!(stats.hits, 1);
        assert_eq!(stats.misses, 1);
    }
    
    #[test]
    fn test_prompt_normalization() {
        let prompt1 = "Write a sort function in Python";
        let prompt2 = "create a sort function in python";
        let prompt3 = "generate sorting algorithm";
        
        let normalized1 = CodeCache::normalize_prompt(prompt1);
        let normalized2 = CodeCache::normalize_prompt(prompt2);
        let normalized3 = CodeCache::normalize_prompt(prompt3);
        
        // Should normalize similarly
        assert!(normalized1.contains("sort"));
        assert!(normalized2.contains("sort"));
        assert!(normalized1 == normalized2);
        assert!(normalized1 != normalized3);
    }
}