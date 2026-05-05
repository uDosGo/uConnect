#!/bin/bash
# =============================================================================
# Check: Large files
# =============================================================================
# Warns about files over a size threshold being committed.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=../lib/shared.sh
source "$SCRIPT_DIR/../lib/shared.sh"

MAX_SIZE_MB=5
MAX_SIZE_BYTES=$(( MAX_SIZE_MB * 1024 * 1024 ))

STAGED_FILES=$(staged_files)

if [ -z "$STAGED_FILES" ]; then
    exit 0
fi

FAILED=0

for file in $STAGED_FILES; do
    if [ ! -f "$file" ]; then
        continue
    fi

    # Get file size from git blob (staged version)
    BLOB_HASH=$(git hash-object -w "$file" 2>/dev/null || true)
    if [ -n "$BLOB_HASH" ]; then
        SIZE=$(git cat-file -s "$BLOB_HASH" 2>/dev/null || echo 0)
        if [ "$SIZE" -gt "$MAX_SIZE_BYTES" ]; then
            SIZE_MB=$(echo "scale=1; $SIZE / 1048576" | bc)
            echo "  ⚠ Large file: $file (${SIZE_MB}MB)"
            echo "    Max recommended: ${MAX_SIZE_MB}MB"
            echo "    Consider using Git LFS or removing large assets."
            FAILED=1
        fi
    fi
done

exit $FAILED
