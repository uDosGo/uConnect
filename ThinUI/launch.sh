#!/bin/bash
# ThinUI Launch Script
# Handles port configuration and provides visible progress

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Function to show progress spinner
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf "  [%c] %s" "$spinstr" "$2"
        local spinstr=$temp"${spinstr%?}"
        sleep $delay
        printf "\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b"
    done
    printf "  [✓] %s\n" "$2"
}

echo "🚀 Launching ThinUI..."
echo ""

# Step 1: Check if dependencies are installed
echo "Step 1/4: Checking dependencies..."
npm list @tauri-apps/cli > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "  ⚠ Tauri CLI not found. Installing..."
    npm install --save-dev @tauri-apps/cli &
    spinner $! "Installing Tauri CLI"
else
    echo "  [✓] Dependencies verified"
fi
echo ""

# Step 2: Update Tauri configuration
echo "Step 2/4: Configuring Tauri..."
if grep -q "7846" src-tauri/tauri.conf.json; then
    echo "  Updating devUrl to port 1420..."
    sed -i '' 's/"devUrl": "http:\/\/localhost:7846"/"devUrl": "http:\/\/localhost:1420"/' src-tauri/tauri.conf.json
    echo "  [✓] Tauri configuration updated"
else
    echo "  [✓] Tauri already configured for port 1420"
fi
echo ""

# Step 3: Start React dev server
echo "Step 3/4: Starting React dev server..."
npm run dev > /tmp/thinui-dev.log 2>&1 &
DEV_PID=$!
sleep 3

# Check if dev server started successfully
if ps -p $DEV_PID > /dev/null; then
    echo "  [✓] React dev server running on port 1420"
else
    echo "  [✗] Failed to start React dev server"
    cat /tmp/thinui-dev.log
    exit 1
fi
echo ""

# Step 4: Launch Tauri
echo "Step 4/4: Launching Tauri application..."
npm run tauri dev

echo ""
echo "🎉 ThinUI launched successfully!"
