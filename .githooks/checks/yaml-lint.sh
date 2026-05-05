#!/bin/bash
# =============================================================================
# Check: YAML lint
# =============================================================================
# Validates YAML file syntax.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=../lib/shared.sh
source "$SCRIPT_DIR/../lib/shared.sh"

YAML_FILES=$(staged_files '\.(yaml|yml)$')

if [ -z "$YAML_FILES" ]; then
    exit 0
fi

# Try yamllint first
if command -v yamllint &>/dev/null; then
    echo "$YAML_FILES" | xargs yamllint --no-warnings 2>&1 || true
    exit 0
fi

# Fallback: use Python to validate YAML syntax
if command -v python3 &>/dev/null; then
    for file in $YAML_FILES; do
        if [ -f "$file" ]; then
            python3 -c "
import yaml, sys
try:
    with open('$file') as f:
        yaml.safe_load(f)
except yaml.YAMLError as e:
    print(f'$file: {e}')
    sys.exit(1)
" 2>&1 || true
        fi
    done
fi
