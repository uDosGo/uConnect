#!/usr/bin/env bash

set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DRY_RUN="${DRY_RUN:-0}"
SKIP_COMPOST="${SKIP_COMPOST:-1}"

echo "Cleaning local runtime debris under: $ROOT_DIR"
echo "Preserving node_modules and dist/build directories."
echo "DRY_RUN=$DRY_RUN"

ROOT_DIR="$ROOT_DIR" python3 - <<'PY'
import os
import shutil
from pathlib import Path

root = Path(os.environ["ROOT_DIR"]).resolve()
dry_run = os.environ.get("DRY_RUN", "0") == "1"
skip_compost = os.environ.get("SKIP_COMPOST", "1") == "1"

targets = {
    ".venv",
    "venv",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    ".run",
}

protected_names = {"node_modules", "dist", "build"}

removed = []
saved_bytes = 0

for current_root, dirnames, _ in os.walk(root):
    p = Path(current_root)
    rel = p.relative_to(root)
    if skip_compost and rel.parts and rel.parts[0] == ".compost":
        dirnames[:] = []
        continue

    # never descend into preserved runtime/build dirs
    dirnames[:] = [d for d in dirnames if d not in protected_names]

    for d in list(dirnames):
        if d in targets:
            target = p / d
            try:
                size = 0
                for sub_root, _, files in os.walk(target):
                    for f in files:
                        fp = Path(sub_root) / f
                        try:
                            size += fp.stat().st_size
                        except OSError:
                            pass
                saved_bytes += size
            except OSError:
                pass

            removed.append((target, size))
            if not dry_run:
                shutil.rmtree(target, ignore_errors=True)
            dirnames.remove(d)

print(f"targets matched: {len(removed)}")
for path, size in removed:
    print(f"{path} | {size / 1024 / 1024:.1f} MB")
print(f"estimated reclaimed: {saved_bytes / 1024 / 1024:.1f} MB")
print("mode:", "dry-run" if dry_run else "applied")
PY
