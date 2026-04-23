#!/usr/bin/env bash
# Compare upstream uDosDev / uDosDocs clones against monorepo dev/ and docs/.
# Requires throwaway full clones (not --depth only for accurate .git exclude — shallow is fine).
#
# Usage:
#   ./compare-upstream-migration-delta.sh
#   UDOS_UPSTREAM_DEV=/path/to/uDosDev UDOS_UPSTREAM_DOCS=/path/to/uDosDocs ./compare-upstream-migration-delta.sh
#
# From repo root:
#   dev/workflow/compare-upstream-migration-delta.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
UDEV="${UDOS_UPSTREAM_DEV:-/tmp/udos-upstream-dev}"
UDOCS="${UDOS_UPSTREAM_DOCS:-/tmp/udos-upstream-docs}"

EXCLUDES=(
  --exclude='.git/'
  --exclude='.compost/'
  --exclude='.cursor/'
  --exclude='.github/'
  --exclude='node_modules/'
  --exclude='.DS_Store'
)

die() { echo "error: $*" >&2; exit 1; }

[[ -d "$REPO_ROOT/dev" ]] || die "expected $REPO_ROOT/dev"
[[ -d "$REPO_ROOT/docs" ]] || die "expected $REPO_ROOT/docs"

if [[ ! -d "$UDEV/.git" ]]; then
  die "missing uDosDev clone at $UDEV — git clone https://github.com/fredporter/uDosDev.git $UDEV"
fi
if [[ ! -d "$UDOCS/.git" ]]; then
  die "missing uDosDocs clone at $UDOCS — git clone https://github.com/fredporter/uDosDocs.git $UDOCS"
fi

echo "Repo root: $REPO_ROOT"
echo "Upstream uDosDev: $UDEV"
echo "Upstream uDosDocs: $UDOCS"
echo "rsync excludes: ${EXCLUDES[*]}"
echo ""

lines_dev="$(rsync -ani "${EXCLUDES[@]}" "$UDEV/" "$REPO_ROOT/dev/" | wc -l | tr -d ' ')"
lines_docs="$(rsync -ani "${EXCLUDES[@]}" "$UDOCS/" "$REPO_ROOT/docs/" | wc -l | tr -d ' ')"

echo "Filtered dry-run line counts (not file counts):"
echo "  uDosDev  -> dev/:   $lines_dev"
echo "  uDosDocs -> docs/:  $lines_docs"
echo ""
echo "First 25 lines (dev delta):"
rsync -ani "${EXCLUDES[@]}" "$UDEV/" "$REPO_ROOT/dev/" 2>/dev/null | head -25 || true
echo ""
echo "Tip: full output — rsync -ani \"\${EXCLUDES[@]}\" \"$UDEV/\" \"$REPO_ROOT/dev/\" | less"
