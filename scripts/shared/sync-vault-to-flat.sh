#!/bin/bash
# Script to sync Vault @* content to DevStudio global/ and user/ directories

echo "🚀 Starting Vault to @global/@user sync..."

# Check if Vault exists
if [ ! -d "$HOME/Vault" ]; then
    echo "⚠️ Vault directory not found at $HOME/Vault"
    exit 1
fi

# Check if DevStudio global/ exists
if [ ! -d "$HOME/Code/DevStudio/global" ]; then
    echo "⚠️ DevStudio/global directory not found"
    exit 1
fi

# Check if DevStudio user/ exists
if [ ! -d "$HOME/Code/DevStudio/user" ]; then
    echo "⚠️ DevStudio/user directory not found"
    exit 1
fi

# Sync @user from Vault to DevStudio/user/
echo "🔄 Syncing @user from Vault to DevStudio/user/"
rsync -av --delete "$HOME/Vault/@user/" "$HOME/Code/DevStudio/user/" \
    --exclude='.git'

# Sync @global from Vault to DevStudio/global/
# Note: @global doesn't exist in Vault, so we'll create it from @toybox and @transport
echo "🔄 Creating @global from @toybox and @transport..."
rsync -av --delete "$HOME/Vault/@toybox/" "$HOME/Code/DevStudio/global/" \
    --exclude='.git' \
    --exclude='experiments' \
    --exclude='widgets'
rsync -av --delete "$HOME/Vault/@transport/" "$HOME/Code/DevStudio/global/" \
    --exclude='.git'

# Verify sync results
echo "📊 Verifying sync results..."

echo "📁 DevStudio/global contents:"
find "$HOME/Code/DevStudio/global" -maxdepth 2 -type d | sort

echo "📁 DevStudio/user contents:"
find "$HOME/Code/DevStudio/user" -maxdepth 2 -type d | sort

echo "✅ Vault to @global/@user sync complete!"
echo "📍 @user content synced from Vault"
echo "📍 @global content created from @toybox and @transport"