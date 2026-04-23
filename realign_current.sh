#!/bin/bash

# uDosGo Current Repository Realignment Script
# This script cleans up the current repository and pulls the latest from remote

set -e  # Exit on error

echo "=== uDosGo Current Repository Realignment ==="
echo "This script will clean up and realign the current repository"
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "Error: This script must be run from a git repository root"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "You have uncommitted changes:"
    git status --short
    read -p "Do you want to stash these changes? [y/N] " stash_response
    if [[ "$stash_response" =~ ^[yY](es)?$ ]]; then
        git stash
        echo "Changes stashed"
    else
        echo "Aborting to preserve your changes"
        exit 1
    fi
fi

# Clean up untracked files and directories
echo "Cleaning up untracked files and directories..."
git clean -fd

# Reset hard to match remote
echo "Resetting to match remote repository..."
git fetch origin
git reset --hard origin/$CURRENT_BRANCH

# Pull latest changes
echo "Pulling latest changes..."
git pull origin $CURRENT_BRANCH

# Clean up any remaining artifacts
echo "Cleaning up build artifacts..."
find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "build" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

# Reapply stashed changes if any
if git stash list | grep -q "stash@{0}"; then
    read -p "Reapply stashed changes? [y/N] " reapply_response
    if [[ "$reapply_response" =~ ^[yY](es)?$ ]]; then
        git stash pop
        echo "Stashed changes reapplied"
    fi
fi

echo ""
echo "=== Realignment Complete ==="
echo "Repository is now clean and up-to-date with remote"
echo "Current status:"
git status --short
echo ""
echo "Latest commit:"
git log --oneline -1