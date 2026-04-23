#!/usr/bin/env bash
# Pull latest main (or current branch) for v4 sibling repos under ~/Code.
set -eu
CODE_ROOT="${UDOS_CODE_ROOT:-$HOME/Code}"
REPOS=(
  Linkdown
  Linkdown-premium
  Syncdown-app
  Chatdown
  UniversalSurfaceXD
  uDosConnect
  SonicScrewdriver
  uDosGo
  Ventoy
)
for name in "${REPOS[@]}"; do
  dir="$CODE_ROOT/$name"
  if [[ -d "$dir/.git" ]]; then
    echo "==> $name"
    git -C "$dir" pull --ff-only || echo "    (pull failed — resolve in $dir)"
  else
    echo "==> $name (skip — no clone at $dir)"
  fi
done
