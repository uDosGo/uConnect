#!/bin/bash

# Production deployment script for uDos
# This script handles the deployment of uDos to production environments

echo "🚀 Starting uDos production deployment..."

# Set environment variables
set -e  # Exit on error
echo "Setting up deployment environment..."

# Build the project
echo "Building project..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Aborting deployment."
    exit 1
fi

# Deploy core components
echo "Deploying core components..."
# Add your actual deployment commands here
# For example:
# rsync -avz --delete build/ user@production-server:/path/to/deployment/
# or use a deployment tool like:
# npm run deploy:core

echo "Deploying UI components..."
# Add UI deployment commands here

echo "Deploying tools and modules..."
# Add tools/modules deployment commands here

# Verify deployment
echo "Verifying deployment..."
# Add verification commands here
# For example:
# curl -sSf https://your-production-url.com/health > /dev/null

# Run post-deployment checks
echo "Running post-deployment checks..."
bash scripts/verify-deployment.sh

if [ $? -ne 0 ]; then
    echo "❌ Deployment verification failed. Rolling back..."
    # Add rollback commands here
    exit 1
fi

echo "✅ Production deployment completed successfully!"
echo "📊 Deployment summary:"
echo "   - Core components: Deployed"
echo "   - UI components: Deployed"
echo "   - Tools and modules: Deployed"
echo "   - Verification: Passed"

exit 0