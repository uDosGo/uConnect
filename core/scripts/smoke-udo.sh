#!/usr/bin/env bash
# Non-interactive smoke: exercises `udo` commands (VA1). Skips `publish preview` (blocking server).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$ROOT/node_modules/.bin:$PATH"
VAULT="${UDOS_VAULT:-$(mktemp -d "${TMPDIR:-/tmp}/udo-smoke-XXXXXX")}"
export UDOS_VAULT="$VAULT"
BIN="node $ROOT/bin/udo.mjs"
cd "$ROOT"
npm run build --silent

echo "UDOS_VAULT=$VAULT"
$BIN help | head -3
$BIN version
$BIN doctor
$BIN init
$BIN list
echo "# Smoke" > "$VAULT/content/smoke.md"
$BIN md lint content/smoke.md
$BIN md toc content/smoke.md
$BIN md format content/smoke.md
$BIN fm add content/smoke.md --tag public
$BIN fm list content/smoke.md
$BIN template list | head -5 || true
$BIN usxd list
$BIN usxd apply default
$BIN usxd show
$BIN publish build
test -f "$VAULT/.site/index.html"
test -f "$VAULT/.site/build.json"
$BIN publish status
echo '{"id":1}' >> "$VAULT/feeds/test.jsonl"
$BIN feed list
$BIN feed view test
$BIN spool list
$BIN sync status
$BIN status
$BIN cleanup || true
echo "OK smoke (preview not run — use: udo publish preview)"
