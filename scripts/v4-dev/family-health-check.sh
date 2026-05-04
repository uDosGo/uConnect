#!/usr/bin/env bash
# v4 brief alias: task surface + optional USXD surface validation.
set -eu
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
bash "$SCRIPT_DIR/check-tasks-md.sh"
USXD="${UDOS_CODE_ROOT:-$HOME/Code}/UniversalSurfaceXD"
if [[ -f "$USXD/package.json" ]] && grep -q 'ux:validate-surfaces' "$USXD/package.json" 2>/dev/null; then
  echo "==> UniversalSurfaceXD npm run ux:validate-surfaces"
  (cd "$USXD" && npm run ux:validate-surfaces)
else
  echo "==> skip ux:validate-surfaces (no USXD or script missing)"
fi
