#!/bin/bash
set -e  # Exit on error
set -x  # Debug mode

TARGET_FILE="ui/src/views/surfaces/WordPressSurface.vue"
TARGET_LINE=382
TARGET_PATTERN="running,"
REPLACEMENT="running"
LOG_FILE="/tmp/fix_comma.log"
MAX_RETRIES=3

# Log start
echo "[$(date)] Starting fix_comma.sh..." >> "$LOG_FILE"
echo "Target: Line $TARGET_LINE in $TARGET_FILE" >> "$LOG_FILE"

# Validate file
if [ ! -f "$TARGET_FILE" ]; then
  echo "❌ Error: File $TARGET_FILE not found." | tee -a "$LOG_FILE"
  exit 1
fi

if [ ! -w "$TARGET_FILE" ]; then
  echo "❌ Error: No write permissions for $TARGET_FILE." | tee -a "$LOG_FILE"
  exit 1
fi

# Function to edit file with retries
edit_file() {
  local retry_count=0
  while [ $retry_count -lt $MAX_RETRIES ]; do
    echo "Attempt $((retry_count + 1)) of $MAX_RETRIES..." | tee -a "$LOG_FILE"
    if sed -i '' "${TARGET_LINE}s/$TARGET_PATTERN/$REPLACEMENT/" "$TARGET_FILE"; then
      echo "✅ Success! Comma removed from line $TARGET_LINE." | tee -a "$LOG_FILE"
      return 0
    else
      echo "⚠️  Retry $((retry_count + 1)): Edit failed." | tee -a "$LOG_FILE"
      ((retry_count++))
      sleep 2
    fi
  done
  echo "❌ Max retries reached. Manual intervention required." | tee -a "$LOG_FILE"
  return 1
}

# Run edit
edit_file

# Verify
if ! grep -q "$TARGET_PATTERN" "$TARGET_FILE"; then
  echo "✅ Verification: Comma successfully removed." | tee -a "$LOG_FILE"
else
  echo "❌ Verification failed. Check $LOG_FILE for details." | tee -a "$LOG_FILE"
  exit 1
fi