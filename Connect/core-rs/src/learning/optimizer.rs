// core-rs/src/learning/optimizer.rs
// Prompt optimization using machine learning patterns

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use serde::{Serialize, Deserialize};

/// Prompt optimization engine
#[derive(Debug, Clone)]
pub struct PromptOptimizer {
    // Pattern database: task_type -> best prompts
    patterns: Arc<Mutex<HashMap<String, Vec<String>>>>,
    // Performance data: prompt -> success rate
    performance: Arc<Mutex<HashMap<String, f64>>>, 
}

impl PromptOptimizer {
    pub fn new() -> Self {
        Self {
            patterns: Arc::new(Mutex::new(HashMap::new())),
            performance: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Optimize a prompt based on historical performance
    pub fn optimize_prompt(&self, task_type: &str, original_prompt: &str) -> String {
        let patterns = self.patterns.lock().unwrap();
        
        // Check if we have patterns for this task type
        if let Some(task_patterns) = patterns.get(task_type) {
            // Find the best performing pattern
            let performance = self.performance.lock().unwrap();
            let best_pattern = task_patterns.iter()
                .max_by(|a, b| {
                    performance.get(*a).unwrap_or(&0.5).total_cmp(performance.get(*b).unwrap_or(&0.5))
                });
            
            if let Some(best) = best_pattern {
                if performance.get(best).unwrap_or(&0.0) > 0.7 {
                    return best.replace("{}", original_prompt);
                }
            }
        }
        
        // Default: return original with slight enhancement
        if original_prompt.ends_with(".") || original_prompt.ends_with("!") || original_prompt.ends_with("?") {
            format!("{} Please provide a detailed response", original_prompt)
        } else {
            format!("Generate a high-quality {}: {}", task_type, original_prompt)
        }
    }

    /// Record prompt performance
    pub fn record_performance(&self, prompt: &str, success: bool, task_type: &str) {
        let mut performance = self.performance.lock().unwrap();
        let entry = performance.entry(prompt.to_string()).or_insert(0.5);
        
        // Update performance score (moving average)
        if success {
            *entry = *entry * 0.9 + 0.1;
        } else {
            *entry = *entry * 0.9;
        }
        
        // If this prompt performs well, add to patterns
        if *entry > 0.8 && success {
            let mut patterns = self.patterns.lock().unwrap();
            patterns.entry(task_type.to_string())
                .or_insert_with(Vec::new)
                .push(prompt.to_string());
        }
    }

    /// Get best prompt for a task type
    pub fn best_prompt(&self, task_type: &str) -> Option<String> {
        let patterns = self.patterns.lock().unwrap();
        let performance = self.performance.lock().unwrap();
        
        patterns.get(task_type).and_then(|prompts| {
            prompts.iter()
                .max_by(|a, b| performance.get(*a).unwrap_or(&0.0).total_cmp(performance.get(*b).unwrap_or(&0.0)))
                .cloned()
        })
    }

    /// Save patterns to disk
    pub fn save_to_disk(&self, path: &str) -> std::io::Result<()> {
        let patterns = self.patterns.lock().unwrap();
        let json = serde_json::to_string_pretty(patterns)?;
        std::fs::write(path, json)
    }

    /// Load patterns from disk
    pub fn load_from_disk(&self, path: &str) -> std::io::Result<()> {
        let json = std::fs::read_to_string(path)?;
        let patterns: HashMap<String, Vec<String>> = serde_json::from_str(&json)?;
        let mut current = self.patterns.lock().unwrap();
        *current = patterns;
        Ok(())
    }
}

/// Simple pattern matcher for common improvements
pub struct PatternMatcher {
    patterns: HashMap<String, Vec<(String, String)>>, // (pattern, replacement)
}

impl PatternMatcher {
    pub fn new() -> Self {
        let mut patterns = HashMap::new();
        
        // Common improvements
        patterns.insert("generate".to_string(), vec![
            (r"make (.*)", "create a $1"),
            (r"do (.*)", "perform the following task: $1"),
        ]);
        
        patterns.insert("explain".to_string(), vec![
            (r"what does (.*) do", "Explain the purpose and functionality of $1"),
            (r"how (.*) works", "Describe in detail how $1 operates"),
        ]);
        
        Self { patterns }
    }

    pub fn improve(&self, task_type: &str, prompt: &str) -> String {
        if let Some(task_patterns) = self.patterns.get(task_type) {
            for (pattern, replacement) in task_patterns {
                if let Some(caps) = regex::Regex::new(pattern).ok() {
                    if caps.is_match(prompt) {
                        return caps.replace(prompt, replacement);
                    }
                }
            }
        }
        prompt.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_prompt_optimization() {
        let optimizer = PromptOptimizer::new();
        
        // Test basic optimization
        let optimized = optimizer.optimize_prompt("generate", "make a function");
        assert!(optimized.contains("create"));
        
        // Test performance tracking
        optimizer.record_performance("create a function", true, "generate");
        let rating = optimizer.performance.lock().unwrap();
        assert!(rating.get("create a function").unwrap() > 0.8);
        
        // Test best prompt selection
        let best = optimizer.best_prompt("generate");
        assert!(best.is_some());
    }

    #[test]
    fn test_pattern_matching() {
        let matcher = PatternMatcher::new();
        
        let improved = matcher.improve("generate", "make a function");
        assert_eq!(improved, "create a function");
        
        let explained = matcher.improve("explain", "what does this do");
        assert!(explained.contains("Explain"));
    }
}