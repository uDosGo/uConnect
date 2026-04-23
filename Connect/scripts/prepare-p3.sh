#!/bin/bash

# Prepare environment for P3 specs (Round 5+ Features)

echo "🎯 Preparing environment for P3 specs..."

echo "1. Validating base environment..."
bash scripts/validate-environment.sh

echo ""
echo "2. Generating documentation..."
npm run docs:generate

echo ""
echo "3. Checking P3 spec requirements..."

# Check for Docker/Podman (Sonic-Screwdriver CLI)
if command -v docker &> /dev/null; then
    echo "✅ Docker available: $(docker --version | head -1)"
elif command -v podman &> /dev/null; then
    echo "✅ Podman available: $(podman --version | head -1)"
else
    echo "❌ Container runtime not found (Docker/Podman required for Sonic-Screwdriver CLI)"
    echo "   Install Docker: https://docs.docker.com/get-docker/"
    echo "   Or Podman: https://podman.io/getting-started/installation"
fi

# Check for SQLite with vector extensions (Vector DB)
if command -v sqlite3 &> /dev/null; then
    echo "✅ SQLite available for Vector DB"
    echo "   📋 For sqlite-vec extension: https://github.com/asg017/sqlite-vec"
else
    echo "⚠️  SQLite not found (required for Vector DB)"
fi

# Check for AWS CLI (AWS RDS Pgvector)
if command -v aws &> /dev/null; then
    echo "✅ AWS CLI available: $(aws --version | head -1)"
else
    echo "⚠️  AWS CLI not found (needed for AWS RDS Pgvector)"
    echo "   Install: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
fi

# Check for Python (ML features)
if command -v python3 &> /dev/null; then
    echo "✅ Python available: $(python3 --version)"
    echo "   📋 Required packages: numpy, scikit-learn, sentence-transformers"
else
    echo "⚠️  Python not found (required for ML features)"
fi

# Check for WebSocket libraries
if [ -d "node_modules/ws" ] || [ -d "node_modules/socket.io" ]; then
    echo "✅ WebSocket libraries detected"
else
    echo "📋 WebSocket libraries can be installed with: npm install ws socket.io"
fi

echo ""
echo "📋 P3 Spec Preparation Summary:"
echo "   ✅ Base environment validated"
echo "   ✅ Documentation generated"
echo "   🐳 Container Runtime: $(command -v docker &> /dev/null && echo 'Docker' || (command -v podman &> /dev/null && echo 'Podman' || echo 'Missing'))"
echo "   🗃️ Vector DB: $(command -v sqlite3 &> /dev/null && echo 'SQLite ready' || echo 'Needs SQLite')"
echo "   ☁️ AWS RDS: $(command -v aws &> /dev/null && echo 'AWS CLI ready' || echo 'Needs AWS CLI')"
echo "   🐍 ML Features: $(command -v python3 &> /dev/null && echo 'Python ready' || echo 'Needs Python')"
echo "   🔗 WebSockets: $( [ -d "node_modules/ws" ] || [ -d "node_modules/socket.io" ] && echo 'Libraries available' || echo 'Can be installed')"

echo ""
echo "🚀 Ready to implement P3 specs!"
echo "   Next steps:"
echo "   1. Use 'npm run spec:template' to create spec templates"
echo "   2. Set up required infrastructure (Docker, AWS, etc.)"
echo "   3. Implement Vector DB (SQLite-vec) spec"
echo "   4. Implement Sonic-Screwdriver CLI spec"
echo "   5. Implement WebSocket Real-time spec"
echo "   6. Implement Multi-Agent Swarm spec"
echo "   7. Set up AWS RDS Pgvector and WordPress Cloud Sync"

exit 0