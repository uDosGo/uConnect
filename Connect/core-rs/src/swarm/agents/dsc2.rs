// core-rs/src/swarm/agents/dsc2.rs
// DSC2 Agent - Code generation and intelligence

use crate::swarm::agent::{Agent, AgentType, Task, TaskType, AgentOutput, AgentContext};
use std::error::Error;
use std::process::Command;
use std::sync::Arc;

/// DSC2 Agent for code generation tasks
#[derive(Debug)]
pub struct DSC2Agent {
    // Could be extended with configuration
}

impl DSC2Agent {
    pub fn new() -> Self {
        Self {}
    }
    
    /// Execute a udo code command and capture output
    fn execute_udo_command(&self, args: &[&str], context: &AgentContext) -> Result<String, Box<dyn Error>> {
        let mut cmd = Command::new("node");
        
        // Use the udo.mjs from the project root
        let udo_path = if cfg!(debug_assertions) {
            // Development: use core/bin/udo.mjs
            format!("{}/core/bin/udo.mjs", context.project_root)
        } else {
            // Production: use core/dist/cli.js
            format!("{}/core/dist/cli.js", context.project_root)
        };
        
        cmd.arg(udo_path)
           .arg("code")
           .args(args)
           .current_dir(&context.project_root);
        
        let output = cmd.output()?;
        
        if !output.status.success() {
            let error_msg = String::from_utf8_lossy(&output.stderr);
            return Err(format!("Command failed: {}", error_msg).into());
        }
        
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }
}

impl Agent for DSC2Agent {
    fn name(&self) -> &str {
        "dsc2"
    }

    fn capabilities(&self) -> Vec<&str> {
        vec![
            "generate",
            "code",
            "function",
            "class",
            "algorithm",
            "complete",
            "insert",
            "explain",
            "refactor",
            "document",
        ]
    }

    fn execute(
        &self,
        task: &Task,
        context: &AgentContext,
    ) -> Result<AgentOutput, Box<dyn Error>> {
        match task.task_type {
            TaskType::Generate => self.execute_generate(task, context),
            TaskType::Complete => self.execute_complete(task, context),
            TaskType::Insert => self.execute_insert(task, context),
            TaskType::Explain => self.execute_explain(task, context),
            TaskType::Refactor => self.execute_refactor(task, context),
            _ => Err(format!("Unsupported task type: {:?}", task.task_type).into()),
        }
    }

    fn cost_estimate(&self, task: &Task) -> f64 {
        // Estimate based on task complexity
        match task.task_type {
            TaskType::Generate | TaskType::Refactor => 0.0002, // ~$0.0002 per task
            TaskType::Complete | TaskType::Insert => 0.0001,
            TaskType::Explain => 0.00005,
            _ => 0.0001,
        }
    }
}

impl DSC2Agent {
    fn execute_generate(&self, task: &Task, context: &AgentContext) -> Result<AgentOutput, Box<dyn Error>> {
        let prompt = task.description.as_str();
        
        let result = self.execute_udo_command(&["generate", prompt], context)?;
        
        Ok(AgentOutput {
            task_id: task.id,
            success: true,
            result: Some(serde_json::json!({
                "code": result,
                "language": "detected",
                "task": "generate"
            })),
            error: None,
            tokens_used: 100, // Estimate
            cost: 0.0002,
            metadata: serde_json::json!({}),
        })
    }
    
    fn execute_complete(&self, task: &Task, context: &AgentContext) -> Result<AgentOutput, Box<dyn Error>> {
        // Extract prefix from context or task
        let prefix = context.current_file.as_deref().unwrap_or("");
        
        let result = self.execute_udo_command(&["complete", "--prefix", prefix], context)?;
        
        Ok(AgentOutput {
            task_id: task.id,
            success: true,
            result: Some(serde_json::json!({
                "completed_code": result,
                "original_prefix": prefix,
                "task": "complete"
            })),
            error: None,
            tokens_used: 50,
            cost: 0.0001,
            metadata: serde_json::json!({}),
        })
    }
    
    fn execute_insert(&self, task: &Task, context: &AgentContext) -> Result<AgentOutput, Box<dyn Error>> {
        // Would need prefix and suffix from task context
        let result = self.execute_udo_command(&["insert"], context)?;
        
        Ok(AgentOutput {
            task_id: task.id,
            success: true,
            result: Some(serde_json::json!({
                "inserted_code": result,
                "task": "insert"
            })),
            error: None,
            tokens_used: 60,
            cost: 0.0001,
            metadata: serde_json::json!({}),
        })
    }
    
    fn execute_explain(&self, task: &Task, context: &AgentContext) -> Result<AgentOutput, Box<dyn Error>> {
        let file = context.current_file.as_deref().ok_or("No file specified")?;
        
        let result = self.execute_udo_command(&["explain", file], context)?;
        
        Ok(AgentOutput {
            task_id: task.id,
            success: true,
            result: Some(serde_json::json!({
                "explanation": result,
                "file": file,
                "task": "explain"
            })),
            error: None,
            tokens_used: 80,
            cost: 0.00005,
            metadata: serde_json::json!({}),
        })
    }
    
    fn execute_refactor(&self, task: &Task, context: &AgentContext) -> Result<AgentOutput, Box<dyn Error>> {
        let file = context.current_file.as_deref().ok_or("No file specified")?;
        
        let result = self.execute_udo_command(&["refactor", file], context)?;
        
        Ok(AgentOutput {
            task_id: task.id,
            success: true,
            result: Some(serde_json::json!({
                "refactored_code": result,
                "file": file,
                "task": "refactor"
            })),
            error: None,
            tokens_used: 120,
            cost: 0.0002,
            metadata: serde_json::json!({}),
        })
    }
}

/// Factory function for creating DSC2 agent
pub fn create_dsc2_agent() -> Arc<dyn Agent> {
    Arc::new(DSC2Agent::new())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::swarm::agent::{Task, TaskType};
    use uuid::Uuid;

    #[test]
    fn test_dsc2_agent_creation() {
        let agent = DSC2Agent::new();
        assert_eq!(agent.name(), "dsc2");
        assert!(agent.capabilities().contains(&"generate"));
    }

    #[test]
    fn test_capability_matching() {
        let agent = DSC2Agent::new();
        assert!(agent.can_handle(&TaskType::Generate));
        assert!(agent.can_handle(&TaskType::Complete));
        assert!(agent.can_handle(&TaskType::Explain));
        assert!(!agent.can_handle(&TaskType::FileCreate));
    }

    #[test]
    fn test_cost_estimation() {
        let agent = DSC2Agent::new();
        let task = Task {
            id: Uuid::new_v4(),
            task_type: TaskType::Generate,
            description: "Test".to_string(),
            context: None,
            priority: 1,
        };
        
        let cost = agent.cost_estimate(&task);
        assert!(cost > 0.0);
    }
}