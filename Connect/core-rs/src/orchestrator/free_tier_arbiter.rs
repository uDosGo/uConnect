use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use std::time::{SystemTime, UNIX_EPOCH};

/// Available inference sources
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum InferenceSource {
    /// Apple Intelligence (free, unlimited for simple tasks)
    AppleIntelligence,
    /// GitHub Copilot Free Tier (300 chats/day)
    CopilotFree,
    /// Gemini Flash Free Tier (60 requests/min, 1500/day)
    GeminiFree,
    /// DeepSeek Free Trial (5M tokens)
    DeepSeekFreeTrial,
    /// DeepSeek Paid ($0.14/1M tokens)
    DeepSeekPaid,
    /// Fallback to local model
    LocalModel,
}

/// Task type for routing decisions
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum TaskType {
    SimpleQA,
    ComplexQA,
    CodeGeneration,
    CodeExplanation,
    CodeRefactoring,
    Research,
    Chat,
    Unknown,
}

impl TaskType {
    pub fn is_simple_qa(&self) -> bool {
        matches!(self, TaskType::SimpleQA)
    }
    
    pub fn is_chat(&self) -> bool {
        matches!(self, TaskType::Chat)
    }
    
    pub fn is_code(&self) -> bool {
        matches!(self, TaskType::CodeGeneration | TaskType::CodeExplanation | TaskType::CodeRefactoring)
    }
    
    pub fn is_research(&self) -> bool {
        matches!(self, TaskType::Research)
    }
}

/// Free tier quota tracking
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FreeTierQuotas {
    pub gemini_quota_remaining: u32,      // 60/min, 1500/day
    pub gemini_last_reset: u64,           // Timestamp of last reset
    pub deepseek_free_tokens: u32,       // 5M total
    pub copilot_free_chats: u32,         // 300/day
    pub copilot_last_reset: u64,         // Timestamp of last reset
    pub apple_intel_available: bool,     // Unlimited
}

impl Default for FreeTierQuotas {
    fn default() -> Self {
        Self {
            gemini_quota_remaining: 1500,      // Start with daily limit
            gemini_last_reset: Self::today_midnight(),
            deepseek_free_tokens: 5_000_000,   // 5M tokens
            copilot_free_chats: 300,           // Daily limit
            copilot_last_reset: Self::today_midnight(),
            apple_intel_available: true,     // Always available
        }
    }
}

impl FreeTierQuotas {
    fn today_midnight() -> u64 {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        // Midnight of current day
        now - (now % 86400)
    }
    
    /// Reset daily quotas if needed
    pub fn reset_daily_quotas(&mut self) {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        // Reset Gemini quota (daily)
        if now - self.gemini_last_reset >= 86400 {
            self.gemini_quota_remaining = 1500;
            self.gemini_last_reset = now;
        }
        
        // Reset Copilot chats (daily)
        if now - self.copilot_last_reset >= 86400 {
            self.copilot_free_chats = 300;
            self.copilot_last_reset = now;
        }
    }
    
    /// Consume Gemini quota
    pub fn consume_gemini(&mut self, tokens: u32) -> bool {
        self.reset_daily_quotas();
        if self.gemini_quota_remaining >= tokens {
            self.gemini_quota_remaining -= tokens;
            return true;
        }
        false
    }
    
    /// Consume Copilot chat
    pub fn consume_copilot(&mut self) -> bool {
        self.reset_daily_quotas();
        if self.copilot_free_chats > 0 {
            self.copilot_free_chats -= 1;
            return true;
        }
        false
    }
    
    /// Consume DeepSeek free tokens
    pub fn consume_deepseek(&mut self, tokens: u32) -> bool {
        if self.deepseek_free_tokens >= tokens {
            self.deepseek_free_tokens -= tokens;
            return true;
        }
        false
    }
    
    /// Get remaining quotas summary
    pub fn get_quotas_summary(&self) -> String {
        format!(
            "Free Tier Quotas: Gemini={}/1500, Copilot={}/300, DeepSeek={}/5M, Apple=✓",
            self.gemini_quota_remaining,
            self.copilot_free_chats,
            self.deepseek_free_tokens / 1_000_000
        )
    }
}

/// Free tier arbiter - selects the cheapest available source
#[derive(Debug)]
pub struct FreeTierArbiter {
    quotas: FreeTierQuotas,
    provider_performance: HashMap<InferenceSource, f64>, // Quality scores
}

impl Default for FreeTierArbiter {
    fn default() -> Self {
        Self {
            quotas: FreeTierQuotas::default(),
            provider_performance: HashMap::new(),
        }
    }
}

impl FreeTierArbiter {
    /// Create new arbiter with default quotas
    pub fn new() -> Self {
        Self::default()
    }
    
    /// Select the cheapest available source for a task
    pub fn select_cheapest_source(&mut self, task_type: TaskType) -> InferenceSource {
        self.quotas.reset_daily_quotas();
        
        // Try free sources in order of cost (all $0, but prioritize by suitability)
        
        // 1. Apple Intelligence - unlimited for simple tasks
        if self.quotas.apple_intel_available && task_type.is_simple_qa() {
            return InferenceSource::AppleIntelligence;
        }
        
        // 2. Copilot Free - great for code tasks
        if self.quotas.copilot_free_chats > 0 && task_type.is_code() {
            self.quotas.consume_copilot();
            return InferenceSource::CopilotFree;
        }
        
        // 3. Gemini Free - good for research and general tasks
        if self.quotas.gemini_quota_remaining > 0 && task_type.is_research() {
            // Estimate 100 tokens per research query
            if self.quotas.consume_gemini(100) {
                return InferenceSource::GeminiFree;
            }
        }
        
        // 4. DeepSeek Free Trial - best for code generation
        if self.quotas.deepseek_free_tokens > 1000 && task_type.is_code() {
            // Estimate 500 tokens per code generation
            if self.quotas.consume_deepseek(500) {
                return InferenceSource::DeepSeekFreeTrial;
            }
        }
        
        // 5. Fallback to paid DeepSeek
        InferenceSource::DeepSeekPaid
    }
    
    /// Select source based on quality requirements
    pub fn select_by_quality(&mut self, task_type: TaskType, min_quality: f64) -> InferenceSource {
        self.quotas.reset_daily_quotas();
        
        // Get performance data for available sources
        let mut candidates = vec![];
        
        // Check Apple Intelligence
        if self.quotas.apple_intel_available && task_type.is_simple_qa() {
            let quality = self.provider_performance.get(&InferenceSource::AppleIntelligence).copied().unwrap_or(0.85);
            if quality >= min_quality {
                candidates.push((quality, InferenceSource::AppleIntelligence));
            }
        }
        
        // Check Copilot
        if self.quotas.copilot_free_chats > 0 && task_type.is_code() {
            let quality = self.provider_performance.get(&InferenceSource::CopilotFree).copied().unwrap_or(0.88);
            if quality >= min_quality {
                candidates.push((quality, InferenceSource::CopilotFree));
            }
        }
        
        // Check Gemini
        if self.quotas.gemini_quota_remaining > 0 {
            let quality = self.provider_performance.get(&InferenceSource::GeminiFree).copied().unwrap_or(0.82);
            if quality >= min_quality {
                candidates.push((quality, InferenceSource::GeminiFree));
            }
        }
        
        // Check DeepSeek Free
        if self.quotas.deepseek_free_tokens > 1000 && task_type.is_code() {
            let quality = self.provider_performance.get(&InferenceSource::DeepSeekFreeTrial).copied().unwrap_or(0.90);
            if quality >= min_quality {
                candidates.push((quality, InferenceSource::DeepSeekFreeTrial));
            }
        }
        
        // Select highest quality candidate
        if let Some((_, source)) = candidates.into_iter().max_by(|a, b| a.0.partial_cmp(&b.0).unwrap()) {
            // Consume quota if needed
            match source {
                InferenceSource::CopilotFree => { self.quotas.consume_copilot(); }
                InferenceSource::GeminiFree => { self.quotas.consume_gemini(100); }
                InferenceSource::DeepSeekFreeTrial => { self.quotas.consume_deepseek(500); }
                _ => {}
            }
            return source;
        }
        
        // Fallback to paid if no free source meets quality requirements
        InferenceSource::DeepSeekPaid
    }
    
    /// Update provider performance based on feedback
    pub fn update_provider_performance(&mut self, source: InferenceSource, quality_score: f64) {
        // Moving average with feedback
        let current = self.provider_performance.get(&source).copied().unwrap_or(0.7);
        let new_score = 0.7 * current + 0.3 * quality_score;
        self.provider_performance.insert(source, new_score);
    }
    
    /// Get cost savings report
    pub fn get_cost_savings_report(&self) -> String {
        let original_quotas = FreeTierQuotas::default();
        
        let gemini_saved = (original_quotas.gemini_quota_remaining - self.quotas.gemini_quota_remaining) as f64 * 0.0000002; // $0.20/1M
        let deepseek_saved = (original_quotas.deepseek_free_tokens - self.quotas.deepseek_free_tokens) as f64 * 0.00000014; // $0.14/1M
        let total_saved = gemini_saved + deepseek_saved;
        
        format!(
            "Cost Savings: Gemini=${:.4}, DeepSeek=${:.4}, Total=${:.4}",
            gemini_saved, deepseek_saved, total_saved
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_free_tier_selection() {
        let mut arbiter = FreeTierArbiter::new();
        
        // Simple QA should use Apple Intelligence
        assert_eq!(
            arbiter.select_cheapest_source(TaskType::SimpleQA),
            InferenceSource::AppleIntelligence
        );
        
        // Code generation should use Copilot Free
        assert_eq!(
            arbiter.select_cheapest_source(TaskType::CodeGeneration),
            InferenceSource::CopilotFree
        );
        
        // After using Copilot, should fallback to DeepSeek Free
        assert_eq!(
            arbiter.select_cheapest_source(TaskType::CodeGeneration),
            InferenceSource::DeepSeekFreeTrial
        );
    }
    
    #[test]
    fn test_quota_management() {
        let mut quotas = FreeTierQuotas::default();
        
        // Should start with full quotas
        assert_eq!(quotas.copilot_free_chats, 300);
        assert_eq!(quotas.gemini_quota_remaining, 1500);
        
        // Consume some quotas
        assert!(quotas.consume_copilot());
        assert!(quotas.consume_gemini(50));
        
        // Quotas should decrease
        assert_eq!(quotas.copilot_free_chats, 299);
        assert_eq!(quotas.gemini_quota_remaining, 1450);
    }
    
    #[test]
    fn test_quality_based_selection() {
        let mut arbiter = FreeTierArbiter::new();
        
        // Set performance scores
        arbiter.update_provider_performance(InferenceSource::CopilotFree, 0.95);
        arbiter.update_provider_performance(InferenceSource::DeepSeekFreeTrial, 0.85);
        
        // High quality requirement should prefer Copilot
        assert_eq!(
            arbiter.select_by_quality(TaskType::CodeGeneration, 0.9),
            InferenceSource::CopilotFree
        );
        
        // Lower quality requirement might accept DeepSeek
        assert_eq!(
            arbiter.select_by_quality(TaskType::CodeGeneration, 0.8),
            InferenceSource::DeepSeekFreeTrial
        );
    }
}