// core-rs/src/swarm/agents/mod.rs
// Agents module

pub mod dsc2;

// Re-export the DSC2 agent
pub use dsc2::{DSC2Agent, create_dsc2_agent};