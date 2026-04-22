#!/bin/bash
set -e  # Exit on error

# Source the file_utils library
source scripts/lib/file_utils.sh

# Test the validate_file function
TARGET_FILE="ui/src/views/surfaces/WordPressSurface.vue"
if validate_file "$TARGET_FILE"; then
  echo "✅ File validation passed for $TARGET_FILE"
else
  echo "❌ File validation failed for $TARGET_FILE"
  exit 1
fi

# Test the edit_file function
TARGET_LINE=382
TARGET_PATTERN="running,"
REPLACEMENT="running"
if edit_file "$TARGET_FILE" "$TARGET_LINE" "$TARGET_PATTERN" "$REPLACEMENT" 3; then
  echo "✅ Edit function passed for $TARGET_FILE"
else
  echo "❌ Edit function failed for $TARGET_FILE"
  exit 1
fi

echo "✅ All modular scripting tests passed!"