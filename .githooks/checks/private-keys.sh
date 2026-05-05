#!/bin/bash
# =============================================================================
# Check: Private keys/secrets
# =============================================================================
# Scans staged files for accidentally committed secrets, API keys, etc.
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

# Patterns that look like secrets
SECRET_PATTERNS=(
    '-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----'
    'AKIA[0-9A-Z]{16}'  # AWS Access Key
    'sk-[a-zA-Z0-9]{20,}'  # OpenAI/Anthropic keys
    'ghp_[a-zA-Z0-9]{36}'  # GitHub PAT
    'gho_[a-zA-Z0-9]{36}'  # GitHub OAuth
    'ghu_[a-zA-Z0-9]{36}'  # GitHub user token
    'xox[baprs]-[a-zA-Z0-9]{10,}'  # Slack tokens
    '-----BEGIN PGP PRIVATE KEY BLOCK-----'
)

for file in $STAGED_FILES; do
    if [ ! -f "$file" ]; then
        continue
    fi

    # Skip binary files
    if file "$file" | grep -q 'binary'; then
        continue
    fi

    # Skip known safe files
    case "$file" in
        *.pub|*.pem|*.crt|*.cert|*.key|.env.example|*.env.example)
            continue
            ;;
    esac

    for pattern in "${SECRET_PATTERNS[@]}"; do
        if grep -q "$pattern" "$file" 2>/dev/null; then
            echo "  ⚠ Possible secret/key found in: $file"
            echo "    Pattern: ${pattern:0:40}..."
            echo "    Remove before committing, or add to .gitignore."
            FAILED=1
            break
        fi
    done
done

exit $FAILED
