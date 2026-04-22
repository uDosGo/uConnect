# 🌐 uDos Localhost Services

## Active Services

### 1. GUI Dashboard
- **URL**: http://localhost:5174
- **Port**: 5174
- **Purpose**: Main graphical interface for uDos
- **Features**: Surface management, command execution, theme switching
- **Status**: ✅ Running (auto-restart on failure)

### 2. USXD Express
- **URL**: http://localhost:3000
- **Port**: 3000 (configurable via `USXD_PORT`)
- **Purpose**: USXD surface preview and rendering
- **Features**: Live reload, WebSocket updates, surface validation
- **Demo Surface**: http://localhost:3000/surface/teletext-console
- **Commands**:
  ```bash
  # Start server
  udo usxd serve --dir surfaces
  
  # Export surfaces
  udo usxd export
  
  # Render to terminal
  udo usxd render surfaces/demo.md
  
  # Validate syntax
  udo usxd validate surfaces/demo.md
  ```

### 3. Vite Dev Server
- **URL**: http://localhost:5173
- **Port**: 5173
- **Purpose**: Development server for UI components
- **Status**: Available during development

## Service Management

### Start All Services
```bash
# Launch GUI and Vibe (includes API server)
~/code-vault/launch-udos.sh --vibe

# Start USXD Express in separate terminal
cd tools/usxd-express
udo usxd serve --dir surfaces

# Or start API server manually
cd tools/gui-api
npm start
```

### Check Service Status
```bash
# GUI status
./scripts/gui-launcher.sh status

# USXD Express status
lsof -i :3000

# View all localhost services
lsof -i -P -n | grep LISTEN | grep localhost
```

### Stop Services
```bash
# Stop GUI
./scripts/gui-launcher.sh stop

# Kill USXD Express (find PID first)
pkill -f "usxd-express"
```

## Service Discovery

### From GUI Dashboard
The sidebar includes direct links to all localhost services:
- 🎮 GUI Dashboard (5174)
- 🔌 GUI API Server (5175)
- 🎨 USXD Express (3000)
- 🌐 Vite Dev Server (5173)

### From Command Line
```bash
# List all listening ports
lsof -i -P -n | grep LISTEN

# Check specific port
lsof -i :3000

# Find process by name
pgrep -f "usxd-express"
```

## Common Ports

| Service | Port | Default URL |
|---------|------|-------------|
| GUI Dashboard | 5174 | http://localhost:5174 |
| GUI API Server | 5175 | http://localhost:5175 |
| USXD Express | 3000 | http://localhost:3000 |
| Vite Dev | 5173 | http://localhost:5173 |
| USXD Demo | 3000 | http://localhost:3000/surface/teletext-console |

## API Endpoints

### GUI API Server (Port 5175)

**Base URL**: http://localhost:5175

#### GET /api/vault/list
Returns vault contents as JSON array:
```json
[
  {
    "name": "README.md",
    "type": "file",
    "size": "2.4 KB",
    "modified": "2026-04-17"
  },
  {
    "name": "workflows",
    "type": "directory",
    "size": "-",
    "modified": "2026-04-15"
  }
]
```

#### POST /api/exec
Execute udo commands:
```bash
curl -X POST http://localhost:5175/api/exec \
  -H "Content-Type: application/json" \
  -d '{"command": "udo list"}'
```

Response:
```json
{
  "success": true,
  "output": "Command output..."
}
```

## Troubleshooting

### Port Conflicts
The GUI launcher automatically handles port conflicts:
1. Detects if port is in use
2. Attempts to kill conflicting process
3. Falls back to alternative port if needed

### Service Not Starting
```bash
# Check logs
./scripts/gui-launcher.sh logs

# Check USXD Express logs
cd tools/usxd-express
npm run dev
```

### Manual Port Change
Edit `scripts/gui-launcher.sh` and change:
```bash
GUI_PORT="${GUI_PORT:-5174}"  # Change to desired port
```

## Integration Points

### GUI → USXD Express
- USXD Surface includes direct links to http://localhost:3000
- Quick action buttons for common USXD commands
- Surface selector with preview functionality

### Vibe TUI → Services
- Vibe can execute commands to start/stop services
- Environment variables provide service URLs
- MCP bridge enables service-to-service communication

## Development Workflow

1. **Start GUI**: `./scripts/gui-launcher.sh start`
2. **Start USXD**: `udo usxd serve --dir surfaces`
3. **Open GUI**: http://localhost:5174
4. **Navigate to USXD Surface**: Click "USXD Renderer" in sidebar
5. **Start USXD Server**: Click "Start Server" button
6. **Open Demo**: Click "Open Surface" to view teletext-console

## Production Notes

- GUI runs on port 5174 to avoid conflicts with common dev ports
- USXD Express uses port 3000 (configurable)
- All services support auto-restart and monitoring
- Logs available for debugging and auditing

---

**Service Integration Complete!** 🌐
All localhost services are wired together and accessible from the main GUI dashboard.
