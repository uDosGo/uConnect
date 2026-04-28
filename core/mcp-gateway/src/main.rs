// MCP Gateway - Unified Rust server for uDos
// Handles MCP protocol, routes to Re3Engine/Hivemind, and provides vault tools

use axum::{
    routing::post,
    response::IntoResponse,
    Json,
    Router,
    extract::State,
};
use serde_json::{json, Value};
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::CorsLayer;

mod mcp;
mod vault;
mod re3_client;
mod hivemind_client;

use mcp::router::ToolRouter;

#[tokio::main]
async fn main() {
    // Initialize logging
    env_logger::init();
    
    // Create tool router with clients
    let re3_endpoint = std::env::var("RE3ENGINE_URL")
        .unwrap_or_else(|_| "http://localhost:30001".to_string());
    let hivemind_endpoint = std::env::var("HIVEMIND_URL")
        .unwrap_or_else(|_| "http://localhost:3010".to_string());
    
    let re3_client = re3_client::Re3Client::new(&re3_endpoint);
    let hivemind_client = hivemind_client::HivemindClient::new(&hivemind_endpoint);
    let tool_router = ToolRouter::new(re3_client, hivemind_client);
    
    // Create shared state
    let state = Arc::new(AppState {
        tool_router,
        vault_root: vault::get_vault_root(),
    });
    
    // Build router
    let app = Router::new()
        .route("/mcp", post(handle_mcp_request))
        .layer(CorsLayer::permissive())
        .with_state(state);
    
    let addr = SocketAddr::from(([0, 0, 0, 0], 30000));
    println!("MCP Gateway listening on http://{}", addr);
    
    axum::serve(
        tokio::net::TcpListener::bind(&addr).await.unwrap(),
        app,
    ).await.unwrap();
}

#[derive(Clone)]
struct AppState {
    tool_router: ToolRouter,
    vault_root: std::path::PathBuf,
}

async fn handle_mcp_request(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Value>,
) -> impl IntoResponse {
    let method = payload.get("method").and_then(|m| m.as_str()).unwrap_or("");
    let id = payload.get("id").cloned();
    
    match method {
        "tools/list" => {
            let tools = mcp::tools::list_tools();
            Json(json!({ 
                "jsonrpc": "2.0", 
                "id": id, 
                "result": { "tools": tools }
            }))
        }
        "tools/call" => {
            let tool_name = payload["params"]["name"].as_str().unwrap_or("");
            let args = payload["params"]["arguments"].clone();
            
            match state.tool_router.route(tool_name, &args).await {
                Ok(output) => Json(json!({ 
                    "jsonrpc": "2.0", 
                    "id": id, 
                    "result": { "content": [{"type": "text", "text": output}] }
                })),
                Err(err) => Json(json!({ 
                    "jsonrpc": "2.0", 
                    "id": id, 
                    "error": { "code": -32000, "message": err }
                })),
            }
        }
        _ => Json(json!({ 
            "jsonrpc": "2.0", 
            "id": id, 
            "error": { "code": -32601, "message": "Method not found" }
        })),
    }
}