#!/usr/bin/env bash
# Validate uDosConnect/courses/* course shells (each numbered course must have README.md).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COURSES="${ROOT}/courses"
fail=0

if [[ ! -d "${COURSES}" ]]; then
  echo "ERROR: missing courses dir: ${COURSES}" >&2
  exit 1
fi

for dir in "${COURSES}"/[0-9][0-9]-*/; do
  [[ -d "$dir" ]] || continue
  name="$(basename "$dir")"
  if [[ ! -f "${dir}/README.md" ]]; then
    echo "ERROR: missing README.md in courses/${name}" >&2
    fail=1
    continue
  fi
  echo "ok  course  ${name}"
done

if [[ "${fail}" -ne 0 ]]; then
  exit 1
fi

echo "ok  courses validation"
