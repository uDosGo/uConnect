use anyhow::{anyhow, Result};
use serde_json::json;

pub fn run(input: &str, output: Option<&str>) -> Result<()> {
    let params = json!({
        "input": input,
        "output": output
    });
    let out = crate::orchestrator::ok_handler::call_tool("markdownify.import", &params.to_string())?;
    if out.get("ok").and_then(serde_json::Value::as_bool) == Some(true) {
        if let Some(path) = out.get("output").and_then(serde_json::Value::as_str) {
            println!("Imported to {path}");
        } else {
            println!("{}", serde_json::to_string_pretty(&out)?);
        }
        return Ok(());
    }
    Err(anyhow!(
        "{}",
        out.get("error")
            .and_then(serde_json::Value::as_str)
            .unwrap_or("unknown markdownify import error")
    ))
}

pub fn status() -> Result<()> {
    let out = crate::orchestrator::ok_handler::call_tool("markdownify.status", "{}")?;
    println!("{}", serde_json::to_string_pretty(&out)?);
    Ok(())
}
