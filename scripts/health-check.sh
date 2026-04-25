#!/bin/bash
# ThinUI Health Check Script
# Usage: ./health-check.sh [--plugin <id>] [--stage <stage>] [--verbose]

set -e

VERBOSE=false
PLUGIN_ID=""
STAGE=""

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case "$1" in
        --plugin) PLUGIN_ID="$2"; shift ;;
        --stage) STAGE="$2"; shift ;;
        --verbose) VERBOSE=true ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
    shift
done

if [ "$VERBOSE" = true ]; then
    echo "Running health checks..."
    echo "Plugin: ${PLUGIN_ID}"
    echo "Stage: ${STAGE}"
fi

# Check if we're checking a specific plugin
if [ -n "$PLUGIN_ID" ]; then
    if [ -z "$STAGE" ]; then
        echo "Error: --stage must be specified when checking a plugin"
        exit 1
    fi
    
    # Check plugin directory exists
    PLUGIN_PATH="~/Code/uDosGo/${STAGE}/${PLUGIN_ID}"
    if [ "$VERBOSE" = true ]; then
        echo "Checking plugin directory: ${PLUGIN_PATH}"
    fi
    
    if [ ! -d "${PLUGIN_PATH}" ]; then
        echo "Error: Plugin directory does not exist: ${PLUGIN_PATH}"
        exit 1
    fi
    
    # Check for manifest file
    if [ "$VERBOSE" = true ]; then
        echo "Checking for manifest file..."
    fi
    
    if [ ! -f "${PLUGIN_PATH}/manifest.json" ] && [ ! -f "${PLUGIN_PATH}/manifest.yaml" ]; then
        echo "Error: No manifest file found in ${PLUGIN_PATH}"
        exit 1
    fi
    
    # Check for tests if in Sandbox or later
    if [[ "$STAGE" != "Toybox" ]]; then
        if [ "$VERBOSE" = true ]; then
            echo "Checking for tests..."
        fi
        
        if [ ! -d "${PLUGIN_PATH}/tests" ] && [ ! -f "${PLUGIN_PATH}/test.js" ] && [ ! -f "${PLUGIN_PATH}/test.ts" ]; then
            echo "Warning: No tests found for ${PLUGIN_ID}"
        fi
    fi
    
    echo "✅ Plugin ${PLUGIN_ID} health check passed"
else
    # General system health check
    if [ "$VERBOSE" = true ]; then
        echo "Running general system health check..."
    fi
    
    # Check base directory
    BASE_DIR="~/Code/uDosGo"
    if [ ! -d "${BASE_DIR}" ]; then
        echo "Error: Base directory does not exist: ${BASE_DIR}"
        exit 1
    fi
    
    # Check required stages
    REQUIRED_STAGES=("Toybox" "Sandbox" "Launch" "Deploy")
    for stage in "${REQUIRED_STAGES[@]}"; do
        if [ ! -d "${BASE_DIR}/${stage}" ]; then
            echo "Warning: Stage directory missing: ${stage}"
        fi
    done
    
    # Check hidden folders
    HIDDEN_FOLDERS=(".compost" ".state")
    for folder in "${HIDDEN_FOLDERS[@]}"; do
        if [ ! -d "${BASE_DIR}/${folder}" ]; then
            if [ "$VERBOSE" = true ]; then
                echo "Creating hidden folder: ${folder}"
            fi
            mkdir -p "${BASE_DIR}/${folder}"
        fi
    done
    
    echo "✅ System health check passed"
fi