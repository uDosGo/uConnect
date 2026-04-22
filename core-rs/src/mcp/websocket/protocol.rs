// MCP WebSocket Protocol
// JSON-RPC message handling for WebSocket transport

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use anyhow::{Result, anyhow};

/// WebSocket protocol trait
pub trait WebSocketProtocol {
    fn parse(message: &str) -> Result<McpWebSocketMessage>;
    fn to_string(&self) -> String;
}

/// MCP WebSocket message types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum McpWebSocketMessage {
    /// JSON-RPC request
    Request {
        jsonrpc: String,
        id: Option<Value>,
        method: String,
        params: Value,
    },
    /// JSON-RPC response
    Response {
        jsonrpc: String,
        id: Option<Value>,
        result: Value,
    },
    /// JSON-RPC error response
    Error {
        jsonrpc: String,
        id: Option<Value>,
        error: WebSocketError,
    },
    /// JSON-RPC notification (no response expected)
    Notification {
        jsonrpc: String,
        method: String,
        params: Value,
    },
    /// Ping message
    Ping {
        jsonrpc: String,
        method: String,
        params: Value,
    },
    /// Pong message
    Pong {
        jsonrpc: String,
        method: String,
        params: Value,
    },
}

impl WebSocketProtocol for McpWebSocketMessage {
    /// Parse a WebSocket message from JSON string
    fn parse(message: &str) -> Result<McpWebSocketMessage> {
        let parsed: Value = serde_json::from_str(message)
            .map_err(|e| anyhow!("Failed to parse JSON: {}", e))?;
        
        // Check if it's a request
        if parsed.get("method").is_some() {
            if parsed.get("id").is_some() {
                // It's a request
                serde_json::from_value(parsed)
                    .map_err(|e| anyhow!("Failed to parse as request: {}", e))
            } else {
                // It's a notification
                serde_json::from_value(parsed)
                    .map_err(|e| anyhow!("Failed to parse as notification: {}", e))
            }
        }
        // Check if it's a response
        else if parsed.get("result").is_some() {
            serde_json::from_value(parsed)
                .map_err(|e| anyhow!("Failed to parse as response: {}", e))
        }
        // Check if it's an error
        else if parsed.get("error").is_some() {
            serde_json::from_value(parsed)
                .map_err(|e| anyhow!("Failed to parse as error: {}", e))
        }
        // Check for ping/pong
        else if parsed.get("method").and_then(|m| m.as_str()) == Some("ping") {
            serde_json::from_value(parsed)
                .map_err(|e| anyhow!("Failed to parse as ping: {}", e))
        }
        else if parsed.get("method").and_then(|m| m.as_str()) == Some("pong") {
            serde_json::from_value(parsed)
                .map_err(|e| anyhow!("Failed to parse as pong: {}", e))
        }
        else {
            Err(anyhow!("Unknown message type"))
        }
    }

    /// Convert message to JSON string
    fn to_string(&self) -> String {
        serde_json::to_string(self).unwrap_or_else(|_| "{}".to_string())
    }
}

impl McpWebSocketMessage {
    /// Create a new request message
    pub fn request(id: Option<Value>, method: &str, params: Value) -> Self {
        McpWebSocketMessage::Request {
            jsonrpc: "2.0".to_string(),
            id,
            method: method.to_string(),
            params,
        }
    }

    /// Create a new response message
    pub fn response(id: Option<Value>, result: Value) -> Self {
        McpWebSocketMessage::Response {
            jsonrpc: "2.0".to_string(),
            id,
            result,
        }
    }

    /// Create a new error message
    pub fn error(id: Option<Value>, code: i32, message: &str, data: Option<String>) -> Self {
        McpWebSocketMessage::Error {
            jsonrpc: "2.0".to_string(),
            id,
            error: WebSocketError {
                code,
                message: message.to_string(),
                data: data.map(|d| json!(d)),
            },
        }
    }

    /// Create a new notification message
    pub fn notification(method: &str, params: Value) -> Self {
        McpWebSocketMessage::Notification {
            jsonrpc: "2.0".to_string(),
            method: method.to_string(),
            params,
        }
    }

    /// Create a new ping message
    pub fn ping(params: Option<Value>) -> Self {
        McpWebSocketMessage::Ping {
            jsonrpc: "2.0".to_string(),
            method: "ping".to_string(),
            params: params.unwrap_or_else(|| json!({})),
        }
    }

    /// Create a new pong message
    pub fn pong(params: Option<Value>) -> Self {
        McpWebSocketMessage::Pong {
            jsonrpc: "2.0".to_string(),
            method: "pong".to_string(),
            params: params.unwrap_or_else(|| json!({})),
        }
    }

    /// Get message ID if available
    pub fn get_id(&self) -> Option<&Value> {
        match self {
            McpWebSocketMessage::Request { id, .. } => id.as_ref(),
            McpWebSocketMessage::Response { id, .. } => id.as_ref(),
            McpWebSocketMessage::Error { id, .. } => id.as_ref(),
            _ => None,
        }
    }

    /// Get method name if available
    pub fn get_method(&self) -> Option<&str> {
        match self {
            McpWebSocketMessage::Request { method, .. } => Some(method),
            McpWebSocketMessage::Notification { method, .. } => Some(method),
            McpWebSocketMessage::Ping { .. } => Some("ping"),
            McpWebSocketMessage::Pong { .. } => Some("pong"),
            _ => None,
        }
    }
}

/// WebSocket error structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebSocketError {
    pub code: i32,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<Value>,
}

/// Common error codes
pub mod error_codes {
    pub const PARSE_ERROR: i32 = -32700;
    pub const INVALID_REQUEST: i32 = -32600;
    pub const METHOD_NOT_FOUND: i32 = -32601;
    pub const INVALID_PARAMS: i32 = -32602;
    pub const INTERNAL_ERROR: i32 = -32603;
    pub const SERVER_ERROR: i32 = -32000;
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_request_parsing() {
        let request_json = r#"
            {"jsonrpc": "2.0", "id": "req_1", "method": "test", "params": {"key": "value"}}
        "#;
        
        let message = McpWebSocketMessage::parse(request_json).unwrap();
        match message {
            McpWebSocketMessage::Request { id, method, params, .. } => {
                assert_eq!(id, Some(&json!("req_1")));
                assert_eq!(method, "test");
                assert_eq!(params["key"], "value");
            }
            _ => panic!("Expected request message"),
        }
    }
    
    #[test]
    fn test_response_creation() {
        let response = McpWebSocketMessage::response(
            Some(json!("req_1")),
            json!({"result": "success"}),
        );
        
        let response_str = response.to_string();
        assert!(response_str.contains("req_1"));
        assert!(response_str.contains("success"));
    }
    
    #[test]
    fn test_error_creation() {
        let error = McpWebSocketMessage::error(
            Some(json!("req_1")),
            -32601,
            "Method not found",
            Some("test method".to_string()),
        );
        
        let error_str = error.to_string();
        assert!(error_str.contains("req_1"));
        assert!(error_str.contains("Method not found"));
        assert!(error_str.contains("test method"));
    }
    
    #[test]
    fn test_notification_parsing() {
        let notification_json = r#"
            {"jsonrpc": "2.0", "method": "event", "params": {"data": "test"}}
        "#;
        
        let message = McpWebSocketMessage::parse(notification_json).unwrap();
        match message {
            McpWebSocketMessage::Notification { method, params, .. } => {
                assert_eq!(method, "event");
                assert_eq!(params["data"], "test");
            }
            _ => panic!("Expected notification message"),
        }
    }
    
    #[test]
    fn test_ping_pong_messages() {
        let ping = McpWebSocketMessage::ping(Some(json!({"timestamp": 123})));
        let pong = McpWebSocketMessage::pong(Some(json!({"timestamp": 124})));
        
        assert!(ping.to_string().contains("ping"));
        assert!(pong.to_string().contains("pong"));
    }
}