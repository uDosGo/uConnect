#!/usr/bin/env bash

set -eu

UDOS_HOME="${UDOS_HOME:-$HOME/.udos}"

udos_managed_root_names() {
  printf '%s\n' \
    bin \
    envs \
    tools \
    cache \
    state \
    logs \
    tmp \
    vault \
    publish \
    memory \
    library \
    sync
}

udos_runtime_path() {
  local name="$1"
  printf '%s\n' "$UDOS_HOME/$name"
}

ensure_udos_managed_roots() {
  local name
  while IFS= read -r name; do
    mkdir -p "$(udos_runtime_path "$name")"
  done < <(udos_managed_root_names)
}

print_udos_managed_roots() {
  local name
  while IFS= read -r name; do
    printf '%s\n' "$(udos_runtime_path "$name")"
  done < <(udos_managed_root_names)
}
