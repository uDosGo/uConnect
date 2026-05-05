#!/bin/bash
# =============================================================================
# Check: mypy (Python type checking)
# =============================================================================
# Runs mypy on staged Python files in uCode1.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=../lib/shared.sh
source "$SCRIPT_DIR/../lib/shared.sh"

require_tool "mypy" "pip install mypy" || exit 0

PYTHON_FILES=$(staged_files '\.py$')

if [ -z "$PYTHON_FILES" ]; then
    exit 0
fi

# Only run mypy if there are files in uCode1
UCODE1_FILES=$(echo "$PYTHON_FILES" | grep '^uCode1/' || true)
if [ -n "$UCODE1_FILES" ]; then
    cd "$SCRIPT_DIR/../../uCode1" 2>/dev/null || true
    echo "$UCODE1_FILES" | xargs python3 -m mypy --ignore-missing-imports --follow-imports=skip 2>&1 || true
fi
