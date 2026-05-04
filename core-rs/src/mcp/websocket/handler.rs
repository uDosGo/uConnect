// WebSocket Connection Handler
// Per-connection state and message processing

use std::net::SocketAddr;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use anyhow::{Result, anyhow};
use tokio::time::{sleep, Duration};
use tokio_tungstenite::tungstenite::protocol::Message;
use serde_json::json;

use super::protocol::McpWebSocketMessage;
use super::super::registry;

/// Connection handler for individual WebSocket clients
#[derive(Debug, Clone)]
pub struct WebSocketConnectionHandler {
    addr: SocketAddr,
    tool_registry: Arc<registry::ToolRegistry>,
    ping_interval: u64,
    last_ping: u64,
    subscriptions: Vec<String>, // Subscription IDs
    connection_start: u64,
}

impl WebSocketConnectionHandler {
    pub fn new(addr: SocketAddr, tool_registry: Arc<registry::ToolRegistry>, ping_interval: u64) -> Self {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        Self {
            addr,
            tool_registry,
            ping_interval,
            last_ping: now,
            subscriptions: Vec::new(),
            connection_start: now,
        }
    }

    /// Get connection address
    pub fn addr(&self) -> SocketAddr {
        self.addr
    }

    /// Get connection duration in seconds
    pub fn duration(&self) -> u64 {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        now - self.connection_start
    }

    /// Check if connection needs ping
    pub fn needs_ping(&self) -> bool {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        now - self.last_ping >= self.ping_interval
    }

    /// Update last ping time
    pub fn update_ping(&mut self) {
        self.last_ping = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
    }

    /// Handle subscribe request
    pub async fn handle_subscribe(
        &mut self,
        params: serde_json::Value,
        write: &mut tokio_tungstenite::WebSocketStream<tokio::net::TcpStream>,
    ) -> Result<()> {
        println!("📋 Subscribe request from {}: {:?}", self.addr, params);
        
        // Parse subscription parameters
        let event = params.get("event")
            .and_then(|e| e.as_str())
            .ok_or_else(|| anyhow!("Missing event parameter"))?;
        
        let subscription_id = format!("sub_{}_{}", self.addr, self.subscriptions.len());
        
        // Add to subscriptions
        self.subscriptions.push(subscription_id.clone());
        
        // Send success response
        let response = McpWebSocketMessage::response(
            Some(json!("subscribe_response")),
            json!({
                "subscription_id": subscription_id,
                "event": event,
                "status": "subscribed"
            }),
        );
        
        write.send(Message::Text(response.to_string())).await?;
        
        println!("✅ Subscription {} added for {}", subscription_id, event);
        
        Ok(())
    }

    /// Handle unsubscribe request
    pub async fn handle_unsubscribe(
        &mut self,
        params: serde_json::Value,
        write: &mut tokio_tungstenite::WebSocketStream<tokio::net::TcpStream>,
    ) -> Result<()> {
        println!("🗑️  Unsubscribe request from {}: {:?}", self.addr, params);
        
        // Parse subscription ID
        let subscription_id = params.get("subscription_id")
            .and_then(|s| s.as_str())
            .ok_or_else(|| anyhow!("Missing subscription_id parameter"))?;
        
        // Remove subscription
        if let Some(pos) = self.subscriptions.iter().position(|s| s == subscription_id) {
            self.subscriptions.remove(pos);
            
            let response = McpWebSocketMessage::response(
                Some(json!("unsubscribe_response")),
                json!({
                    "subscription_id": subscription_id,
                    "status": "unsubscribed"
                }),
            );
            
            write.send(Message::Text(response.to_string())).await?;
            println!("✅ Subscription {} removed", subscription_id);
        } else {
            let response = McpWebSocketMessage::error(
                Some(json!("unsubscribe_response")),
                -32602,
                "Invalid params",
                Some("Subscription not found".to_string()),
            );
            
            write.send(Message::Text(response.to_string())).await?;
            return Err(anyhow!("Subscription {} not found", subscription_id));
        }
        
        Ok(())
    }

    /// Handle batch request
    pub async fn handle_batch(
        &mut self,
        params: serde_json::Value,
        write: &mut tokio_tungstenite::WebSocketStream<tokio::net::TcpStream>,
    ) -> Result<()> {
        println!("🔢 Batch request from {}: {:?}", self.addr, params);
        
        // Parse batch requests
        let requests = params.get("requests")
            .and_then(|r| r.as_array())
            .ok_or_else(|| anyhow!("Missing requests array"))?;
        
        let mut responses = Vec::new();
        
        // Process each request in the batch
        for (index, request) in requests.iter().enumerate() {
            let method = request.get("method")
                .and_then(|m| m.as_str())
                .ok_or_else(|| anyhow!("Request {} missing method", index))?;
            
            let params = request.get("params")
                .cloned()
                .unwrap_or_else(|| json!({}));
            
            // Execute the tool
            match self.tool_registry.handle_tool_call(method, params) {
                Ok(result) => {
                    responses.push(json!({
                        "id": index,
                        "result": result
                    }));
                }
                Err(e) => {
                    responses.push(json!({
                        "id": index,
                        "error": {
                            "code": -32603,
                            "message": "Internal error",
                            "data": format!("Tool execution failed: {}", e)
                        }
                    }));
                }
            }
        }
        
        // Send batch response
        let response = McpWebSocketMessage::response(
            Some(json!("batch_response")),
            json!({"responses": responses}),
        );
        
        write.send(Message::Text(response.to_string())).await?;
        
        println!("✅ Batch processed {} requests", responses.len());
        
        Ok(())
    }

    /// Send ping message
    pub async fn send_ping(
        &mut self,
        write: &mut tokio_tungstenite::WebSocketStream<tokio::net::TcpStream>,
    ) -> Result<()> {
        let ping_message = McpWebSocketMessage::ping(Some(json!({
            "timestamp": SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs()
        })));
        
        write.send(Message::Text(ping_message.to_string())).await?;
        self.update_ping();
        
        Ok(())
    }

    /// Get active subscriptions
    pub fn active_subscriptions(&self) -> Vec<String> {
        self.subscriptions.clone()
    }

    /// Check if subscribed to event
    pub fn is_subscribed_to(&self, event: &str) -> bool {
        // In a real implementation, we'd track which events each subscription is for
        // This is simplified for the example
        !self.subscriptions.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;
    use std::net::{IpAddr, Ipv4Addr};
    
    #[test]
    fn test_connection_handler_creation() {
        let addr = SocketAddr::new(IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)), 12345);
        let tool_registry = Arc::new(registry::ToolRegistry::new());
        
        let handler = WebSocketConnectionHandler::new(addr, tool_registry, 30);
        assert_eq!(handler.addr(), addr);
        assert_eq!(handler.active_subscriptions().len(), 0);
        assert!(handler.duration() < 2); // Less than 2 seconds old
    }
    
    #[test]
    fn test_ping_management() {
        let addr = SocketAddr::new(IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)), 12345);
        let tool_registry = Arc::new(registry::ToolRegistry::new());
        
        let mut handler = WebSocketConnectionHandler::new(addr, tool_registry, 60);
        assert!(!handler.needs_ping());
        
        // Simulate time passing
        // In a real test, we'd mock the time, but for this example we'll just check the logic
        handler.update_ping();
        assert!(!handler.needs_ping());
    }
}