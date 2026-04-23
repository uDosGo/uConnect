#!/bin/bash

# Validate the config.json file
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
CONFIG_FILE="$SCRIPT_DIR/config.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: $CONFIG_FILE not found!"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install jq to validate the configuration."
    exit 1
fi

# Validate JSON format
if ! jq empty "$CONFIG_FILE" &> /dev/null; then
    echo "Error: $CONFIG_FILE is not a valid JSON file!"
    exit 1
fi

# Check required fields
MISSING_FIELDS=()

if [ -z "$(jq -r 'has("mcp-tools")' "$CONFIG_FILE")" ] || [ "$(jq -r 'has("mcp-tools")' "$CONFIG_FILE")" == "false" ]; then
    MISSING_FIELDS+=("mcp-tools")
fi

if [ -z "$(jq -r 'has("automation")' "$CONFIG_FILE")" ] || [ "$(jq -r 'has("automation")' "$CONFIG_FILE")" == "false" ]; then
    MISSING_FIELDS+=("automation")
fi

if [ -z "$(jq -r 'has("file_handling")' "$CONFIG_FILE")" ] || [ "$(jq -r 'has("file_handling")' "$CONFIG_FILE")" == "false" ]; then
    MISSING_FIELDS+=("file_handling")
fi

if [ -z "$(jq -r 'has("rate_limits")' "$CONFIG_FILE")" ] || [ "$(jq -r 'has("rate_limits")' "$CONFIG_FILE")" == "false" ]; then
    MISSING_FIELDS+=("rate_limits")
fi

if [ ${#MISSING_FIELDS[@]} -ne 0 ]; then
    echo "Error: The following required fields are missing in $CONFIG_FILE:"
    for field in "${MISSING_FIELDS[@]}"; do
        echo "  - $field"
    done
    exit 1
fi

# Check specific settings
GITHUB_ENABLED=$(jq '."mcp-tools".github' "$CONFIG_FILE")
CODE_INTERPRETER_ENABLED=$(jq '."mcp-tools".code_interpreter' "$CONFIG_FILE")
CANVAS_ENABLED=$(jq '."automation".canvas' "$CONFIG_FILE")
SECRET_SCAN_ENABLED=$(jq '."automation".secret_scan' "$CONFIG_FILE")

if [ "$GITHUB_ENABLED" != "true" ]; then
    echo "Warning: GitHub integration is not enabled!"
fi

if [ "$CODE_INTERPRETER_ENABLED" != "true" ]; then
    echo "Warning: Code Interpreter is not enabled!"
fi

if [ "$CANVAS_ENABLED" != "true" ]; then
    echo "Warning: Canvas Mode is not enabled!"
fi

if [ "$SECRET_SCAN_ENABLED" != "\"auto\"" ]; then
    echo "Warning: Secret Scanning is not set to auto!"
fi

# Check examples folder
if [ -d "$SCRIPT_DIR/examples" ]; then
    EXAMPLE_COUNT=$(ls -1 "$SCRIPT_DIR/examples/" 2>/dev/null | wc -l)
    if [ "$EXAMPLE_COUNT" -gt 0 ]; then
        echo "✅ Examples folder contains $EXAMPLE_COUNT file(s)."
    else
        echo "⚠️  Examples folder is empty."
    fi
else
    echo "⚠️  Examples folder not found."
fi

# Success message
echo "✅ Configuration file $CONFIG_FILE is valid and correctly configured!"
echo ""
echo "Summary:"
echo "  - MCP Tools: GitHub ($GITHUB_ENABLED), Code Interpreter ($CODE_INTERPRETER_ENABLED), Web Search ($(jq -r '."mcp-tools".web_search' "$CONFIG_FILE"))"
echo "  - Automation: Canvas ($CANVAS_ENABLED), Secret Scan ($SECRET_SCAN_ENABLED)"
echo "  - File Handling: Archival ($(jq -r '."file_handling".archival' "$CONFIG_FILE")), Formats ($(jq -r '."file_handling".formats | join(", ")' "$CONFIG_FILE"))"
echo "  - Rate Limits: Notify ($(jq -r '."rate_limits".notify' "$CONFIG_FILE")), Custom ($(jq -r '."rate_limits".custom' "$CONFIG_FILE"))"

exit 0
