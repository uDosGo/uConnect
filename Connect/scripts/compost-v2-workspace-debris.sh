#!/usr/bin/env bash

set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATE_STAMP="$(date '+%Y-%m-%d')"
TIME_STAMP="$(date '+%H%M%S')"
COMPOST_ROOT="$ROOT_DIR/.compost/$DATE_STAMP"
TRASH_ROOT="$COMPOST_ROOT/trash/$TIME_STAMP/workspace-debris"
ARCHIVE_ROOT="$COMPOST_ROOT/archive/$TIME_STAMP/repo-workspaces"
MANIFEST_PATH="$COMPOST_ROOT/archive/$TIME_STAMP/manifest.txt"
RUNTIME_REPORT_PATH="$COMPOST_ROOT/archive/$TIME_STAMP/runtime-health-scan.txt"
UDOS_HOME="${UDOS_HOME:-$HOME/.udos}"

mkdir -p "$TRASH_ROOT" "$ARCHIVE_ROOT"

move_with_parents() {
  local source="$1"
  local dest_root="$2"
  local rel="${source#$ROOT_DIR/}"

  mkdir -p "$(dirname "$dest_root/$rel")"
  mv "$source" "$dest_root/$rel"
  printf '%s -> %s\n' "$source" "$dest_root/$rel" >>"$MANIFEST_PATH"
}

printf 'uDOS v2 compost run\n' >"$MANIFEST_PATH"
printf 'date=%s\n' "$DATE_STAMP" >>"$MANIFEST_PATH"
printf 'time=%s\n' "$TIME_STAMP" >>"$MANIFEST_PATH"

while IFS= read -r path; do
  [ -e "$path" ] || continue
  move_with_parents "$path" "$TRASH_ROOT"
done <<EOF
$(find "$ROOT_DIR" -maxdepth 2 \
  \( -name '.DS_Store' -o -name '.pytest_cache' -o -name '__pycache__' \) \
  ! -path "$ROOT_DIR/.compost/*" \
  ! -path '*/.git/*' | sort)
EOF

for retired in \
  "$ROOT_DIR/sonic-screwdriver/sonic-stick.code-workspace" \
  "$ROOT_DIR/uHOME-server/uHOME-server.code-workspace"; do
  if [ -e "$retired" ]; then
    move_with_parents "$retired" "$ARCHIVE_ROOT"
  fi
done

printf 'manifest=%s\n' "$MANIFEST_PATH"

{
  printf 'uDOS runtime scan\n'
  printf 'udos_home=%s\n' "$UDOS_HOME"
  if [ -d "$UDOS_HOME" ]; then
    printf '\n[top-level-usage]\n'
    du -sh "$UDOS_HOME"/* 2>/dev/null | sort -h || true
    printf '\n[stale-cache-files-older-than-7-days]\n'
    find "$UDOS_HOME/cache" -type f -mtime +7 2>/dev/null | sort || true
    printf '\n[stale-tmp-files-older-than-7-days]\n'
    find "$UDOS_HOME/tmp" -type f -mtime +7 2>/dev/null | sort || true
    printf '\n[stale-log-files-older-than-7-days]\n'
    find "$UDOS_HOME/logs" -type f -mtime +7 2>/dev/null | sort || true
  else
    printf 'udos_home_missing=1\n'
  fi
} >"$RUNTIME_REPORT_PATH"

printf 'runtime_scan=%s\n' "$RUNTIME_REPORT_PATH"
