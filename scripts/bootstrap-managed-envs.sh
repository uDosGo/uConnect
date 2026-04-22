#!/usr/bin/env sh
set -eu

UDOS_HOME="${UDOS_HOME:-$HOME/.udos}"

mkdir -p "$UDOS_HOME/envs"          "$UDOS_HOME/tools"          "$UDOS_HOME/cache"          "$UDOS_HOME/state"          "$UDOS_HOME/logs"          "$UDOS_HOME/state/ucode"          "$UDOS_HOME/state/jobs"

echo "Managed uDOS directories prepared under: $UDOS_HOME"
