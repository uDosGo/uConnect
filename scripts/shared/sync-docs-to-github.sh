#!/bin/bash
# sync-docs-to-github.sh - Sync documentation to GitHub Pages

set -e

# Configuration
VAULT_DIR="~/Code/Vault"
DOCS_DIR="~/Code/uDosGo/docs"
GITHUB_REPO="git@github.com:uDosGo/uDosGo.github.io.git"
TEMP_DIR="/tmp/udos-docs-sync"

# Create temp directory
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Copy docs from vault public directory
if [ -d "$VAULT_DIR/public" ]; then
    cp -r "$VAULT_DIR/public"/* "$TEMP_DIR/"
fi

# Copy additional docs from docs directory
if [ -d "$DOCS_DIR" ]; then
    cp -r "$DOCS_DIR"/* "$TEMP_DIR/"
fi

# Clone GitHub Pages repo
cd "$TEMP_DIR"
git clone "$GITHUB_REPO" .

# Copy new content
tar -c -C "$TEMP_DIR" . | tar -x -C .

# Commit and push
git add .
git commit -m "Update documentation from vault and docs - $(date +%Y-%m-%d)"
git push origin main

echo "Documentation synced to GitHub Pages"

# Cleanup
rm -rf "$TEMP_DIR"