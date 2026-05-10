#!/bin/bash
# uDos UI Launcher — Linux desktop entry point
# Installs as: ~/.local/share/applications/udosui.desktop
# Usage: bash scripts/udosui-launcher.sh
#
# For Linux: run this once to install the .desktop launcher:
#   bash scripts/udosui-launcher.sh --install

set -e

CONNECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UI_DIR="$CONNECT_DIR/ui"
LOG_DIR="${HOME}/.udos"
LOG_FILE="$LOG_DIR/udosui.log"
PID_FILE="$LOG_DIR/udosui.pid"

mkdir -p "$LOG_DIR"

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Starting uDos UI..." | tee -a "$LOG_FILE"

# --install flag: create Linux .desktop entry
if [ "${1:-}" = "--install" ]; then
    DESKTOP_DIR="${HOME}/.local/share/applications"
    mkdir -p "$DESKTOP_DIR"
    cat > "$DESKTOP_DIR/udosui.desktop" <<-EOF
[Desktop Entry]
Name=uDos UI
Comment=uDos Connect — shared-infrastructure hub
Exec=${CONNECT_DIR}/scripts/udosui-launcher.sh
Icon=${CONNECT_DIR}/ui/public/favicon.svg
Terminal=false
Type=Application
Categories=Development;Education;
StartupNotify=true
EOF
    chmod +x "$DESKTOP_DIR/udosui.desktop"
    echo "✅ Installed Linux desktop launcher: $DESKTOP_DIR/udosui.desktop" | tee -a "$LOG_FILE"
    exit 0
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+." | tee -a "$LOG_FILE" >&2
    exit 1
fi

# Install dependencies if needed
if [ ! -d "$UI_DIR/node_modules" ]; then
    echo "Installing UI dependencies..." | tee -a "$LOG_FILE"
    cd "$UI_DIR" && npm install >> "$LOG_FILE" 2>&1
fi

# Start the dev server
cd "$UI_DIR"
echo "Launching UI at http://localhost:5173" | tee -a "$LOG_FILE"
npx vite --port 5173 --open >> "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
echo "✅ uDos UI started (PID: $(cat "$PID_FILE"))" | tee -a "$LOG_FILE"
