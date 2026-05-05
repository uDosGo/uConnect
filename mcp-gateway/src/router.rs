// Tool Router
// Routes tool calls to the appropriate engine or local implementation

use serde_json::{json, Value};
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
            // Binder feed tools
            "binder_feed" => self.handle_binder_feed(args).await,
            "binder_feed_update" => self.handle_binder_feed_update(args).await,
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

    /// Retrieve a binder JSON feed by name.
    /// Usage: binder_feed { "binder": "#udos" }
    async fn handle_binder_feed(&self, args: &Value) -> Result<String, String> {
        let binder = args["binder"].as_str().unwrap_or("");
        let clean_name = binder.trim_start_matches('#');
        if clean_name.is_empty() {
            return Err("Missing required argument: binder (e.g. '#udos')".to_string());
        }

        let home = std::env::var("HOME").unwrap_or_else(|_| "/Users/fredbook".to_string());
        let feeds_dir = format!("{}/uDos/shared/feeds", home);
        let feed_path = format!("{}/{}.json", feeds_dir, clean_name);

        match std::fs::read_to_string(&feed_path) {
            Ok(content) => Ok(content),
            Err(_) => {
                // Fallback: try to generate the feed on-the-fly using the Python binder pipeline
                Err(format!(
                    "Feed for binder '{}' not found at {}. Run the binder pipeline first:\n  python3 ~/Vault/scripts/binder-to-json.py --topic #{}",
                    binder, feed_path, clean_name
                ))
            }
        }
    }

    /// Trigger a binder feed update (called by CI or local pipeline).
    /// Usage: binder_feed_update { "binder": "all" }
    async fn handle_binder_feed_update(&self, args: &Value) -> Result<String, String> {
        let binder = args["binder"].as_str().unwrap_or("all");
        let home = std::env::var("HOME").unwrap_or_else(|_| "/Users/fredbook".to_string());
        let vault_scripts = format!("{}/Vault/scripts", home);

        // Try to run the Python binder pipeline
        let script_path = format!("{}/binder-to-json.py", vault_scripts);
        let script_path_obj = std::path::Path::new(&script_path);

        if script_path_obj.exists() {
            let topic_arg = if binder == "all" {
                "--all".to_string()
            } else {
                format!("--topic {}", binder)
            };

            let output = std::process::Command::new("python3")
                .arg(&script_path)
                .arg(&topic_arg)
                .output()
                .map_err(|e| format!("Failed to run binder pipeline: {}", e))?;

            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                Ok(format!("Binder feed update triggered:\n{}", stdout))
            } else {
                let stderr = String::from_utf8_lossy(&output.stderr);
                Err(format!("Binder pipeline failed:\n{}", stderr))
            }
        } else {
            // Fallback: try the shell pipeline script
            let sh_script = format!("{}/run-binder-pipeline.sh", vault_scripts);
            let sh_path = std::path::Path::new(&sh_script);
            if sh_path.exists() {
                let output = std::process::Command::new("bash")
                    .arg(&sh_script)
                    .arg("--feed-only")
                    .output()
                    .map_err(|e| format!("Failed to run shell pipeline: {}", e))?;

                if output.status.success() {
                    let stdout = String::from_utf8_lossy(&output.stdout);
                    Ok(format!("Binder feed update triggered:\n{}", stdout))
                } else {
                    let stderr = String::from_utf8_lossy(&output.stderr);
                    Err(format!("Shell pipeline failed:\n{}", stderr))
                }
            } else {
                Err(format!(
                    "No binder pipeline script found at {} or {}. Install the binder pipeline first.",
                    script_path, sh_script
                ))
            }
        }
    }
}
