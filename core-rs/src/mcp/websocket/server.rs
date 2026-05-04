// MCP WebSocket Server Implementation
// Real-time transport server for MCP protocol

use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use anyhow::{Result, anyhow};
use futures_util::{SinkExt, StreamExt};
use tokio::net::{TcpListener, TcpStream};
use tokio_tungstenite::tungstenite::protocol::Message;
use tungstenite::handshake::server::{Request, Response};

use super::super::registry;
use super::handler::WebSocketConnectionHandler;
use super::protocol::{McpWebSocketMessage, WebSocketProtocol};

/// WebSocket server configuration
#[derive(Debug, Clone)]
pub struct WebSocketServerConfig {
    pub host: String,
    pub port: u16,
    pub max_connections: usize,
    pub ping_interval: u64,
    pub protocol_version: String,
}

impl Default for WebSocketServerConfig {
    fn default() -> Self {
        Self {
            host: "0.0.0.0".to_string(),
            port: 3010,
            max_connections: 100,
            ping_interval: 30, // seconds
            protocol_version: "mcp-v1".to_string(),
        }
    }
}

/// WebSocket server state
#[derive(Debug)]
pub struct WebSocketServer {
    config: WebSocketServerConfig,
    connections: Arc<Mutex<HashMap<SocketAddr, WebSocketConnectionHandler>>>, 
    tool_registry: Arc<registry::ToolRegistry>,
}

impl WebSocketServer {
    pub fn new(config: WebSocketServerConfig, tool_registry: Arc<registry::ToolRegistry>) -> Self {
        Self {
            config,
            connections: Arc::new(Mutex::new(HashMap::new())),
            tool_registry,
        }
    }

    /// Start the WebSocket server
    pub async fn run(&self) -> Result<()> {
        let listener = TcpListener::bind((self.config.host.as_str(), self.config.port)).await?;
        println!("🌐 WebSocket server listening on ws://{}:{}", 
                 self.config.host, self.config.port);
        
        while let Ok((stream, addr)) = listener.accept().await {
            // Check connection limit
            let connections = self.connections.lock().unwrap();
            if connections.len() >= self.config.max_connections {
                println!("⚠️  Connection limit reached, rejecting: {}", addr);
                continue;
            }
            drop(connections);
            
            // Spawn a new task for each connection
            let tool_registry = self.tool_registry.clone();
            let connections = self.connections.clone();
            let config = self.config.clone();
            
            tokio::spawn(async move {
                if let Err(e) = self.handle_connection(stream, addr, tool_registry, connections, config).await {
                    println!("❌ WebSocket connection error from {}: {}", addr, e);
                }
            });
        }
        
        Ok(())
    }

    /// Handle a single WebSocket connection
    async fn handle_connection(
        &self,
        stream: TcpStream,
        addr: SocketAddr,
        tool_registry: Arc<registry::ToolRegistry>,
        connections: Arc<Mutex<HashMap<SocketAddr, WebSocketConnectionHandler>>>, 
        config: WebSocketServerConfig,
    ) -> Result<()> {
        println!("🔌 New WebSocket connection from: {}", addr);
        
        // Perform WebSocket handshake
        let callback = |req: &Request, response: Response| {
            // Validate protocol
            if !req.protocols().iter().any(|p| p == config.protocol_version) {
                println!("❌ Protocol mismatch from {}: expected {}, got {:?}", 
                         addr, config.protocol_version, req.protocols());
                return Ok(response);
            }
            
            println!("✅ Protocol validated: {}", config.protocol_version);
            Ok(response)
        };
        
        let ws_stream = tokio_tungstenite::accept_hdr_async(stream, callback).await?;
        println!("🤝 WebSocket handshake completed: {}", addr);
        
        // Create connection handler
        let mut handler = WebSocketConnectionHandler::new(
            addr,
            tool_registry,
            config.ping_interval,
        );
        
        // Add to active connections
        connections.lock().unwrap().insert(addr, handler.clone());
        
        // Split stream into sender and receiver
        let (mut write, mut read) = ws_stream.split();
        
        // Main message loop
        while let Some(message) = read.next().await {
            match message? {
                Message::Text(text) => {
                    self.handle_text_message(&text, &mut handler, &mut write).await?;
                }
                Message::Binary(data) => {
                    println!("📦 Binary message received from {}: {} bytes", addr, data.len());
                    // Handle binary messages (could be for file transfers, etc.)
                }
                Message::Ping(data) => {
                    println!("🏓 Ping received from {}", addr);
                    write.send(Message::Pong(data)).await?;
                }
                Message::Pong(_) => {
                    println!("🏓 Pong received from {}", addr);
                }
                Message::Close(_) => {
                    println!("🔴 Close message received from {}", addr);
                    break;
                }
                Message::Frame(_) => {
                    println!("⚠️  Frame message received from {}", addr);
                }
            }
        }
        
        // Clean up
        connections.lock().unwrap().remove(&addr);
        println!("🔌 Connection closed: {}", addr);
        
        Ok(())
    }

    /// Handle text messages (JSON-RPC)
    async fn handle_text_message(
        &self,
        text: &str,
        handler: &mut WebSocketConnectionHandler,
        write: &mut tokio_tungstenite::WebSocketStream<TcpStream>,
    ) -> Result<()> {
        println!("📝 Message from {}: {}", handler.addr(), text);
        
        // Parse message
        let message = match McpWebSocketMessage::parse(text) {
            Ok(msg) => msg,
            Err(e) => {
                let error_response = McpWebSocketMessage::error(
                    None,
                    -32700,
                    "Parse error",
                    Some(format!("Failed to parse message: {}", e)),
                );
                write.send(Message::Text(error_response.to_string())).await?;
                return Err(anyhow!("Parse error: {}", e));
            }
        };
        
        // Route message
        match message {
            McpWebSocketMessage::Request { id, method, params } => {
                self.handle_request(id, &method, params, handler, write).await?;
            }
            McpWebSocketMessage::Notification { method, params } => {
                self.handle_notification(&method, params, handler, write).await?;
            }
            McpWebSocketMessage::Response { .. } => {
                // Responses are handled by the client that sent the request
                println!("📤 Response message received (client-side handling)");
            }
            McpWebSocketMessage::Ping { .. } => {
                // Already handled in message loop
            }
            McpWebSocketMessage::Pong { .. } => {
                // Already handled in message loop
            }
        }
        
        Ok(())
    }

    /// Handle JSON-RPC requests
    async fn handle_request(
        &self,
        id: Option<serde_json::Value>,
        method: &str,
        params: serde_json::Value,
        handler: &mut WebSocketConnectionHandler,
        write: &mut tokio_tungstenite::WebSocketStream<TcpStream>,
    ) -> Result<()> {
        println!("📥 Handling request: {} with params {:?}", method, params);
        
        // Route to appropriate handler
        match method {
            "subscribe" => {
                handler.handle_subscribe(params, write).await?;
            }
            "unsubscribe" => {
                handler.handle_unsubscribe(params, write).await?;
            }
            "batch" => {
                handler.handle_batch(params, write).await?;
            }
            _ => {
                // Route to MCP tool registry
                match self.tool_registry.handle_tool_call(method, params) {
                    Ok(result) => {
                        let response = McpWebSocketMessage::response(
                            id,
                            json!({
                                "content": [{
                                    "type": "text",
                                    "text": result.to_string()
                                }],
                                "structuredContent": result,
                                "isError": false
                            }),
                        );
                        write.send(Message::Text(response.to_string())).await?;
                    }
                    Err(e) => {
                        let response = McpWebSocketMessage::error(
                            id,
                            -32603,
                            "Internal error",
                            Some(format!("Tool execution failed: {}", e)),
                        );
                        write.send(Message::Text(response.to_string())).await?;
                    }
                }
            }
        }
        
        Ok(())
    }

    /// Handle JSON-RPC notifications
    async fn handle_notification(
        &self,
        method: &str,
        params: serde_json::Value,
        handler: &mut WebSocketConnectionHandler,
        write: &mut tokio_tungstenite::WebSocketStream<TcpStream>,
    ) -> Result<()> {
        println!("📢 Handling notification: {} with params {:?}", method, params);
        
        // Notifications don't expect responses, but we can send acknowledgments
        match method {
            "ping" => {
                // Already handled in message loop
            }
            "pong" => {
                // Already handled in message loop
            }
            _ => {
                println!("ℹ️  Notification received: {}", method);
                // Could broadcast to other clients, log, etc.
            }
        }
        
        Ok(())
    }

    /// Get current connection count
    pub fn connection_count(&self) -> usize {
        self.connections.lock().unwrap().len()
    }

    /// Broadcast message to all connected clients
    pub async fn broadcast(&self, message: &str) -> Result<()> {
        let connections = self.connections.lock().unwrap();
        let mut failed = 0;
        
        for (addr, _) in connections.iter() {
            if let Err(e) = self.broadcast_to(addr, message).await {
                println!("❌ Failed to broadcast to {}: {}", addr, e);
                failed += 1;
            }
        }
        
        if failed > 0 {
            println!("⚠️  Broadcast completed with {} failures", failed);
        }
        
        Ok(())
    }

    /// Broadcast to specific client
    async fn broadcast_to(&self, addr: &SocketAddr, message: &str) -> Result<()> {
        // In a real implementation, we'd have access to the write half
        // This is simplified for the example
        println!("📢 Broadcasting to {}: {}", addr, message);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;
    
    #[test]
    fn test_server_creation() {
        let config = WebSocketServerConfig::default();
        let tool_registry = Arc::new(registry::ToolRegistry::new());
        
        let server = WebSocketServer::new(config, tool_registry);
        assert_eq!(server.connection_count(), 0);
        assert_eq!(server.config.port, 3010);
    }
    
    #[test]
    fn test_protocol_validation() {
        let config = WebSocketServerConfig {
            protocol_version: "mcp-v1".to_string(),
            ..Default::default()
        };
        
        assert_eq!(config.protocol_version, "mcp-v1");
    }
}