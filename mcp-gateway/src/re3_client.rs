// Re3Engine Client
// Forwards calls to the Python Re3Engine

use reqwest::Client;
use serde_json::Value;

#[derive(Clone)]
pub struct Re3Client {
    endpoint: String,
    client: Client,
}

impl Re3Client {
    pub fn new(endpoint: &str) -> Self {
        Re3Client {
            endpoint: endpoint.to_string(),
            client: Client::new(),
        }
    }

    pub async fn call(&self, tool: &str, args: &Value) -> Result<String, String> {
        let url = format!("{}/{}", self.endpoint, tool);
        
        match self.client
            .post(&url)
            .json(args)
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
                Err(e) => Err(format!("Re3Engine request failed: {}", e)),
            }
    }
}