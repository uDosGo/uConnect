#!/usr/bin/env bash
# uDosConnect TUI Launcher - Bubble Tea style with progress bars and spinners
# This is the main entry point that uses the TypeScript TUI launcher

# Get script directory and root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UDOS_ROOT="$(dirname "$SCRIPT_DIR")"

# Use the compiled TUI launcher
node "$SCRIPT_DIR/dist/tui-launcher.js" --root "$UDOS_ROOT" "$@"
