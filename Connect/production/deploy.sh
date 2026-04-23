#!/bin/bash

# Deploy uDosConnect AI Integration
# Usage: ./deploy.sh [environment]

set -e

if [ "$#" -eq 0 ]; then
  echo "Usage: $0 [environment]"
  echo "Available environments: staging, production"
  exit 1
fi

ENVIRONMENT=$1
CONFIG_FILE=""

case $ENVIRONMENT in
  staging)
    CONFIG_FILE="staging_config.json"
    ;;
  production)
    CONFIG_FILE="config.json"
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT"
    exit 1
    ;;
esac

echo "Deploying uDosConnect AI Integration ($ENVIRONMENT)..."

# Run tests
python3 test_deepseek_integration.py
if [ $? -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi

echo "✅ Tests passed"

# Start server
if [ "$ENVIRONMENT" = "production" ]; then
  echo "Starting production server..."
  pm2 start "python3 -m udo.cli" --name udos-ai
else
  echo "Starting staging server..."
  python3 -m udo.cli
fi

echo "✅ Server started"
