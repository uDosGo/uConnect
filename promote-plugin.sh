#!/bin/bash
# ThinUI Plugin Promotion Script
# Usage: ./promote-plugin.sh <plugin-id> --from <stage> --to <stage>

set -e

# Parse arguments
if [ "$#" -lt 3 ]; then
    echo "Usage: $0 <plugin-id> --from <stage> --to <stage>"
    echo "Stages: Toybox, Sandbox, Launch, Deploy"
    exit 1
fi

PLUGIN_ID="$1"
shift

FROM_STAGE=""
TO_STAGE=""

while [[ "$#" -gt 0 ]]; do
    case "$1" in
        --from) FROM_STAGE="$2"; shift ;;
        --to) TO_STAGE="$2"; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
    shift
done

if [ -z "$FROM_STAGE" ] || [ -z "$TO_STAGE" ]; then
    echo "Error: Both --from and --to stages must be specified"
    exit 1
fi

# Validate stages
VALID_STAGES=("Toybox" "Sandbox" "Launch" "Deploy")
if [[ ! " ${VALID_STAGES[@]} " =~ " $FROM_STAGE " ]]; then
    echo "Error: Invalid from stage: $FROM_STAGE"
    exit 1
fi

if [[ ! " ${VALID_STAGES[@]} " =~ " $TO_STAGE " ]]; then
    echo "Error: Invalid to stage: $TO_STAGE"
    exit 1
fi

# Get current user
PROMOTED_BY="${USER}@$(hostname)"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Source and destination paths
BASE_DIR="~/Code/uDosGo"
SOURCE_PATH="${BASE_DIR}/${FROM_STAGE}/${PLUGIN_ID}"
DEST_PATH="${BASE_DIR}/${TO_STAGE}/${PLUGIN_ID}"

# Check if source exists
echo "Checking source: ${SOURCE_PATH}"
if [ ! -d "${SOURCE_PATH}" ]; then
    echo "Error: Source directory does not exist: ${SOURCE_PATH}"
    exit 1
fi

# Check if destination already exists
if [ -d "${DEST_PATH}" ]; then
    echo "Error: Destination already exists: ${DEST_PATH}"
    exit 1
fi

# Run health checks
echo "Running pre-promotion health checks..."
if [ -f "health-check.sh" ]; then
    if ! ./health-check.sh --plugin "${PLUGIN_ID}" --stage "${FROM_STAGE}"; then
        echo "Error: Health checks failed"
        exit 1
    fi
else
    echo "Warning: health-check.sh not found, skipping health checks"
fi

# Create destination directory
echo "Creating destination: ${DEST_PATH}"
mkdir -p "${DEST_PATH}"

# Copy plugin files
echo "Copying plugin files..."
cp -r "${SOURCE_PATH}/"* "${DEST_PATH}/"

# Update state database
echo "Updating state database..."
STATE_DB="${HOME}/.udos/state.db"

# Initialize database if it doesn't exist
if [ ! -f "${STATE_DB}" ]; then
    echo "Initializing state database..."
    mkdir -p "$(dirname "${STATE_DB}")"
    cat > "${STATE_DB}" << 'EOF'
CREATE TABLE plugins (
    id TEXT PRIMARY KEY,
    name TEXT,
    stage TEXT CHECK(stage IN ('Toybox','Sandbox','Launch','Deploy')),
    version TEXT,
    manifest TEXT,
    promoted_at DATETIME
);

CREATE TABLE hidden_folders (
    path TEXT PRIMARY KEY,
    type TEXT CHECK(type IN ('compost','state','legacy')),
    size_bytes INTEGER,
    last_accessed DATETIME,
    ttl_days INTEGER
);

CREATE TABLE promotion_history (
    plugin_id TEXT,
    from_stage TEXT,
    to_stage TEXT,
    promoted_by TEXT,
    timestamp DATETIME
);
EOF
fi

# Record promotion in history
echo "Recording promotion in history..."
echo "INSERT INTO promotion_history (plugin_id, from_stage, to_stage, promoted_by, timestamp) VALUES ('${PLUGIN_ID}', '${FROM_STAGE}', '${TO_STAGE}', '${PROMOTED_BY}', '${TIMESTAMP}');" >> "${STATE_DB}"

# Update plugin stage
echo "Updating plugin stage..."
echo "UPDATE plugins SET stage = '${TO_STAGE}', promoted_at = '${TIMESTAMP}' WHERE id = '${PLUGIN_ID}';" >> "${STATE_DB}"

echo "✅ Plugin ${PLUGIN_ID} promoted from ${FROM_STAGE} to ${TO_STAGE}"
echo "   Source: ${SOURCE_PATH}"
echo "   Destination: ${DEST_PATH}"
echo "   Promoted by: ${PROMOTED_BY}"
echo "   Timestamp: ${TIMESTAMP}"