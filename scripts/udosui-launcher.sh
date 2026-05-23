#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# uDos UI Launcher — Linux/macOS entry point
# ═══════════════════════════════════════════════════════════════════
# Usage: bash scripts/udosui-launcher.sh [surface|--all|--menu-bar|dev]
#
# Unified port scheme:
#   ui (hub)  → 5173
#   proseui   → 5174
#   code3ui   → 5175
#   code4ui   → 5176
#   opsui     → 5177
#   gridui    → 5178
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
SURFACE_NAMES=(ui proseui code3ui code4ui opsui gridui)
SURFACE_PORTS=(5173 5174 5175 5176 5177 5178)
SURFACE_LABELS=(
  "🏠 UI Hub (index)"
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

# ── Kill process on port ────────────────────────────────────────
kill_port() {
  local port="$1"
  local pids
  pids=$(lsof -ti :"$port" 2>/dev/null)
  if [ -n "$pids" ]; then
    kill -9 $pids 2>/dev/null || true
  fi
}

# ── Start a surface (background, returns PID) ───────────────────
start_surface_bg() {
  local surface="$1"
  local default_port=$(get_surface_port "$surface")
  
  if [ -z "$default_port" ]; then
    echo "  ❌ Unknown surface: $surface"
    return 1
  fi
  
  local ui_dir="$CONNECT_DIR/$surface"
  
  if [ ! -d "$ui_dir" ]; then
    echo "  ❌ Surface directory not found: $ui_dir"
    return 1
  fi
  
  # Kill any existing process on this port first
  kill_port "$default_port"
  
  # Install deps if needed
  if [ ! -d "$ui_dir/node_modules" ]; then
    cd "$ui_dir"
    npm install >> "$LOG_FILE" 2>&1
    cd "$CONNECT_DIR"
  fi
  
  # Start vite in background
  cd "$ui_dir"
  nohup npx vite --port "$default_port" --host >> "$LOG_FILE" 2>&1 &
  local pid=$!
  cd "$CONNECT_DIR"
  
  echo "$pid"
}

# ── Start a surface (foreground, waits) ─────────────────────────
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
  
  # Kill any existing process on this port
  echo ""
  echo "  🔍 Checking port $default_port..."
  kill_port "$default_port"
  echo "  ✅ Port $default_port is free"
  
  # Start dev server
  echo ""
  echo "  🚀 Launching Vite dev server for $surface..."
  echo "     http://localhost:$default_port"
  echo ""
  
  cd "$ui_dir"
  
  # Start vite with verbose logging
  npx vite --port "$default_port" --open --debug 2>&1 | while IFS= read -r line; do
    echo "     $line"
  done >> "$LOG_FILE" 2>&1 &
  VITE_PID=$!
  echo $VITE_PID > "$PID_FILE"
  
  # Wait for server to be ready
  echo "  ⏳ Waiting for server to start..."
  for i in $(seq 1 30); do
    if curl -s "http://localhost:$default_port" > /dev/null 2>&1; then
      echo "  ✅ Server is ready! (PID: $VITE_PID)"
      echo "  🌐 http://localhost:$default_port"
      echo ""
      echo "  📝 Logs: $LOG_FILE"
      echo "  🛑 Press Ctrl+C to stop"
      echo ""
      {
        echo "  Server started (PID: $VITE_PID)"
        echo "  URL: http://localhost:$default_port"
      } >> "$LOG_FILE"
      # Wait for the process to finish (keeps terminal open)
      wait $VITE_PID
      exit 0
    fi
    sleep 1
  done
  
  echo "  ⚠️  Server may still be starting up..."
  echo "  🌐 Try http://localhost:$default_port in your browser"
  echo "  📝 Check logs: $LOG_FILE"
  echo ""
  wait $VITE_PID
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
  
  read -p "  Choice [1-6/a/q]: " choice
  
  case "$choice" in
    1|2|3|4|5|6)
      local idx=$((choice - 1))
      local name="${SURFACE_NAMES[$idx]}"
      echo ""
      start_surface "$name"
      ;;
    a|A)
      node "$CONNECT_DIR/scripts/udos.cjs" start --all
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

# ── Start menu bar app ──────────────────────────────────────────
start_menu_bar() {
  local swift_src="$CONNECT_DIR/scripts/udos-menu-bar.swift"
  local binary="/tmp/udos-menu-bar"

  if pgrep -f "udos-menu-bar" > /dev/null 2>&1; then
    echo "  ✅ Menu bar app already running (PID: $(pgrep -f 'udos-menu-bar'))"
    return 0
  fi

  echo "  🔨 Compiling menu bar app..."
  if swiftc -o "$binary" "$swift_src" 2>/dev/null; then
    echo "  ✅ Compiled: $binary"
    "$binary" &
    sleep 2
    if pgrep -f "udos-menu-bar" > /dev/null 2>&1; then
      echo "  ✅ Menu bar app started (PID: $(pgrep -f 'udos-menu-bar'))"
      echo "  🔄 Look for the 🍔 icon in your menu bar!"
    else
      echo "  ⚠️  Menu bar app may not have started"
    fi
  else
    echo "  ⚠️  Could not compile menu bar app (Swift may not be available)"
  fi
}

# ── Launch all surfaces ─────────────────────────────────────────
launch_all() {
  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║   🚀 uDos / Connect — Launching All Surfaces            ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""

  # Start all surfaces in background
  for name in "${SURFACE_NAMES[@]}"; do
    local port=$(get_surface_port "$name")
    local ui_dir="$CONNECT_DIR/$name"

    if [ ! -d "$ui_dir" ]; then
      echo "  ⚠️  Skipping $name (directory not found)"
      continue
    fi

    # Kill existing on this port
    kill_port "$port"

    # Install deps if needed (silently)
    if [ ! -d "$ui_dir/node_modules" ]; then
      echo "  📦 Installing deps for $name..."
      (cd "$ui_dir" && npm install >> "$LOG_FILE" 2>&1)
    fi

    (cd "$ui_dir" && nohup npx vite --port "$port" --host >> "$LOG_FILE" 2>&1 &)
    echo "  ✅ $name → http://localhost:$port"
  done

  # Start menu bar
  start_menu_bar

  echo ""
  echo "  📝 Logs: $LOG_FILE"
  echo "  🌐 Hub:  http://localhost:$(get_surface_port ui)"
  echo "  🛑 Press Ctrl+C to stop all"
  echo ""
  wait
}

# ── Main ────────────────────────────────────────────────────────
case "${1:-}" in
  --install)
    install_desktop
    ;;
  --all|-a)
    node "$CONNECT_DIR/scripts/udos.cjs" start --all
    ;;
  --all-server|--all-with-server)
    node "$CONNECT_DIR/scripts/udos.cjs" start --all --with-server
    ;;
  --server)
    node "$CONNECT_DIR/scripts/udos.cjs" start-server
    ;;
  --menu-bar|-m)
    node "$CONNECT_DIR/scripts/udos.cjs" menu-bar
    ;;
  dev|dev-mode)
    dev_mode
    ;;
  ui|proseui|code3ui|code4ui|opsui|gridui)
    node "$CONNECT_DIR/scripts/udos.cjs" start "$1"
    ;;
  "")
    # Default: launch hub index
    node "$CONNECT_DIR/scripts/udos.cjs" start "ui"
    ;;
  *)
    echo "❌ Unknown surface: $1"
    echo "   Usage: bash scripts/udosui-launcher.sh [surface|--all|--all-server|--server|--menu-bar|dev]"
    echo "   Surfaces: ui proseui code3ui code4ui opsui gridui dev"
    exit 1
    ;;
esac
