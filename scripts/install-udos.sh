#!/usr/bin/env bash

# uDos installation script
# Creates proper directory structure and wrapper for uDos CLI

set -e

echo "🎮 Installing uDos CLI..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Navigate to the uDosGo root directory
UDOSGO_ROOT="$(dirname "$SCRIPT_DIR")"

# Build the release version from uCode1
cd "$UDOSGO_ROOT/uCode1"
echo "🔨 Building uCode1..."
cargo build --release

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p ~/.local/share/udos/bin

# Copy the built binary to the proper location (use uCode1 as udos)
echo "📦 Installing udos binary..."
cp target/release/uCode1 ~/.local/share/udos/bin/udos

# Create the uDos binary wrapper
echo "🔧 Creating wrapper script..."
cat > ~/.local/bin/udos << 'EOF'
#!/bin/bash
export PATH="$HOME/.local/share/udos/bin:$PATH"
exec "$HOME/.local/share/udos/bin/udos" "$@"
EOF

# Make executables
chmod +x ~/.local/share/udos/bin/udos
chmod +x ~/.local/bin/udos

# Create udo symlink
echo "🔗 Creating udo symlink..."
ln -sf ~/.local/bin/udos ~/.local/bin/udo

# Test the installation
echo "🧪 Testing installation..."
if command -v udos >/dev/null 2>&1; then
    echo "✅ Installation successful!"
    echo ""
    echo "You can now use:"
    echo "  udos status   - Check uDos status"
    echo "  udos dev      - Start the complete uDos development environment"
    echo "  udo dev       - Same as above (short alias)"
    echo "  udos --help   - See all available commands"
    echo ""
    echo "The following components will be started:"
    echo "  ✅ uCode1 core (MCP server + feed spool + daemon)"
    echo "  ✅ ThinUI (Teletext dashboard on auto-assigned port)"
    echo "  ✅ Re3Engine (reasoning MCP server)"
    echo "  ✅ Re3Chat (browser chat interface)"
else
    echo "❌ Installation failed. Please check your PATH includes ~/.local/bin"
    exit 1
fi
