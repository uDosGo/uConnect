// core-rs/src/swarm/agent.rs
// Agent trait definition for Hivemind's multi-agent swarm system

use std::error::Error;
use std::time::SystemTime;
use serde::{Serialize, Deserialize};
use uuid::Uuid;

/// Represents a task that an agent can execute
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: Uuid,
    pub task_type: TaskType,
    pub description: String,
    pub context: Option<serde_json::Value>,
    pub priority: u8,
}

/// Types of agents in the swarm
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Hash, Eq)]
pub enum AgentType {
    DSC2,
    VibeCLI,
    Gemini,
    OpenRouter,
    AppleIntel,
}

/// Types of tasks agents can handle
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TaskType {
    Generate,
    Complete,
    Insert,
    Explain,
    Refactor,
    Document,
    Test,
    FileCreate,
    FileRead,
    FileWrite,
    FileDelete,
    Custom(String),
}

/// Message passed between agents
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentMessage {
    pub task_id: Uuid,
    pub message_type: MessageType,
    pub content: serde_json::Value,
    pub timestamp: Option<SystemTime>,
}

/// Types of messages agents can exchange
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum MessageType {
    Request,
    Response,
    Status,
    Error,
    Handoff,
}

/// Output from an agent's execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentOutput {
    pub task_id: Uuid,
    pub success: bool,
    pub result: Option<serde_json::Value>,
    pub error: Option<String>,
    pub tokens_used: u32,
    pub cost: f64,
    pub metadata: serde_json::Value,
}

/// Context provided to agents
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AgentContext {
    pub project_root: String,
    pub current_file: Option<String>,
    pub related_files: Vec<String>,
    pub user_preferences: serde_json::Value,
    pub previous_outputs: Vec<AgentOutput>,
}

/// Core trait that all agents must implement
pub trait Agent: Send + Sync {
    /// Unique identifier for the agent
    fn name(&self) -> &str;

    /// List of capabilities this agent supports
    fn capabilities(&self) -> Vec<&str>;

    /// Execute a task and return the output
    fn execute(
        &self,
        task: &Task,
        context: &AgentContext,
    ) -> Result<AgentOutput, Box<dyn Error>>;

    /// Validate that the output meets quality standards
    fn validate_output(&self, output: &AgentOutput) -> bool {
        output.success
    }

    /// Estimate the cost of executing a task
    fn cost_estimate(&self, task: &Task) -> f64;

    /// Check if this agent can handle a specific task type
    fn can_handle(&self, task_type: &TaskType) -> bool {
        let capability_str = match task_type {
            TaskType::Generate => "generate",
            TaskType::Complete => "complete",
            TaskType::Insert => "insert",
            TaskType::Explain => "explain",
            TaskType::Refactor => "refactor",
            TaskType::Document => "document",
            TaskType::Test => "test",
            TaskType::FileCreate => "file_create",
            TaskType::FileRead => "file_read",
            TaskType::FileWrite => "file_write",
            TaskType::FileDelete => "file_delete",
            TaskType::Custom(s) => s,
        };
        self.capabilities().contains(&capability_str)
    }
}

/// Boxed agent trait for dynamic dispatch
pub type BoxedAgent = Box<dyn Agent>;

/// Agent registration and management
pub struct AgentRegistry {
    agents: Vec<BoxedAgent>,
}

impl AgentRegistry {
    pub fn new() -> Self {
        Self { agents: Vec::new() }
    }

    pub fn register(&mut self, agent: BoxedAgent) {
        self.agents.push(agent);
    }

    pub fn get_agent(&self, name: &str) -> Option<&BoxedAgent> {
        self.agents.iter().find(|a| a.name() == name)
    }

    pub fn get_agent_for_task(&self, task_type: &TaskType) -> Option<&BoxedAgent> {
        self.agents.iter().find(|a| a.can_handle(task_type))
    }

    pub fn list_agents(&self) -> Vec<&BoxedAgent> {
        self.agents.iter().collect()
    }
}

/// Agent factory for creating specific agent instances
pub mod agent_factory {
    use super::*;

    pub fn create_dsc2_agent() -> BoxedAgent {
        Box::new(agents::dsc2::DSC2Agent::new())
    }

    pub fn create_vibe_cli_agent() -> BoxedAgent {
        // Placeholder - will be implemented in vibe_cli.rs
        todo!("Vibe-CLI agent implementation")
    }

    pub fn create_gemini_agent() -> BoxedAgent {
        // Placeholder - will be implemented in gemini.rs
        todo!("Gemini agent implementation")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    struct MockAgent {
        name: String,
        capabilities: Vec<String>,
    }

    impl Agent for MockAgent {
        fn name(&self) -> &str {
            &self.name
        }

        fn capabilities(&self) -> Vec<&str> {
            self.capabilities.iter().map(|s| s.as_str()).collect()
        }

        fn execute(
            &self,
            task: &Task,
            _context: &AgentContext,
        ) -> Result<AgentOutput, Box<dyn Error>> {
            Ok(AgentOutput {
                task_id: task.id,
                success: true,
                result: Some(serde_json::json!({
                    "message": format!("Mock execution of task: {}", task.description)
                })),
                error: None,
                tokens_used: 100,
                cost: 0.01,
                metadata: serde_json::json!({}),
            })
        }

        fn cost_estimate(&self, _task: &Task) -> f64 {
            0.01
        }
    }

    #[test]
    fn test_agent_registration() {
        let mut registry = AgentRegistry::new();
        let mock_agent = Box::new(MockAgent {
            name: "test-agent".to_string(),
            capabilities: vec!["generate".to_string(), "explain".to_string()],
        });

        registry.register(mock_agent);
        
        assert_eq!(registry.list_agents().len(), 1);
        assert!(registry.get_agent("test-agent").is_some());
    }

    #[test]
    fn test_task_execution() {
        let agent = MockAgent {
            name: "test-agent".to_string(),
            capabilities: vec!["generate".to_string()],
        };

        let task = Task {
            id: Uuid::new_v4(),
            task_type: TaskType::Generate,
            description: "Test task".to_string(),
            context: None,
            priority: 1,
        };

        let context = AgentContext::default();
        let result = agent.execute(&task, &context);

        assert!(result.is_ok());
        let output = result.unwrap();
        assert!(output.success);
        assert_eq!(output.task_id, task.id);
    }

    #[test]
    fn test_capability_matching() {
        let agent = MockAgent {
            name: "test-agent".to_string(),
            capabilities: vec!["generate".to_string(), "explain".to_string()],
        };

        assert!(agent.can_handle(&TaskType::Generate));
        assert!(agent.can_handle(&TaskType::Explain));
        assert!(!agent.can_handle(&TaskType::Complete));
    }
}