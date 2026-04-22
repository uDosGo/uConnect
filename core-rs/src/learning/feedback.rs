// core-rs/src/learning/feedback.rs
// Feedback collection and learning system

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use serde::{Serialize, Deserialize};
use uuid::Uuid;

/// User feedback on task execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserFeedback {
    pub task_id: Uuid,
    pub rating: u8, // 1-5 stars
    pub comment: Option<String>,
    pub timestamp: i64,
    pub task_type: String,
    pub command: String,
}

/// Learning system that adapts based on feedback
#[derive(Debug, Clone)]
pub struct LearningSystem {
    feedback: Arc<Mutex<Vec<UserFeedback>>>,
    prompt_improvements: Arc<Mutex<HashMap<String, String>>>,
}

impl LearningSystem {
    pub fn new() -> Self {
        Self {
            feedback: Arc::new(Mutex::new(Vec::new())),
            prompt_improvements: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Record user feedback
    pub fn record_feedback(&self, feedback: UserFeedback) {
        let mut feedback_list = self.feedback.lock().unwrap();
        feedback_list.push(feedback);
    }

    /// Get average rating for a task type
    pub fn average_rating(&self, task_type: &str) -> f64 {
        let feedback_list = self.feedback.lock().unwrap();
        let relevant = feedback_list.iter()
            .filter(|f| f.task_type == task_type);
        let count = relevant.clone().count() as f64;
        if count == 0.0 {
            return 0.0;
        }
        let sum: u32 = relevant.map(|f| f.rating as u32).sum();
        sum as f64 / count
    }

    /// Get prompt improvements for a task type
    pub fn get_prompt_improvement(&self, task_type: &str) -> Option<String> {
        let improvements = self.prompt_improvements.lock().unwrap();
        improvements.get(task_type).cloned()
    }

    /// Learn from feedback and improve prompts
    pub fn learn_from_feedback(&self) {
        let feedback_list = self.feedback.lock().unwrap();
        let mut improvements = self.prompt_improvements.lock().unwrap();
        
        // Group feedback by task type
        let mut type_feedback: HashMap<String, Vec<&UserFeedback>> = HashMap::new();
        for feedback in feedback_list.iter() {
            type_feedback.entry(feedback.task_type.clone())
                .or_insert_with(Vec::new)
                .push(feedback);
        }
        
        // Analyze each task type
        for (task_type, feedbacks) in type_feedback {
            if feedbacks.len() < 3 {
                continue; // Not enough data
            }
            
            let avg_rating = self.average_rating(&task_type);
            
            // If average rating is low, suggest improvements
            if avg_rating < 3.0 {
                let common_issues: HashMap<String, usize> = HashMap::new();
                // TODO: Analyze feedback comments for common issues
                // For now, use a simple improvement
                improvements.insert(
                    task_type.clone(),
                    format!("Try being more specific about the {} task type", task_type)
                );
            }
        }
    }

    /// Save feedback to disk (JSON)
    pub fn save_to_disk(&self, path: &str) -> std::io::Result<()> {
        let feedback_list = self.feedback.lock().unwrap();
        let json = serde_json::to_string_pretty(feedback_list)?;
        std::fs::write(path, json)
    }

    /// Load feedback from disk
    pub fn load_from_disk(&self, path: &str) -> std::io::Result<()> {
        let json = std::fs::read_to_string(path)?;
        let feedback_list: Vec<UserFeedback> = serde_json::from_str(&json)?;
        let mut list = self.feedback.lock().unwrap();
        *list = feedback_list;
        Ok(())
    }
}

/// Task outcome tracker
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskOutcome {
    pub task_id: Uuid,
    pub success: bool,
    pub duration_ms: u64,
    pub tokens_used: u32,
    pub cost: f64,
    pub quality_score: f64, // 0.0-1.0
    pub timestamp: i64,
}

/// Outcome tracker
#[derive(Debug, Clone)]
pub struct OutcomeTracker {
    outcomes: Arc<Mutex<Vec<TaskOutcome>>>,
}

impl OutcomeTracker {
    pub fn new() -> Self {
        Self {
            outcomes: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn track_outcome(&self, outcome: TaskOutcome) {
        let mut outcomes = self.outcomes.lock().unwrap();
        outcomes.push(outcome);
    }

    /// Get success rate for a task type
    pub fn success_rate(&self, task_type: &str) -> f64 {
        // TODO: Filter by task type when we add that field
        let outcomes = self.outcomes.lock().unwrap();
        let total = outcomes.len() as f64;
        if total == 0.0 {
            return 0.0;
        }
        let success_count = outcomes.iter()
            .filter(|o| o.success)
            .count() as f64;
        success_count / total
    }

    /// Get average quality score
    pub fn average_quality(&self) -> f64 {
        let outcomes = self.outcomes.lock().unwrap();
        if outcomes.is_empty() {
            return 0.0;
        }
        let sum: f64 = outcomes.iter().map(|o| o.quality_score).sum();
        sum / outcomes.len() as f64
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    #[test]
    fn test_feedback_collection() {
        let system = LearningSystem::new();
        
        system.record_feedback(UserFeedback {
            task_id: Uuid::new_v4(),
            rating: 4,
            comment: Some("Good but could be better".to_string()),
            timestamp: 0,
            task_type: "generate".to_string(),
            command: "generate function".to_string(),
        });
        
        assert_eq!(system.average_rating("generate"), 4.0);
    }

    #[test]
    fn test_outcome_tracking() {
        let tracker = OutcomeTracker::new();
        
        tracker.track_outcome(TaskOutcome {
            task_id: Uuid::new_v4(),
            success: true,
            duration_ms: 1000,
            tokens_used: 100,
            cost: 0.0002,
            quality_score: 0.85,
            timestamp: 0,
        });
        
        assert_eq!(tracker.success_rate("generate"), 1.0);
        assert_eq!(tracker.average_quality(), 0.85);
    }
}