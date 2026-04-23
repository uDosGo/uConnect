#!/usr/bin/env bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$SCRIPT_DIR/family-repos.sh"

repo_name="${1:-$(basename "$PWD")}"
repo_path="${2:-$PWD}"

require_file() {
  local path="$1"
  if [ ! -f "$repo_path/$path" ]; then
    echo "Missing required file: $path" >&2
    exit 1
  fi
}

require_dir() {
  local path="$1"
  if [ ! -d "$repo_path/$path" ]; then
    echo "Missing required directory: $path" >&2
    exit 1
  fi
}

require_file README.md
require_file .github/CODEOWNERS
if [ ! -f "$repo_path/.github/pull_request_template.md" ] && [ ! -f "$repo_path/.github/PULL_REQUEST_TEMPLATE.md" ]; then
  echo "Missing required file: .github/pull_request_template.md" >&2
  exit 1
fi
require_file .github/ISSUE_TEMPLATE/binder-backed-work-item.yml

if is_public_repo "$repo_name"; then
  require_dir docs
  require_file docs/architecture.md
  require_file docs/boundary.md
  require_file docs/getting-started.md
  require_file .github/workflows/validate.yml
  require_file .github/workflows/family-policy-check.yml
else
  require_file .github/workflows/validate.yml
fi

# Optional: .github/workflows/promote.yml — legacy develop→main automation; not
# required for main-line repos (see uDOS-host as the refreshed integration anchor).

echo "Governance checks passed for $repo_name"
