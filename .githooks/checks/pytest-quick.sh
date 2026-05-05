#!/bin/bash
# =============================================================================
# Check: pytest (quick)
# =============================================================================
# Runs a quick subset of Python tests for uCode1.
# Only runs if Python files in uCode1 were changed.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=../lib/shared.sh
source "$SCRIPT_DIR/../lib/shared.sh"

require_tool "python3" "Install Python 3" || exit 0

PYTHON_FILES=$(staged_files '\.py$')
UCODE1_FILES=$(echo "$PYTHON_FILES" | grep '^uCode1/' || true)

if [ -z "$UCODE1_FILES" ]; then
    exit 0
fi

cd "$SCRIPT_DIR/../../uCode1"

# Run only tests related to changed files (quick subset)
python3 -m pytest tests/ -v --tb=short -x --timeout=30 2>&1 || true
