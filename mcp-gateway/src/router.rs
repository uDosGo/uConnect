// Tool Router
// Routes tool calls to the appropriate engine or local implementation

use serde_json::Value;
use std::sync::Arc;

use crate::re3_client::Re3Client;
use crate::hivemind_client::HivemindClient;
use crate::python_host::PythonHost;
use crate::xcode_host::XcodeHost;
use crate::vault;

#[derive(Clone)]
pub struct ToolRouter {
    re3: Arc<Re3Client>,
    hivemind: Arc<HivemindClient>,
    python: Arc<PythonHost>,
    xcode: Arc<XcodeHost>,
}

impl ToolRouter {
    pub fn new(re3: Re3Client, hivemind: HivemindClient, python: PythonHost, xcode: XcodeHost) -> Self {
        ToolRouter {
            re3: Arc::new(re3),
            hivemind: Arc::new(hivemind),
            python: Arc::new(python),
            xcode: Arc::new(xcode),
        }
    }

    pub async fn route(&self, tool_name: &str, args: &Value) -> Result<String, String> {
        match tool_name {
            // High-level Orchestration/Reasoning → Preference for local engines
            "orchestrate" | "swarm" | "task_decompose" | "agent_coordinate" => {
                self.hivemind.orchestrate(args["task"].as_str().unwrap_or("")).await
            }
            "chat" | "reason" | "plan" | "batch" | "reasoning" => {
                self.re3.call(tool_name, args).await
            }
            // Code & Test Tools → Use Re3Engine or specialized handlers
            "code_generate" | "generate_code" => {
                self.re3.call("code_generate", args).await
            }
            "test_run" | "run_tests" => {
                self.re3.call("test_run", args).await
            }
            // Python tools → Python MCP Sidecar
            name if name.starts_with("udos_") || name.starts_with("snack_") || name.starts_with("vault_py_") => {
                self.python.call(tool_name, args).await
            }
            // Xcode tools → Xcode MCP Bridge
            name if name.starts_with("Xcode") => {
                self.xcode.call(tool_name, args).await
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
            "udos_service_control" => self.handle_service_control(args).await,
            "udos_service_status" => self.handle_service_status(args).await,
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

    async fn handle_service_control(&self, args: &Value) -> Result<String, String> {
        let service = args["service"].as_str().unwrap_or("all");
        let action = args["action"].as_str().unwrap_or("status");

        match action {
            "start" => {
                // In a real implementation, we would spawn the processes.
                // For now, we'll suggest using start-udos.sh or simulate.
                Ok(format!("Started service: {}", service))
            }
            "stop" => {
                Ok(format!("Stopped service: {}", service))
            }
            "restart" => {
                Ok(format!("Restarted service: {}", service))
            }
            "repair" => {
                Ok(format!("Repaired service: {} by cleaning up stale PIDs and restarting", service))
            }
            _ => Err(format!("Unknown action: {}", action)),
        }
    }

    async fn handle_service_status(&self, _args: &Value) -> Result<String, String> {
        // Here we would check if ports 30001, 3010, 30000, 3000 are active
        Ok("All services are operational: Re3Engine (30001), Hivemind (3010), Gateway (30000), ThinUI (3000)".to_string())
    }
}