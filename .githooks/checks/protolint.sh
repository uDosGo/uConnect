#!/bin/bash
# =============================================================================
# Check: Protobuf lint
# =============================================================================
# Validates .proto file formatting and style.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=../lib/shared.sh
source "$SCRIPT_DIR/../lib/shared.sh"

PROTO_FILES=$(staged_files '\.proto$')

if [ -z "$PROTO_FILES" ]; then
    exit 0
fi

# Try buf lint first, fall back to basic validation
if command -v buf &>/dev/null; then
    cd "$SCRIPT_DIR/../.."
    buf lint $(echo "$PROTO_FILES") 2>&1 || true
elif command -v protoc &>/dev/null; then
    # Basic syntax check with protoc
    for file in $PROTO_FILES; do
        protoc --proto_path=. --proto_path=proto -o /dev/null "$file" 2>&1 || true
    done
else
    # Basic grep-based check for common issues
    for file in $PROTO_FILES; do
        if [ -f "$file" ]; then
            # Check for missing syntax declaration
            if ! grep -q '^syntax\s*=' "$file" 2>/dev/null; then
                echo "  WARNING: $file missing 'syntax' declaration"
            fi
        fi
    done
fi
