#!/bin/bash
# =============================================================================
# Check: cargo check (Rust compilation check)
# =============================================================================
# Runs cargo check on changed Rust workspaces (faster than full build).
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=../lib/shared.sh
source "$SCRIPT_DIR/../lib/shared.sh"

require_tool "cargo" "Install Rust: https://rustup.rs" || exit 0

RUST_FILES=$(staged_files '\.rs$')

if [ -z "$RUST_FILES" ]; then
    exit 0
fi

UCODE2_FILES=$(echo "$RUST_FILES" | grep '^uCode2/' || true)
CORE_RS_FILES=$(echo "$RUST_FILES" | grep '^core-rs/' || true)

FAILED=0

if [ -n "$UCODE2_FILES" ]; then
    cd "$SCRIPT_DIR/../../uCode2" 2>/dev/null || true
    cargo check --workspace 2>&1 || FAILED=1
fi

if [ -n "$CORE_RS_FILES" ]; then
    cd "$SCRIPT_DIR/../../core-rs" 2>/dev/null || true
    cargo check 2>&1 || FAILED=1
fi

exit $FAILED
