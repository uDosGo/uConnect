#!/usr/bin/env bash
# uDos — one-line style install after git clone (Linux / macOS terminal).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SONIC="$ROOT/tools/sonic-express/bin/sonic-express.mjs"

if [[ ! -f "$SONIC" ]]; then
  echo "Expected $SONIC — run this script from a full uDosConnect checkout."
  exit 1
fi

node "$SONIC" install "$@"
echo ""
echo "Try: udo version && udo doctor && udo help"
