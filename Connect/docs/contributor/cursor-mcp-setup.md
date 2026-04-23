---
title: "Cursor MCP setup for uDos"
tags: [--contributor]
audience: contributor
slot: 7
---

# Cursor MCP setup for uDos

Use this guide to connect Cursor to the local `udo` MCP server and verify tool calls end-to-end.

## Prerequisites

- Repo cloned locally (`uDos`)
- Rust toolchain installed
- `core-rs` builds locally (`cargo test` passes in `core-rs/`)

Optional for import conversion:

- `.local/markdownify-config.yaml` (copy from `dev/tools/markdownify-config.yaml.example`)
- MarkItDown installed in your Markdownify environment

## Cursor MCP server config

Configure a stdio MCP server in Cursor that launches:

- **Command:** `cargo`
- **Args:** `run --manifest-path core-rs/Cargo.toml -- mcp start`
- **Working directory:** `<repo-root>`
- **Environment (optional):**
  - `UDOS_MARKDOWNIFY_CONFIG=<repo-root>/.local/markdownify-config.yaml`

This starts the MCP transport implemented in `core-rs/src/mcp/server.rs`.

You can also start from the checked-in template:

- `dev/tools/cursor-mcp.json.example`

## Quick smoke test (without Cursor UI)

Run from repo root:

```bash
python3 - <<'PY'
import json, subprocess

def frame(obj):
    body = json.dumps(obj).encode()
    return f"Content-Length: {len(body)}\r\n\r\n".encode() + body

def read_msg(stream):
    headers = b""
    while b"\r\n\r\n" not in headers:
        chunk = stream.read(1)
        if not chunk:
            raise RuntimeError("EOF while reading headers")
        headers += chunk
    header_text = headers.decode()
    length = 0
    for line in header_text.split("\r\n"):
        if line.lower().startswith("content-length:"):
            length = int(line.split(":", 1)[1].strip())
    body = stream.read(length)
    return json.loads(body.decode())

p = subprocess.Popen(
    ["cargo", "run", "--manifest-path", "core-rs/Cargo.toml", "--", "mcp", "start"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.DEVNULL,
)

requests = [
    {"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}},
    {"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}},
    {"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}},
    {"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "markdownify.status", "arguments": {}}},
]

for req in requests:
    p.stdin.write(frame(req))
    p.stdin.flush()
    if "id" in req:
        resp = read_msg(p.stdout)
        print(json.dumps(resp, indent=2))

p.terminate()
PY
```

Expected:

- `initialize` returns protocol + tool capability payload
- `tools/list` returns a non-empty tool list
- `tools/call` for `markdownify.status` returns structured JSON status

## First tools to validate in Cursor

- `tools/list`
- `tools/call` with `markdownify.status`
- `tools/call` with `diagram.fonts.list` (if FIGlet is installed)

## Known constraints (current alpha)

- Tool schemas are permissive (`additionalProperties: true`) while tool contracts are being hardened.
- `markdownify.import` depends on local MarkItDown runtime availability.
- Several namespaces are still explicit A2 stubs by design (`sync.*`, `agent.*`, etc.).
