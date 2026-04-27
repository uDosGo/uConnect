use tauri::Manager;
use serde_json;
use chrono;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                // Development mode: load from external URL
                if let Some(window) = app.get_window("main") {
                    window.eval("window.location.href = 'http://localhost:1420'")?;
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_thinui_info,
            set_window_title,
            connect_to_mcp,
            mcp_call
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn get_thinui_info() -> Result<String, String> {
    Ok(env!("CARGO_PKG_VERSION").to_string())
}

#[tauri::command]
async fn set_window_title(window: tauri::Window, title: String) -> Result<(), String> {
    window.set_title(&title)
        .map_err(|e| e.to_string())
}

/// Global MCP socket connection state
struct McpConnection {
    socket_path: String,
    connected: bool,
}

impl McpConnection {
    fn new(socket_path: &str) -> Self {
        Self {
            socket_path: socket_path.to_string(),
            connected: false,
        }
    }
    
    /// Expand tilde in path (e.g., ~/Code/Vault/.uds/mcp.sock)
    fn expand_path(&self) -> String {
        if self.socket_path.starts_with("~") {
            let home = std::env::var("HOME").unwrap_or_else(|_| "/".to_string());
            self.socket_path.replacen("~", &home, 1)
        } else {
            self.socket_path.clone()
        }
    }
    
    /// Check if socket file exists
    fn socket_exists(&self) -> bool {
        let expanded_path = self.expand_path();
        std::path::Path::new(&expanded_path).exists()
    }
    
    /// Test connection to MCP socket
    async fn test_connection(&mut self) -> Result<bool, String> {
        use tokio::io::AsyncWriteExt;
        
        let socket_path = self.expand_path();
        
        // Simple ping test
        let ping_message = serde_json::json!({"Ping": null});
        
        match tokio::net::UnixStream::connect(&socket_path).await {
            Ok(mut stream) => {
                // Send ping
                let message_str = ping_message.to_string();
                if let Err(e) = stream.write_all(message_str.as_bytes()).await {
                    return Err(format!("Failed to write to socket: {}", e));
                }
                
                // Read response (simple implementation)
                let mut buffer = [0; 1024];
                match stream.read(&mut buffer).await {
                    Ok(n) if n > 0 => {
                        let response = String::from_utf8_lossy(&buffer[..n]);
                        if response.contains("pong") || response.contains("Success") {
                            self.connected = true;
                            Ok(true)
                        } else {
                            Err(format!("Unexpected response: {}", response))
                        }
                    }
                    Ok(_) => Err("No response from socket".to_string()),
                    Err(e) => Err(format!("Failed to read from socket: {}", e)),
                }
            }
            Err(e) => {
                self.connected = false;
                Err(format!("Failed to connect to socket {}: {}", socket_path, e))
            }
        }
    }
}

#[tauri::command]
async fn connect_to_mcp(path: String) -> Result<bool, String> {
    // In development, we'll just return true since we're using mock mode
    #[cfg(debug_assertions)]
    {
        println!("MCP: Development mode - mock connection to {}", path);
        Ok(true)
    }
    
    #[cfg(not(debug_assertions))]
    {
        // Production implementation with real socket connection
        let mut connection = McpConnection::new(&path);
        
        // Check if socket exists
        if !connection.socket_exists() {
            println!("MCP: Socket file not found at {}", path);
            return Ok(false);
        }
        
        // Test the connection
        match connection.test_connection().await {
            Ok(success) => {
                println!("MCP: Successfully connected to {}", path);
                Ok(success)
            }
            Err(e) => {
                println!("MCP: Connection failed: {}", e);
                Ok(false)
            }
        }
    }
}

#[tauri::command]
async fn mcp_call(method: String, params: serde_json::Value) -> Result<serde_json::Value, String> {
    // In development, return mock responses
    #[cfg(debug_assertions)]
    {
        println!("MCP Call: {} with params: {:?}", method, params);
        
        // Simple mock responses for development
        match method.as_str() {
            "ping" => Ok(serde_json::json!({ "result": "pong" })),
            "get_core_status" => Ok(serde_json::json!({
                "status": "connected",
                "version": "0.1.0",
                "timestamp": chrono::Utc::now().to_rfc3339()
            })),
            "get_dashboard_data" => Ok(serde_json::json!({
                "vault_items": 42,
                "feeds": 5,
                "agents": 3,
                "recent_activity": [
                    "Core system initialized",
                    "Vault module loaded",
                    "Feed processor started",
                    "Agent system online",
                    "Dashboard ready"
                ]
            })),
            "feed_recent" => Ok(serde_json::json!({
                "result": [],
                "limit": params.get("limit").unwrap_or(&serde_json::json!(50))
            })),
            "feed_search" => Ok(serde_json::json!({
                "result": [],
                "tag": params.get("tag").unwrap_or(&serde_json::json!("")),
                "limit": params.get("limit").unwrap_or(&serde_json::json!(50))
            })),
            _ => {
                println!("MCP: Unknown method {}", method);
                Ok(serde_json::json!({ "error": "unknown_method" }))
            }
        }
    }
    
    #[cfg(not(debug_assertions))]
    {
        // Production implementation with real socket communication
        let socket_path = std::env::var("UDS_SOCKET_PATH")
            .unwrap_or_else(|_| "~/Code/Vault/.uds/mcp.sock".to_string());
        
        let mut connection = McpConnection::new(&socket_path);
        
        // Expand the path
        let expanded_path = connection.expand_path();
        
        // Check if socket exists
        if !connection.socket_exists() {
            return Err(format!("MCP socket not found at {}", expanded_path));
        }
        
        // Build the MCP request
        let request = serde_json::json!({
            method: method,
            params: params
        });
        
        // Connect and send the request
        match tokio::net::UnixStream::connect(&expanded_path).await {
            Ok(mut stream) => {
                use tokio::io::{AsyncWriteExt, AsyncReadExt};
                
                // Send the request
                let request_str = request.to_string();
                if let Err(e) = stream.write_all(request_str.as_bytes()).await {
                    return Err(format!("Failed to write to MCP socket: {}", e));
                }
                
                // Read the response
                let mut buffer = [0; 4096];
                match stream.read(&mut buffer).await {
                    Ok(n) if n > 0 => {
                        let response_str = String::from_utf8_lossy(&buffer[..n]);
                        
                        // Parse the JSON response
                        match serde_json::from_str(&response_str) {
                            Ok(response) => Ok(response),
                            Err(e) => Err(format!("Failed to parse MCP response: {}", e)),
                        }
                    }
                    Ok(_) => Err("No response from MCP server".to_string()),
                    Err(e) => Err(format!("Failed to read from MCP socket: {}", e)),
                }
            }
            Err(e) => Err(format!("Failed to connect to MCP socket at {}: {}", expanded_path, e)),
        }
    }
}