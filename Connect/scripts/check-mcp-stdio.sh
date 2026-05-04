#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${repo_root}"

python3 - <<'PY'
import json
import subprocess
import sys

def frame(obj):
    body = json.dumps(obj).encode()
    return f"Content-Length: {len(body)}\r\n\r\n".encode() + body

def read_msg(stream):
    headers = b""
    while b"\r\n\r\n" not in headers:
        chunk = stream.read(1)
        if not chunk:
            raise RuntimeError("EOF while reading MCP headers")
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

try:
    requests = [
        {"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}},
        {"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}},
        {"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}},
        {"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "markdownify.status", "arguments": {}}},
    ]

    init_ok = False
    tools_count = 0
    status_ok = False

    for req in requests:
        p.stdin.write(frame(req))
        p.stdin.flush()
        if "id" not in req:
            continue
        resp = read_msg(p.stdout)
        if req["id"] == 1:
            init_ok = resp.get("result", {}).get("protocolVersion") == "2024-11-05"
        elif req["id"] == 2:
            tools = resp.get("result", {}).get("tools", [])
            tools_count = len(tools)
        elif req["id"] == 3:
            sc = resp.get("result", {}).get("structuredContent", {})
            status_ok = bool(sc.get("ok"))

    if not init_ok:
        raise RuntimeError("initialize did not return expected protocolVersion")
    if tools_count == 0:
        raise RuntimeError("tools/list returned zero tools")
    if not status_ok:
        raise RuntimeError("tools/call markdownify.status did not return ok=true")

    print(f"[mcp-smoke] initialize ok, tools={tools_count}, markdownify.status ok")
finally:
    p.terminate()
PY
