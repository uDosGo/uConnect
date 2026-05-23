#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# uDos UI Launcher — Linux/macOS entry point
# ═══════════════════════════════════════════════════════════════════
# Installs as: ~/.local/share/applications/udosui.desktop (Linux)
# Usage: bash scripts/udosui-launcher.sh [surface_name]
#
# Surfaces:
#   proseui  — Prose Editor (default)  → port 5173
#   code3ui  — Code Editor v3          → port 5174
#   code4ui  — Code Editor v4          → port 5175
#   opsui    — Server Operations       → port 5176
#   gridui   — Grid Workspace          → port 5177
#   dev      — Dev Mode: surface picker
#
# For Linux: run this once to install the .desktop launcher:
#   bash scripts/udosui-launcher.sh --install

set -e

CONNECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="${HOME}/.udos"
LOG_FILE="$LOG_DIR/udosui.log"
PID_FILE="$LOG_DIR/udosui.pid"

mkdir -p "$LOG_DIR"

# ── Port registry ───────────────────────────────────────────────
# Using indexed arrays for macOS bash 3.2 compatibility
SURFACE_NAMES=(proseui code3ui code4ui opsui gridui)
SURFACE_PORTS=(5173 5174 5175 5176 5177)
SURFACE_LABELS=(
  "📝 Prose Editor (proseui)"
  "💻 Code Editor v3 (code3ui)"
  "🖥️  Code Editor v4 (code4ui)"
  "⚙️  Server Ops (opsui)"
  "📊 Grid Workspace (gridui)"
)

get_surface_port() {
  local name="$1"
  for i in "${!SURFACE_NAMES[@]}"; do
    if [ "${SURFACE_NAMES[$i]}" = "$name" ]; then
      echo "${SURFACE_PORTS[$i]}"
      return 0
    fi
  done
  return 1
}

# ── Verbose startup ─────────────────────────────────────────────
print_banner() {
  local surface="$1"
  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║   🚀 uDos / Connect — UI Launcher                       ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""
  echo "  📂 Connect dir: $CONNECT_DIR"
  echo "  🖥️  Surface:     ${surface:-proseui}"
  echo "  📝 Log file:    $LOG_FILE"
  echo "  ⏰ Started:     $(date +'%Y-%m-%d %H:%M:%S')"
  echo ""
}

log_startup() {
  local surface="$1"
  {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  uDos UI Launcher — $(date +'%Y-%m-%d %H:%M:%S')"
    echo "  Surface: $surface"
    echo "═══════════════════════════════════════════════════════════"
    echo "  Connect dir: $CONNECT_DIR"
  } >> "$LOG_FILE"
}

# ── Install Linux desktop entry ─────────────────────────────────
install_desktop() {
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
}

# ── Check prerequisites ─────────────────────────────────────────
check_prereqs() {
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
}

# ── Install dependencies ────────────────────────────────────────
install_deps() {
  local ui_dir="$1"
  echo ""
  echo "  📦 Checking UI dependencies..."
  
  if [ ! -d "$ui_dir/node_modules" ]; then
    echo "  ⏳ Installing dependencies (this may take a minute)..."
    echo "     Running: npm install"
    echo ""
    cd "$ui_dir"
    npm install 2>&1 | while IFS= read -r line; do
      echo "     $line"
    done
    echo ""
    echo "  ✅ Dependencies installed"
    {
      echo "  Dependencies installed"
    } >> "$LOG_FILE"
  else
    echo "  ✅ Dependencies already installed ($(ls -1 "$ui_dir/node_modules" 2>/dev/null | wc -l) packages)"
  fi
}

# ── Find free port ──────────────────────────────────────────────
find_free_port() {
  local base_port="$1"
  local port="$base_port"
  
  while lsof -i :"$port" &>/dev/null 2>&1; do
    port=$((port + 1))
  done
  
  echo "$port"
}

# ── Start a surface ─────────────────────────────────────────────
start_surface() {
  local surface="$1"
  local default_port=$(get_surface_port "$surface")
  
  if [ -z "$default_port" ]; then
    echo "  ❌ Unknown surface: $surface"
    echo "     Available: ${SURFACE_NAMES[*]}"
    exit 1
  fi
  
  local ui_dir="$CONNECT_DIR/$surface"
  
  if [ ! -d "$ui_dir" ]; then
    echo "  ❌ Surface directory not found: $ui_dir"
    exit 1
  fi
  
  print_banner "$surface"
  log_startup "$surface"
  check_prereqs
  install_deps "$ui_dir"
  
  # Find free port
  echo ""
  echo "  🔍 Checking port availability..."
  local port=$(find_free_port "$default_port")
  
  if [ "$port" != "$default_port" ]; then
    echo "  ⚠️  Default port $default_port was in use, using $port instead"
  fi
  echo "  ✅ Port $port is available"
  
  # Start dev server
  echo ""
  echo "  🚀 Launching Vite dev server for $surface..."
  echo "     http://localhost:$port"
  echo ""
  
  cd "$ui_dir"
  
  # Start vite with verbose logging
  npx vite --port "$port" --open --debug 2>&1 | while IFS= read -r line; do
    echo "     $line"
  done >> "$LOG_FILE" 2>&1 &
  VITE_PID=$!
  echo $VITE_PID > "$PID_FILE"
  
  # Wait for server to be ready
  echo "  ⏳ Waiting for server to start..."
  for i in $(seq 1 30); do
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
      echo "  ✅ Server is ready! (PID: $VITE_PID)"
      echo "  🌐 http://localhost:$port"
      echo ""
      echo "  📝 Logs: $LOG_FILE"
      echo "  🛑 Press Ctrl+C to stop"
      echo ""
      {
        echo "  Server started (PID: $VITE_PID)"
        echo "  URL: http://localhost:$port"
      } >> "$LOG_FILE"
      exit 0
    fi
    sleep 1
  done
  
  echo "  ⚠️  Server may still be starting up..."
  echo "  🌐 Try http://localhost:$port in your browser"
  echo "  📝 Check logs: $LOG_FILE"
  echo ""
}

# ── Dev Mode: surface picker ────────────────────────────────────
dev_mode() {
  print_banner "dev"
  log_startup "dev"
  check_prereqs
  
  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║   🛠️  uDos Dev Mode — Surface Selector                   ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""
  echo "  Select a surface to launch:"
  echo ""
  
  for i in "${!SURFACE_NAMES[@]}"; do
    local port="${SURFACE_PORTS[$i]}"
    local status="🟢"
    if lsof -i :"$port" &>/dev/null 2>&1; then
      status="🔴"
    fi
    echo "    $((i+1))) ${SURFACE_LABELS[$i]}  ${status} :$port"
  done
  
  echo "    a) 🚀 Launch ALL surfaces"
  echo "    q) Quit"
  echo ""
  
  read -p "  Choice [1-5/a/q]: " choice
  
  case "$choice" in
    1|2|3|4|5)
      local idx=$((choice - 1))
      local name="${SURFACE_NAMES[$idx]}"
      echo ""
      start_surface "$name"
      ;;
    a|A)
      echo ""
      echo "  🚀 Launching all surfaces..."
      echo ""
      for name in "${SURFACE_NAMES[@]}"; do
        local port=$(get_surface_port "$name")
        local ui_dir="$CONNECT_DIR/$name"
        
        if [ ! -d "$ui_dir" ]; then
          echo "  ⚠️  Skipping $name (directory not found)"
          continue
        fi
        
        install_deps "$ui_dir"
        
        local free_port=$(find_free_port "$port")
        cd "$ui_dir"
        npx vite --port "$free_port" --debug 2>&1 | while IFS= read -r line; do
          echo "     [$name] $line"
        done >> "$LOG_FILE" 2>&1 &
        
        echo "  ✅ $name → http://localhost:$free_port (PID: $!)"
      done
      echo ""
      echo "  📝 Logs: $LOG_FILE"
      echo "  🛑 Press Ctrl+C to stop all"
      echo ""
      # Wait forever
      wait
      ;;
    q|Q)
      echo ""
      echo "  👋 Goodbye!"
      echo ""
      exit 0
      ;;
    *)
      echo ""
      echo "  ❌ Invalid choice. Please try again."
      echo ""
      dev_mode
      ;;
  esac
}

# ── Main ────────────────────────────────────────────────────────
case "${1:-}" in
  --install)
    install_desktop
    ;;
  dev|dev-mode)
    dev_mode
    ;;
  proseui|code3ui|code4ui|opsui|gridui)
    start_surface "$1"
    ;;
  "")
    # Default: launch proseui
    start_surface "proseui"
    ;;
  *)
    echo "❌ Unknown surface: $1"
    echo "   Usage: bash scripts/udosui-launcher.sh [surface|dev]"
    echo "   Surfaces: proseui code3ui code4ui opsui gridui dev"
    exit 1
    ;;
esac
