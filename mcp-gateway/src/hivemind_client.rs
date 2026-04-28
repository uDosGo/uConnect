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

    pub async fn call(&self, tool: &str, args: &Value) -> Result<String, String> {
        let url = format!("{}/mcp", self.endpoint);
        
        let request = json!({
            "jsonrpc": "2.0",
            "method": "tools/call",
            "params": {
                "name": tool,
                "arguments": args
            },
            "id": 1
        });
        
        match self.client
            .post(&url)
            .json(&request)
            .send()
            .await {
                Ok(resp) => {
                    match resp.json::<Value>().await {
                        Ok(json) => {
                            if let Some(result) = json.get("result") {
                                Ok(result.to_string())
                            } else if let Some(error) = json.get("error") {
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