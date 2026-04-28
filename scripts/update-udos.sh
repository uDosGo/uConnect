#!/usr/bin/env bash

# uDos updater script
# Rebuilds and updates the uDos CLI installation

set -e

echo "🔄 Updating uDos CLI..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Navigate to the uDosGo root directory
UDOSGO_ROOT="$(dirname "$SCRIPT_DIR")"

# Build the release version from uCode1
cd "$UDOSGO_ROOT/uCode1"
echo "🔨 Rebuilding uCode1..."
cargo build --release

# Copy the updated binary
echo "📦 Updating udos binary..."
cp target/release/uCode1 ~/.local/share/udos/bin/udos

# Make sure it's executable
chmod +x ~/.local/share/udos/bin/udos

# Test the update
echo "🧪 Testing update..."
if command -v udos >/dev/null 2>&1; then
    echo "✅ Update successful!"
    echo ""
    echo "uDos CLI has been updated to the latest version."
    echo "Run 'udos --help' to see available commands."
else
    echo "❌ Update failed. Please check your installation."
    exit 1
fi