#!/bin/bash

# Hivemind Sonic-Express Installer
# Version: 1.0.0
# Purpose: Install and configure Sonic-Express handler for Hivemind

echo "🚀 Hivemind Sonic-Express Installer"
echo "==================================="

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null | cut -d'.' -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required. Current: ${NODE_VERSION}"
  exit 1
fi
echo "✅ Node.js ${NODE_VERSION} detected"

# Check npm version
NPM_VERSION=$(npm --version 2>/dev/null | cut -d'.' -f1)
if [ -z "$NPM_VERSION" ] || [ "$NPM_VERSION" -lt 9 ]; then
  echo "❌ npm 9+ required. Current: ${NPM_VERSION}"
  exit 1
fi
echo "✅ npm ${NPM_VERSION} detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --silent
if [ $? -ne 0 ]; then
  echo "❌ Failed to install dependencies"
  exit 1
fi
echo "✅ Dependencies installed"

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ TypeScript build failed"
  exit 1
fi
echo "✅ TypeScript built successfully"

# Configure Sonic-Express
echo "🛠️ Configuring Sonic-Express..."

# Create config directory
mkdir -p config
cp config.example.json config/production.json 2>/dev/null || true

# Update configuration
jq '.dsc2.endpoint = "http://localhost:30000/mcp"' config/production.json > config/production.json.tmp && mv config/production.json.tmp config/production.json
jq '.dsc2.use_real_server = true' config/production.json > config/production.json.tmp && mv config/production.json.tmp config/production.json

# Set permissions
chmod +x bin/*.sh 2>/dev/null || true

echo "✅ Sonic-Express configuration complete"

# Start Sonic-Express
echo "🚀 Starting Sonic-Express..."
npm start

echo "🎉 Hivemind Sonic-Express is running!"
