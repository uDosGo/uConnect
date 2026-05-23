#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Build & Install uDos macOS Menu Bar App
# ═══════════════════════════════════════════════════════════════════
# Usage:
#   bash scripts/build-menu-bar.sh              # Build to /tmp
#   bash scripts/build-menu-bar.sh --install    # Build & install to /usr/local/bin
#   bash scripts/build-menu-bar.sh --start      # Build, install & launch
#   bash scripts/build-menu-bar.sh --stop       # Kill running instance
#   bash scripts/build-menu-bar.sh --uninstall  # Remove from /usr/local/bin
# ═══════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE="$SCRIPT_DIR/udos-menu-bar.swift"
BINARY="/usr/local/bin/udos-menu-bar"
TEMP_BINARY="/tmp/udos-menu-bar"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   🍎 uDos macOS Menu Bar — Build & Install              ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

case "${1:-build}" in
  build)
    echo "  🔨 Compiling..."
    swiftc -o "$TEMP_BINARY" "$SOURCE"
    echo "  ✅ Built: $TEMP_BINARY"
    echo "  ℹ️  Run with --install to install to /usr/local/bin"
    echo ""
    ;;

  --install)
    echo "  🔨 Compiling..."
    swiftc -o "$TEMP_BINARY" "$SOURCE"
    echo "  ✅ Built: $TEMP_BINARY"
    
    echo "  📦 Installing to $BINARY..."
    sudo cp "$TEMP_BINARY" "$BINARY"
    sudo chmod +x "$BINARY"
    echo "  ✅ Installed: $BINARY"
    echo ""
    echo "  🚀 To start:  udos-menu-bar &"
    echo "  🔄 To auto-start on login:"
    echo "     System Settings → General → Login Items → Add $BINARY"
    echo ""
    ;;

  --start)
    echo "  🔨 Compiling..."
    swiftc -o "$TEMP_BINARY" "$SOURCE"
    echo "  ✅ Built: $TEMP_BINARY"
    
    echo "  📦 Installing to $BINARY..."
    sudo cp "$TEMP_BINARY" "$BINARY"
    sudo chmod +x "$BINARY"
    echo "  ✅ Installed: $BINARY"
    
    # Kill existing instance if running
    if pgrep -f "udos-menu-bar" > /dev/null 2>&1; then
      echo "  ⏹  Stopping existing instance..."
      pkill -f "udos-menu-bar" 2>/dev/null || true
      sleep 1
    fi
    
    echo "  🚀 Launching..."
    "$BINARY" &
    sleep 2
    
    if pgrep -f "udos-menu-bar" > /dev/null 2>&1; then
      echo "  ✅ Running (PID: $(pgrep -f 'udos-menu-bar'))"
      echo "  🔄 Look for the 🔄 icon in your menu bar!"
    else
      echo "  ❌ Failed to start"
    fi
    echo ""
    ;;

  --stop)
    if pgrep -f "udos-menu-bar" > /dev/null 2>&1; then
      echo "  ⏹  Stopping udos-menu-bar..."
      pkill -f "udos-menu-bar" 2>/dev/null || true
      echo "  ✅ Stopped"
    else
      echo "  ℹ️  Not running"
    fi
    echo ""
    ;;

  --uninstall)
    if [ -f "$BINARY" ]; then
      echo "  🗑️  Removing $BINARY..."
      sudo rm "$BINARY"
      echo "  ✅ Uninstalled"
    else
      echo "  ℹ️  Not installed"
    fi
    
    # Kill running instance
    if pgrep -f "udos-menu-bar" > /dev/null 2>&1; then
      pkill -f "udos-menu-bar" 2>/dev/null || true
      echo "  ✅ Running instance stopped"
    fi
    echo ""
    ;;

  *)
    echo "  Usage: bash scripts/build-menu-bar.sh [option]"
    echo ""
    echo "  Options:"
    echo "    build        Compile only (default)"
    echo "    --install    Build & install to /usr/local/bin"
    echo "    --start      Build, install & launch"
    echo "    --stop       Kill running instance"
    echo "    --uninstall  Remove from /usr/local/bin"
    echo ""
    ;;
esac
