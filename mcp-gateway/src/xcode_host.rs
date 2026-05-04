// Xcode MCP Host
// Manages the Xcode MCP bridge (xcrun mcpbridge) via stdio
use tokio::process::{Command, Child};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use std::process::Stdio;
use serde_json::{json, Value};
use std::sync::Arc;
use tokio::sync::Mutex;
use log::{info, debug, warn};

#[derive(Clone)]
pub struct XcodeHost {
    inner: Arc<Mutex<XcodeHostInner>>,
}

struct XcodeHostInner {
    child: Option<Child>,
}

impl XcodeHost {
    pub fn new() -> Self {
        XcodeHost {
            inner: Arc::new(Mutex::new(XcodeHostInner { child: None })),
        }
    }

    pub async fn ensure_started(&self) -> Result<(), String> {
        let mut inner = self.inner.lock().await;
        if inner.child.is_some() {
            // Check if it's still running
            if let Ok(None) = inner.child.as_mut().unwrap().try_wait() {
                return Ok(());
            } else {
                info!("Xcode MCP bridge stopped, restarting...");
                inner.child = None;
            }
        }

        info!("Starting Xcode MCP bridge (xcrun mcpbridge)...");
        
        let child = Command::new("xcrun")
            .arg("mcpbridge")
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|e| format!("Failed to spawn Xcode MCP bridge: {}", e))?;

        inner.child = Some(child);
        Ok(())
    }

    pub async fn call(&self, tool: &str, args: &Value) -> Result<String, String> {
        self.ensure_started().await?;
        
        let mut inner = self.inner.lock().await;
        let child = inner.child.as_mut().unwrap();
        
        let stdin = child.stdin.as_mut().ok_or("Failed to open stdin")?;
        let stdout = child.stdout.as_mut().ok_or("Failed to open stdout")?;
        let mut reader = BufReader::new(stdout);

        let request = json!({
            "jsonrpc": "2.0",
            "method": "tools/call",
            "params": {
                "name": tool,
                "arguments": args
            },
            "id": format!("xcode-{}", chrono::Utc::now().timestamp_millis())
        });

        let req_str = format!("{}\n", serde_json::to_string(&request).unwrap());
        debug!("Sending to Xcode bridge: {}", req_str.trim());
        
        stdin.write_all(req_str.as_bytes()).await.map_err(|e| e.to_string())?;
        stdin.flush().await.map_err(|e| e.to_string())?;

        let mut response = String::new();
        reader.read_line(&mut response).await.map_err(|e| e.to_string())?;
        debug!("Received from Xcode bridge: {}", response.trim());

        if response.is_empty() {
             return Err("Empty response from Xcode bridge (is Xcode running?)".to_string());
        }

        let resp_json: Value = serde_json::from_str(&response).map_err(|e| format!("Invalid JSON from Xcode: {} (response: {})", e, response))?;
        
        if let Some(result) = resp_json.get("result") {
            Ok(result.to_string())
        } else if let Some(error) = resp_json.get("error") {
            Err(error.to_string())
        } else {
            Ok(resp_json.to_string())
        }
    }

    pub async fn list_tools(&self) -> Result<Vec<Value>, String> {
        self.ensure_started().await?;
        
        let mut inner = self.inner.lock().await;
        let child = inner.child.as_mut().unwrap();
        
        let stdin = child.stdin.as_mut().ok_or("Failed to open stdin")?;
        let stdout = child.stdout.as_mut().ok_or("Failed to open stdout")?;
        let mut reader = BufReader::new(stdout);

        let request = json!({
            "jsonrpc": "2.0",
            "method": "tools/list",
            "params": {},
            "id": "list-xcode"
        });

        let req_str = format!("{}\n", serde_json::to_string(&request).unwrap());
        stdin.write_all(req_str.as_bytes()).await.map_err(|e| e.to_string())?;
        stdin.flush().await.map_err(|e| e.to_string())?;

        let mut response = String::new();
        reader.read_line(&mut response).await.map_err(|e| e.to_string())?;
        
        if response.is_empty() {
            return Ok(vec![]);
        }

        let resp_json: Value = serde_json::from_str(&response).map_err(|e| format!("Invalid JSON from Xcode: {} (response: {})", e, response))?;
        
        if let Some(result) = resp_json.get("result").and_then(|r| r.get("tools")) {
            Ok(result.as_array().unwrap_or(&vec![]).clone())
        } else {
            Ok(vec![])
        }
    }
}
