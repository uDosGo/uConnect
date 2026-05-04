#!/usr/bin/env bash

set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Scanning for repo-local virtualenv patterns and overlap..."

if command -v rg >/dev/null 2>&1; then
  rg -n \
    --glob '**/scripts/*.sh' \
    --glob '!uDOS-dev/@dev/**' \
    '\.venv|python3 -m venv|source \.venv|UV_PROJECT_ENVIRONMENT' \
    "$ROOT_DIR" || true
else
  grep -RInE '\.venv|python3 -m venv|source \.venv|UV_PROJECT_ENVIRONMENT' \
    "$ROOT_DIR" \
    --exclude-dir=uDOS-dev/@dev \
    --include='*.sh' | grep -v '/uDOS-dev/@dev/' || true
fi

echo
echo "Shared env status:"
if [ -f "$ROOT_DIR/.udos-connect-python" ]; then
  echo "  pointer file: $ROOT_DIR/.udos-connect-python"
  echo "  python bin: $(cat "$ROOT_DIR/.udos-connect-python")"
elif [ -f "$ROOT_DIR/.udos-family-python" ]; then
  echo "  pointer file: $ROOT_DIR/.udos-family-python (legacy)"
  echo "  python bin: $(cat "$ROOT_DIR/.udos-family-python")"
else
  echo "  pointer file missing; run scripts/bootstrap-family-python.sh"
fi
