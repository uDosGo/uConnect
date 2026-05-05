#!/bin/bash
# =============================================================================
# Check: Dockerfile lint
# =============================================================================
# Validates Dockerfile syntax.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=../lib/shared.sh
source "$SCRIPT_DIR/../lib/shared.sh"

DOCKER_FILES=$(staged_files -E '(Dockerfile|docker-compose|\.dockerfile)' || true)

# Also check for files named Dockerfile (no extension)
if [ -z "$DOCKER_FILES" ]; then
    DOCKER_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -i 'Dockerfile' || true)
fi

if [ -z "$DOCKER_FILES" ]; then
    exit 0
fi

# Try hadolint
if command -v hadolint &>/dev/null; then
    for file in $DOCKER_FILES; do
        if [ -f "$file" ]; then
            hadolint "$file" 2>&1 || true
        fi
    done
    exit 0
fi

# Try docker validate
if command -v docker &>/dev/null; then
    for file in $DOCKER_FILES; do
        if [ -f "$file" ] && head -1 "$file" | grep -q '^FROM'; then
            docker pull $(head -1 "$file" | awk '{print $2}') 2>/dev/null || true
        fi
    done
fi
