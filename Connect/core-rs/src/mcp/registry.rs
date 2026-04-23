use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolSpec {
    pub name: String,
    pub description: String,
    pub status: String,
}

pub fn default_tools() -> Vec<ToolSpec> {
    vec![
        tool("vault.read", "Read vault file", "A1"),
        tool("vault.write", "Write vault file", "A1"),
        tool("vault.list", "List vault paths", "A1"),
        tool("vault.search", "Search vault text", "A1"),
        tool("feed.list", "List feeds", "A1"),
        tool("feed.pull", "Pull feeds", "A1"),
        tool("feed.view", "View feed items", "A1"),
        tool("spool.list", "List spools", "A1"),
        tool("spool.create", "Create spool", "A1"),
        tool("spool.play", "Play spool", "A1"),
        tool("publish.build", "Build static publish", "A1"),
        tool("publish.deploy", "Deploy static publish", "A1"),
        tool("grid.import", "Import REXPaint", "A1"),
        tool("grid.export", "Export REXPaint", "A1"),
        tool("grid.render", "Render grid", "A1"),
        tool("usxd.render", "Render USXD", "A1"),
        tool("usxd.export", "Export USXD", "A1"),
        tool("diagram.banner", "Generate FIGlet banner", "A1"),
        tool("diagram.fonts.list", "List FIGlet fonts", "A1"),
        tool("image.process", "Process image via IMAGE module", "A1"),
        tool(
            "markdownify.status",
            "Show Markdownify MCP integration status",
            "A2-alpha",
        ),
        tool(
            "markdownify.import",
            "Convert input to markdown via MarkItDown bridge",
            "A2-alpha",
        ),
        tool("sync.status", "Sync status", "A2-stub"),
        tool("sync.push", "Sync push", "A2-stub"),
        tool("sync.pull", "Sync pull", "A2-stub"),
        tool("apple.reminders.list", "List reminders", "A2-stub"),
        tool("apple.contacts.list", "List contacts", "A2-stub"),
        tool("agent.hivemind", "Multi-agent query", "A2-stub"),
        tool("lechat.query", "Query Le Chat (Mistral)", "A2-alpha"),
        tool("lechat.stream", "Stream response from Le Chat", "A2-alpha"),
        tool("webhook.register", "Register webhook", "A2-stub"),
        tool("webhook.trigger", "Trigger webhook", "A2-stub"),
        tool("actions.workflow.trigger", "Trigger GitHub workflow", "A2-stub"),
        tool("actions.workflow.status", "Workflow status", "A2-stub"),
        tool("actions.secrets.get", "Get secret", "A2-stub"),
    ]
}

fn tool(name: &str, description: &str, status: &str) -> ToolSpec {
    ToolSpec {
        name: name.to_string(),
        description: description.to_string(),
        status: status.to_string(),
    }
}

pub fn handle_tool_call(method: &str, params: Value) -> Result<Value> {
    match method {
        "system.tools.list" => Ok(json!(default_tools())),
        "diagram.banner" => {
            let text = params.get("text").and_then(Value::as_str).unwrap_or_default();
            let font = params.get("font").and_then(Value::as_str);
            let output = figlet_banner(text, font)?;
            Ok(json!({ "ok": true, "output": output }))
        }
        "diagram.fonts.list" => {
            let fonts = figlet_fonts()?;
            Ok(json!({ "ok": true, "fonts": fonts }))
        }
        "markdownify.status" => Ok(crate::mcp::markdownify::status_json()),
        "markdownify.import" => crate::mcp::markdownify::import_to_markdown(params),
        "lechat.query" => crate::mcp::lechat::query(params),
        "lechat.stream" => crate::mcp::lechat::stream(params),
        _ => Ok(json!({
            "ok": false,
            "error": format!("tool `{method}` not implemented in A1 scaffold"),
            "status": "stub"
        })),
    }
}

fn figlet_banner(text: &str, font: Option<&str>) -> Result<String> {
    let mut cmd = Command::new("figlet");
    if let Some(f) = font {
        cmd.arg("-f").arg(f);
    }
    cmd.arg(text);
    let out = cmd.output();
    match out {
        Ok(o) if o.status.success() => Ok(String::from_utf8_lossy(&o.stdout).to_string()),
        Ok(o) => Err(anyhow!(
            "figlet failed: {}",
            String::from_utf8_lossy(&o.stderr).trim()
        )),
        Err(_) => Err(anyhow!(
            "figlet is not installed. Install it to use diagram.banner."
        )),
    }
}

fn figlet_fonts() -> Result<Vec<String>> {
    let out = Command::new("figlet").arg("-I2").output();
    match out {
        Ok(o) if o.status.success() => {
            let dir = String::from_utf8_lossy(&o.stdout).trim().to_string();
            let mut names = Vec::new();
            if let Ok(entries) = std::fs::read_dir(dir) {
                for e in entries.flatten() {
                    let p = e.path();
                    if p.extension().and_then(|x| x.to_str()) == Some("flf") {
                        if let Some(stem) = p.file_stem().and_then(|x| x.to_str()) {
                            names.push(stem.to_string());
                        }
                    }
                }
            }
            names.sort();
            Ok(names)
        }
        _ => Err(anyhow!(
            "unable to list figlet fonts (figlet missing or inaccessible)"
        )),
    }
}
