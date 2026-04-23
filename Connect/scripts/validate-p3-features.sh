#!/bin/bash

# Validate P3 feature requirements in the development environment

echo "🔍 Validating P3 feature requirements..."

set -e  # Exit on error

# Track validation results
vector_db_status="📋"
sonic_cli_status="📋"
websocket_status="📋"
multi_agent_status="📋"

# 1. Vector DB Validation
echo "Checking Vector DB requirements..."

# Check for SQLite
if command -v sqlite3 &> /dev/null; then
    echo "✅ SQLite available"
    
    # Check for sqlite-vec extension
    if sqlite3 -version | grep -q "vec" || [ -f "/usr/local/lib/sqlite-vec.so" ]; then
        echo "✅ SQLite-vec extension detected"
        vector_db_status="✅"
    else
        echo "📋 SQLite-vec extension needed: https://github.com/asg017/sqlite-vec"
        vector_db_status="📋"
    fi
else
    echo "❌ SQLite not found (required for Vector DB)"
    vector_db_status="❌"
fi

# Check for Python ML libraries
if command -v python3 &> /dev/null; then
    if python3 -c "import sentence_transformers" 2>/dev/null; then
        echo "✅ Sentence Transformers available"
    else
        echo "📋 Sentence Transformers needed: pip install sentence-transformers"
    fi
else
    echo "⚠️  Python not found (required for ML features)"
fi

# Check for vector directory
if [ -d "vectors" ]; then
    echo "✅ Vector storage directory exists"
else
    echo "📋 Vector storage directory can be created: mkdir vectors"
fi

# 2. Sonic-Screwdriver CLI Validation
echo ""
echo "Checking Sonic-Screwdriver CLI requirements..."

# Check for container runtime
if command -v docker &> /dev/null; then
    echo "✅ Docker available: $(docker --version | head -1)"
    sonic_cli_status="✅"
elif command -v podman &> /dev/null; then
    echo "✅ Podman available: $(podman --version | head -1)"
    sonic_cli_status="✅"
else
    echo "❌ Container runtime not found (Docker/Podman required)"
    sonic_cli_status="❌"
fi

# Check for CHASIS library directory
if [ -d "modules/chasis/library" ]; then
    echo "✅ CHASIS library directory exists"
else
    echo "📋 CHASIS library directory can be created"
fi

# Check for X11/XQuartz (for native apps)
if command -v xhost &> /dev/null || [ -d "/Applications/Utilities/XQuartz.app" ]; then
    echo "✅ X11/XQuartz available for native app forwarding"
else
    echo "📋 X11/XQuartz may be needed for native app containers"
fi

# 3. WebSocket Real-time Validation
echo ""
echo "Checking WebSocket requirements..."

# Check for WebSocket libraries
if [ -d "node_modules/ws" ]; then
    echo "✅ WS library available"
    websocket_status="✅"
elif [ -d "node_modules/socket.io" ]; then
    echo "✅ Socket.IO library available"
    websocket_status="✅"
else
    echo "📋 WebSocket libraries can be installed: npm install ws socket.io"
    websocket_status="📋"
fi

# Check for async/await support (Node.js)
if node -e "async function test() { await Promise.resolve(); }" 2>/dev/null; then
    echo "✅ Async/await support available"
else
    echo "⚠️  Async/await support check failed"
fi

# 4. Multi-Agent Swarm Validation
echo ""
echo "Checking Multi-Agent Swarm requirements..."

# Check for agent configuration directory
if [ -d "~/.config/udos/agents" ]; then
    echo "✅ Agent configuration directory exists"
    multi_agent_status="✅"
else
    echo "📋 Agent configuration directory can be created"
    multi_agent_status="📋"
fi

# Check for Redis (for inter-agent communication)
if command -v redis-cli &> /dev/null; then
    echo "✅ Redis available for agent communication"
else
    echo "📋 Redis can be installed for inter-agent messaging"
fi

# Check for parallel processing capabilities
if command -v parallel &> /dev/null; then
    echo "✅ GNU Parallel available for task execution"
else
    echo "📋 GNU Parallel can be installed for parallel processing"
fi

# Summary
echo ""
echo "📋 P3 Feature Validation Summary:"
echo ""
echo "Vector DB (SQLite-vec):"
echo "   $vector_db_status Vector database requirements"
echo ""
echo "Sonic-Screwdriver CLI:"
echo "   $sonic_cli_status Container runtime and CHASIS"
echo ""
echo "WebSocket Real-time:"
echo "   $websocket_status WebSocket libraries"
echo ""
echo "Multi-Agent Swarm:"
echo "   $multi_agent_status Agent orchestration"

# Count ready vs needed
ready_count=0
needed_count=0

for status in "$vector_db_status" "$sonic_cli_status" "$websocket_status" "$multi_agent_status"; do
    if [[ "$status" == "✅" ]]; then
        ((ready_count++))
    elif [[ "$status" == "📋" ]] || [[ "$status" == "⚠️" ]]; then
        ((needed_count++))
    fi
done

total_features=4
echo ""
echo "📊 Overall Status:"
echo "   ✅ Ready: $ready_count/$total_features"
echo "   📋 Needs attention: $needed_count/$total_features"

if [ $ready_count -ge $((($total_features * 50) / 100)) ]; then
    echo ""
    echo "🎉 Environment has basic P3 feature support!"
    echo "   Some advanced components may need setup during implementation."
else
    echo ""
    echo "⚠️  Several P3 requirements need attention before implementation."
    echo "   Run 'npm run prepare:p3' for detailed setup instructions."
fi

# Additional recommendations
echo ""
echo "💡 P3 Implementation Recommendations:"
if [[ "$vector_db_status" != "✅" ]]; then
    echo "   • Install sqlite-vec: https://github.com/asg017/sqlite-vec"
    echo "   • Install sentence-transformers: pip install sentence-transformers"
fi

if [[ "$sonic_cli_status" != "✅" ]]; then
    echo "   • Install Docker: https://docs.docker.com/get-docker/"
    echo "   • Or Podman: https://podman.io/getting-started/installation"
fi

if [[ "$websocket_status" != "✅" ]]; then
    echo "   • Install WebSocket libraries: npm install ws socket.io"
fi

if [[ "$multi_agent_status" != "✅" ]]; then
    echo "   • Set up agent configurations in ~/.config/udos/agents/"
    echo "   • Install Redis for inter-agent communication"
fi

exit 0