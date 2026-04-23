#!/usr/bin/env bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

bash "$SCRIPT_DIR/bootstrap-managed-envs.sh"

# shellcheck source=scripts/lib/family-python.sh
. "$SCRIPT_DIR/lib/family-python.sh"

existing_env=0
if [ -x "${UDOS_SHARED_PYTHON_BIN:-}" ]; then
  existing_env=1
fi

ensure_shared_python

"$UDOS_SHARED_PYTHON_BIN" -m ensurepip --upgrade >/dev/null 2>&1 || true
BASE_PKGS="${UDOS_SHARED_BASE_PKGS:-pip setuptools wheel pytest fastapi uvicorn httpx pydantic cryptography jsonschema}"
REFRESH_BASE_PKGS="${UDOS_SHARED_REFRESH_BASE_PKGS:-auto}"

should_refresh=0
case "$REFRESH_BASE_PKGS" in
  1|true|yes|always) should_refresh=1 ;;
  auto)
    if [ "$existing_env" -eq 0 ]; then
      should_refresh=1
    fi
    ;;
  *) should_refresh=0 ;;
esac

if [ "$should_refresh" -eq 1 ]; then
  if ! "$UDOS_SHARED_PYTHON_BIN" -m pip install --upgrade $BASE_PKGS >/dev/null; then
    echo "warning: shared Python base package refresh failed; continuing with existing environment state" >&2
  fi
fi

echo "uDOS family shared Python ready"
print_shared_python_summary
echo "activate with:"
echo "  source \"$UDOS_SHARED_ENV_DIR/bin/activate\""

# Keep a local pointer for scripts and tools that want a root-level hint.
printf '%s\n' "$UDOS_SHARED_PYTHON_BIN" > "$ROOT_DIR/.udos-connect-python"
