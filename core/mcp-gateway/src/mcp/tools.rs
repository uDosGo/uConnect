// MCP Tool definitions

use serde_json::json;

#[derive(Debug, Clone, serde::Serialize)]
pub struct Tool {
    pub name: String,
    pub description: String,
    pub input_schema: serde_json::Value,
}

pub fn list_tools() -> Vec<Tool> {
    vec![
        // Reasoning tools (forward to Re3Engine)
        Tool {
            name: "chat".to_string(),
            description: "Send a message to the reasoning engine".to_string(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "message": { "type": "string" }
                },
                "required": ["message"]
            }),
        },
        Tool {
            name: "reason".to_string(),
            description: "Perform reasoning on a task".to_string(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "task": { "type": "string" },
                    "context": { "type": "string" }
                },
                "required": ["task"]
            }),
        },
        Tool {
            name: "plan".to_string(),
            description: "Create a step-by-step plan".to_string(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "goal": { "type": "string" }
                },
                "required": ["goal"]
            }),
        },
        Tool {
            name: "batch".to_string(),
            description: "Process multiple tasks in batch".to_string(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "tasks": { "type": "array" }
                },
                "required": ["tasks"]
            }),
        },
        
        // Orchestration tools (forward to Hivemind)
        Tool {
            name: "swarm".to_string(),
            description: "Coordinate multiple agents for a task".to_string(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "task": { "type": "string" },
                    "agents": { "type": "array" }
                },
                "required": ["task"]
            }),
        },
        Tool {
            name: "task_decompose".to_string(),
            description: "Decompose a complex task into subtasks".to_string(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "task": { "type": "string" }
                },
                "required": ["task"]
            }),
        },
        Tool {
            name: "agent_coordinate".to_string(),
            description: "Coordinate between multiple agents".to_string(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "agents": { "type": "array" },
                    "goal": { "type": "string" }
                },
                "required": ["agents", "goal"]
            }),
        },
        
        // Vault tools (direct Rust implementation)
        Tool {
            name: "vault_read".to_string(),
            description: "Read a file from the vault".to_string(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Path relative to vault root"
                    }
                },
                "required": ["path"]
            }),
        },
        Tool {
            name: "vault_write".to_string(),
            description: "Write content to a file in the vault".to_string(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "path": { "type": "string" },
                    "content": { "type": "string" }
                },
                "required": ["path", "content"]
            }),
        },
        Tool {
            name: "vault_list".to_string(),
            description: "List directory contents".to_string(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Directory path, empty for root"
                    }
                }
            }),
        },
        Tool {
            name: "vault_search".to_string(),
            description: "Search by keyword or tag".to_string(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "query": { "type": "string" },
                    "path": { "type": "string" }
                },
                "required": ["query"]
            }),
        },
        Tool {
            name: "vault_delete".to_string(),
            description: "Move file to trash".to_string(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "path": { "type": "string" }
                },
                "required": ["path"]
            }),
        },
        Tool {
            name: "vault_metadata".to_string(),
            description: "Get file info (size, modified, tags)".to_string(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "path": { "type": "string" }
                },
                "required": ["path"]
            }),
        },
        
        // Development tools
        Tool {
            name: "code_generate".to_string(),
            description: "Generate code from specification".to_string(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "spec": { "type": "string" },
                    "language": { "type": "string" }
                },
                "required": ["spec"]
            }),
        },
        Tool {
            name: "test_run".to_string(),
            description: "Run tests for a module".to_string(),
            input_schema: json!({
                "type": "object",
                "properties": {
                    "module": { "type": "string" }
                },
                "required": ["module"]
            }),
        },
    ]
}
