#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${repo_root}"

echo "[story] running usxd-go story tests"
(
  cd modules/usxd-go
  go test ./story
)

echo "[story] running onboarding story example"
story_output="$(cd modules/usxd-go && go run ./examples/story-onboarding)"

echo "[story] validating serialized story envelope"
STORY_OUTPUT="${story_output}" python3 - <<'PY'
import json
import os

text = os.environ["STORY_OUTPUT"]
start = text.find("{")
if start == -1:
    raise SystemExit("story example did not emit JSON envelope")

doc = json.loads(text[start:])
open_box = doc.get("open_box", {})
if open_box.get("type") != "application/vnd.usxd.story":
    raise SystemExit("unexpected story mime type")
if not str(open_box.get("usxd_version", "")).startswith("v0.2.0-alpha."):
    raise SystemExit("unexpected story usxd_version")
if "story" not in doc:
    raise SystemExit("missing story object")
print("[story] story envelope keys OK")
PY

echo "[story] validating story schema contract"
(
  cd modules/usxd-go
  go test ./schema -run Story
)

echo "[story] checks passed"
