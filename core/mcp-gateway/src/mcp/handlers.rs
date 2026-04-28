// MCP Tool handlers

use axum::Json;
use serde_json::{json, Value};
use std::sync::Arc;
use crate::AppState;

pub async fn handle_vault_read(
    state: &Arc<AppState>,
    args: &Value,
) -> Result<Json<Value>, Json<Value>> {
    let path = args["path"].as_str().ok_or_else(|| {
        Json(json!({"error": "Missing path parameter"}))
    })?;
    
    match crate::vault::read_file(&state.vault_root, path).await {
        Ok(content) => Ok(Json(json!({
            "success": true,
            "content": content,
            "path": path
        }))),
        Err(e) => Err(Json(json!({"error": e.to_string()}))),
    }
}

pub async fn handle_vault_write(
    state: &Arc<AppState>,
    args: &Value,
) -> Result<Json<Value>, Json<Value>> {
    let path = args["path"].as_str().ok_or_else(|| {
        Json(json!({"error": "Missing path parameter"}))
    })?;
    let content = args["content"].as_str().ok_or_else(|| {
        Json(json!({"error": "Missing content parameter"}))
    })?;
    
    match crate::vault::write_file(&state.vault_root, path, content).await {
        Ok(()) => Ok(Json(json!({"success": true, "path": path}))),
        Err(e) => Err(Json(json!({"error": e.to_string()}))),
    }
}

pub async fn handle_vault_list(
    state: &Arc<AppState>,
    args: &Value,
) -> Result<Json<Value>, Json<Value>> {
    let path = args["path"].as_str().unwrap_or("");
    
    match crate::vault::list_dir(&state.vault_root, path).await {
        Ok(items) => Ok(Json(json!({
            "success": true,
            "items": items,
            "path": path
        }))),
        Err(e) => Err(Json(json!({"error": e.to_string()}))),
    }
}

pub async fn handle_vault_search(
    state: &Arc<AppState>,
    args: &Value,
) -> Result<Json<Value>, Json<Value>> {
    let query = args["query"].as_str().ok_or_else(|| {
        Json(json!({"error": "Missing query parameter"}))
    })?;
    let path = args["path"].as_str().unwrap_or("");
    
    match crate::vault::search(&state.vault_root, query, path).await {
        Ok(results) => Ok(Json(json!({
            "success": true,
            "results": results,
            "count": results.len()
        }))),
        Err(e) => Err(Json(json!({"error": e.to_string()}))),
    }
}

pub async fn handle_vault_delete(
    state: &Arc<AppState>,
    args: &Value,
) -> Result<Json<Value>, Json<Value>> {
    let path = args["path"].as_str().ok_or_else(|| {
        Json(json!({"error": "Missing path parameter"}))
    })?;
    
    match crate::vault::delete_file(&state.vault_root, path).await {
        Ok(()) => Ok(Json(json!({"success": true, "path": path}))),
        Err(e) => Err(Json(json!({"error": e.to_string()}))),
    }
}

pub async fn handle_vault_metadata(
    state: &Arc<AppState>,
    args: &Value,
) -> Result<Json<Value>, Json<Value>> {
    let path = args["path"].as_str().ok_or_else(|| {
        Json(json!({"error": "Missing path parameter"}))
    })?;
    
    match crate::vault::get_metadata(&state.vault_root, path).await {
        Ok(metadata) => Ok(Json(json!({
            "success": true,
            "metadata": metadata
        }))),
        Err(e) => Err(Json(json!({"error": e.to_string()}))),
    }
}

pub async fn handle_chat(
    _state: &Arc<AppState>,
    args: &Value,
) -> Result<Json<Value>, Json<Value>> {
    let message = args["message"].as_str().ok_or_else(|| {
        Json(json!({"error": "Missing message parameter"}))
    })?;
    
    // Forward to Re3Engine (Python) via HTTP or subprocess
    match crate::re3_client::chat(message).await {
        Ok(response) => Ok(Json(json!({
            "success": true,
            "response": response
        }))),
        Err(e) => Err(Json(json!({"error": e.to_string()}))),
    }
}

pub async fn handle_reason(
    _state: &Arc<AppState>,
    args: &Value,
) -> Result<Json<Value>, Json<Value>> {
    let task = args["task"].as_str().ok_or_else(|| {
        Json(json!({"error": "Missing task parameter"}))
    })?;
    let context = args["context"].as_str().unwrap_or("");
    
    // Forward to Re3Engine (Python) via HTTP or subprocess
    match crate::re3_client::reason(task, context).await {
        Ok(response) => Ok(Json(json!({
            "success": true,
            "response": response
        }))),
        Err(e) => Err(Json(json!({"error": e.to_string()}))),
    }
}
