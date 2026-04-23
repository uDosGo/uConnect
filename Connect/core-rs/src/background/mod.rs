// core-rs/src/background/mod.rs
// Background processing module

pub mod queue;

// Re-export key types
pub use queue::{TaskQueue, TaskProcessor, BackgroundTask, TaskStatus};

// Idle detector (will be implemented)
pub mod idle;

// Scheduler (will be implemented)
pub mod scheduler;