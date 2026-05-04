#!/usr/bin/env bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$SCRIPT_DIR/family-repos.sh"

for repo in "${all_repos[@]}"; do
  echo "=== $repo ==="
  "$SCRIPT_DIR/check-repo-governance.sh" "$repo" "$ROOT_DIR/$repo"
  git -C "$ROOT_DIR/$repo" status --short --branch
  if is_public_repo "$repo"; then
    git -C "$ROOT_DIR/$repo" branch --list develop
    gh api "repos/${OWNER}/${repo}/branches/main/protection" >/dev/null
  fi
done
