#!/usr/bin/env bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SONIC_FAMILY_ROOT="${UDOS_SONIC_FAMILY_ROOT:-$ROOT_DIR/../sonic-family}"
UHOME_FAMILY_ROOT="${UDOS_UHOME_FAMILY_ROOT:-$ROOT_DIR/../uHOME-family}"

# shellcheck source=scripts/lib/family-python.sh
. "$SCRIPT_DIR/lib/family-python.sh"
ensure_shared_python

"$SCRIPT_DIR/bootstrap-family-python.sh" >/dev/null

export UDOS_SHARED_PYTHON_BIN
export UDOS_USE_SHARED_RESOURCES=1

run_step() {
  local label="$1"
  shift
  echo "==> $label"
  "$@"
}

run_step_if_present() {
  local label="$1"
  local script_path="$2"
  shift 2
  if [ -f "$script_path" ]; then
    run_step "$label" "$@" "$script_path"
  else
    echo "==> $label (skipped: missing $script_path)"
  fi
}

if [ -f "$ROOT_DIR/uDOS-core/scripts/run-core-checks.sh" ]; then
  run_step "uDOS-core checks" bash "$ROOT_DIR/uDOS-core/scripts/run-core-checks.sh"
else
  run_step "uDosConnect monorepo checks" npm run verify:a1
fi
if [ -f "$ROOT_DIR/uDOS-plugin-index/scripts/run-plugin-index-checks.sh" ]; then
  run_step "uDOS-plugin-index checks" bash "$ROOT_DIR/uDOS-plugin-index/scripts/run-plugin-index-checks.sh"
fi
run_step_if_present \
  "uDOS-wizard checks" \
  "$ROOT_DIR/uDOS-wizard/scripts/run-wizard-checks.sh" \
  bash
if [ -f "$ROOT_DIR/uDOS-gameplay/scripts/run-gameplay-checks.sh" ]; then
  run_step "uDOS-gameplay checks" bash "$ROOT_DIR/uDOS-gameplay/scripts/run-gameplay-checks.sh"
fi
if [ -f "$ROOT_DIR/uDOS-grid/scripts/run-grid-checks.sh" ]; then
  run_step "uDOS-grid checks" bash "$ROOT_DIR/uDOS-grid/scripts/run-grid-checks.sh"
fi
if [ -f "$UHOME_FAMILY_ROOT/uHOME-server/scripts/run-uhome-server-checks.sh" ]; then
  run_step "uHOME-server checks" bash "$UHOME_FAMILY_ROOT/uHOME-server/scripts/run-uhome-server-checks.sh"
fi
run_step_if_present \
  "uDOS-empire checks" \
  "$ROOT_DIR/uDOS-empire/scripts/run-empire-checks.sh" \
  bash
if [ -f "$UHOME_FAMILY_ROOT/uHOME-client/scripts/run-uhome-client-checks.sh" ]; then
  run_step "uHOME-client checks" bash "$UHOME_FAMILY_ROOT/uHOME-client/scripts/run-uhome-client-checks.sh"
fi
if [ -f "$ROOT_DIR/uDOS-groovebox/scripts/run-groovebox-checks.sh" ]; then
  run_step "uDOS-groovebox checks" bash "$ROOT_DIR/uDOS-groovebox/scripts/run-groovebox-checks.sh"
fi
if [ -f "$SONIC_FAMILY_ROOT/sonic-screwdriver/scripts/run-sonic-checks.sh" ]; then
  run_step "sonic-screwdriver checks" bash "$SONIC_FAMILY_ROOT/sonic-screwdriver/scripts/run-sonic-checks.sh"
fi
if [ -f "$ROOT_DIR/uDOS-thinui/scripts/run-thinui-checks.sh" ]; then
  run_step "uDOS-thinui checks" bash "$ROOT_DIR/uDOS-thinui/scripts/run-thinui-checks.sh"
fi
if [ -f "$ROOT_DIR/uDOS-workspace/scripts/run-workspace-checks.sh" ]; then
  run_step "uDOS-workspace checks" bash "$ROOT_DIR/uDOS-workspace/scripts/run-workspace-checks.sh"
fi
if [ -f "$ROOT_DIR/uDOS-themes/scripts/run-theme-checks.sh" ]; then
  run_step "uDOS-themes checks" bash "$ROOT_DIR/uDOS-themes/scripts/run-theme-checks.sh"
fi
if [ -f "$ROOT_DIR/uDOS-docs/scripts/run-docs-checks.sh" ]; then
  run_step "uDOS-docs checks" bash "$ROOT_DIR/uDOS-docs/scripts/run-docs-checks.sh"
fi
if [ -f "$ROOT_DIR/uDOS-alpine/scripts/run-alpine-checks.sh" ]; then
  run_step "uDOS-alpine checks" bash "$ROOT_DIR/uDOS-alpine/scripts/run-alpine-checks.sh"
fi
if [ -f "$ROOT_DIR/uDOS-host/scripts/run-ubuntu-checks.sh" ]; then
  run_step "uDOS-host checks" bash "$ROOT_DIR/uDOS-host/scripts/run-ubuntu-checks.sh"
fi
if [ -f "$SONIC_FAMILY_ROOT/sonic-ventoy/scripts/run-ventoy-checks.sh" ]; then
  run_step "sonic-ventoy checks" bash "$SONIC_FAMILY_ROOT/sonic-ventoy/scripts/run-ventoy-checks.sh"
fi

echo "All family checks passed with shared python: $UDOS_SHARED_PYTHON_BIN"
