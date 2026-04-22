use crate::mcp::registry;
use anyhow::{Context, Result};
use serde_json::{json, Value};
use std::collections::HashSet;
use std::io::{self, BufRead, Write};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;

pub struct UDosMcpServer;

impl UDosMcpServer {
    pub fn new() -> Self {
        Self
    }

    pub fn run_stdio(&self) -> Result<()> {
        let stdin = io::stdin();
        let stdout = io::stdout();
        let mut reader = io::BufReader::new(stdin.lock());
        let mut writer = io::BufWriter::new(stdout.lock());

        loop {
            let message = match read_framed_message(&mut reader)? {
                Some(msg) => msg,
                None => break,
            };

            let req: Value = match serde_json::from_str(&message) {
                Ok(v) => v,
                Err(e) => {
                    let err = jsonrpc_error(Value::Null, -32700, "Parse error", Some(json!(e.to_string())));
                    write_framed_message(&mut writer, &err)?;
                    continue;
                }
            };

            let id = req.get("id").cloned();
            let method = req.get("method").and_then(Value::as_str);
            let params = req.get("params").cloned().unwrap_or_else(|| json!({}));

            let resp = match method {
                Some("initialize") => {
                    jsonrpc_result(
                        id.unwrap_or(Value::Null),
                        json!({
                            "protocolVersion": "2024-11-05",
                            "serverInfo": { "name": "udos-core", "version": env!("CARGO_PKG_VERSION") },
                            "capabilities": { "tools": {} }
                        }),
                    )
                }
                Some("notifications/initialized") => {
                    // Notification: no response body required.
                    continue;
                }
                Some("ping") => jsonrpc_result(id.unwrap_or(Value::Null), json!({})),
                Some("tools/list") => {
                    let tools = registry::default_tools()
                        .into_iter()
                        .map(|tool| {
                            let input_schema = tool_input_schema(&tool.name);
                            json!({
                                "name": tool.name,
                                "description": format!("{} [{}]", tool.description, tool.status),
                                "inputSchema": input_schema
                            })
                        })
                        .collect::<Vec<_>>();
                    jsonrpc_result(id.unwrap_or(Value::Null), json!({ "tools": tools }))
                }
                Some("tools/call") => {
                    let name = params.get("name").and_then(Value::as_str);
                    let args = params
                        .get("arguments")
                        .cloned()
                        .unwrap_or_else(|| json!({}));
                    match name {
                        Some(tool_name) => {
                            if !known_tool_names().contains(tool_name) {
                                let message = format!("Invalid params: unknown tool `{tool_name}`");
                                let detail = json!({ "name": tool_name });
                                let resp = jsonrpc_error(
                                    id.unwrap_or(Value::Null),
                                    -32602,
                                    &message,
                                    Some(detail),
                                );
                                write_framed_message(&mut writer, &resp)?;
                                continue;
                            }
                            if let Err(message) = validate_tool_arguments(tool_name, &args) {
                                let detail = json!({ "name": tool_name, "arguments": args });
                                let resp = jsonrpc_error(
                                    id.unwrap_or(Value::Null),
                                    -32602,
                                    &format!("Invalid params: {message}"),
                                    Some(detail),
                                );
                                write_framed_message(&mut writer, &resp)?;
                                continue;
                            }
                            let tool_out = registry::handle_tool_call(tool_name, args)
                                .unwrap_or_else(|e| json!({ "ok": false, "error": e.to_string() }));
                            let is_error = tool_out.get("ok").and_then(Value::as_bool) == Some(false);
                            jsonrpc_result(
                                id.unwrap_or(Value::Null),
                                json!({
                                    "content": [
                                        {
                                            "type": "text",
                                            "text": serde_json::to_string_pretty(&tool_out).unwrap_or_else(|_| tool_out.to_string())
                                        }
                                    ],
                                    "structuredContent": tool_out,
                                    "isError": is_error
                                }),
                            )
                        }
                        None => jsonrpc_error(
                            id.unwrap_or(Value::Null),
                            -32602,
                            "Invalid params: tools/call requires `name`",
                            None,
                        ),
                    }
                }
                Some(other) => {
                    jsonrpc_error(
                        id.unwrap_or(Value::Null),
                        -32601,
                        &format!("Method not found: {other}"),
                        None,
                    )
                }
                None => jsonrpc_error(
                    id.unwrap_or(Value::Null),
                    -32600,
                    "Invalid Request: missing `method`",
                    None,
                ),
            };

            write_framed_message(&mut writer, &resp)?;
        }
        Ok(())
    }

    pub async fn run_http(&self, port: u16) -> Result<()> {
        let listener = TcpListener::bind(("0.0.0.0", port)).await?;
        loop {
            let (mut socket, _) = listener.accept().await?;
            tokio::spawn(async move {
                let mut buf = vec![0u8; 8192];
                if let Ok(n) = socket.read(&mut buf).await {
                    if n == 0 {
                        return;
                    }
                    let req = String::from_utf8_lossy(&buf[..n]).to_string();
                    let body = req.split("\r\n\r\n").nth(1).unwrap_or("").trim();
                    let parsed: Value = serde_json::from_str(body).unwrap_or_else(|_| json!({}));
                    let method = parsed
                        .get("method")
                        .and_then(Value::as_str)
                        .unwrap_or("unknown");
                    let params = parsed.get("params").cloned().unwrap_or(json!({}));
                    let result = registry::handle_tool_call(method, params)
                        .unwrap_or_else(|e| json!({ "ok": false, "error": e.to_string() }));
                    let body = json!({ "result": result }).to_string();
                    let response = format!(
                        "HTTP/1.1 200 OK\r\ncontent-type: application/json\r\ncontent-length: {}\r\n\r\n{}",
                        body.len(),
                        body
                    );
                    let _ = socket.write_all(response.as_bytes()).await;
                }
            });
        }
    }
}

fn read_framed_message<R: BufRead>(reader: &mut R) -> Result<Option<String>> {
    let mut content_length: Option<usize> = None;
    let mut header_line = String::new();

    loop {
        header_line.clear();
        let bytes = reader.read_line(&mut header_line)?;
        if bytes == 0 {
            return Ok(None);
        }
        let line = header_line.trim_end_matches(['\r', '\n']);
        if line.is_empty() {
            break;
        }
        let lower = line.to_ascii_lowercase();
        if let Some(rest) = lower.strip_prefix("content-length:") {
            content_length = Some(
                rest.trim()
                    .parse::<usize>()
                    .with_context(|| format!("invalid Content-Length header: {line}"))?,
            );
        }
    }

    let len = content_length.context("missing Content-Length header")?;
    let mut buf = vec![0u8; len];
    reader.read_exact(&mut buf)?;
    Ok(Some(String::from_utf8(buf).context("invalid UTF-8 message body")?))
}

fn write_framed_message<W: Write>(writer: &mut W, body: &Value) -> Result<()> {
    let payload = body.to_string();
    write!(writer, "Content-Length: {}\r\n\r\n{}", payload.len(), payload)?;
    writer.flush()?;
    Ok(())
}

fn jsonrpc_result(id: Value, result: Value) -> Value {
    json!({
        "jsonrpc": "2.0",
        "id": id,
        "result": result
    })
}

fn jsonrpc_error(id: Value, code: i64, message: &str, data: Option<Value>) -> Value {
    json!({
        "jsonrpc": "2.0",
        "id": id,
        "error": {
            "code": code,
            "message": message,
            "data": data
        }
    })
}

fn known_tool_names() -> HashSet<String> {
    registry::default_tools().into_iter().map(|t| t.name).collect()
}

fn tool_input_schema(tool_name: &str) -> Value {
    match tool_name {
        "markdownify.import" => json!({
            "type": "object",
            "properties": {
                "input": { "type": "string", "description": "Input file path or URL" },
                "output": { "type": "string", "description": "Optional output markdown path" }
            },
            "required": ["input"],
            "additionalProperties": false
        }),
        "markdownify.status" => json!({
            "type": "object",
            "properties": {},
            "additionalProperties": false
        }),
        "diagram.banner" => json!({
            "type": "object",
            "properties": {
                "text": { "type": "string", "description": "Text to render with figlet" },
                "font": { "type": "string", "description": "Optional figlet font name" }
            },
            "required": ["text"],
            "additionalProperties": false
        }),
        "diagram.fonts.list" => json!({
            "type": "object",
            "properties": {},
            "additionalProperties": false
        }),
        _ => json!({
            "type": "object",
            "additionalProperties": true
        }),
    }
}

fn validate_tool_arguments(tool_name: &str, args: &Value) -> std::result::Result<(), String> {
    let obj = args
        .as_object()
        .ok_or_else(|| "tools/call `arguments` must be an object".to_string())?;
    match tool_name {
        "markdownify.import" => {
            let input = obj
                .get("input")
                .and_then(Value::as_str)
                .ok_or_else(|| "`input` is required and must be a string".to_string())?;
            if input.trim().is_empty() {
                return Err("`input` cannot be empty".to_string());
            }
            if let Some(output) = obj.get("output") {
                if output.as_str().is_none() {
                    return Err("`output` must be a string when provided".to_string());
                }
            }
            reject_unexpected(obj, &["input", "output"])?;
        }
        "markdownify.status" | "diagram.fonts.list" => {
            reject_unexpected(obj, &[])?;
        }
        "diagram.banner" => {
            let text = obj
                .get("text")
                .and_then(Value::as_str)
                .ok_or_else(|| "`text` is required and must be a string".to_string())?;
            if text.trim().is_empty() {
                return Err("`text` cannot be empty".to_string());
            }
            if let Some(font) = obj.get("font") {
                if font.as_str().is_none() {
                    return Err("`font` must be a string when provided".to_string());
                }
            }
            reject_unexpected(obj, &["text", "font"])?;
        }
        _ => {}
    }
    Ok(())
}

fn reject_unexpected(
    obj: &serde_json::Map<String, Value>,
    allowed: &[&str],
) -> std::result::Result<(), String> {
    for key in obj.keys() {
        if !allowed.iter().any(|k| key == k) {
            return Err(format!("unexpected argument `{key}`"));
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{tool_input_schema, validate_tool_arguments};
    use serde_json::json;

    #[test]
    fn schema_marks_markdownify_import_input_required() {
        let schema = tool_input_schema("markdownify.import");
        let required = schema
            .get("required")
            .and_then(|x| x.as_array())
            .expect("required array");
        assert!(required.iter().any(|x| x == "input"));
    }

    #[test]
    fn validation_rejects_missing_required_input() {
        let err = validate_tool_arguments("markdownify.import", &json!({}))
            .expect_err("expected validation error");
        assert!(err.contains("input"), "unexpected error: {err}");
    }

    #[test]
    fn validation_rejects_unknown_field_for_status() {
        let err = validate_tool_arguments("markdownify.status", &json!({"foo":"bar"}))
            .expect_err("expected validation error");
        assert!(err.contains("unexpected argument"), "unexpected error: {err}");
    }
}
