#!/bin/bash
# =============================================================================
# Check: JSON validation
# =============================================================================
# Validates JSON file syntax.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=../lib/shared.sh
source "$SCRIPT_DIR/../lib/shared.sh"

JSON_FILES=$(staged_files '\.json$')

if [ -z "$JSON_FILES" ]; then
    exit 0
fi

FAILED=0

for file in $JSON_FILES; do
    if [ -f "$file" ]; then
        if ! python3 -m json.tool "$file" > /dev/null 2>&1; then
            echo "  Invalid JSON: $file"
            python3 -m json.tool "$file" 2>&1 || true
            FAILED=1
        fi
    fi
done

exit $FAILED
