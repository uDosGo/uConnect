// core-rs/src/swarm/mod.rs
// Main module for Hivemind's multi-agent swarm system

pub mod agent;
pub mod agents;

// Re-export key types and traits
pub use agent::{
    Agent, BoxedAgent, AgentRegistry, Task, TaskType, AgentOutput, AgentContext,
    AgentType, MessageType, AgentMessage, agent_factory,
};

// Swarm orchestrator (will be implemented next)
pub mod orchestrator;

// Inter-agent communication (will be implemented next)
pub mod communication;

// Task planner (will be implemented next)
pub mod planner;

// Parallel executor (will be implemented next)
pub mod executor;

// Supervisor (will be implemented next)
pub mod supervisor;