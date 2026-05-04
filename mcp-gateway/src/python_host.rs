// Python MCP Host
// Manages a Python MCP server subprocess via stdio
use tokio::process::{Command, Child};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use std::process::Stdio;
use serde_json::{json, Value};
use std::sync::Arc;
use tokio::sync::Mutex;
use log::{info, debug};

#[derive(Clone)]
pub struct PythonHost {
    inner: Arc<Mutex<PythonHostInner>>,
}

struct PythonHostInner {
    child: Option<Child>,
}

impl PythonHost {
    pub fn new() -> Self {
        PythonHost {
            inner: Arc::new(Mutex::new(PythonHostInner { child: None })),
        }
    }

    pub async fn ensure_started(&self) -> Result<(), String> {
        let mut inner = self.inner.lock().await;
        if inner.child.is_some() {
            return Ok(());
        }

        info!("Starting Python MCP server sidecar...");
        
        let child = Command::new("python3")
            .arg("-m")
            .arg("mcp_server")
            .current_dir("/Users/fredbook/Code/OkAgentDigital")
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|e| format!("Failed to spawn Python MCP server: {}", e))?;

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
            "id": 1
        });

        let req_str = format!("{}\n", serde_json::to_string(&request).unwrap());
        debug!("Sending to Python: {}", req_str.trim());
        
        stdin.write_all(req_str.as_bytes()).await.map_err(|e| e.to_string())?;
        stdin.flush().await.map_err(|e| e.to_string())?;

        let mut response = String::new();
        reader.read_line(&mut response).await.map_err(|e| e.to_string())?;
        debug!("Received from Python: {}", response.trim());

        let resp_json: Value = serde_json::from_str(&response).map_err(|e| e.to_string())?;
        
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
            "id": "list"
        });

        let req_str = format!("{}\n", serde_json::to_string(&request).unwrap());
        stdin.write_all(req_str.as_bytes()).await.map_err(|e| e.to_string())?;
        stdin.flush().await.map_err(|e| e.to_string())?;

        let mut response = String::new();
        reader.read_line(&mut response).await.map_err(|e| e.to_string())?;
        
        let resp_json: Value = serde_json::from_str(&response).map_err(|e| e.to_string())?;
        
        if let Some(result) = resp_json.get("result").and_then(|r| r.get("tools")) {
            Ok(result.as_array().unwrap_or(&vec![]).clone())
        } else {
            Ok(vec![])
        }
    }
}
