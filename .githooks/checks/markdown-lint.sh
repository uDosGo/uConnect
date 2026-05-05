#!/bin/bash
# =============================================================================
# Check: Markdown lint
# =============================================================================
# Checks for common Markdown issues.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=../lib/shared.sh
source "$SCRIPT_DIR/../lib/shared.sh"

MD_FILES=$(staged_files '\.md$')

if [ -z "$MD_FILES" ]; then
    exit 0
fi

# Try markdownlint-cli
if command -v markdownlint &>/dev/null; then
    echo "$MD_FILES" | xargs markdownlint --disable MD013 MD033 2>&1 || true
    exit 0
fi

# Try npx markdownlint
if command -v npx &>/dev/null; then
    cd "$SCRIPT_DIR/../.."
    npx --yes markdownlint-cli --disable MD013 MD033 $(echo "$MD_FILES") 2>&1 || true
    exit 0
fi

# Basic checks
for file in $MD_FILES; do
    if [ -f "$file" ]; then
        # Check for broken links (simple pattern)
        # Check for very long lines (>120 chars) in non-code blocks
        awk '
        /^```/ { in_code = !in_code }
        !in_code && length($0) > 120 { print "WARNING: Line too long (" length($0) " chars): " FILENAME ":" NR }
        ' "$file" 2>/dev/null || true
    fi
done
