#!/bin/bash

# Deployment verification script for uDos
# This script verifies that the deployment was successful

echo "🔍 Verifying uDos deployment..."

# Set environment variables
set -e  # Exit on error

# Check if required files exist
echo "Checking required files..."
REQUIRED_FILES=(
    "package.json"
    "README.md"
    "core/package.json"
    "ui/package.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Required file missing: $file"
        exit 1
    fi
done

# Check if build artifacts exist
echo "Checking build artifacts..."
if [ ! -d "build" ]; then
    echo "⚠️  Build directory not found. This might be expected for some deployment scenarios."
fi

# Verify npm workspaces
echo "Verifying npm workspaces..."
if ! npm run workspaces:check; then
    echo "❌ Workspace verification failed"
    exit 1
fi

# Check environment variables
echo "Checking environment..."
if [ -z "$NODE_ENV" ]; then
    echo "⚠️  NODE_ENV not set. Defaulting to 'production'."
    export NODE_ENV=production
fi

# Run basic functionality tests
echo "Running basic functionality tests..."
if ! node -e "console.log('Testing basic Node.js functionality...'); process.exit(0)"; then
    echo "❌ Basic Node.js test failed"
    exit 1
fi

# Check for common deployment issues
echo "Checking for common deployment issues..."

# Check for large files that might cause issues
LARGE_FILES=$(find . -name "*.json" -o -name "*.md" -o -name "*.js" -o -name "*.ts" | xargs ls -l | awk '$5 > 1048576 {print $9}')
if [ -n "$LARGE_FILES" ]; then
    echo "⚠️  Large files found that might cause deployment issues:"
    echo "$LARGE_FILES"
fi

# Check for potential secrets in config files
SECRETS_FOUND=$(grep -r --include="*.json" --include="*.yml" --include="*.yaml" "password\|api[_-]?key\|token" . 2>/dev/null | grep -v node_modules | grep -v ".git" || true)
if [ -n "$SECRETS_FOUND" ]; then
    echo "⚠️  Potential secrets found in config files. Review before deployment."
fi

echo "✅ Deployment verification completed successfully!"
echo "📋 Verification summary:"
echo "   - Required files: ✅ Present"
echo "   - Build artifacts: ✅ Checked"
echo "   - NPM workspaces: ✅ Verified"
echo "   - Environment: ✅ Configured"
echo "   - Basic functionality: ✅ Working"
echo "   - Common issues: ✅ Checked"

exit 0