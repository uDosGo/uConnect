// core-rs/src/learning/mod.rs
// Learning and adaptation module

pub mod feedback;

// Re-export key types
pub use feedback::{UserFeedback, LearningSystem, OutcomeTracker, TaskOutcome};

// Prompt optimizer (will be implemented)
pub mod optimizer;

// Personalization (will be implemented)
pub mod personalization;