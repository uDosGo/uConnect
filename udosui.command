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
# Operator Test Mode:
#   Double-click with Option key held → launches opsui (SnackMachine)
#   for operator testing of the Snackbar runtime.

cd "$(dirname "$0")"

# Check for Option key (modifier flag via environment)
if [[ "$MODIFIER_FLAGS" == *"option"* ]] || [[ "$1" == "--ops" ]]; then
  SURFACE="opsui"
  LABEL="Server Operations (SnackMachine)"
else
  SURFACE="${1:-proseui}"
  LABEL="${2:-Prose Editor}"
fi

echo "============================================"
echo "  uDos / Connect — UI Launcher (macOS)"
echo "  Surface: $LABEL"
echo "============================================"
echo ""
bash scripts/udosui-launcher.sh "$SURFACE"
echo ""
echo "Press Ctrl+C to stop the server."
echo "============================================"
# Keep terminal open
exec bash
