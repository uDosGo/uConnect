// Hivemind Client
// Forwards calls to the Hivemind orchestrator

use reqwest::Client;
use serde_json::{Value, json};

#[derive(Clone)]
pub struct HivemindClient {
    endpoint: String,
    client: Client,
}

impl HivemindClient {
    pub fn new(endpoint: &str) -> Self {
        HivemindClient {
            endpoint: endpoint.to_string(),
            client: Client::new(),
        }
    }

    pub async fn orchestrate(&self, task: &str) -> Result<String, String> {
        let url = format!("{}/mcp", self.endpoint);
        let request = json!({
            "Orchestrate": {
                "task": task
            }
        });

        match self.client
            .post(&url)
            .json(&request)
            .send()
            .await {
                Ok(resp) => {
                    match resp.json::<Value>().await {
                        Ok(json) => {
                            if let Some(success) = json.get("Success") {
                                if let Some(data) = success.get("data") {
                                    if data.is_string() {
                                        Ok(data.as_str().unwrap().to_string())
                                    } else {
                                        Ok(data.to_string())
                                    }
                                } else {
                                    Ok(success.to_string())
                                }
                            } else if let Some(error) = json.get("Error") {
                                Err(error.get("message").and_then(|m| m.as_str()).unwrap_or("Unknown error").to_string())
                            } else {
                                Ok(json.to_string())
                            }
                        }
                        Err(e) => Err(format!("Failed to parse response: {}", e)),
                    }
                }
                Err(e) => Err(format!("Hivemind request failed: {}", e)),
            }
    }

    pub async fn call(&self, _tool: &str, args: &Value) -> Result<String, String> {
        // Hivemind also supports direct tool calls via TaskTool method in its server.rs
        let url = format!("{}/mcp", self.endpoint);
        let request = json!({
            "TaskTool": args
        });
        // Note: The Hivemind server expects {"TaskTool": params} where params is the Tool enum
        // This might need adjustment based on the actual TaskTool enum structure
        
        match self.client
            .post(&url)
            .json(&request)
            .send()
            .await {
                Ok(resp) => {
                    match resp.json::<Value>().await {
                        Ok(json) => {
                            if let Some(success) = json.get("Success") {
                                Ok(success.to_string())
                            } else if let Some(error) = json.get("Error") {
                                Err(error.to_string())
                            } else {
                                Ok(json.to_string())
                            }
                        }
                        Err(e) => Err(format!("Failed to parse response: {}", e)),
                    }
                }
                Err(e) => Err(format!("Hivemind request failed: {}", e)),
            }
    }
}