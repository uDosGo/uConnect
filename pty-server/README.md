# Micro PTY Server

WebSocket-based pseudo-terminal server for Micro terminal integration in ThinUI.

## Features

- **Three Modes**: Embed, Multi-Panel, and C64 Retro
- **WebSocket Protocol**: Real-time bidirectional communication
- **Session Management**: Tracks active connections
- **Command Handling**: Built-in commands (help, exit, clear, date)

## Installation

```bash
cargo build --release
```

## Usage

### Start the Server

```bash
./target/release/pty-server
```

The server will be available at `ws://localhost:3001/pty/{mode}`

### Available Modes

- `ws://localhost:3001/pty/embed` - Embed widget mode
- `ws://localhost:3001/pty/c64` - C64 retro mode
- `ws://localhost:3001/pty/panel_{id}` - Multi-panel mode

### Health Check

```bash
curl http://localhost:3001/health
```

### Connect with WebSocket Client

```javascript
// JavaScript client example
const socket = new WebSocket('ws://localhost:3001/pty/embed');

socket.onopen = () => {
  console.log('Connected to Micro PTY Server');
  socket.send('help');
};

socket.onmessage = (event) => {
  console.log('Received:', event.data);
};

socket.onclose = () => {
  console.log('Connection closed');
};
```

## Configuration

Create a `.env` file:

```env
PTY_PORT=3001
```

## Commands

| Command | Description |
|---------|-------------|
| `help` | Show help message |
| `exit` | Close connection |
| `clear` | Clear screen (ANSI escape) |
| `date` | Show current date |
| Any text | Echo back with timestamp |

## Mode-Specific Behavior

### Embed Mode
- Single terminal instance
- Basic command set
- Modern theme

### Multi-Panel Mode
- Each panel has unique ID
- Independent sessions
- Can be arranged in grid

### C64 Mode
- Commodore 64 BASIC theme
- Green phosphor colors
- Retro welcome message
- 40x25 character grid

## Architecture

```
ThinUI (Tauri) → WebSocket → PTY Server → Session Manager
```

## Integration with ThinUI

The PTY server is designed to work with the Micro terminal components:

1. **MicroEmbed**: Connects to `/pty/embed`
2. **MicroMultiPanel**: Connects to `/pty/panel_{id}` for each panel
3. **MicroC64**: Connects to `/pty/c64`

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

## Dependencies

- `warp` - WebSocket server
- `tokio` - Async runtime
- `uuid` - Session IDs
- `chrono` - Timestamp formatting
- `log` - Logging

## License

MIT

## Security

- Session isolation
- No authentication (for local development only)
- WebSocket-only (no HTTP endpoints except health check)

## Performance

- Supports multiple concurrent connections
- Lightweight message processing
- Minimal memory footprint

## Future Enhancements

- File system integration
- Command history persistence
- Authentication
- TLS support
- Custom command extensions