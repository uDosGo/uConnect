#!/usr/bin/env bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
UHOME_FAMILY_ROOT="${UDOS_UHOME_FAMILY_ROOT:-$ROOT_DIR/../uHOME-family}"

# shellcheck source=scripts/lib/family-python.sh
. "$SCRIPT_DIR/lib/family-python.sh"
ensure_shared_python

bash "$SCRIPT_DIR/bootstrap-family-python.sh" >/dev/null

export UDOS_USE_SHARED_RESOURCES=1
if [ -f "$ROOT_DIR/.udos-connect-python" ]; then
  UDOS_SHARED_PYTHON_BIN="$(tr -d '\n' < "$ROOT_DIR/.udos-connect-python")"
  export UDOS_SHARED_PYTHON_BIN
elif [ -f "$ROOT_DIR/.udos-family-python" ]; then
  # Backward compatibility for older local setups.
  UDOS_SHARED_PYTHON_BIN="$(tr -d '\n' < "$ROOT_DIR/.udos-family-python")"
  export UDOS_SHARED_PYTHON_BIN
fi

run_step() {
  local label="$1"
  shift
  echo "==> $label"
  "$@"
}

if [ -f "$ROOT_DIR/uDOS-empire/scripts/run-empire-wizard-release-gate.sh" ]; then
  run_step "uDOS-empire wizard release gate" "$ROOT_DIR/uDOS-empire/scripts/run-empire-wizard-release-gate.sh"
fi
if [ -f "$UHOME_FAMILY_ROOT/uHOME-client/scripts/run-client-server-release-gate.sh" ]; then
  run_step "uHOME-client server release gate" bash "$UHOME_FAMILY_ROOT/uHOME-client/scripts/run-client-server-release-gate.sh"
fi

echo "Family release gates passed."
