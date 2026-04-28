// Re3Engine client - forwards to Python Re3Engine

use reqwest::Client;
use serde_json::Value;

#[derive(Clone)]
pub struct Re3Client {
    endpoint: String,
    client: Client,
}

impl Re3Client {
    pub fn new(endpoint: &str) -> Self {
        Self {
            endpoint: endpoint.to_string(),
            client: Client::new(),
        }
    }
    
    pub async fn call(&self, tool: &str, args: &Value) -> Result<String, String> {
        let url = format!("{}/{}", self.endpoint, tool);
        
        let response = self.client
            .post(&url)
            .json(args)
            .send()
            .await
            .map_err(|e| format!("Failed to connect to Re3Engine: {}", e))?;
        
        if !response.status().is_success() {
            return Err(format!("Re3Engine returned status: {}", response.status()));
        }
        
        let body = response
            .json::<Value>()
            .await
            .map_err(|e| format!("Failed to parse Re3Engine response: {}", e))?;
        
        body.get("response")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .ok_or_else(|| "Invalid response from Re3Engine".to_string())
    }
}
