#!/usr/bin/env bash

set -eu

# shellcheck source=scripts/lib/udos-paths.sh
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/udos-paths.sh"

UDOS_ENV_NAME="${UDOS_ENV_NAME:-family-py311}"
UDOS_PYTHON_VERSION="${UDOS_PYTHON_VERSION:-3.11}"
UDOS_SHARED_ENV_DIR="${UDOS_SHARED_ENV_DIR:-$(udos_runtime_path envs)/$UDOS_ENV_NAME}"
UDOS_SHARED_PYTHON_BIN="${UDOS_SHARED_PYTHON_BIN:-$UDOS_SHARED_ENV_DIR/bin/python}"

configure_shared_runtime_env() {
  ensure_udos_managed_roots
  mkdir -p "$(udos_runtime_path cache)/pip" "$(udos_runtime_path cache)/uv" "$(udos_runtime_path cache)/pytest" "$(udos_runtime_path cache)/pycache"
  export PIP_CACHE_DIR="${PIP_CACHE_DIR:-$(udos_runtime_path cache)/pip}"
  export UV_CACHE_DIR="${UV_CACHE_DIR:-$(udos_runtime_path cache)/uv}"
  export PYTHONPYCACHEPREFIX="${PYTHONPYCACHEPREFIX:-$(udos_runtime_path cache)/pycache}"

  if [ -z "${PYTEST_ADDOPTS:-}" ]; then
    export PYTEST_ADDOPTS="-o cache_dir=$(udos_runtime_path cache)/pytest"
  else
    case "$PYTEST_ADDOPTS" in
      *"cache_dir="*) ;;
      *) export PYTEST_ADDOPTS="$PYTEST_ADDOPTS -o cache_dir=$(udos_runtime_path cache)/pytest" ;;
    esac
  fi
}

ensure_shared_python() {
  configure_shared_runtime_env

  if [ -x "$UDOS_SHARED_PYTHON_BIN" ]; then
    return 0
  fi

  mkdir -p "$(udos_runtime_path envs)"

  if ! command -v uv >/dev/null 2>&1; then
    echo "uv is required to create shared family python environment." >&2
    echo "Install uv and rerun: https://docs.astral.sh/uv/getting-started/installation/" >&2
    exit 1
  fi

  uv python install "$UDOS_PYTHON_VERSION"
  uv venv --python "$UDOS_PYTHON_VERSION" "$UDOS_SHARED_ENV_DIR"
}

print_shared_python_summary() {
  echo "shared env: $UDOS_SHARED_ENV_DIR"
  "$UDOS_SHARED_PYTHON_BIN" --version
}
