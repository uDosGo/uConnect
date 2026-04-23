#!/bin/bash

# uDosGo Vault Synchronization Setup
# This script sets up Vault to sync user documentation from GitHub repositories

set -e  # Exit on error

echo "=== uDosGo Vault Synchronization Setup ==="
echo "Setting up Vault to sync with GitHub repositories"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Check prerequisites
echo "Step 1: Checking prerequisites..."

if ! command_exists git; then
    echo "Error: Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Git is installed"

if ! command_exists curl; then
    echo "Error: curl is not installed. Please install curl first."
    exit 1
fi

echo "✅ curl is installed"

# 2. Set up Vault directory structure
echo ""
echo "Step 2: Setting up Vault directory structure..."

# Create main Vault directories
mkdir -p ~/Vault/{docs,user-docs,private,ecosystem,dev,coordination}

# Create subdirectories for organization
mkdir -p ~/Vault/docs/{ecosystem,architecture,guides,reference}
mkdir -p ~/Vault/user-docs/{personal,work,projects}
mkdir -p ~/Vault/private/{secrets,config,credentials}
mkdir -p ~/Vault/ecosystem/{management,integration,scripts}
mkdir -p ~/Vault/dev/{docs,specs,designs}
mkdir -p ~/Vault/coordination/{meetings,planning,communication}

echo "✅ Vault directory structure created"

# 3. Set up Git repositories
echo ""
echo "Step 3: Setting up Git repositories..."

# Check if Vault repository already exists
if [ -d "~/Vault/.git" ]; then
    echo "✅ Vault Git repository already exists"
else
    echo "Initializing Git repository in Vault..."
    cd ~/Vault
    git init
    git config user.name "uDosGo Ecosystem"
    git config user.email "ecosystem@udosgo.com"
    
    # Create initial .gitignore
    cat > .gitignore << 'EOL'
# Vault .gitignore
.compost/
secrets/
private/
*.env
*.key
*.pem
.DS_Store
EOL
    
    git add .gitignore
    git commit -m "Initial Vault setup"
    echo "✅ Vault Git repository initialized"
fi

# 4. Set up synchronization scripts
echo ""
echo "Step 4: Setting up synchronization scripts..."

# Create sync script for private user docs
cat > ~/Vault/ecosystem/scripts/sync_user_docs.sh << 'EOL'
#!/bin/bash
# Vault User Docs Synchronization Script

set -e

echo "=== Vault User Docs Sync ==="

# Check if we have access to the private repo
if git ls-remote --exit-code git@github.com:fredporter/Vault.git >/dev/null 2>&1; then
    echo "Syncing from private user docs repository..."
    
    # Clone or pull the private repository
    if [ -d "~/Vault/user-docs/private-repo" ]; then
        cd ~/Vault/user-docs/private-repo
        git pull origin main
    else
        git clone git@github.com:fredporter/Vault.git ~/Vault/user-docs/private-repo
    fi
    
    # Sync documents to appropriate locations
    rsync -av --delete ~/Vault/user-docs/private-repo/personal/ ~/Vault/user-docs/personal/
    rsync -av --delete ~/Vault/user-docs/private-repo/work/ ~/Vault/user-docs/work/
    rsync -av --delete ~/Vault/user-docs/private-repo/projects/ ~/Vault/user-docs/projects/
    
    echo "✅ User docs synchronized"
else
    echo "Private repository not accessible, using local user docs"
fi

# Sync ecosystem documentation
if [ -d "~/uDosGo/Docs" ]; then
    rsync -av --delete ~/uDosGo/Docs/ ~/Vault/docs/ecosystem/
    echo "✅ Ecosystem docs synchronized"
fi

echo "✅ Vault sync complete"
EOL

# Create sync script for ecosystem coordination docs
cat > ~/Vault/ecosystem/scripts/sync_eco_docs.sh << 'EOL'
#!/bin/bash
# Ecosystem Coordination Docs Synchronization Script

set -e

echo "=== Ecosystem Coordination Docs Sync ==="

# Sync coordination documents from uDosGo
if [ -d "~/uDosGo/uDosConnect" ]; then
    rsync -av --delete ~/uDosGo/uDosConnect/docs/ ~/Vault/coordination/
    echo "✅ Coordination docs synchronized"
fi

# Sync development documentation
if [ -d "~/uDosGo/dev" ]; then
    rsync -av --delete ~/uDosGo/dev/docs/ ~/Vault/dev/docs/
    echo "✅ Development docs synchronized"
fi

# Sync architecture documentation
if [ -d "~/uDosGo/architecture" ]; then
    rsync -av --delete ~/uDosGo/architecture/ ~/Vault/docs/architecture/
    echo "✅ Architecture docs synchronized"
fi

echo "✅ Ecosystem coordination sync complete"
EOL

# Create master sync script
cat > ~/Vault/ecosystem/scripts/vault_sync_all.sh << 'EOL'
#!/bin/bash
# Master Vault Synchronization Script

set -e

echo "=== Master Vault Synchronization ==="

# Change to Vault directory
cd ~/Vault

# Run all synchronization scripts
bash ecosystem/scripts/sync_user_docs.sh
bash ecosystem/scripts/sync_eco_docs.sh

# Commit changes to Vault repository
git add .
if git diff --cached --quiet; then
    echo "No changes to commit"
else
    git commit -m "Automated sync: $(date +%Y-%m-%d\ %H:%M:%S)"
    echo "✅ Changes committed to Vault repository"
fi

echo "✅ Master Vault synchronization complete"
EOL

# Make all sync scripts executable
chmod +x ~/Vault/ecosystem/scripts/*.sh

echo "✅ Synchronization scripts created and made executable"

# 5. Set up cron jobs for automatic synchronization
echo ""
echo "Step 5: Setting up automatic synchronization..."

# Create cron job for daily sync
(crontab -l 2>/dev/null; echo "0 6 * * * bash ~/Vault/ecosystem/scripts/vault_sync_all.sh") | crontab -
echo "✅ Daily synchronization cron job set up (6:00 AM)"

# 6. Create Vault management tools
echo ""
echo "Step 6: Creating Vault management tools..."

# Create vault status tool
cat > ~/Vault/ecosystem/scripts/vault_status.sh << 'EOL'
#!/bin/bash
# Vault Status Tool

echo "=== Vault Status ==="
echo ""

echo "Directory Structure:"
tree -L 2 -d ~/Vault/ 2>/dev/null || find ~/Vault/ -maxdepth 2 -type d | sed 's|~/Vault/|  |g'

echo ""
echo "Git Status:"
cd ~/Vault
git status --short 2>/dev/null || echo "Not a git repository"

echo ""
echo "Disk Usage:"
du -sh ~/Vault/* 2>/dev/null || echo "Cannot determine disk usage"

echo ""
echo "Last Modified Files:"
find ~/Vault/ -type f -exec ls -lt {} + 2>/dev/null | head -10 || echo "No files found"
EOL

# Create vault backup tool
cat > ~/Vault/ecosystem/scripts/vault_backup.sh << 'EOL'
#!/bin/bash
# Vault Backup Tool

set -e

echo "=== Vault Backup ==="

BACKUP_DIR="~/Vault/backups/vault_backup_$(date +%Y%m%d_%H%M%S)"

mkdir -p "$BACKUP_DIR"

# Backup important directories
rsync -av --delete ~/Vault/docs/ "$BACKUP_DIR/docs/"
rsync -av --delete ~/Vault/user-docs/ "$BACKUP_DIR/user-docs/"
rsync -av --delete ~/Vault/ecosystem/ "$BACKUP_DIR/ecosystem/"

# Create manifest
cat > "$BACKUP_DIR/BACKUP_MANIFEST.txt" << MANIFEST
Vault Backup Manifest
=====================
Backup Date: $(date)
Backup Location: $BACKUP_DIR

Contents:
- docs/
- user-docs/
- ecosystem/

Git Status:
$(cd ~/Vault && git status --short 2>/dev/null || echo "Not a git repository")
MANIFEST

echo "✅ Vault backup created: $BACKUP_DIR"
EOL

chmod +x ~/Vault/ecosystem/scripts/vault_*.sh

echo "✅ Vault management tools created"

# 7. Set up environment variables
echo ""
echo "Step 7: Setting up environment variables..."

# Add to shell configuration
SHELL_CONFIG=""
if [ -f "~/.zshrc" ]; then
    SHELL_CONFIG="~/.zshrc"
elif [ -f "~/.bashrc" ]; then
    SHELL_CONFIG="~/.bashrc"
else
    SHELL_CONFIG="~/.profile"
fi

# Add Vault-specific environment variables
if ! grep -q "VAULT_SYNC_SCRIPTS" "$SHELL_CONFIG"; then
    cat >> "$SHELL_CONFIG" << 'EOL'

# uDosGo Vault Environment Variables
export VAULT_SYNC_SCRIPTS="$HOME/Vault/ecosystem/scripts"
export PATH="$PATH:$VAULT_SYNC_SCRIPTS"
EOL
    echo "✅ Vault environment variables added to $SHELL_CONFIG"
else
    echo "✅ Vault environment variables already configured"
fi

# 8. Final verification
echo ""
echo "=== Vault Synchronization Setup Complete ==="
echo ""

echo "Vault Structure:"
tree -L 3 ~/Vault/ 2>/dev/null || find ~/Vault/ -maxdepth 3 -type d | sed 's|~/Vault/|  |g'

echo ""
echo "Available Commands:"
echo "  vault_sync_all.sh      - Synchronize all Vault content"
echo "  sync_user_docs.sh      - Synchronize user documentation"
echo "  sync_eco_docs.sh      - Synchronize ecosystem documentation"
echo "  vault_status.sh        - Show Vault status"
echo "  vault_backup.sh        - Create Vault backup"

echo ""
echo "Next steps:"
echo "1. Run: source $SHELL_CONFIG"
echo "2. Test synchronization: bash ~/Vault/ecosystem/scripts/vault_sync_all.sh"
echo "3. Set up SSH keys for private repository access if needed"
echo "4. Review Vault documentation in ~/Vault/docs/"
