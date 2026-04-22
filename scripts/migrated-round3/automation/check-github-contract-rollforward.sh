#!/usr/bin/env bash

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$SCRIPT_DIR/family-repos.sh"

report_mode=0
if [ "${1:-}" = "--report" ]; then
  report_mode=1
fi

# Resolve checkout path: prefer $ROOT_DIR/<repo>, then first match under
# UDOS_GITHUB_CONTRACT_REPO_ROOTS (colon-separated extra roots, e.g. sibling
# `sonic-family` / `uHOME-family` trees). No spaces in paths.
resolve_repo_path() {
  local repo="$1"
  local primary="$ROOT_DIR/$repo"
  if [ -d "$primary" ]; then
    printf '%s' "$primary"
    return 0
  fi
  local roots="${UDOS_GITHUB_CONTRACT_REPO_ROOTS:-}"
  if [ -z "$roots" ]; then
    return 1
  fi
  local _ifs="$IFS"
  IFS=':'
  # shellcheck disable=SC2086
  set -- $roots
  IFS="$_ifs"
  local root
  for root in "$@"; do
    [ -n "$root" ] || continue
    if [ -d "$root/$repo" ]; then
      printf '%s' "$root/$repo"
      return 0
    fi
  done
  return 1
}

check_repo() {
  local repo="$1"
  local path=""
  if resolved="$(resolve_repo_path "$repo")"; then
    path="$resolved"
  fi
  local validate="$path/.github/workflows/validate.yml"
  local policy="$path/.github/workflows/family-policy-check.yml"

  if [ -z "$path" ] || [ ! -d "$path" ]; then
    if [ "$report_mode" -eq 1 ]; then
      echo "$repo|missing-local-repo|n/a|n/a|n/a"
      return 0
    fi
    return 0
  fi

  local has_validate="no"
  local has_policy="no"
  local script_owned="no"

  # Script-owned: local `bash scripts/` / `run-*-checks.sh`, OR caller `uses:` of
  # uDOS-dev reusable validate / family-policy-check (family contract anchor).
  wf_script_owned() {
    local f="$1"
    [ -f "$f" ] || return 1
    grep -Eq "bash scripts/|run-.*checks\\.sh|uses:[[:space:]]*[^[:space:]]*uDOS-dev/\\.github/workflows/(validate|family-policy-check)\\.yml" "$f"
  }

  if [ -f "$validate" ]; then
    has_validate="yes"
    if wf_script_owned "$validate"; then
      script_owned="yes"
    fi
  fi
  if [ -f "$policy" ]; then
    has_policy="yes"
    if [ "$script_owned" = "no" ] && wf_script_owned "$policy"; then
      script_owned="yes"
    fi
  fi

  local status="pending"
  if [ "$has_validate" = "yes" ] && [ "$has_policy" = "yes" ] && [ "$script_owned" = "yes" ]; then
    status="aligned"
  fi

  if [ "$report_mode" -eq 1 ]; then
    echo "$repo|$status|$has_validate|$has_policy|$script_owned"
    return 0
  fi

  if [ "$status" != "aligned" ]; then
    echo "GitHub contract roll-forward pending for $repo (validate:$has_validate policy:$has_policy script_owned:$script_owned)" >&2
    return 1
  fi
}

if [ "$report_mode" -eq 1 ]; then
  echo "repo|status|validate|family_policy|script_owned"
  for repo in "${public_repos[@]}"; do
    check_repo "$repo"
  done
  exit 0
fi

fail=0
for repo in "${public_repos[@]}"; do
  if ! check_repo "$repo"; then
    fail=1
  fi
done

if [ "$fail" -ne 0 ]; then
  exit 1
fi

echo "GitHub contract roll-forward checks passed"
