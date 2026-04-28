// uDos MCP Gateway
// Unified access point for all uDos tools and engines

use axum::{Json, Router, routing::post};
use serde_json::{json, Value};
use std::net::SocketAddr;
use std::env;
use log::{info, error};

mod re3_client;
mod hivemind_client;
mod vault;
mod router;

use re3_client::Re3Client;
use hivemind_client::HivemindClient;
use router::ToolRouter;

#[tokio::main]
async fn main() {
    // Initialize logging
    env_logger::init();
    
    // Load environment variables
    dotenv::dotenv().ok();
    
    let port = env::var("MCP_PORT").unwrap_or_else(|_| "30000".to_string());
    let addr = SocketAddr::from(([0, 0, 0, 0], port.parse().unwrap()));
    
    info!("Starting uDos MCP Gateway on port {}", port);
    
    // Initialize clients
    let re3_endpoint = env::var("RE3_ENGINE_URL").unwrap_or_else(|_| "http://localhost:30001".to_string());
    let hivemind_endpoint = env::var("HIVEMIND_URL").unwrap_or_else(|_| "http://localhost:3010".to_string());
    
    let re3_client = Re3Client::new(&re3_endpoint);
    let hivemind_client = HivemindClient::new(&hivemind_endpoint);
    
    // Create tool router
    let tool_router = ToolRouter::new(re3_client, hivemind_client);
    
    // Build the router
    let app = Router::new()
        .route("/mcp", post(move |json: Json<Value>| handle_mcp_request(json, tool_router.clone())))
        .route("/health", axum::routing::get(health_check));
    
    info!("MCP Gateway ready at http://{}", addr);
    
    // Start the server
    axum::serve(tokio::net::TcpListener::bind(&addr).await.unwrap(), app)
        .await
        .unwrap();
}

async fn handle_mcp_request(
    Json(req): Json<Value>,
    tool_router: ToolRouter,
) -> Json<Value> {
    info!("Received MCP request: {:?}", req);
    
    let method = req.get("method").and_then(|m| m.as_str()).unwrap_or("");
    let id = req.get("id").cloned();
    
    match method {
        "tools/list" => {
            let tools = list_all_tools();
            Json(json!({ 
                "jsonrpc": "2.0", 
                "id": id, 
                "result": { "tools": tools } 
            }))
        }
        "tools/call" => {
            let tool_name = req["params"]["name"].as_str().unwrap_or("");
            let args = req["params"]["arguments"].clone();
            
            info!("Calling tool: {}", tool_name);
            
            match tool_router.route(tool_name, &args).await {
                Ok(output) => {
                    Json(json!({ 
                        "jsonrpc": "2.0", 
                        "id": id, 
                        "result": { 
                            "content": [
                                { "type": "text", "text": output }
                            ] 
                        } 
                    }))
                }
                Err(err) => {
                    error!("Tool {} failed: {}", tool_name, err);
                    Json(json!({ 
                        "jsonrpc": "2.0", 
                        "id": id, 
                        "error": { 
                            "code": -32000, 
                            "message": err 
                        } 
                    }))
                }
            }
        }
        _ => {
            Json(json!({ 
                "jsonrpc": "2.0", 
                "id": id, 
                "error": { 
                    "code": -32601, 
                    "message": "Method not found" 
                } 
            }))
        }
    }
}

async fn health_check() -> Json<Value> {
    Json(json!({
        "status": "healthy",
        "service": "uDos MCP Gateway",
        "version": "0.1.0"
    }))
}

fn list_all_tools() -> Vec<Value> {
    vec![
        // Reasoning tools (Re3Engine)
        tool_def("chat", "Have a conversation with the AI assistant"),
        tool_def("reason", "Perform deep reasoning about a problem"),
        tool_def("plan", "Create a step-by-step plan"),
        tool_def("batch", "Process multiple items in batch"),
        
        // Orchestration tools (Hivemind)
        tool_def("swarm", "Coordinate multiple agents in a swarm"),
        tool_def("task_decompose", "Break down a complex task"),
        tool_def("agent_coordinate", "Coordinate between multiple agents"),
        
        // Vault tools (Direct Rust)
        tool_def("vault_read", "Read a file from the vault"),
        tool_def("vault_write", "Write a file to the vault"),
        tool_def("vault_list", "List files in a vault directory"),
        tool_def("vault_search", "Search for files in the vault"),
        tool_def("vault_delete", "Delete a file from the vault"),
        tool_def("vault_metadata", "Get metadata about a vault file"),
        
        // Dev tools
        tool_def("code_generate", "Generate code based on specifications"),
        tool_def("test_run", "Run tests and return results"),
    ]
}

fn tool_def(name: &str, description: &str) -> Value {
    json!({
        "name": name,
        "description": description,
        "input_schema": { "type": "object" }
    })
}