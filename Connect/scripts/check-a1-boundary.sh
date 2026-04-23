#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "[boundary] checking lock registry presence"
test -f "docs/specs/LOCKED-REGISTRY.md"
test -f "docs/specs/a1-a2-boundary.md"

echo "[boundary] checking forbidden cloud keywords in A1 core (outside allowed stubs)"
if command -v rg >/dev/null 2>&1; then
  SEARCH_CMD=(rg -n -i "(wordpress|hubspot|twilio|oauth2|saml|cloudwatch|kafka|rabbitmq|temporal)" \
    core/src \
    --glob '!core/src/cloud-stubs/**' \
    --glob '!core/src/actions/wordpress.ts' \
    --glob '!core/src/actions/a2.ts' \
    --glob '!core/src/actions/server.ts' \
    --glob '!core/src/actions/collab.ts' \
    --glob '!core/src/cli.ts')
else
  SEARCH_CMD=(grep -RInE "(wordpress|hubspot|twilio|oauth2|saml|cloudwatch|kafka|rabbitmq|temporal)" \
    core/src \
    --exclude-dir='cloud-stubs' \
    --exclude='cli.ts' \
    --exclude='a2.ts' \
    --exclude='server.ts' \
    --exclude='wordpress.ts' \
    --exclude='collab.ts')
fi
if "${SEARCH_CMD[@]}"; then
  echo "Boundary violation: cloud/proprietary keyword found in A1 core."
  exit 1
fi

echo "[boundary] checking forbidden cloud SDK imports in A1 core"
if command -v rg >/dev/null 2>&1; then
  if rg -n -i "(from|require\\()\\s*[\"'](@aws-sdk|aws-sdk|firebase|supabase|stripe|@octokit/rest)[\"']" core/src \
    --glob '!core/src/actions/github.ts'; then
    echo "Boundary violation: cloud SDK import found in A1 core."
    exit 1
  fi
else
  if grep -RInE "(from|require\()\\s*[\"'](@aws-sdk|aws-sdk|firebase|supabase|stripe|@octokit/rest)[\"']" core/src \
    --exclude='github.ts'; then
    echo "Boundary violation: cloud SDK import found in A1 core."
    exit 1
  fi
fi

echo "[boundary] checking server command naming (must be under a2)"
if command -v rg >/dev/null 2>&1; then
  if rg -n "program\\.command\\(\"server\"\\)" core/src/cli.ts; then
    echo "Boundary violation: top-level do server command is disallowed; use do a2 server."
    exit 1
  fi
else
  if grep -n 'program\.command("server")' core/src/cli.ts; then
    echo "Boundary violation: top-level do server command is disallowed; use do a2 server."
    exit 1
  fi
fi

echo "[boundary] checking lock id format"
if command -v rg >/dev/null 2>&1; then
  bad_ids="$(awk '/^\| L[0-9]{3} /{print $2}' docs/specs/LOCKED-REGISTRY.md | sed 's/|//g' | tr -d ' ' | rg -v '^L[0-9]{3}$' || true)"
else
  bad_ids="$(awk '/^\| L[0-9]{3} /{print $2}' docs/specs/LOCKED-REGISTRY.md | sed 's/|//g' | tr -d ' ' | grep -Ev '^L[0-9]{3}$' || true)"
fi
if [ -n "${bad_ids}" ]; then
  echo "Boundary violation: invalid lock ID format(s):"
  echo "${bad_ids}"
  exit 1
fi

echo "[boundary] checking lock id uniqueness"
dup_ids="$(awk '/^\| L[0-9]+ /{print $2}' docs/specs/LOCKED-REGISTRY.md | sort | uniq -d || true)"
if [ -n "${dup_ids}" ]; then
  echo "Boundary violation: duplicate lock IDs found: ${dup_ids}"
  exit 1
fi

echo "[boundary] checking required lock IDs"
for id in L001 L002 L003 L004; do
  if ! grep -q "| ${id} |" docs/specs/LOCKED-REGISTRY.md; then
    echo "Boundary violation: required lock ${id} missing from LOCKED-REGISTRY.md"
    exit 1
  fi
done

echo "[boundary] checking whitelist paths exist"
while IFS= read -r p; do
  [ -z "${p}" ] && continue
  if [ ! -e "${p}" ]; then
    echo "Boundary violation: whitelist path does not exist: ${p}"
    exit 1
  fi
done < <(awk '/^\| `/{print $2}' docs/specs/LOCKED-REGISTRY.md | tr -d '`')

echo "[boundary] ok"
