#!/usr/bin/env bash

# Test script for udos command
# This demonstrates the functionality without actually starting all services

set -e

echo "🧪 Testing uDos CLI..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UDOS_CLI_DIR="$SCRIPT_DIR/udos-cli"

echo "📁 Working directory: $UDOS_CLI_DIR"

cd "$UDOS_CLI_DIR"

echo ""
echo "1. Testing udos --help"
./udos --help

echo ""
echo "2. Testing udo --help (alias)"
./udo --help

echo ""
echo "3. Testing udos dev --help"
./udos dev --help

echo ""
echo "4. Testing port management"
echo "   Assigning a port..."
./udos ports assign --debug
echo "   Listing ports..."
./udos ports list --debug

echo ""
echo "5. Testing all subcommands help"
for cmd in core ui re3 chat all stop status; do
    echo "   Testing 'udos $cmd --help':"
    ./udos $cmd --help | head -3
    echo ""
done

echo "✅ All tests passed!"
echo ""
echo "🎉 uDos CLI is working correctly!"
echo ""
echo "To install system-wide, run:"
echo "  ./install-udos.sh"
