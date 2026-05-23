#!/bin/bash
# uDos UI Launcher — macOS double-click wrapper
#
# Usage:
#   1. Save this file as udosui.command
#   2. chmod +x udosui.command
#   3. Double-click in Finder to launch the uDos UI
#
# The terminal window will open, run the launcher, and stay open
# so you can see logs / shut down with Ctrl+C.
#
# Flags:
#   --all           Launch all surfaces + hub + menu bar
#   --all-server    Launch all surfaces + uServer (Snackbar) backend
#   --menu-bar      Start only the menu bar app
#   --ops           Launch opsui (SnackMachine) for operator testing
#   --server        Start only the uServer (Snackbar) backend
#   <surface>       Launch a specific surface (ui, proseui, code3ui, etc.)

cd "$(dirname "$0")"

case "${1:-}" in
  --all|-a)
    echo "============================================"
    echo "  uDos / Connect — Launch Everything"
    echo "============================================"
    echo ""
    node scripts/udos.cjs start --all
    ;;
  --all-server|--all-with-server)
    echo "============================================"
    echo "  uDos / Connect — Launch Everything + uServer"
    echo "============================================"
    echo ""
    node scripts/udos.cjs start --all --with-server
    ;;
  --server)
    echo "============================================"
    echo "  uDos / Connect — uServer (Snackbar) Backend"
    echo "============================================"
    echo ""
    node scripts/udos.cjs start-server
    ;;
  --menu-bar|-m)
    echo "============================================"
    echo "  uDos / Connect — Menu Bar App"
    echo "============================================"
    echo ""
    node scripts/udos.cjs menu-bar
    echo ""
    echo "Look for the 🍔 icon in your menu bar."
    echo "Press Ctrl+C to stop."
    echo "============================================"
    exec bash
    ;;
  --ops)
    echo "============================================"
    echo "  uDos / Connect — Server Operations (opsui)"
    echo "============================================"
    echo ""
    node scripts/udos.cjs start opsui
    ;;
  "")
    # Default: launch everything (hub + all surfaces + menu bar)
    echo "============================================"
    echo "  uDos / Connect — Launch Everything"
    echo "============================================"
    echo ""
    node scripts/udos.cjs start --all
    ;;
  *)
    echo "============================================"
    echo "  uDos / Connect — UI Launcher (macOS)"
    echo "  Surface: $1"
    echo "============================================"
    echo ""
    node scripts/udos.cjs start "$1"
    ;;
esac
