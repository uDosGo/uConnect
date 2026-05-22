#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# uConnect Port Handler — Find & manage ports for all uConnect UIs
# ═══════════════════════════════════════════════════════════════════
# Usage:
#   bash scripts/port-handler.sh find [base_port]   # Find next free port
#   bash scripts/port-handler.sh kill [port]         # Kill process on port
#   bash scripts/port-handler.sh list                # List all uConnect ports
#   bash scripts/port-handler.sh start [project]     # Start a project's dev server
#   bash scripts/port-handler.sh status              # Show running servers

set -e

CONNECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ── Port registry: project → default port ──────────────────────
# (Using indexed arrays for macOS bash 3.2 compatibility)
PROJECT_NAMES=(proseui code4ui code3ui gridui)
PROJECT_PORTS=(5173 5175 5176 5177)

get_project_port() {
  local name="$1"
  for i in "${!PROJECT_NAMES[@]}"; do
    if [ "${PROJECT_NAMES[$i]}" = "$name" ]; then
      echo "${PROJECT_PORTS[$i]}"
      return 0
    fi
  done
  return 1
}

# ── Help ────────────────────────────────────────────────────────
show_help() {
  echo "uConnect Port Handler"
  echo ""
  echo "Usage:"
  echo "  bash scripts/port-handler.sh find [base_port]   Find next free port"
  echo "  bash scripts/port-handler.sh kill [port]         Kill process on port"
  echo "  bash scripts/port-handler.sh list                List all uConnect ports"
  echo "  bash scripts/port-handler.sh start [project]     Start a project's dev server"
  echo "  bash scripts/port-handler.sh status              Show running servers"
  echo ""
  echo "Projects:"
  for i in "${!PROJECT_NAMES[@]}"; do
    echo "  ${PROJECT_NAMES[$i]} → port ${PROJECT_PORTS[$i]}"
  done
}

# ── Find free port ──────────────────────────────────────────────
find_free_port() {
  local base_port="${1:-5173}"
  local port="$base_port"
  
  while lsof -i :"$port" &>/dev/null 2>&1; do
    port=$((port + 1))
  done
  
  echo "$port"
}

# ── Kill process on port ────────────────────────────────────────
kill_port() {
  local port="$1"
  if [ -z "$port" ]; then
    echo "❌ Usage: port-handler.sh kill <port>"
    exit 1
  fi
  
  local pids
  pids=$(lsof -ti :"$port" 2>/dev/null)
  
  if [ -n "$pids" ]; then
    echo "🔫 Killing process(es) on port $port: $pids"
    kill -9 $pids 2>/dev/null
    echo "✅ Port $port freed"
  else
    echo "ℹ️  Port $port is already free"
  fi
}

# ── List all uConnect ports ─────────────────────────────────────
list_ports() {
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║   uConnect Port Registry                                ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""
  
  for i in "${!PROJECT_NAMES[@]}"; do
    local project="${PROJECT_NAMES[$i]}"
    local port="${PROJECT_PORTS[$i]}"
    local status="🟢 FREE"
    local pid=""
    
    if lsof -i :"$port" &>/dev/null 2>&1; then
      pid=$(lsof -ti :"$port" 2>/dev/null)
      local cmd=$(ps -p "$pid" -o command= 2>/dev/null | head -c 60)
      status="🔴 IN USE"
      printf "  %-12s → %-5s %s (PID: %-6s %s)\n" "$project" ":$port" "$status" "$pid" "$cmd"
    else
      printf "  %-12s → %-5s %s\n" "$project" ":$port" "$status"
    fi
  done
  echo ""
}

# ── Start a project ─────────────────────────────────────────────
start_project() {
  local project="$1"
  local default_port=$(get_project_port "$project")
  
  if [ -z "$default_port" ]; then
    echo "❌ Unknown project: $project"
    echo "   Available: ${PROJECT_NAMES[*]}"
    exit 1
  fi
  
  local project_dir="$CONNECT_DIR/$project"
  
  if [ ! -d "$project_dir" ]; then
    echo "❌ Project directory not found: $project_dir"
    exit 1
  fi
  
  # Find a free port starting from the default
  local port=$(find_free_port "$default_port")
  
  echo "🚀 Starting $project on port $port..."
  echo "   Directory: $project_dir"
  echo ""
  
  cd "$project_dir"
  
  # Install deps if needed
  if [ ! -d "node_modules" ]; then
    echo "   📦 Installing dependencies..."
    npm install
  fi
  
  # Start vite
  if [ "$port" != "$default_port" ]; then
    echo "   ⚠️  Default port $default_port was in use, using $port instead"
  fi
  
  npx vite --port "$port" --open &
  local vite_pid=$!
  
  echo ""
  echo "   ✅ Started (PID: $vite_pid)"
  echo "   🌐 http://localhost:$port"
  echo ""
}

# ── Status ──────────────────────────────────────────────────────
show_status() {
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║   uConnect Running Servers                              ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""
  
  local found=0
  for i in "${!PROJECT_NAMES[@]}"; do
    local project="${PROJECT_NAMES[$i]}"
    local port="${PROJECT_PORTS[$i]}"
    
    if lsof -i :"$port" &>/dev/null 2>&1; then
      local pid=$(lsof -ti :"$port" 2>/dev/null)
      local cmd=$(ps -p "$pid" -o command= 2>/dev/null | head -c 80)
      echo "  🟢 $project → http://localhost:$port (PID: $pid)"
      found=$((found + 1))
    fi
  done
  
  if [ "$found" -eq 0 ]; then
    echo "  ℹ️  No uConnect servers running"
  fi
  echo ""
}

# ── Main ────────────────────────────────────────────────────────
case "${1:-help}" in
  find)
    find_free_port "${2:-5173}"
    ;;
  kill)
    kill_port "$2"
    ;;
  list)
    list_ports
    ;;
  start)
    start_project "$2"
    ;;
  status)
    show_status
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    echo "❌ Unknown command: $1"
    echo ""
    show_help
    exit 1
    ;;
esac
