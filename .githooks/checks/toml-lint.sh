#!/bin/bash
# =============================================================================
# Check: TOML validation
# =============================================================================
# Validates TOML file syntax.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=../lib/shared.sh
source "$SCRIPT_DIR/../lib/shared.sh"

TOML_FILES=$(staged_files '\.toml$')

if [ -z "$TOML_FILES" ]; then
    exit 0
fi

# Try taplo (Rust TOML linter)
if command -v taplo &>/dev/null; then
    echo "$TOML_FILES" | xargs taplo check 2>&1 || true
    exit 0
fi

# Fallback: use Python to validate TOML syntax
if command -v python3 &>/dev/null; then
    for file in $TOML_FILES; do
        if [ -f "$file" ]; then
            python3 -c "
import tomllib, sys
try:
    with open('$file', 'rb') as f:
        tomllib.load(f)
except tomllib.TOMLDecodeError as e:
    print(f'$file: {e}')
    sys.exit(1)
except ImportError:
    # Python < 3.11
    try:
        import toml
        with open('$file') as f:
            toml.load(f)
    except Exception as e:
        print(f'$file: {e}')
        sys.exit(1)
" 2>&1 || true
        fi
    done
fi
