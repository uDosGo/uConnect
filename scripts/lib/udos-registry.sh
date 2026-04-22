#!/usr/bin/env bash

set -eu

ROOT_DIR="${ROOT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"

resolve_udos_registry_file() {
  local domain="$1"
  local registry_name="$2"

  case "$domain" in
    themes)
      printf '%s\n' "$ROOT_DIR/uDOS-themes/registry/$registry_name"
      ;;
    plugins)
      printf '%s\n' "$ROOT_DIR/uDOS-plugin-index/$registry_name"
      ;;
    commandd)
      printf '%s\n' "$ROOT_DIR/uDOS-host/contracts/udos-commandd/$registry_name"
      ;;
    *)
      echo "unknown registry domain: $domain" >&2
      return 1
      ;;
  esac
}

require_udos_registry_file() {
  local path
  path="$(resolve_udos_registry_file "$1" "$2")"
  if [ ! -f "$path" ]; then
    echo "missing registry file: $path" >&2
    return 1
  fi
  printf '%s\n' "$path"
}
