#!/usr/bin/env bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$SCRIPT_DIR/family-repos.sh"

ensure_develop_branch() {
  local repo="$1"
  if ! git -C "$ROOT_DIR/$repo" rev-parse --verify develop >/dev/null 2>&1; then
    git -C "$ROOT_DIR/$repo" branch develop main
  fi
  if ! git ls-remote --exit-code --heads "git@github.com:${OWNER}/${repo}.git" develop >/dev/null 2>&1; then
    git -C "$ROOT_DIR/$repo" push -u origin develop
  fi
}

set_repo_metadata() {
  local repo="$1"
  local description topics homepage
  local topic
  description="$(repo_description "$repo")"
  topics="$(repo_topics "$repo")"
  homepage="$(repo_docs_url "$repo")"

  if [ -n "$homepage" ]; then
    gh repo edit "${OWNER}/${repo}" --description "$description" --homepage "$homepage"
  else
    gh repo edit "${OWNER}/${repo}" --description "$description"
  fi
  if [ -n "$topics" ]; then
    for topic in $(printf '%s' "$topics" | tr ',' ' '); do
      gh repo edit "${OWNER}/${repo}" --add-topic "$topic"
    done
  fi
}

set_labels() {
  local repo="$1"
  gh label create binder --repo "${OWNER}/${repo}" --color "0052CC" --description "Binder-backed work item" --force
  gh label create boundary --repo "${OWNER}/${repo}" --color "5319E7" --description "Ownership or cross-repo boundary change" --force
  gh label create contract --repo "${OWNER}/${repo}" --color "1D76DB" --description "Runtime or public contract change" --force
  gh label create docs --repo "${OWNER}/${repo}" --color "0E8A16" --description "Documentation or educational surface" --force
  gh label create release --repo "${OWNER}/${repo}" --color "D93F0B" --description "Release or promotion work" --force
  gh label create blocked --repo "${OWNER}/${repo}" --color "B60205" --description "Blocked by dependency or prerequisite" --force
  gh label create cross-repo --repo "${OWNER}/${repo}" --color "FBCA04" --description "Touches more than one repo" --force
}

# Direct pushes to main allowed (no required PR reviews). Linear history kept.
protect_main_branch() {
  local repo="$1"
  gh api \
    --method PUT \
    -H "Accept: application/vnd.github+json" \
    "repos/${OWNER}/${repo}/branches/main/protection" \
    --input - >/dev/null <<'EOF'
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": false,
  "lock_branch": false,
  "allow_fork_syncing": true
}
EOF
}

for repo in "${all_repos[@]}"; do
  set_repo_metadata "$repo"
  set_labels "$repo"
done

for repo in "${public_repos[@]}"; do
  ensure_develop_branch "$repo"
  protect_main_branch "$repo"
done
