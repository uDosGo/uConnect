# uDos MCP Gateway

A unified Rust-based gateway that provides access to all uDos tools and engines through a single MCP (Message Control Protocol) endpoint.

## Features

- **Single Endpoint**: All tools accessible via `/mcp`
- **Multi-Engine Routing**: Automatically routes to Re3Engine, Hivemind, or local Rust implementations
- **Vault Operations**: Direct filesystem operations for secure file management
- **Standalone Operation**: Works even when external engines are unavailable
- **JSON-RPC 2.0**: Standard protocol for easy integration

## Architecture

```
DevStudio (React) → MCP Gateway (Rust) → [Re3Engine | Hivemind | Local Tools]
```

## Tools Available

### Reasoning Tools (Forwarded to Re3Engine)
- `chat`: Conversational AI interface
- `reason`: Deep reasoning about problems
- `plan`: Step-by-step planning
- `batch`: Batch processing

### Orchestration Tools (Forwarded to Hivemind)
- `swarm`: Multi-agent coordination
- `task_decompose`: Task breakdown
- `agent_coordinate`: Agent communication

### Vault Tools (Direct Rust Implementation)
- `vault_read`: Read files from vault
- `vault_write`: Write files to vault
- `vault_list`: List directory contents
- `vault_search`: Search for files
- `vault_delete`: Move files to trash
- `vault_metadata`: Get file metadata

### Development Tools
- `code_generate`: Code generation
- `test_run`: Test execution

## Setup

### Prerequisites
- Rust 1.70+
- Cargo
- Python 3.9+ (for Re3Engine)
- Node.js (for Hivemind)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/mcp-gateway.git
cd mcp-gateway

# Build the gateway
cargo build --release

# Run the gateway
./target/release/mcp-gateway
```

### Configuration

Create a `.env` file:

```env
MCP_PORT=30000
RE3_ENGINE_URL=http://localhost:30001
HIVEMIND_URL=http://localhost:3010
UDOS_VAULT=/path/to/vault
```

## Usage

### Start the Gateway

```bash
cargo run --release
```

The gateway will be available at `http://localhost:30000/mcp`

### List Available Tools

```bash
curl -X POST http://localhost:30000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'
```

### Call a Tool

```bash
curl -X POST http://localhost:30000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "vault_list",
      "arguments": {"path": "/"}
    },
    "id": 1
  }'
```

## Integration with DevStudio

The gateway is designed to work seamlessly with DevStudio's chat interface:

```typescript
// DevStudio chat client
const response = await fetch('/api/chat/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'chat',
      arguments: { prompt: 'Hello, how can I help?' }
    },
    id: 1
  })
});
```

## Development

### Build

```bash
cargo build
```

### Test

```bash
cargo test
```

### Run

```bash
cargo run
```

## Security

- **Path Validation**: All vault operations validate paths to prevent directory traversal
- **Trash System**: Files are moved to trash instead of permanent deletion
- **Environment-Based Config**: Sensitive paths configured via environment variables

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Support

For issues or questions, please file an issue on GitHub.