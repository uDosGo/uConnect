#!/bin/bash
# uDosConnect — one-click launcher (macOS). Double-click in Finder to open Terminal and GUI.
# This wrapper calls the TUI launcher with Bubble Tea style interface.

# Get script directory and root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UDOS_ROOT="$(dirname "$SCRIPT_DIR")"

# Export vault location
export UDOS_VAULT="${UDOS_VAULT:-$HOME/vault}"

# Use the TUI launcher with progress bars and spinners
"$SCRIPT_DIR/udos-tui.sh" "$@"
