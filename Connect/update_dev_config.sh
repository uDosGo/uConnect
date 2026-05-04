#!/bin/bash

# Update Dev Mode Configuration
DEV_MODE_FILE="$HOME/.udos/dev_mode"
DEV_CONFIG_FILE="$(pwd)/dev_mode_config.json"

# Check if dev_mode is enabled
if [ -f "$DEV_MODE_FILE" ] && [ "$(cat "$DEV_MODE_FILE")" == "ON" ]; then
    # Enable Dev Mode in config
    jq '.dev_mode.enabled = true' "$DEV_CONFIG_FILE" > tmp.json && mv tmp.json "$DEV_CONFIG_FILE"
    jq '.dev_mode.ui_settings.show_mcp_tools_editor = true' "$DEV_CONFIG_FILE" > tmp.json && mv tmp.json "$DEV_CONFIG_FILE"
    jq '.dev_mode.ui_settings.show_rate_limits_panel = true' "$DEV_CONFIG_FILE" > tmp.json && mv tmp.json "$DEV_CONFIG_FILE"
    jq '.dev_mode.ui_settings.show_mistral_dev_chat = true' "$DEV_CONFIG_FILE" > tmp.json && mv tmp.json "$DEV_CONFIG_FILE"
    jq '.dev_mode.ui_settings.show_webhook_config = true' "$DEV_CONFIG_FILE" > tmp.json && mv tmp.json "$DEV_CONFIG_FILE"
    jq '.dev_mode.ui_settings.show_advanced_sections = true' "$DEV_CONFIG_FILE" > tmp.json && mv tmp.json "$DEV_CONFIG_FILE"
    jq '.dev_mode.ui_settings.dev_mode_badge = true' "$DEV_CONFIG_FILE" > tmp.json && mv tmp.json "$DEV_CONFIG_FILE"
    echo "✅ Dev Mode configuration updated: ENABLED"
else
    # Disable Dev Mode in config
    jq '.dev_mode.enabled = false' "$DEV_CONFIG_FILE" > tmp.json && mv tmp.json "$DEV_CONFIG_FILE"
    jq '.dev_mode.ui_settings.show_mcp_tools_editor = false' "$DEV_CONFIG_FILE" > tmp.json && mv tmp.json "$DEV_CONFIG_FILE"
    jq '.dev_mode.ui_settings.show_rate_limits_panel = false' "$DEV_CONFIG_FILE" > tmp.json && mv tmp.json "$DEV_CONFIG_FILE"
    jq '.dev_mode.ui_settings.show_mistral_dev_chat = false' "$DEV_CONFIG_FILE" > tmp.json && mv tmp.json "$DEV_CONFIG_FILE"
    jq '.dev_mode.ui_settings.show_webhook_config = false' "$DEV_CONFIG_FILE" > tmp.json && mv tmp.json "$DEV_CONFIG_FILE"
    jq '.dev_mode.ui_settings.show_advanced_sections = false' "$DEV_CONFIG_FILE" > tmp.json && mv tmp.json "$DEV_CONFIG_FILE"
    jq '.dev_mode.ui_settings.dev_mode_badge = false' "$DEV_CONFIG_FILE" > tmp.json && mv tmp.json "$DEV_CONFIG_FILE"
    echo "✅ Dev Mode configuration updated: DISABLED"
fi

cat "$DEV_CONFIG_FILE" | jq .
