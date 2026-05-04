#!/bin/bash
# uDosConnect — one-click launcher (macOS). Double-click in Finder to open Terminal and GUI.
set -euo pipefail

echo "🎮 Starting uDosConnect"

# Get script directory and root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UDOS_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if uDosConnect is properly set up
if [[ ! -d "$UDOS_ROOT/core" ]]; then
  echo "❌ uDosConnect not found at $UDOS_ROOT"
  echo "Please ensure you're in the uDosConnect repository root."
  read -r -n 1 -s
  exit 1
fi

# Install dependencies if needed
if [[ ! -f "$UDOS_ROOT/core/bin/udo.mjs" ]]; then
  echo "🔧 Installing dependencies"
  if command -v pnpm &> /dev/null; then
    (cd "$UDOS_ROOT" && pnpm install --silent)
  elif command -v npm &> /dev/null; then
    (cd "$UDOS_ROOT" && npm install --silent)
  else
    echo "❌ Neither pnpm nor npm found. Please install Node.js."
    read -r -n 1 -s
    exit 1
  fi
fi

# Build core if needed
if [[ ! -f "$UDOS_ROOT/core/dist/index.js" ]]; then
  echo "🔨 Building core"
  (cd "$UDOS_ROOT/core" && npm run build --silent) 2>/dev/null || true
fi

# Start GUI in the background
GUI_PORT=5176
# Check if GUI is already running
if ! nc -z localhost $GUI_PORT; then
  echo "🌐 Starting GUI server on port $GUI_PORT"
  (cd "$UDOS_ROOT/ui" && npm run dev -- --port $GUI_PORT > /tmp/udos-gui.log 2>&1 &)
  
  # Wait for GUI to start
  echo "⏳ Waiting for GUI to initialize"
  for i in {1..30}; do
    if lsof -i :$GUI_PORT -sTCP:LISTEN -t >/dev/null; then
      echo "✅ GUI server started successfully!"
      break
    fi
    if [[ $i -eq 30 ]]; then
      echo "⚠️ GUI server took too long to start"
      echo "Check logs: tail -f /tmp/udos-gui.log"
    fi
    sleep 1
  done
else
  echo "✅ GUI server already running on port $GUI_PORT"
fi

# Open GUI in browser
if command -v open &> /dev/null; then
  echo "🚀 Opening uDosConnect GUI in browser"
  open "http://localhost:$GUI_PORT" || true
else
  echo "ℹ️ GUI available at: http://localhost:$GUI_PORT"
fi

# Run CLI command if provided, otherwise show help
UDO_BIN="$UDOS_ROOT/core/bin/udo.mjs"
if [[ ${#} -gt 0 ]]; then
  echo "📍 Running command: udo ${*}"
  node "$UDO_BIN" "$@"
  exit_code=$?
else
  echo ""
  echo "🎮 uDosConnect is ready!"
  echo ""
  echo "🌐 GUI Dashboard: http://localhost:$GUI_PORT"
  echo "💡 Try these commands:"
  echo "   udo status          - Check system status"
  echo "   udo list            - List vault contents"
  echo "   udo vibe            - Start Vibe TUI"
  echo "   udo dev start       - Enable Dev Mode"
  echo "   udo gui demos       - Show demo surfaces"
  echo ""
  echo "Press any key to close this window"
  read -r -n 1 -s
  exit_code=0
fi

if [[ $exit_code -ne 0 ]]; then
  echo ""
  echo "❌ Command failed with exit code $exit_code"
  echo "Press any key to close"
  read -r -n 1 -s
fi
exit "$exit_code"
