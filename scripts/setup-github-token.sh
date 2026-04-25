#!/bin/bash
# scripts/setup-github-token.sh
# Sets up GITHUB_TOKEN environment variable for testing MCP tools.

if [ -z "$GITHUB_TOKEN" ]; then
    echo "GITHUB_TOKEN is not set."
    echo "Please create a GitHub Personal Access Token with 'repo' scope."
    echo "Then run:"
    echo "  export GITHUB_TOKEN='your_token_here'"
    echo "Or set it temporarily for this session:"
    echo "  read -p 'Enter GitHub Token: ' GITHUB_TOKEN"
    exit 1
else
    echo "GITHUB_TOKEN is already set."
fi