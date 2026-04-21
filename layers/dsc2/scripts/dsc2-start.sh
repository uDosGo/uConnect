#!/bin/bash

# DSC2 Start Script
# Starts the DeepSeek Reasoning Engine server

echo "🚀 Starting DSC2 Reasoning Engine..."

# Navigate to dsc2-server directory
cd "$(dirname "$0")/../dsc2-server" || {
    echo "❌ Failed to navigate to dsc2-server directory"
    exit 1
}

# Check if node_modules exists, if not install
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "🔧 Installing dependencies..."
    npm install || {
        echo "❌ Failed to install dependencies"
        exit 1
    }
fi

# Start the server
echo "🌐 Starting DSC2 server on port 30000..."
npm run pm2:start || {
    echo "❌ Failed to start DSC2 server"
    exit 1
}

echo "✅ DSC2 Reasoning Engine started successfully!"
echo "📊 Health: http://localhost:30000/health"
echo "🔌 MCP Endpoint: http://localhost:30000/mcp"

exit 0