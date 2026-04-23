#!/bin/bash

# Function to validate file
validate_file() {
  local file=$1
  if [ ! -f "$file" ]; then
    echo "❌ Error: File $file not found."
    return 1
  fi
  if [ ! -w "$file" ]; then
    echo "❌ Error: No write permissions for $file."
    return 1
  fi
  return 0
}

# Function to edit file with retries
edit_file() {
  local file=$1
  local line=$2
  local pattern=$3
  local replacement=$4
  local max_retries=$5
  local retry_count=0

  while [ $retry_count -lt $max_retries ]; do
    if sed -i '' "${line}s/$pattern/$replacement/" "$file"; then
      echo "✅ Success!"
      return 0
    else
      echo "⚠️  Retry $((retry_count + 1)) of $max_retries..."
      ((retry_count++))
      sleep 2
    fi
  done
  echo "❌ Max retries reached. Manual intervention required."
  return 1
}