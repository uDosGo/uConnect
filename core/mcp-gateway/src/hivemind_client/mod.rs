// Hivemind client - forwards to Hivemind orchestrator

use reqwest::Client;
use serde_json::{json, Value};

#[derive(Clone)]
pub struct HivemindClient {
    endpoint: String,
    client: Client,
}

impl HivemindClient {
    pub fn new(endpoint: &str) -> Self {
        Self {
            endpoint: endpoint.to_string(),
            client: Client::new(),
        }
    }
    
    pub async fn call(&self, tool: &str, args: &Value) -> Result<String, String> {
        let url = format!("{}/mcp", self.endpoint);
        
        let response = self.client
            .post(&url)
            .json(&json!({
                "method": "tools/call",
                "params": {
                    "name": tool,
                    "arguments": args
                }
            }))
            .send()
            .await
            .map_err(|e| format!("Failed to connect to Hivemind: {}", e))?;
        
        if !response.status().is_success() {
            return Err(format!("Hivemind returned status: {}", response.status()));
        }
        
        let body = response
            .json::<Value>()
            .await
            .map_err(|e| format!("Failed to parse Hivemind response: {}", e))?;
        
        body.get("result")
            .and_then(|r| r.get("content"))
            .and_then(|c| c.get(0))
            .and_then(|item| item.get("text"))
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .ok_or_else(|| "Invalid response from Hivemind".to_string())
    }
}
