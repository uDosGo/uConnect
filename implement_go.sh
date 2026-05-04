#!/bin/bash

# uDosGo Ecosystem Setup and Realignment Script
# This script implements the go.md guide, cleaning up existing work and pulling latest from remote

set -e  # Exit on error

echo "=== uDosGo Ecosystem Setup and Realignment ==="
echo "This script will clean up existing work and realign with remote repositories"
echo ""

# Function to confirm before proceeding
confirm() {
    read -p "$1 [y/N] " response
    case "$response" in
        [yY][eE][sS]|[yY])
            return 0
            ;;
        *)
            echo "Aborted."
            exit 1
            ;;
    esac
}

# Check if we're in the right directory
if [ ! -f "go.md" ]; then
    echo "Error: This script must be run from the uDosGo repository root"
    exit 1
fi

# Step 1: Clean up existing directories
 echo "Step 1: Cleaning up existing directories..."

# Backup important files if they exist
if [ -d "~/uDosGo" ]; then
    echo "Backing up existing uDosGo directory to ~/uDosGo_backup_$(date +%Y%m%d_%H%M%S)"
    mv ~/uDosGo ~/uDosGo_backup_$(date +%Y%m%d_%H%M%S)
fi

if [ -d "~/Code" ]; then
    echo "Backing up existing Code directory to ~/Code_backup_$(date +%Y%m%d_%H%M%S)"
    mv ~/Code ~/Code_backup_$(date +%Y%m%d_%H%M%S)
fi

if [ -d "~/Vault" ]; then
    echo "Backing up existing Vault directory to ~/Vault_backup_$(date +%Y%m%d_%H%M%S)"
    mv ~/Vault ~/Vault_backup_$(date +%Y%m%d_%H%M%S)
fi

# Step 2: Create Directory Structure
echo "Step 2: Creating directory structure..."
mkdir -p ~/uDosGo/{Home,3dWorld,Connect,Memory,Users,scripts,dev,Docs,SonicScrewdriver,Vendor}
mkdir -p ~/Code/{Apps,Dev,Vendor,Private}
mkdir -p ~/Vault/{.compost,-inbox,-outbox}

# Step 3: Clone Core Repositories
echo "Step 3: Cloning core repositories..."

# Clone core uDosGo repositories
git clone git@github.com:uDosGo/Home.git ~/uDosGo/Home
git clone git@github.com:uDosGo/3dWorld.git ~/uDosGo/3dWorld
git clone git@github.com:uDosGo/Connect.git ~/uDosGo/Connect

# Clone Code repository
git clone git@github.com:uDosGo/Code.git ~/Code

# Clone User Vault
git clone git@github.com:uDosGo/Vault.git ~/Vault

# Step 4: Set Up AgentDigitalOK Repositories
echo "Step 4: Setting up AgentDigitalOK repositories..."
mkdir -p ~/Code/Vendor/AgentDigitalOK

# Clone Hivemind (if you have access)
if git ls-remote --exit-code git@github.com:AgentDigitalOK/Hivemind.git >/dev/null 2>&1; then
    git clone git@github.com:AgentDigitalOK/Hivemind.git ~/Code/Vendor/AgentDigitalOK/Hivemind
else
    echo "Hivemind repository not accessible, skipping..."
fi

# Step 5: Set Up Applications
echo "Step 5: Setting up applications..."
mkdir -p ~/Code/Apps

# Clone Marksmith (if available)
if git ls-remote --exit-code git@github.com:uDosGo/Marksmith.git >/dev/null 2>&1; then
    git clone git@github.com:uDosGo/Marksmith.git ~/Code/Apps/Marksmith
else
    echo "Marksmith repository not accessible, skipping..."
fi

# Clone McSnackbar (if available)
if git ls-remote --exit-code git@github.com:uDosGo/McSnackbar.git >/dev/null 2>&1; then
    git clone git@github.com:uDosGo/McSnackbar.git ~/Code/Apps/McSnackbar
else
    echo "McSnackbar repository not accessible, skipping..."
fi

# Step 6: Set Up Environment Variables
echo "Step 6: Setting up environment variables..."

# Detect shell
SHELL_CONFIG=""
if [ -f "~/.zshrc" ]; then
    SHELL_CONFIG="~/.zshrc"
elif [ -f "~/.bashrc" ]; then
    SHELL_CONFIG="~/.bashrc"
else
    echo "Warning: Could not find .zshrc or .bashrc, environment variables not set"
fi

if [ -n "$SHELL_CONFIG" ]; then
    # Backup existing config
    cp "$SHELL_CONFIG" "${SHELL_CONFIG}.backup_$(date +%Y%m%d_%H%M%S)"
    
    # Add environment variables if not already present
    if ! grep -q "UDOSGO_ROOT" "$SHELL_CONFIG"; then
        cat >> "$SHELL_CONFIG" << 'EOL'

# uDosGo Environment Variables
export UDOSGO_ROOT="$HOME/uDosGo"
export CODE_ROOT="$HOME/Code"
export VAULT_ROOT="$HOME/Vault"
export PATH="$PATH:$CODE_ROOT/Vendor/AgentDigitalOK/Hivemind/bin"
export PATH="$PATH:$UDOSGO_ROOT/Home/scripts"
EOL
    fi
    
    echo "Environment variables added to $SHELL_CONFIG"
    echo "Please run 'source $SHELL_CONFIG' to apply them"
fi

# Step 7: Download and Set Up Scripts
echo "Step 7: Downloading ecosystem scripts..."
mkdir -p ~/uDosGo/Home/scripts

curl -o ~/uDosGo/Home/scripts/ecosystem-health-check.sh https://raw.githubusercontent.com/uDosGo/Home/main/scripts/ecosystem-health-check.sh
curl -o ~/uDosGo/Home/scripts/ecosystem-maintenance.sh https://raw.githubusercontent.com/uDosGo/Home/main/scripts/ecosystem-maintenance.sh

chmod +x ~/uDosGo/Home/scripts/ecosystem-health-check.sh
chmod +x ~/uDosGo/Home/scripts/ecosystem-maintenance.sh

# Step 8: Set Up Documentation
echo "Step 8: Setting up documentation..."
mkdir -p ~/uDosGo/Docs

curl -o ~/uDosGo/Docs/ECOSYSTEM-RULES.md https://raw.githubusercontent.com/uDosGo/Home/main/docs/ECOSYSTEM-RULES.md
curl -o ~/uDosGo/Docs/FINAL-ECOSYSTEM-SUMMARY.md https://raw.githubusercontent.com/uDosGo/Home/main/docs/FINAL-ECOSYSTEM-SUMMARY.md
curl -o ~/uDosGo/Docs/AGENT-SHARING-INSTRUCTIONS.md https://raw.githubusercontent.com/uDosGo/Home/main/docs/AGENT-SHARING-INSTRUCTIONS.md

# Step 9: Configure Git
echo "Step 9: Configuring Git..."

# Check if git is configured
if [ -z "$(git config --global user.name)" ]; then
    read -p "Enter your name for Git: " git_name
    git config --global user.name "$git_name"
fi

if [ -z "$(git config --global user.email)" ]; then
    read -p "Enter your email for Git: " git_email
    git config --global user.email "$git_email"
fi

# Check for SSH keys
if [ ! -f ~/.ssh/id_ed25519 ]; then
    echo "Generating new SSH key..."
    ssh-keygen -t ed25519 -C "$(git config --global user.email)"
    eval "$(ssh-agent -s)"
    ssh-add ~/.ssh/id_ed25519
    
    echo "Please add the following SSH key to your GitHub account:"
    cat ~/.ssh/id_ed25519.pub
    echo ""
    echo "Then press Enter to continue..."
    read
fi

# Step 10: Verify All Components
echo "Step 10: Verifying components..."

echo "Checking directory structure..."
ls -la ~/uDosGo/
ls -la ~/Code/
ls -la ~/Vault/

echo "Checking git repositories..."
git -C ~/uDosGo/Home status
git -C ~/uDosGo/3dWorld status
git -C ~/uDosGo/Connect status
git -C ~/Code status
git -C ~/Vault status

echo "Checking environment variables..."
echo "UDOSGO_ROOT: $UDOSGO_ROOT"
echo "CODE_ROOT: $CODE_ROOT"
echo "VAULT_ROOT: $VAULT_ROOT"

# Step 11: Run Health Check
echo "Step 11: Running health check..."
bash ~/uDosGo/Home/scripts/ecosystem-health-check.sh

# Step 12: Set Up SeedVault (Optional)
echo "Step 12: Setting up SeedVault (optional)..."
mkdir -p ~/uDosGo/Connect/SeedVault

if [ -d ~/uDosGo/Connect/SeedVault ]; then
    echo "SeedVault directory created successfully"
else
    echo "SeedVault setup requires additional configuration"
fi

echo ""
echo "=== uDosGo Ecosystem Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Review the documentation in ~/uDosGo/Docs/"
echo "2. Familiarize yourself with the ecosystem rules"
echo "3. Set up any additional tools or applications as needed"
echo "4. Begin using the ecosystem for development and collaboration"
echo ""
echo "For support, refer to:"
echo "- ~/uDosGo/Docs/ECOSYSTEM-RULES.md"
echo "- ~/uDosGo/Docs/FINAL-ECOSYSTEM-SUMMARY.md"
echo "- ~/uDosGo/Docs/AGENT-SHARING-INSTRUCTIONS.md"
