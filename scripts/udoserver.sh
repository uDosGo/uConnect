#!/bin/bash
# ─── udoserver — uConnect UI Server Manager ─────────────────────
# Usage:
#   ./scripts/udoserver.sh start       Start all UI servers
#   ./scripts/udoserver.sh stop        Stop all UI servers
#   ./scripts/udoserver.sh restart     Restart all UI servers
#   ./scripts/udoserver.sh status      Show server status
#   ./scripts/udoserver.sh logs <name> Tail logs for a specific server
#
# Unified port scheme (matches udosui-launcher.sh):
#   ui (hub)  → 5173
#   proseui   → 5174
#   code3ui   → 5175
#   code4ui   → 5176
#   opsui     → 5177
#   gridui    → 5178

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="${ROOT}/.udoserver"
PID_FILE="${LOG_DIR}/pids"
mkdir -p "$LOG_DIR"

SERVERS=(
  "ui:ui:5173"
  "proseui:proseui:5174"
  "code3ui:code3ui:5175"
  "code4ui:code4ui:5176"
  "opsui:opsui:5177"
  "gridui:gridui:5178"
)

# ─── Helpers ─────────────────────────────────────────────────────

load_pids() {
  if [[ -f "$PID_FILE" ]]; then
    source "$PID_FILE"
  fi
}

save_pid() {
  local name="$1" pid="$2"
  grep -v "^${name}_pid=" "$PID_FILE" 2>/dev/null > "${PID_FILE}.tmp" || true
  echo "${name}_pid=$pid" >> "${PID_FILE}.tmp"
  mv "${PID_FILE}.tmp" "$PID_FILE"
}

remove_pid() {
  local name="$1"
  grep -v "^${name}_pid=" "$PID_FILE" 2>/dev/null > "${PID_FILE}.tmp" || true
  mv "${PID_FILE}.tmp" "$PID_FILE"
}

is_running() {
  local pid="$1"
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

logfile() {
  local name="$1"
  echo "${LOG_DIR}/${name}.log"
}

# ─── Commands ────────────────────────────────────────────────────

cmd_start() {
  echo "─── Starting uConnect UI Servers ───"
  for entry in "${SERVERS[@]}"; do
    IFS=':' read -r name dir port <<< "$entry"
    local lf
    lf="$(logfile "$name")"

    # Check if already running
    load_pids
    local existing_pid_var="${name}_pid"
    if is_running "${!existing_pid_var:-}"; then
      echo "  ✓ $name already running (PID ${!existing_pid_var}) on port $port"
      continue
    fi

    # Kill any orphan on this port
    local orphans
    orphans=$(lsof -ti:"$port" 2>/dev/null || true)
    if [[ -n "$orphans" ]]; then
      kill -9 $orphans 2>/dev/null || true
    fi

    echo -n "  Starting $name on port $port... "
    cd "$ROOT/$dir"
    nohup npx vite --port "$port" --host > "$lf" 2>&1 &
    local pid=$!
    save_pid "$name" "$pid"

    # Wait for it to be ready (up to 10 seconds)
    local waited=0
    while [[ $waited -lt 10 ]]; do
      if curl -s -o /dev/null -w "" "http://localhost:$port/" 2>/dev/null; then
        echo "PID $pid ✓"
        break
      fi
      sleep 0.5
      waited=$((waited + 1))
    done
    if [[ $waited -ge 10 ]]; then
      echo "PID $pid (started, waiting for ready...)"
    fi
    cd "$ROOT"
  done
  echo "─── All servers started ───"
}

cmd_stop() {
  echo "─── Stopping uConnect UI Servers ───"
  load_pids
  for entry in "${SERVERS[@]}"; do
    IFS=':' read -r name dir port <<< "$entry"
    local pid_var="${name}_pid"
    local pid="${!pid_var:-}"
    if is_running "$pid"; then
      echo -n "  Stopping $name (PID $pid)... "
      kill "$pid" 2>/dev/null || true
      for i in {1..5}; do
        if ! is_running "$pid"; then break; fi
        sleep 0.3
      done
      if is_running "$pid"; then
        kill -9 "$pid" 2>/dev/null || true
        echo "killed -9"
      else
        echo "stopped"
      fi
    else
      echo "  $name not running"
    fi
    remove_pid "$name"
  done
  # Also kill any orphaned vite processes from these ports
  for entry in "${SERVERS[@]}"; do
    IFS=':' read -r name dir port <<< "$entry"
    local orphans
    orphans=$(lsof -ti:"$port" 2>/dev/null || true)
    if [[ -n "$orphans" ]]; then
      echo "  Cleaning orphan on port $port (PID $orphans)"
      kill -9 $orphans 2>/dev/null || true
    fi
  done
  echo "─── All servers stopped ───"
}

cmd_restart() {
  cmd_stop
  sleep 1
  cmd_start
}

cmd_status() {
  echo "─── uConnect UI Server Status ───"
  load_pids
  local any_running=false
  for entry in "${SERVERS[@]}"; do
    IFS=':' read -r name dir port <<< "$entry"
    local pid_var="${name}_pid"
    local pid="${!pid_var:-}"
    local lf
    lf="$(logfile "$name")"

    # Also check by port
    local port_pid
    port_pid=$(lsof -ti:"$port" 2>/dev/null || true)

    if is_running "$pid"; then
      echo "  ✓ $name → http://localhost:$port/ (PID $pid)"
      any_running=true
    elif [[ -n "$port_pid" ]]; then
      echo "  ? $name → http://localhost:$port/ (orphan PID $port_pid, not in pidfile)"
      any_running=true
    else
      echo "  ✗ $name → http://localhost:$port/ (stopped)"
    fi
  done
  if ! $any_running; then
    echo "  (no servers running)"
  fi
  echo "─── Logs: $LOG_DIR ───"
}

cmd_logs() {
  local name="$1"
  local lf
  lf="$(logfile "$name")"
  if [[ -f "$lf" ]]; then
    tail -f "$lf"
  else
    echo "No log file for $name (not started yet?)"
    exit 1
  fi
}

cmd_clean() {
  echo "─── Cleaning up stale pidfile and logs ───"
  rm -f "$PID_FILE"
  echo "  Removed $PID_FILE"
  echo "─── Done ───"
}

# ─── Main ────────────────────────────────────────────────────────

case "${1:-help}" in
  start)
    cmd_start
    ;;
  stop)
    cmd_stop
    ;;
  restart)
    cmd_restart
    ;;
  status)
    cmd_status
    ;;
  logs)
    if [[ -z "${2:-}" ]]; then
      echo "Usage: $0 logs <server_name>"
      echo "  Servers: ui, proseui, code3ui, code4ui, opsui, gridui"
      exit 1
    fi
    cmd_logs "$2"
    ;;
  clean)
    cmd_clean
    ;;
  help|*)
    echo "uConnect UI Server Manager"
    echo ""
    echo "Usage:"
    echo "  $0 start              Start all UI servers"
    echo "  $0 stop               Stop all UI servers"
    echo "  $0 restart            Restart all UI servers"
    echo "  $0 status             Show server status"
    echo "  $0 logs <name>        Tail logs for a server"
    echo "  $0 clean              Remove stale pidfile"
    echo ""
    echo "Servers:"
    for entry in "${SERVERS[@]}"; do
      IFS=':' read -r name dir port <<< "$entry"
      echo "  $name → http://localhost:$port/ (from $dir)"
    done
    ;;
esac
