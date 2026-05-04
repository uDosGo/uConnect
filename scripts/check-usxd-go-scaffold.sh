#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${repo_root}"

echo "[usxd-go] running module tests"
(
  cd modules/usxd-go
  go test ./...
)

port="${USXD_GO_PORT:-18099}"
echo "[usxd-go] starting server on port ${port}"

tmp_log="$(mktemp)"
cleanup() {
  if [ -n "${server_pid:-}" ] && kill -0 "${server_pid}" 2>/dev/null; then
    kill "${server_pid}" 2>/dev/null || true
    wait "${server_pid}" 2>/dev/null || true
  fi
  rm -f "${tmp_log}"
}
trap cleanup EXIT

(
  cd modules/usxd-go
  USXD_GO_PORT="${port}" go run ./cmd/usxd-server >"${tmp_log}" 2>&1
) &
server_pid=$!

for _ in {1..20}; do
  if curl -sf "http://localhost:${port}/healthz" >/dev/null; then
    break
  fi
  sleep 0.25
done

echo "[usxd-go] checking /healthz"
curl -sf "http://localhost:${port}/healthz" >/dev/null

echo "[usxd-go] checking /api/usxd/state"
state_json="$(curl -sf "http://localhost:${port}/api/usxd/state")"
STATE_JSON="${state_json}" python3 - <<'PY'
import json
import os

doc = json.loads(os.environ["STATE_JSON"])
required = ["open_box", "chassis", "widgets"]
missing = [k for k in required if k not in doc]
if missing:
    raise SystemExit(f"missing required state keys: {', '.join(missing)}")
print("[usxd-go] state payload keys OK")
PY

echo "[usxd-go] scaffold checks passed"
