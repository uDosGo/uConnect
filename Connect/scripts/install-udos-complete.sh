#!/usr/bin/env bash
# uDos Complete Installation Script
# Installs all components including local requirements and udo wrapper
set -euo pipefail

echo "🚀 uDos Complete Installation"
echo "================================"

# Get project root
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "📁 Project root: $ROOT"

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null | cut -d'.' -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required. Current: ${NODE_VERSION:-not installed}"
  exit 1
fi
echo "✅ Node.js ${NODE_VERSION} detected"

# Install local requirements
echo "📦 Installing local requirements..."
cd "$ROOT"

# Install core dependencies
cd "$ROOT/core"
npm install --silent
cd "$ROOT/core-rs"
npm install --silent 2>/dev/null || true

# Build core components
echo "🔨 Building core components..."
cd "$ROOT/core"
npm run build

# Install udo wrapper
echo "🔧 Installing udo wrapper..."
mkdir -p "$HOME/.local/bin"
cp "$ROOT/udo-wrapper" "$HOME/.local/bin/udo"
chmod +x "$HOME/.local/bin/udo"

# Add to PATH if not already present
if ! grep -q "\.local/bin" "$HOME/.zshrc" 2>/dev/null; then
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc"
  echo "✅ Added ~/.local/bin to PATH in .zshrc"
fi

# Source the updated PATH
source "$HOME/.zshrc"

# Verify installation
echo "🧪 Verifying installation..."
if command -v udo >/dev/null 2>&1; then
  echo "✅ udo command installed globally"
  cd "$ROOT"
  udo check full
else
  echo "❌ udo command not found in PATH"
  echo "Please add ~/.local/bin to your PATH and try again"
fi

echo "🎉 Installation complete!"
echo "Try: udo version && udo doctor && udo help"