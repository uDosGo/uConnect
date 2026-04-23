#!/usr/bin/env bash

set -eu

UDOS_HOME="${UDOS_HOME:-$HOME/.udos}"

if [ ! -d "$UDOS_HOME" ]; then
  echo "No uDOS managed directory found at: $UDOS_HOME"
  exit 0
fi

echo "uDOS footprint: $UDOS_HOME"
echo
echo "Top-level usage:"
if command -v du >/dev/null 2>&1; then
  du -sh "$UDOS_HOME"/* 2>/dev/null | sort -h || true
fi

echo
echo "More detail (sorted by size):"

if command -v du >/dev/null 2>&1; then
  # Use numeric sort so MB/GB ordering is correct.
  du -m "$UDOS_HOME"/* 2>/dev/null \
    | sort -nr \
    | head -n 20 \
    | awk '{printf "%6s MB\t%s\n", $1, $2}'
fi

echo
echo "Environment binaries present:"
if [ -d "$UDOS_HOME/envs" ]; then
  ls -1 "$UDOS_HOME/envs" 2>/dev/null | sed 's/^/  - /' || true
fi

echo
echo "Caches present:"
if [ -d "$UDOS_HOME/cache" ]; then
  ls -1 "$UDOS_HOME/cache" 2>/dev/null | sed 's/^/  - /' || true
fi

echo
echo "Runtime health:"
echo "  run scripts/run-udos-runtime-health.sh for storage, stale-file, and debris monitoring"
