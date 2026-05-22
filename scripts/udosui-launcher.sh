#!/bin/bash
# uDos UI Launcher — Linux/macOS entry point
# Installs as: ~/.local/share/applications/udosui.desktop (Linux)
# Usage: bash scripts/udosui-launcher.sh
#
# For Linux: run this once to install the .desktop launcher:
#   bash scripts/udosui-launcher.sh --install

set -e

CONNECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UI_DIR="$CONNECT_DIR/proseui"
LOG_DIR="${HOME}/.udos"
LOG_FILE="$LOG_DIR/udosui.log"
PID_FILE="$LOG_DIR/udosui.pid"

mkdir -p "$LOG_DIR"

# ── Verbose startup ──────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   🚀 uDos / Connect — UI Launcher (proseui)             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  📂 Connect dir: $CONNECT_DIR"
echo "  📂 UI dir:      $UI_DIR"
echo "  📝 Log file:    $LOG_FILE"
echo "  ⏰ Started:     $(date +'%Y-%m-%d %H:%M:%S')"
echo ""

# Log startup
{
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "  uDos UI Launcher — $(date +'%Y-%m-%d %H:%M:%S')"
  echo "═══════════════════════════════════════════════════════════"
  echo "  Connect dir: $CONNECT_DIR"
  echo "  UI dir:      $UI_DIR"
} >> "$LOG_FILE"

# --install flag: create Linux .desktop entry
if [ "${1:-}" = "--install" ]; then
    DESKTOP_DIR="${HOME}/.local/share/applications"
    mkdir -p "$DESKTOP_DIR"
    cat > "$DESKTOP_DIR/udosui.desktop" <<-EOF
[Desktop Entry]
Name=uDos UI
Comment=uDos Connect — shared-infrastructure hub
Exec=${CONNECT_DIR}/scripts/udosui-launcher.sh
Icon=${CONNECT_DIR}/proseui/public/favicon.svg
Terminal=false
Type=Application
Categories=Development;Education;
StartupNotify=true
EOF
    chmod +x "$DESKTOP_DIR/udosui.desktop"
    echo "  ✅ Installed Linux desktop launcher: $DESKTOP_DIR/udosui.desktop"
    echo "  ℹ️  You can now find 'uDos UI' in your app menu."
    echo ""
    exit 0
fi

# ── Check prerequisites ──────────────────────────────────────
echo "  🔍 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "  ❌ Node.js is not installed. Please install Node.js v18+."
    echo "     https://nodejs.org/"
    echo ""
    exit 1
fi

NODE_VERSION=$(node -v)
echo "  ✅ Node.js $NODE_VERSION found"

if ! command -v npm &> /dev/null; then
    echo "  ❌ npm is not installed."
    echo ""
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "  ✅ npm v$NPM_VERSION found"

# ── Install dependencies ─────────────────────────────────────
echo ""
echo "  📦 Checking UI dependencies..."

if [ ! -d "$UI_DIR/node_modules" ]; then
    echo "  ⏳ Installing dependencies (this may take a minute)..."
    echo "     Running: npm install"
    echo ""
    cd "$UI_DIR"
    npm install 2>&1 | while IFS= read -r line; do
        echo "     $line"
    done
    echo ""
    echo "  ✅ Dependencies installed"
    {
        echo "  Dependencies installed"
    } >> "$LOG_FILE"
else
    echo "  ✅ Dependencies already installed ($(ls -1 "$UI_DIR/node_modules" 2>/dev/null | wc -l) packages)"
fi

# ── Find free port ───────────────────────────────────────────
echo ""
echo "  🔍 Checking port availability..."

PORT_HANDLER="$CONNECT_DIR/scripts/port-handler.sh"
if [ -f "$PORT_HANDLER" ]; then
    PORT=$(bash "$PORT_HANDLER" find 5173)
else
    # Fallback: manual port scan
    PORT=5173
    while lsof -i :"$PORT" &>/dev/null 2>&1; do
        PORT=$((PORT + 1))
    done
fi

echo "  ✅ Port $PORT is available"

# ── Start dev server ─────────────────────────────────────────
echo ""
echo "  🚀 Launching Vite dev server..."
echo "     http://localhost:$PORT"
echo ""

cd "$UI_DIR"

# Start vite with verbose logging
npx vite --port "$PORT" --open --debug 2>&1 | while IFS= read -r line; do
    echo "     $line"
done >> "$LOG_FILE" 2>&1 &
VITE_PID=$!
echo $VITE_PID > "$PID_FILE"

# Wait for server to be ready
echo "  ⏳ Waiting for server to start..."
for i in $(seq 1 30); do
    if curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
        echo "  ✅ Server is ready! (PID: $VITE_PID)"
        echo "  🌐 Open http://localhost:$PORT in your browser"
        echo ""
        echo "  📝 Logs: $LOG_FILE"
        echo "  🛑 Press Ctrl+C to stop"
        echo ""
        {
          echo "  Server started (PID: $VITE_PID)"
          echo "  URL: http://localhost:$PORT"
        } >> "$LOG_FILE"
        exit 0
    fi
    sleep 1
done

echo "  ⚠️  Server may still be starting up..."
echo "  🌐 Try http://localhost:$PORT in your browser"
echo "  📝 Check logs: $LOG_FILE"
echo ""
