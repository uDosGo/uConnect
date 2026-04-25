#!/usr/bin/env bash

# uDos installation script
# Installs the udos command and creates the udo alias

set -e

echo "🎮 Installing uDos CLI..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Navigate to the uDosGo root directory
UDOSGO_ROOT="$(dirname "$SCRIPT_DIR")"
UDOS_CLI_DIR="$UDOSGO_ROOT/uCode1/udos-cli"

# Build the release version
cd "$UDOS_CLI_DIR"
echo "🔨 Building udos..."
cargo build --release

# Install to /usr/local/bin
echo "📦 Installing udos to /usr/local/bin..."
sudo cp target/release/udos /usr/local/bin/udos

# Create udo symlink
echo "🔗 Creating udo symlink..."
sudo ln -sf /usr/local/bin/udos /usr/local/bin/udo

# Make sure they're executable
sudo chmod +x /usr/local/bin/udos
sudo chmod +x /usr/local/bin/udo

echo "✅ Installation complete!"
echo ""
echo "You can now use:"
echo "  udos dev    - Start the complete uDos development environment"
echo "  udo dev     - Same as above (short alias)"
echo "  udos --help - See all available commands"
echo ""
echo "The following components will be started:"
echo "  ✅ uCode1 core (MCP server + feed spool + daemon)"
echo "  ✅ ThinUI (Teletext dashboard on auto-assigned port)"
echo "  ✅ Re3Engine (reasoning MCP server)"
echo "  ✅ Re3Chat (browser chat interface)"
