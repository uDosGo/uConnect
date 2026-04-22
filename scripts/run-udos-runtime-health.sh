#!/usr/bin/env bash

set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WARN_USAGE_PCT="${WARN_USAGE_PCT:-85}"
STALE_DAYS="${STALE_DAYS:-7}"

# shellcheck source=scripts/lib/udos-paths.sh
. "$ROOT_DIR/scripts/lib/udos-paths.sh"

echo "uDOS runtime health"
echo "root: $ROOT_DIR"
echo "udos_home: $UDOS_HOME"
echo

echo "==> required runtime roots"
missing=0
while IFS= read -r path; do
  if [ -e "$path" ]; then
    echo "OK   $path"
  else
    echo "MISS $path"
    missing=$((missing + 1))
  fi
done < <(print_udos_managed_roots)

echo
echo "==> filesystem usage"
if command -v df >/dev/null 2>&1; then
  df -h "$HOME" 2>/dev/null | sed 's/^/  /' || true
fi

usage_pct=""
if command -v df >/dev/null 2>&1; then
  usage_pct="$(df -Pk "$HOME" 2>/dev/null | awk 'NR==2 {gsub(/%/, "", $5); print $5}')"
fi
if [ -n "${usage_pct:-}" ]; then
  if [ "$usage_pct" -ge "$WARN_USAGE_PCT" ]; then
    echo "WARN filesystem usage is ${usage_pct}% (threshold ${WARN_USAGE_PCT}%)"
  else
    echo "OK   filesystem usage is ${usage_pct}%"
  fi
fi

echo
echo "==> top-level ~/.udos usage"
if [ -d "$UDOS_HOME" ] && command -v du >/dev/null 2>&1; then
  du -sh "$UDOS_HOME"/* 2>/dev/null | sort -h | sed 's/^/  /' || true
else
  echo "  ~/.udos not present yet"
fi

echo
echo "==> largest ~/.udos entries"
if [ -d "$UDOS_HOME" ] && command -v du >/dev/null 2>&1; then
  du -m "$UDOS_HOME"/* 2>/dev/null | sort -nr | head -n 20 | awk '{printf "  %6s MB\t%s\n", $1, $2}' || true
fi

echo
echo "==> stale cleanup candidates"
for bucket in cache tmp logs; do
  target="$UDOS_HOME/$bucket"
  if [ -d "$target" ]; then
    count="$(find "$target" -type f -mtime +"$STALE_DAYS" 2>/dev/null | wc -l | tr -d ' ')"
    echo "  $target files older than $STALE_DAYS days: $count"
  fi
done

echo
echo "==> workspace debris indicators"
if command -v find >/dev/null 2>&1; then
  ds_count="$(find "$ROOT_DIR" -name '.DS_Store' ! -path "$ROOT_DIR/.compost/*" ! -path '*/.git/*' 2>/dev/null | wc -l | tr -d ' ')"
  pycache_count="$(find "$ROOT_DIR" -name '__pycache__' ! -path "$ROOT_DIR/.compost/*" ! -path '*/.git/*' 2>/dev/null | wc -l | tr -d ' ')"
  pytest_count="$(find "$ROOT_DIR" -name '.pytest_cache' ! -path "$ROOT_DIR/.compost/*" ! -path '*/.git/*' 2>/dev/null | wc -l | tr -d ' ')"
  echo "  .DS_Store count: $ds_count"
  echo "  __pycache__ count: $pycache_count"
  echo "  .pytest_cache count: $pytest_count"
fi

echo
echo "==> compost usage"
if [ -d "$ROOT_DIR/.compost" ] && command -v du >/dev/null 2>&1; then
  du -sh "$ROOT_DIR/.compost" 2>/dev/null | sed 's/^/  /' || true
fi

echo
echo "==> summary"
echo "missing_runtime_roots=$missing"
echo "stale_days_threshold=$STALE_DAYS"
echo "warn_usage_pct=$WARN_USAGE_PCT"
