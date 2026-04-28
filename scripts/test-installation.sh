#!/usr/bin/env bash

# Test script to verify the uDos installation

echo "🧪 Testing uDos installation..."

# Check if the binary exists
if [ -f ~/.local/share/udos/bin/udos ]; then
    echo "✅ uDos binary exists in ~/.local/share/udos/bin/udos"
else
    echo "❌ uDos binary not found in ~/.local/share/udos/bin/udos"
    exit 1
fi

# Check if the wrapper exists
if [ -f ~/.local/bin/udos ]; then
    echo "✅ uDos wrapper exists in ~/.local/bin/udos"
else
    echo "❌ uDos wrapper not found in ~/.local/bin/udos"
    exit 1
fi

# Check if the symlink exists
if [ -L ~/.local/bin/udo ]; then
    echo "✅ udo symlink exists in ~/.local/bin/udo"
else
    echo "❌ udo symlink not found in ~/.local/bin/udo"
    exit 1
fi

# Check if the binary is executable
if [ -x ~/.local/share/udos/bin/udos ]; then
    echo "✅ uDos binary is executable"
else
    echo "❌ uDos binary is not executable"
    exit 1
fi

# Check if the wrapper is executable
if [ -x ~/.local/bin/udos ]; then
    echo "✅ uDos wrapper is executable"
else
    echo "❌ uDos wrapper is not executable"
    exit 1
fi

# Test if the command is available
if command -v udos >/dev/null 2>&1; then
    echo "✅ udos command is available in PATH"
else
    echo "❌ udos command is not available in PATH"
    echo "Please make sure ~/.local/bin is in your PATH"
    exit 1
fi

# Test if the alias is available
if command -v udo >/dev/null 2>&1; then
    echo "✅ udo alias is available in PATH"
else
    echo "❌ udo alias is not available in PATH"
    exit 1
fi

echo ""
echo "🎉 All tests passed! uDos installation is working correctly."
echo ""
echo "You can now use:"
echo "  udos --help   - See available commands"
echo "  udos status   - Check uDos status"
echo "  udo status    - Same as above (short alias)"