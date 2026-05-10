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

cd "$(dirname "$0")"
echo "============================================"
echo "  uDos / Connect — UI Launcher (macOS)"
echo "============================================"
echo ""
bash scripts/udosui-launcher.sh
echo ""
echo "Press Ctrl+C to stop the server."
echo "============================================"
# Keep terminal open
exec bash
