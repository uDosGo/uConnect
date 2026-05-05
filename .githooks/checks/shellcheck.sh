#!/bin/bash
# =============================================================================
# Check: ShellCheck
# =============================================================================
# Runs shellcheck on staged shell scripts.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=../lib/shared.sh
source "$SCRIPT_DIR/../lib/shared.sh"

SHELL_FILES=$(staged_files '\.(sh|bash)$')

if [ -z "$SHELL_FILES" ]; then
    exit 0
fi

if command -v shellcheck &>/dev/null; then
    echo "$SHELL_FILES" | xargs shellcheck -x -S style 2>&1 || true
else
    # Basic syntax check with bash -n
    for file in $SHELL_FILES; do
        if [ -f "$file" ]; then
            bash -n "$file" 2>&1 || true
        fi
    done
fi
