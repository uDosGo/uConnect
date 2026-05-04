#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${repo_root}"

echo "[uos] running module tests"
(
  cd modules/uos
  go test ./...
)

echo "[uos] checking dry-run invocation contract"
uos_output="$(cd modules/uos && go run ./cmd/uos launch airpaint --dry-run --gpu-profile nvidia --runtime docker -- /tmp/example.png --theme dark)"

UOS_OUTPUT="${uos_output}" python3 - <<'PY'
import os

text = os.environ["UOS_OUTPUT"]
required = [
    "effective: docker",
    "gpu_profile: nvidia",
    "--gpus all",
    "NVIDIA_DRIVER_CAPABILITIES=all",
    "airpaint /workspace/.uos-outside",
]
missing = [x for x in required if x not in text]
if missing:
    raise SystemExit(f"uos smoke output missing required markers: {missing}")
print("[uos] dry-run markers OK")
PY

echo "[uos] checks passed"

