# MCP Gateway - Unified Rust Server for uDos

A production-ready Rust server that provides a **single MCP endpoint** for all uDos tools, routing requests to the appropriate engine (Re3Engine, Hivemind, or direct filesystem operations).

## Features

### ✅ Unified MCP Endpoint
- Single endpoint: `http://localhost:30000/mcp`
- JSON-RPC 2.0 compatible
- CORS-enabled for web clients

### ✅ Tool Categories

| Category | Tools | Engine | Status |
|----------|-------|--------|--------|
| **Reasoning** | `chat`, `reason`, `plan`, `batch` | Python Re3Engine | ✅ Forwarding |
| **Orchestration** | `swarm`, `task_decompose`, `agent_coordinate` | Hivemind | ✅ Forwarding |
| **Vault/FS** | `vault_read`, `vault_write`, `vault_list`, `vault_search`, `vault_delete`, `vault_metadata` | Direct Rust | ✅ Native |
| **Dev Tools** | `code_generate`, `test_run` | Re3Engine | ✅ Forwarding |

### ✅ Security
- **Path traversal prevention**: All vault paths canonicalized and validated
- **Trash system**: Files moved to `~/vault/.trash/` instead of permanent deletion
- **Environment-based config**: Read from `UDOS_VAULT`, `RE3ENGINE_URL`, `HIVEMIND_URL`
- **CORS**: Permissive CORS for development (tighten for production)

### ✅ Performance
- **Rust-based**: Fast, memory-efficient, production-ready
- **Async I/O**: Tokio runtime for concurrent operations
- **Zero-copy JSON**: Efficient serialization with serde_json

## Quick Start

### 1. Build

```bash
cd ~/uDos/core/mcp-gateway
cargo build --release
```

### 2. Run

```bash
./target/release/mcp-gateway
```

Server listens on `http://localhost:30000/mcp`

### 3. Configure (optional)

```bash
export UDOS_VAULT="~/vault"              # Default: ~/vault
export RE3ENGINE_URL="http://localhost:30001"  # Default: http://localhost:30001
export HIVEMIND_URL="http://localhost:3010"     # Default: http://localhost:3010
```

## API Examples

### List Available Tools

```bash
curl -X POST http://localhost:30000/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/list", "id": 1}'
```

### Call a Tool (Vault Read)

```bash
curl -X POST http://localhost:30000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "vault_read",
      "arguments": {"path": "notes/test.md"}
    },
    "id": 1
  }'
```

### Call a Tool (Chat with Re3Engine)

```bash
curl -X POST http://localhost:30000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "chat",
      "arguments": {"message": "Hello from DevStudio!"}
    },
    "id": 1
  }'
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DevStudio / Chat Client                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    MCP Gateway (Rust)                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
│  │  │ Tool Router  │  │ Auth/Rate    │  │ Session Mgr  │      │  │
│  │  └──────┬───────┘  └──────────────┘  └──────────────┘      │  │
│  │         │                                               │  │
│  │         └──────────────┬───────────────┬──────────────┘      │  │
│  │                        │               │                    │  │
│  │          ┌─────────────┴─────┐   ┌─────┴─────────────┐      │  │
│  │          │  Re3Engine        │   │  Hivemind         │      │  │
│  │          │  (Python)         │   │  (Rust/Typescript)│      │  │
│  │          │  • Deep reasoning │   │  • Task routing   │      │  │
│  │          │  • Planning       │   │  • Multi-agent    │      │  │
│  │          └───────────────────┘   └───────────────────┘      │  │
│  │                    │                       │              │  │
│  │                    └───────────┬───────────┘              │  │
│  │                                │                          │  │
│  │                        ┌───────┴───────┐                  │  │
│  │                        │  Shared Tools │                  │  │
│  │                        │  • Vault ops  │                  │  │
│  │                        │  • File system│                  │  │
│  │                        └───────────────┘                  │  │
└─────────────────────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `UDOS_VAULT` | `~/vault` | Root directory for vault operations |
| `RE3ENGINE_URL` | `http://localhost:30001` | Python Re3Engine endpoint |
| `HIVEMIND_URL` | `http://localhost:3010` | Hivemind orchestrator endpoint |
| `RUST_LOG` | `info` | Log level (trace, debug, info, warn, error) |

### Example `.env`

```env
UDOS_VAULT=/Users/fredbook/vault
RE3ENGINE_URL=http://localhost:30001
HIVEMIND_URL=http://localhost:3010
RUST_LOG=debug
```

## Development

### Build

```bash
cargo build      # Debug build
cargo build --release  # Optimized build
```

### Run

```bash
cargo run        # Development mode
./target/release/mcp-gateway  # Production mode
```

### Test

```bash
cargo test
```

## Deployment

### Docker

```dockerfile
FROM rust:1.70
WORKDIR /app
COPY . .
RUN cargo build --release
CMD ["./target/release/mcp-gateway"]
```

Build and run:
```bash
docker build -t mcp-gateway .
docker run -p 30000:30000 -e UDOS_VAULT=/vault mcp-gateway
```

### Systemd

Create `/etc/systemd/system/mcp-gateway.service`:
```ini
[Unit]
Description=MCP Gateway for uDos
After=network.target

[Service]
User=fredbook
Environment="UDOS_VAULT=/home/fredbook/vault"
Environment="RE3ENGINE_URL=http://localhost:30001"
Environment="HIVEMIND_URL=http://localhost:3010"
ExecStart=/home/fredbook/Code/uDosGo/core/mcp-gateway/target/release/mcp-gateway
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable mcp-gateway
sudo systemctl start mcp-gateway
```

## Integration with DevStudio

The gateway is designed to work seamlessly with **@assistant-ui/react** in DevStudio:

```tsx
// DevStudio/src/components/ChatPanel.tsx
import { useAssistant } from "@assistant-ui/react";

const runtime = useAssistant({
  api: "/api/chat/mcp",  // Next.js proxy to Rust gateway
});
```

Create a Next.js API route that proxies to the Rust gateway:

```ts
// DevStudio/src/pages/api/chat/mcp.ts
import type { NextApiRequest, NextApiResponse } from "next";

const MCP_GATEWAY = process.env.MCP_GATEWAY_URL || "http://localhost:30000/mcp";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = await fetch(MCP_GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });
  
  const data = await response.json();
  res.status(response.status).json(data);
}
```

## Error Handling

The gateway provides detailed error messages:

- **Connection errors**: When Re3Engine or Hivemind are unavailable
- **Validation errors**: Invalid tool names or arguments
- **Permission errors**: Attempts to access files outside vault root
- **Not found**: Unknown tools or missing files

Example error response:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32000,
    "message": "Failed to connect to Re3Engine: Connection refused"
  }
}
```

## Future Enhancements

- [ ] Authentication (JWT, API keys)
- [ ] Rate limiting
- [ ] Request logging
- [ ] Metrics (Prometheus)
- [ ] Health checks
- [ ] WebSocket support for real-time updates
- [ ] Plugin system for custom tools

## License

MIT
