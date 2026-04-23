#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
vendor_dir="${repo_root}/vendor/markdownify-mcp"
venv_dir="${vendor_dir}/.venv"

# Pin to a known-good upstream commit to keep installs reproducible.
MARKITDOWN_REF="${MARKITDOWN_REF:-604bba13da2f43b756b49122cb65bdedb85b1dff}"
MARKITDOWN_SPEC="markitdown[all] @ git+https://github.com/microsoft/markitdown.git@${MARKITDOWN_REF}#subdirectory=packages/markitdown"

if command -v python3.11 >/dev/null 2>&1; then
  py_bin="python3.11"
elif command -v python3 >/dev/null 2>&1; then
  py_bin="python3"
else
  echo "[markdownify] error: python3.11 or python3 is required" >&2
  exit 1
fi

py_version="$(${py_bin} -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
py_major="${py_version%%.*}"
py_minor="${py_version##*.}"
if [ "${py_major}" -lt 3 ] || { [ "${py_major}" -eq 3 ] && [ "${py_minor}" -lt 10 ]; }; then
  echo "[markdownify] error: ${py_bin}=${py_version} is too old; need Python >= 3.10" >&2
  exit 1
fi

echo "[markdownify] using ${py_bin} (${py_version})"
cd "${vendor_dir}"
"${py_bin}" -m venv "${venv_dir}"
"${venv_dir}/bin/python" -m pip install --upgrade pip
"${venv_dir}/bin/pip" install "${MARKITDOWN_SPEC}"

if [ ! -x "${venv_dir}/bin/markitdown" ]; then
  echo "[markdownify] error: expected ${venv_dir}/bin/markitdown after install" >&2
  exit 1
fi

echo "[markdownify] installed at ${venv_dir}/bin/markitdown"
echo "[markdownify] run: cargo run --manifest-path core-rs/Cargo.toml -- import-status"
