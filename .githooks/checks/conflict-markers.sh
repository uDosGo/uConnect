#!/bin/bash
# =============================================================================
# Check: Merge conflict markers
# =============================================================================
# Scans staged files for unresolved merge conflict markers.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=../lib/shared.sh
source "$SCRIPT_DIR/../lib/shared.sh"

STAGED_FILES=$(staged_files)

if [ -z "$STAGED_FILES" ]; then
    exit 0
fi

FAILED=0

for file in $STAGED_FILES; do
    if [ ! -f "$file" ]; then
        continue
    fi

    # Check for conflict markers
    if grep -n '^<<<<<<< \|^=======$\|^>>>>>>> ' "$file" 2>/dev/null; then
        echo ""
        echo "  ❌ Merge conflict markers found in: $file"
        echo "  Resolve conflicts before committing."
        FAILED=1
    fi
done

exit $FAILED
