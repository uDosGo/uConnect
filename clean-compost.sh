#!/bin/bash
# ThinUI Compost Cleaner
# Usage: ./clean-compost.sh [--older-than <days>] [--dry-run] [--verbose]

set -e

DRY_RUN=false
VERBOSE=false
OLDER_THAN=30  # Default: 30 days

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case "$1" in
        --older-than) OLDER_THAN="$2"; shift ;;
        --dry-run) DRY_RUN=true ;;
        --verbose) VERBOSE=true ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
    shift
done

if [ "$VERBOSE" = true ]; then
    echo "Cleaning compost files older than ${OLDER_THAN} days..."
    if [ "$DRY_RUN" = true ]; then
        echo "DRY RUN: No files will be deleted"
    fi
fi

# Compost directory
COMPOST_DIR="~/Code/uDosGo/.compost"

# Check if compost directory exists
if [ ! -d "${COMPOST_DIR}" ]; then
    echo "Compost directory does not exist: ${COMPOST_DIR}"
    exit 0
fi

# Calculate cutoff date
CUTOFF_DATE=$(date -v-${OLDER_THAN}d +"%Y-%m-%d")

if [ "$VERBOSE" = true ]; then
    echo "Cutoff date: ${CUTOFF_DATE}"
fi

# Find and delete old files
DELETED_COUNT=0
DELETED_SIZE=0

while IFS= read -r -d '' file; do
    # Get file modification date
    file_date=$(stat -f "%Sm" -t "%Y-%m-%d" "$file")
    
    # Compare dates
    if [[ "$file_date" < "$CUTOFF_DATE" ]]; then
        file_size=$(stat -f "%z" "$file")
        
        if [ "$VERBOSE" = true ]; then
            echo "Would delete: $file (${file_size} bytes, modified: $file_date)"
        fi
        
        if [ "$DRY_RUN" = false ]; then
            rm -rf "$file"
            if [ "$VERBOSE" = true ]; then
                echo "Deleted: $file"
            fi
            DELETED_COUNT=$((DELETED_COUNT + 1))
            DELETED_SIZE=$((DELETED_SIZE + file_size))
        fi
    fi
done < <(find "${COMPOST_DIR}" -type f -print0)

# Summary
if [ "$DRY_RUN" = true ]; then
    echo "DRY RUN COMPLETE"
    echo "Would have deleted ${DELETED_COUNT} files (${DELETED_SIZE} bytes)"
else
    echo "✅ Cleanup complete"
    echo "Deleted ${DELETED_COUNT} files (${DELETED_SIZE} bytes)"
    
    # Update state database
    STATE_DB="${HOME}/.udos/state.db"
    if [ -f "${STATE_DB}" ]; then
        echo "Updating state database..."
        echo "DELETE FROM hidden_folders WHERE type = 'compost' AND last_accessed < '${CUTOFF_DATE}';" >> "${STATE_DB}"
    fi
fi