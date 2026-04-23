#!/usr/bin/env bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> bootstrap shared resources"
bash "$SCRIPT_DIR/bootstrap-family-python.sh"

echo "==> audit env overlap"
bash "$SCRIPT_DIR/audit-family-env-overlap.sh"

echo "==> runtime health"
bash "$SCRIPT_DIR/run-udos-runtime-health.sh"

echo "==> run family checks"
bash "$SCRIPT_DIR/run-family-checks.sh"

echo "==> run family release gates"
bash "$SCRIPT_DIR/run-family-release-gates.sh"

echo
echo "uDOS family is release-ready on this machine."
