#!/usr/bin/env bash
# Initialize local Tier-1 SQLite database (~/.udos/cells.db).
# Schema: modules/udos-db-schema/sqlite/schema.sql (uDosConnect repo).

set -euo pipefail

UDOS_HOME="${UDOS_HOME:-${HOME}/.udos}"
DB_PATH="${UDOS_HOME}/cells.db"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SCHEMA_PATH="${SCHEMA_PATH:-${REPO_ROOT}/modules/udos-db-schema/sqlite/schema.sql}"

mkdir -p "${UDOS_HOME}"

if [[ ! -f "${SCHEMA_PATH}" ]]; then
  echo "error: schema not found: ${SCHEMA_PATH}" >&2
  exit 1
fi

if [[ ! -f "${DB_PATH}" ]]; then
  echo "Creating uDos SQLite database at ${DB_PATH}"
  sqlite3 "${DB_PATH}" < "${SCHEMA_PATH}" >/dev/null
  echo "Database initialised."
else
  echo "Database already exists at ${DB_PATH}"
fi

chmod 600 "${DB_PATH}" 2>/dev/null || true

sqlite3 "${DB_PATH}" "SELECT 'uDos DB ready';"
