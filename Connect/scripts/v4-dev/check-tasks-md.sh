#!/usr/bin/env bash
# Verify canonical task files for uDosConnect (monorepo-only).
set -eu
CODE_ROOT="${UDOS_CODE_ROOT:-$HOME/Code}"
missing=0
ROOT="$CODE_ROOT/uDosConnect"
if [[ ! -d "$ROOT" ]]; then
  echo "SKIP  uDosConnect (not cloned under $CODE_ROOT)"
  exit 0
fi
if [[ -f "$ROOT/TASKS.md" ]]; then
  echo "OK  uDosConnect/TASKS.md"
else
  echo "MISSING  uDosConnect/TASKS.md"
  missing=1
fi
if [[ -f "$ROOT/dev/TASKS.md" ]]; then
  echo "OK  uDosConnect/dev/TASKS.md"
else
  echo "MISSING  uDosConnect/dev/TASKS.md"
  missing=1
fi
exit "$missing"
