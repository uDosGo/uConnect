#!/bin/bash

# uDosGo macOS Launcher Wrapper
# This wrapper calls the main uDosGoStart.sh script

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Call the main script
"$SCRIPT_DIR/uDosGoStart.sh"

exit $?