#!/bin/bash

# uDosConnect Round Advancement Script
# Advances the project to the next development round

echo "🎮 uDosConnect Round Advancement"
echo "================================"
echo ""

# Check current round
if [ -f "ROUND_ADVANCEMENT.md" ]; then
    echo "✅ Round Advancement Plan found"
    echo ""
    echo "Current Status:"
    grep "## 📋 Current Status" -A 10 ROUND_ADVANCEMENT.md
    echo ""
else
    echo "❌ ROUND_ADVANCEMENT.md not found"
    exit 1
fi

# Create round 2 implementation files
echo "🔧 Setting up Round 2 implementation..."

# Create API endpoints directory
mkdir -p tools/gui-api/endpoints

# Create command execution endpoint
cat > tools/gui-api/endpoints/exec.ts << 'EOT'
import { Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function execCommand(req: Request, res: Response) {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({ success: false, error: 'Command required' });
    }
    
    console.log(`Executing: ${command}`);
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      return res.json({ success: false, output: stdout, error: stderr });
    }
    
    res.json({ success: true, output: stdout });
  } catch (error) {
    console.error('Command execution failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
EOT

# Create vault operations endpoint
cat > tools/gui-api/endpoints/vault.ts << 'EOT'
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const VAULT_PATH = process.env.VAULT_PATH || path.join(process.env.HOME || '', 'vault');

export async function listVaultContents(req: Request, res: Response) {
  try {
    if (!fs.existsSync(VAULT_PATH)) {
      return res.json([]);
    }
    
    const items = fs.readdirSync(VAULT_PATH).map(item => {
      const itemPath = path.join(VAULT_PATH, item);
      const stats = fs.statSync(itemPath);
      
      return {
        name: item,
        type: stats.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        modified: stats.mtime.toISOString()
      };
    });
    
    res.json(items);
  } catch (error) {
    console.error('Failed to list vault:', error);
    res.status(500).json({ error: 'Failed to list vault contents' });
  }
}

export async function createDirectory(req: Request, res: Response) {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name required' });
    }
    
    const dirPath = path.join(VAULT_PATH, name);
    
    if (fs.existsSync(dirPath)) {
      return res.status(400).json({ success: false, error: 'Directory already exists' });
    }
    
    fs.mkdirSync(dirPath);
    res.json({ success: true, path: dirPath });
  } catch (error) {
    console.error('Failed to create directory:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
EOT

# Update main API server
cat > tools/gui-api/server.js << 'EOT'
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5175;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
const vaultRoutes = require('./endpoints/vault');
const execRoutes = require('./endpoints/exec');

app.use('/api/vault', vaultRoutes);
app.use('/api/exec', execRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`GUI API Server running on http://localhost:${PORT}`);
});
EOT

# Update package.json for API server
cat > tools/gui-api/package.json << 'EOT'
{
  "name": "udos-gui-api",
  "version": "1.0.0",
  "description": "uDosConnect GUI API Server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/node": "^20.4.2"
  }
}
EOT

# Create TypeScript config for API
cat > tools/gui-api/tsconfig.json << 'EOT'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
EOT

# Update GUI launcher to start API server
echo ""
echo "📝 Updating GUI launcher..."

# Backup original launcher
cp scripts/gui-launcher.sh scripts/gui-launcher.sh.bak

# Create new launcher with API server support
cat > scripts/gui-launcher.sh << 'EOT'
#!/bin/bash

# uDosConnect GUI Launcher with API Server
# Enhanced with process monitoring and auto-restart

set -e

# Configuration
GUI_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../ui" && pwd)"
API_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../tools/gui-api" && pwd)"
LOG_FILE="${HOME}/.udos/gui.log"
PID_FILE="${HOME}/.udos/gui.pid"
API_PID_FILE="${HOME}/.udos/gui-api.pid"

# Port configuration
PRIMARY_PORT=5174
FALLBACK_PORTS=(5176 5177 5178)
API_PORT=5175

# Ensure directories exist
mkdir -p "$(dirname "$LOG_FILE")"

# Logging functions
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1" | tee -a "$LOG_FILE" >&2
}

# Check if port is available
port_available() {
    ! lsof -i :"$1" -sTCP:LISTEN -t >/dev/null 2>&1
}

# Find available port
find_available_port() {
    if port_available "$PRIMARY_PORT"; then
        echo "$PRIMARY_PORT"
        return
    fi
    
    for port in "${FALLBACK_PORTS[@]}"; do
        if port_available "$port"; then
            echo "$port"
            return
        fi
    done
    
    error "No available ports found"
    exit 1
}

# Start API server
start_api_server() {
    log "Starting GUI API Server on port $API_PORT..."
    
    cd "$API_DIR"
    
    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js to run the API server."
        return 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log "Installing API server dependencies..."
        npm install > /dev/null 2>&1 || {
            error "Failed to install API dependencies"
            return 1
        }
    fi
    
    # Start API server in background
    node server.js > "${HOME}/.udos/gui-api.log" 2>&1 &
    API_PID=$!
    echo "$API_PID" > "$API_PID_FILE"
    
    log "API Server started with PID $API_PID"
    
    # Wait for server to start
    sleep 2
    
    if ! kill -0 "$API_PID" 2>/dev/null; then
        error "API Server failed to start"
        rm -f "$API_PID_FILE"
        return 1
    fi
    
    return 0
}

# Stop API server
stop_api_server() {
    if [ -f "$API_PID_FILE" ]; then
        API_PID=$(cat "$API_PID_FILE")
        if kill -0 "$API_PID" 2>/dev/null; then
            log "Stopping API Server (PID: $API_PID)..."
            kill "$API_PID"
            rm -f "$API_PID_FILE"
        fi
    fi
}

# Start GUI
start_gui() {
    local port=$1
    log "Starting GUI on port $port..."
    
    cd "$GUI_DIR"
    
    # Start GUI in background
    npm run dev -- --port "$port" > "${HOME}/.udos/gui.log" 2>&1 &
    GUI_PID=$!
    echo "$GUI_PID" > "$PID_FILE"
    
    log "GUI started with PID $GUI_PID on port $port"
    
    # Wait for GUI to start
    sleep 3
    
    if ! kill -0 "$GUI_PID" 2>/dev/null; then
        error "GUI failed to start"
        rm -f "$PID_FILE"
        return 1
    fi
    
    log "GUI is running at http://localhost:$port"
    return 0
}

# Stop GUI
stop_gui() {
    if [ -f "$PID_FILE" ]; then
        GUI_PID=$(cat "$PID_FILE")
        if kill -0 "$GUI_PID" 2>/dev/null; then
            log "Stopping GUI (PID: $GUI_PID)..."
            kill "$GUI_PID"
            rm -f "$PID_FILE"
        fi
    fi
}

# Check status
status() {
    echo "GUI Launcher Status:"
    echo "-------------------"
    
    if [ -f "$API_PID_FILE" ]; then
        API_PID=$(cat "$API_PID_FILE")
        if kill -0 "$API_PID" 2>/dev/null; then
            echo "✅ API Server: Running (PID: $API_PID, Port: $API_PORT)"
        else
            echo "❌ API Server: Not running (PID file exists but process dead)"
        fi
    else
        echo "❌ API Server: Not running"
    fi
    
    if [ -f "$PID_FILE" ]; then
        GUI_PID=$(cat "$PID_FILE")
        if kill -0 "$GUI_PID" 2>/dev/null; then
            echo "✅ GUI: Running (PID: $GUI_PID)"
        else
            echo "❌ GUI: Not running (PID file exists but process dead)"
        fi
    else
        echo "❌ GUI: Not running"
    fi
}

# Show logs
logs() {
    if [ -f "$LOG_FILE" ]; then
        echo "GUI Launcher Logs:"
        echo "------------------"
        tail -n 50 "$LOG_FILE"
    else
        echo "No logs available"
    fi
}

# Main command handling
case "$1" in
    start)
        log "Starting uDosConnect GUI..."
        
        # Start API server first
        if ! start_api_server; then
            error "Failed to start API server"
            exit 1
        fi
        
        # Find available port
        PORT=$(find_available_port)
        
        # Start GUI
        if ! start_gui "$PORT"; then
            error "Failed to start GUI"
            stop_api_server
            exit 1
        fi
        
        log "uDosConnect GUI started successfully!"
        log "GUI: http://localhost:$PORT"
        log "API: http://localhost:$API_PORT"
        ;;
    
    stop)
        log "Stopping uDosConnect GUI..."
        stop_gui
        stop_api_server
        log "GUI stopped"
        ;;
    
    restart)
        log "Restarting uDosConnect GUI..."
        stop_gui
        stop_api_server
        sleep 2
        
        if ! start_api_server; then
            error "Failed to restart API server"
            exit 1
        fi
        
        PORT=$(find_available_port)
        
        if ! start_gui "$PORT"; then
            error "Failed to restart GUI"
            stop_api_server
            exit 1
        fi
        
        log "GUI restarted successfully"
        ;;
    
    status)
        status
        ;;
    
    logs)
        logs
        ;;
    
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
EOT

chmod +x scripts/gui-launcher.sh

# Install API dependencies
echo ""
echo "📦 Installing API server dependencies..."
cd tools/gui-api
npm install > /dev/null 2>&1

echo ""
echo "✅ Round 2 setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the enhanced launcher: ./scripts/gui-launcher.sh start"
echo "2. The API server will start on port 5175"
echo "3. The GUI will start on an available port"
echo "4. Begin wiring GUI buttons to real commands"
echo ""
echo "Documentation: ROUND_ADVANCEMENT.md"
