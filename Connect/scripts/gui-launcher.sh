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
