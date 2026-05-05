#!/bin/bash
# =============================================================================
# Check: ESLint (JavaScript/TypeScript)
# =============================================================================
# Runs ESLint on staged JS/TS/Vue files.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=../lib/shared.sh
source "$SCRIPT_DIR/../lib/shared.sh"

require_tool "npx" "Install Node.js" || exit 0

JS_FILES=$(staged_files '\.(js|ts|vue)$')

if [ -z "$JS_FILES" ]; then
    exit 0
fi

# Check if eslint config exists
if [ ! -f "$SCRIPT_DIR/../../eslint.config.js" ]; then
    exit 0
fi

cd "$SCRIPT_DIR/../.."
npx eslint --no-warn-ignored $(echo "$JS_FILES") 2>&1 || true
