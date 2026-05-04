use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Serialize, Deserialize};
use std::fs::{File, OpenOptions};
use std::io::{Write, BufWriter};
use std::path::PathBuf;

/// DSC2 call metrics
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Dsc2CallMetrics {
    pub timestamp: u64,
    pub tool: String,
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub latency_ms: u64,
    pub success: bool,
    pub cost_usd: f64,
    pub language: Option<String>,
    pub purpose: Option<String>,
}

/// Value metrics tracker
#[derive(Debug)]
pub struct ValueMetrics {
    metrics_file: PathBuf,
    monthly_budget: f64,
    used_budget: f64,
}

impl ValueMetrics {
    /// Create new ValueMetrics instance
    pub fn new(metrics_dir: &str, monthly_budget: f64) -> Self {
        let metrics_file = PathBuf::from(metrics_dir).join("dsc2_metrics.ndjson");
        
        // Ensure directory exists
        if let Some(parent) = metrics_file.parent() {
            std::fs::create_dir_all(parent).unwrap_or_else(|_| {
                eprintln!("⚠️  Could not create metrics directory: {:?}", parent);
            });
        }
        
        ValueMetrics {
            metrics_file,
            monthly_budget,
            used_budget: 0.0,
        }
    }
    
    /// Record a DSC2 call with metrics
    pub fn record_dsc2_call(&mut self, metrics: Dsc2CallMetrics) {
        // Update used budget
        self.used_budget += metrics.cost_usd;
        
        // Log to file
        if let Ok(file) = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.metrics_file)
        {
            let mut writer = BufWriter::new(file);
            if let Ok(json) = serde_json::to_string(&metrics) {
                if let Err(e) = writeln!(writer, "{}", json) {
                    eprintln!("❌ Failed to write metrics: {}", e);
                }
            }
        }
        
        // Check budget
        let budget_percentage = (self.used_budget / self.monthly_budget) * 100.0;
        if budget_percentage > 90.0 {
            eprintln!("⚠️  DSC2 budget warning: {:.1}% used ({:.2}/${:.2})", 
                      budget_percentage, self.used_budget, self.monthly_budget);
        }
    }
    
    /// Calculate cost for DSC2 call
    pub fn calculate_cost(prompt_tokens: u32, completion_tokens: u32) -> f64 {
        // DSC2 pricing: $0.14 per 1M tokens (input + output)
        const PRICE_PER_1M_TOKENS: f64 = 0.14;
        let total_tokens = prompt_tokens as f64 + completion_tokens as f64;
        (total_tokens / 1_000_000.0) * PRICE_PER_1M_TOKENS
    }
    
    /// Get current timestamp in milliseconds
    pub fn current_timestamp() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
    
    /// Get budget usage summary
    pub fn get_budget_summary(&self) -> String {
        let percentage = (self.used_budget / self.monthly_budget) * 100.0;
        format!(
            "DSC2 Budget: ${:.2}/{:.2} ({:.1}%)",
            self.used_budget, self.monthly_budget, percentage
        )
    }
    
    /// Check if budget is exceeded
    pub fn is_budget_exceeded(&self) -> bool {
        self.used_budget >= self.monthly_budget
    }
}

/// DSC2 call tracker with metrics
#[derive(Debug)]
pub struct Dsc2CallTracker {
    metrics: ValueMetrics,
}

impl Dsc2CallTracker {
    pub fn new(metrics_dir: &str, monthly_budget: f64) -> Self {
        Dsc2CallTracker {
            metrics: ValueMetrics::new(metrics_dir, monthly_budget),
        }
    }
    
    /// Track a DSC2 call and return metrics
    pub async fn track_call<T, F>(
        &mut self,
        tool: &str,
        prompt_tokens: u32,
        language: Option<&str>,
        purpose: Option<&str>,
        call_func: F,
    ) -> Result<T, String>
    where
        F: std::future::Future<Output = Result<T, String>>,
    {
        // Check budget before making call
        if self.metrics.is_budget_exceeded() {
            return Err("DSC2 budget exceeded".to_string());
        }
        
        let start_time = ValueMetrics::current_timestamp();
        
        // Execute the call
        let result = call_func.await;
        
        let end_time = ValueMetrics::current_timestamp();
        let latency_ms = end_time.saturating_sub(start_time);
        
        // Calculate completion tokens (mock for now)
        let completion_tokens = match &result {
            Ok(_) => prompt_tokens / 2, // Rough estimate
            Err(_) => 0,
        };
        
        let cost = ValueMetrics::calculate_cost(prompt_tokens, completion_tokens);
        
        // Record metrics
        self.metrics.record_dsc2_call(Dsc2CallMetrics {
            timestamp: start_time,
            tool: tool.to_string(),
            prompt_tokens,
            completion_tokens,
            latency_ms,
            success: result.is_ok(),
            cost_usd: cost,
            language: language.map(|s| s.to_string()),
            purpose: purpose.map(|s| s.to_string()),
        });
        
        result
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_cost_calculation() {
        let cost = ValueMetrics::calculate_cost(1000, 500);
        assert!(cost > 0.0);
        assert!(cost < 0.001); // Should be very small for 1.5k tokens
    }
    
    #[test]
    fn test_budget_tracking() {
        let mut metrics = ValueMetrics::new("/tmp/test_metrics", 100.0);
        
        let initial_budget = metrics.used_budget;
        
        metrics.record_dsc2_call(Dsc2CallMetrics {
            timestamp: 123456,
            tool: "dsc2_generate".to_string(),
            prompt_tokens: 1000,
            completion_tokens: 500,
            latency_ms: 100,
            success: true,
            cost_usd: 0.00021,
            language: Some("rust".to_string()),
            purpose: Some("testing".to_string()),
        });
        
        assert!(metrics.used_budget > initial_budget);
    }
}