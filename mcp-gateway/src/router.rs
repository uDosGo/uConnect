// Tool Router
// Routes tool calls to the appropriate engine or local implementation

use serde_json::Value;
use std::sync::Arc;

use crate::re3_client::Re3Client;
use crate::hivemind_client::HivemindClient;
use crate::vault;

#[derive(Clone)]
pub struct ToolRouter {
    re3: Arc<Re3Client>,
    hivemind: Arc<HivemindClient>,
}

impl ToolRouter {
    pub fn new(re3: Re3Client, hivemind: HivemindClient) -> Self {
        ToolRouter {
            re3: Arc::new(re3),
            hivemind: Arc::new(hivemind),
        }
    }

    pub async fn route(&self, tool_name: &str, args: &Value) -> Result<String, String> {
        match tool_name {
            // Reasoning tools → Re3Engine
            "chat" | "reason" | "plan" | "batch" => {
                self.re3.call(tool_name, args).await
            }
            // Orchestration tools → Hivemind
            "swarm" | "task_decompose" | "agent_coordinate" => {
                self.hivemind.call(tool_name, args).await
            }
            // Vault tools → direct filesystem
            "vault_read" => vault::read(args).await,
            "vault_write" => vault::write(args).await,
            "vault_list" => vault::list(args).await,
            "vault_search" => vault::search(args).await,
            "vault_delete" => vault::delete(args).await,
            "vault_metadata" => vault::metadata(args).await,
            // Dev tools (local implementation for now)
            "code_generate" => self.handle_code_generate(args).await,
            "test_run" => self.handle_test_run(args).await,
            _ => Err(format!("Unknown tool: {}", tool_name)),
        }
    }
}

impl ToolRouter {
    async fn handle_code_generate(&self, args: &Value) -> Result<String, String> {
        let prompt = args["prompt"].as_str().unwrap_or("");
        Ok(format!("Generated code for: {}", prompt))
    }

    async fn handle_test_run(&self, args: &Value) -> Result<String, String> {
        let test_name = args["test_name"].as_str().unwrap_or("");
        Ok(format!("Ran test: {}", test_name))
    }
}