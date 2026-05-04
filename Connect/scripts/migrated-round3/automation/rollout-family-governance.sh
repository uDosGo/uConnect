#!/usr/bin/env bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$SCRIPT_DIR/family-repos.sh"

write_file() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  cat >"$path"
}

write_shared_files() {
  local repo="$1"
  local repo_path="$ROOT_DIR/$repo"
  local visibility="private"
  if is_public_repo "$repo"; then
    visibility="public"
  fi

  write_file "$repo_path/.github/CODEOWNERS" <<EOF
* @fredporter
EOF

  write_file "$repo_path/.github/PULL_REQUEST_TEMPLATE.md" <<EOF
## Summary

- binder:
- target branch:
- repo role:

## Checks

- [ ] docs updated where needed
- [ ] boundary ownership confirmed
- [ ] tests or validation run
- [ ] promotion notes added if this targets \`main\`
EOF

  write_file "$repo_path/.github/PULL_REQUEST_TEMPLATE/release-promotion.md" <<EOF
## Release Promotion

- source branch: \`develop\`
- target branch: \`main\`
- release tag:
- binder or release note:

## Promotion Checks

- [ ] validation passed on \`develop\`
- [ ] family policy checks passed
- [ ] release notes reviewed
- [ ] cross-repo dependency order confirmed
EOF

  write_file "$repo_path/.github/ISSUE_TEMPLATE/binder-backed-work-item.yml" <<EOF
name: Binder-backed work item
description: Track a binder-scoped change in the v2 repo family.
title: "[binder] "
labels: ["binder"]
body:
  - type: input
    id: binder
    attributes:
      label: Binder ID
      description: Use #binder/<repo-or-stream>-<objective>
      placeholder: "#binder/dev-family-sync-policy"
    validations:
      required: true
  - type: dropdown
    id: repo
    attributes:
      label: Owning repo
      options:
        - uDOS-core
        - uDOS-shell
        - sonic-screwdriver
        - uDOS-plugin-index
        - uDOS-wizard
        - uDOS-gameplay
        - uDOS-groovebox
        - uDOS-empire
        - uHOME-matter
        - uDOS-dev
        - uDOS-themes
        - uDOS-docs
        - uDOS-alpine
        - uDOS-host
        - sonic-ventoy
        - uHOME-client
        - uHOME-server
        - omd-mac-osx-app
        - uHOME-app-android
        - uHOME-app-ios
    validations:
      required: true
  - type: textarea
    id: objective
    attributes:
      label: Objective
    validations:
      required: true
  - type: textarea
    id: acceptance
    attributes:
      label: Acceptance criteria
    validations:
      required: true
EOF

  write_file "$repo_path/.github/ISSUE_TEMPLATE/cross-repo-boundary-change.yml" <<EOF
name: Cross-repo boundary change
description: Track a dependency or ownership change that affects more than one repo.
title: "[boundary] "
labels: ["boundary", "cross-repo"]
body:
  - type: input
    id: binder
    attributes:
      label: Binder ID
      placeholder: "#binder/core-dependency-matrix"
    validations:
      required: true
  - type: textarea
    id: repos
    attributes:
      label: Affected repos
      description: List the dependency owner first, then downstream repos.
    validations:
      required: true
  - type: textarea
    id: change
    attributes:
      label: Boundary change
    validations:
      required: true
  - type: textarea
    id: risks
    attributes:
      label: Risks and rollout notes
EOF

  if [ "$repo" != "uDOS-dev" ]; then
    if is_public_repo "$repo"; then
      write_file "$repo_path/.github/workflows/validate.yml" <<EOF
name: Validate

on:
  push:
    branches:
      - develop
  pull_request:
    branches:
      - develop
      - main
  workflow_dispatch:

jobs:
  validate:
    uses: ${OWNER}/uDOS-dev/.github/workflows/validate.yml@main
    with:
      governance_mode: ${visibility}
EOF
    else
      write_file "$repo_path/.github/workflows/validate.yml" <<EOF
name: Validate

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  workflow_dispatch:

jobs:
  validate:
    uses: ${OWNER}/uDOS-dev/.github/workflows/validate.yml@main
    with:
      governance_mode: ${visibility}
EOF
    fi
  fi

  if is_public_repo "$repo" && [ "$repo" != "uDOS-dev" ]; then
    write_file "$repo_path/.github/workflows/family-policy-check.yml" <<EOF
name: Family Policy Check

on:
  push:
    branches:
      - develop
      - main
  pull_request:
    branches:
      - develop
      - main
  workflow_dispatch:

jobs:
  family-policy-check:
    uses: ${OWNER}/uDOS-dev/.github/workflows/family-policy-check.yml@main
EOF

    write_file "$repo_path/.github/workflows/promote.yml" <<EOF
name: Promote

on:
  workflow_dispatch:
  pull_request:
    types:
      - closed
    branches:
      - develop

jobs:
  promote:
    if: github.event_name == 'workflow_dispatch' || github.event.pull_request.merged == true
    uses: ${OWNER}/uDOS-dev/.github/workflows/promote.yml@main
EOF

    if [ ! -f "$repo_path/.github/workflows/release.yml" ]; then
      write_file "$repo_path/.github/workflows/release.yml" <<EOF
name: Release

on:
  push:
    tags:
      - 'v*.*.*'
  workflow_dispatch:

jobs:
  release:
    uses: ${OWNER}/uDOS-dev/.github/workflows/release.yml@main
EOF
    fi
  fi
}

for repo in "${all_repos[@]}"; do
  write_shared_files "$repo"
done
