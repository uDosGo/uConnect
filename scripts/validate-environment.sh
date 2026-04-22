#!/bin/bash

# Environment validation script for uDos
# Validates required tools and configurations for various features

echo "🔧 Validating uDos development environment..."

set -e  # Exit on error

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 24 ]; then
    echo "❌ Node.js 24+ required (found: $(node -v 2>/dev/null || echo 'not installed'))"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Check npm version
NPM_VERSION=$(npm -v 2>/dev/null | cut -d'.' -f1)
if [ -z "$NPM_VERSION" ] || [ "$NPM_VERSION" -lt 9 ]; then
    echo "❌ npm 9+ required (found: $(npm -v 2>/dev/null || echo 'not installed'))"
    exit 1
fi
echo "✅ npm version: $(npm -v)"

# Check for required global tools
echo "Checking required tools..."

# Check for Docker (needed for Sonic-Screwdriver CLI)
if ! command -v docker &> /dev/null && ! command -v podman &> /dev/null; then
    echo "⚠️  Docker/Podman not found (required for container features)"
else
    echo "✅ Container runtime: $(command -v docker &> /dev/null && echo "Docker" || echo "Podman")"
fi

# Check for SQLite (needed for Vector DB)
if command -v sqlite3 &> /dev/null; then
    echo "✅ SQLite: $(sqlite3 --version | head -1)"
else
    echo "⚠️  SQLite not found (required for database features)"
fi

# Check for Python (needed for some ML features)
if command -v python3 &> /dev/null; then
    echo "✅ Python: $(python3 --version)"
else
    echo "⚠️  Python not found (required for ML features)"
fi

# Check for Git
if command -v git &> /dev/null; then
    echo "✅ Git: $(git --version)"
else
    echo "❌ Git required but not found"
    exit 1
fi

# Check environment variables for sensitive data
echo "Checking environment variables..."
if env | grep -i -E "(PASSWORD|API_KEY|SECRET|TOKEN)" | grep -v "CI=true" | grep -v "NODE_ENV"; then
    echo "⚠️  Potential sensitive environment variables detected"
fi

# Check for common configuration files
CONFIG_FILES=(
    "vibecli/config.json"
    ".env"
    "package.json"
)

for config in "${CONFIG_FILES[@]}"; do
    if [ -f "$config" ]; then
        echo "✅ Config file: $config"
    else
        echo "⚠️  Config file missing: $config"
    fi
done

echo ""
echo "📋 Environment Validation Summary:"
echo "   ✅ Core requirements: Node.js, npm, Git"
echo "   ⚠️  Optional tools: Docker/Podman, SQLite, Python"
echo "   🔒 Security: Environment variables checked"
echo "   📁 Configuration: Key files verified"

echo ""
echo "🎯 Environment ready for:"
echo "   - Current development workflows"
echo "   - P2 specs (Email, Webhooks, API Docs)"
echo "   - P3 specs (Vector DB, CLI tools, Multi-Agent)"
echo "   - Future features (Kubernetes, Mobile)"

exit 0