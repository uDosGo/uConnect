use anyhow::{anyhow, Result};
use serde_json::{json, Value};

pub fn query(params: Value) -> Result<Value> {
    let prompt = params
        .get("prompt")
        .and_then(Value::as_str)
        .ok_or_else(|| anyhow!("Missing or invalid 'prompt' parameter"))?;

    // Placeholder for Le Chat query logic
    let response = format!("Response to: {}", prompt);

    Ok(json!({
        "ok": true,
        "response": response
    }))
}

pub fn stream(params: Value) -> Result<Value> {
    let prompt = params
        .get("prompt")
        .and_then(Value::as_str)
        .ok_or_else(|| anyhow!("Missing or invalid 'prompt' parameter"))?;

    // Placeholder for Le Chat stream logic
    let stream_response = format!("Stream response to: {}", prompt);

    Ok(json!({
        "ok": true,
        "stream": stream_response
    }))
}
