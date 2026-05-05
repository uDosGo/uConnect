#!/bin/bash
# =============================================================================
# Check: rustfmt (Rust formatting)
# =============================================================================
# Checks that staged Rust files are properly formatted.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=../lib/shared.sh
source "$SCRIPT_DIR/../lib/shared.sh"

require_tool "rustfmt" "rustup component add rustfmt" || exit 0

RUST_FILES=$(staged_files '\.rs$')

if [ -z "$RUST_FILES" ]; then
    exit 0
fi

# Determine which Rust workspace to check
UCODE2_FILES=$(echo "$RUST_FILES" | grep '^uCode2/' || true)
CORE_RS_FILES=$(echo "$RUST_FILES" | grep '^core-rs/' || true)

FAILED=0

if [ -n "$UCODE2_FILES" ]; then
    cd "$SCRIPT_DIR/../../uCode2" 2>/dev/null || true
    if ! cargo fmt --all -- --check 2>&1; then
        echo ""
        echo "  Run 'cd uCode2 && cargo fmt' to fix formatting."
        FAILED=1
    fi
fi

if [ -n "$CORE_RS_FILES" ]; then
    cd "$SCRIPT_DIR/../../core-rs" 2>/dev/null || true
    if ! cargo fmt --all -- --check 2>&1; then
        echo ""
        echo "  Run 'cd core-rs && cargo fmt' to fix formatting."
        FAILED=1
    fi
fi

exit $FAILED
