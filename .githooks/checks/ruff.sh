#!/bin/bash
# =============================================================================
# Check: ruff (Python linter)
# =============================================================================
# Runs ruff on staged Python files in uCode1.
# =============================================================================

set -euo pipefail

# Source shared library
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=../lib/shared.sh
source "$SCRIPT_DIR/../lib/shared.sh"

# Check tool availability
require_tool "ruff" "pip install ruff" || exit 0

# Get staged Python files
PYTHON_FILES=$(staged_files '\.py$')

if [ -z "$PYTHON_FILES" ]; then
    exit 0
fi

# Run ruff check on staged files
echo "$PYTHON_FILES" | xargs ruff check --ignore E501,F401 --no-cache 2>&1
