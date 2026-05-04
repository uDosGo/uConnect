use anyhow::Result;
use serde_json::{json, Value};

pub fn list_tools() -> Value {
    json!(crate::mcp::registry::default_tools())
}

pub fn call_tool(name: &str, params_json: &str) -> Result<Value> {
    let params: Value = serde_json::from_str(params_json).unwrap_or_else(|_| json!({}));
    crate::mcp::registry::handle_tool_call(name, params)
}
