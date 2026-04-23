#!/bin/bash

# uDosGo Local Ecosystem Setup
# This script ensures all 4 local home folders are properly set up

set -e  # Exit on error

echo "=== uDosGo Local Ecosystem Setup ==="
echo "Setting up 4 home folders: uDosGo, Vault, Code, Code/Apps"
echo ""

# Function to create directory if it doesn't exist
ensure_directory() {
    local dir_path="$1"
    local dir_name="$2"
    
    if [ ! -d "$dir_path" ]; then
        echo "Creating $dir_name directory: $dir_path"
        mkdir -p "$dir_path"
        echo "✅ $dir_name directory created"
    else
        echo "✅ $dir_name directory already exists: $dir_path"
    fi
}

# Function to set proper permissions
set_permissions() {
    local dir_path="$1"
    chmod 755 "$dir_path"
    echo "✅ Permissions set for $dir_path"
}

# 1. uDosGo Home Folder
echo "Step 1: Setting up uDosGo home folder..."
ensure_directory "~/uDosGo" "uDosGo"
set_permissions "~/uDosGo"

# Create essential subdirectories if they don't exist
mkdir -p ~/uDosGo/{Home,3dWorld,Connect,Memory,Users,scripts,dev,Docs,SonicScrewdriver,Vendor}
echo "✅ uDosGo subdirectories created"

# 2. Vault Home Folder
echo ""
echo "Step 2: Setting up Vault home folder..."
ensure_directory "~/Vault" "Vault"
set_permissions "~/Vault"

# Create essential Vault subdirectories
mkdir -p ~/Vault/{.compost,-inbox,-outbox,backups,archive,secrets}
echo "✅ Vault subdirectories created"

# 3. Code Home Folder
echo ""
echo "Step 3: Setting up Code home folder..."
ensure_directory "~/Code" "Code"
set_permissions "~/Code"

# Create essential Code subdirectories
mkdir -p ~/Code/{Apps,Dev,Vendor,Private,Tools,Libraries}
echo "✅ Code subdirectories created"

# 4. Code/Apps Home Folder
echo ""
echo "Step 4: Setting up Code/Apps home folder..."
ensure_directory "~/Code/Apps" "Code/Apps"
set_permissions "~/Code/Apps"

# Create essential Apps subdirectories
mkdir -p ~/Code/Apps/{Marksmith,McSnackbar,Utilities,WebApps,MobileApps}
echo "✅ Code/Apps subdirectories created"

# 5. Verify all directories
echo ""
echo "Step 5: Verifying all home folders..."
echo ""

echo "uDosGo Home Folder:"
ls -la ~/uDosGo/ | head -10
echo ""

echo "Vault Home Folder:"
ls -la ~/Vault/ | head -10
echo ""

echo "Code Home Folder:"
ls -la ~/Code/ | head -10
echo ""

echo "Code/Apps Home Folder:"
ls -la ~/Code/Apps/ | head -10
echo ""

# 6. Set up basic configuration files
echo "Step 6: Setting up basic configuration..."

# Create README in each home folder
cat > ~/uDosGo/README.md << 'EOL'
# uDosGo Home Folder
This is the main uDosGo ecosystem directory containing:
- Home: Core home configuration
- 3dWorld: 3D world and spatial computing
- Connect: Connection management
- Memory: Memory systems
- Users: User management
- scripts: Ecosystem scripts
- dev: Development tools
- Docs: Documentation
- SonicScrewdriver: Advanced tools
- Vendor: Third-party integrations
EOL

cat > ~/Vault/README.md << 'EOL'
# Vault Home Folder
This directory contains secure storage for:
- .compost: Temporary/compostable data
- -inbox: Incoming data processing
- -outbox: Outgoing data staging
- backups: System backups
- archive: Long-term archives
- secrets: Sensitive configuration (keep encrypted)
EOL

cat > ~/Code/README.md << 'EOL'
# Code Home Folder
This directory contains all code-related work:
- Apps: Application development
- Dev: Development projects
- Vendor: Third-party code
- Private: Private repositories
- Tools: Development tools
- Libraries: Shared libraries
EOL

cat > ~/Code/Apps/README.md << 'EOL'
# Code/Apps Home Folder
This directory contains application development:
- Marksmith: Marksmith application
- McSnackbar: McSnackbar application
- Utilities: Utility applications
- WebApps: Web applications
- MobileApps: Mobile applications
EOL

echo "✅ Configuration files created"

# 7. Set up environment variables
echo ""
echo "Step 7: Setting up environment variables..."

# Check which shell config file to use
SHELL_CONFIG=""
if [ -f "~/.zshrc" ]; then
    SHELL_CONFIG="~/.zshrc"
elif [ -f "~/.bashrc" ]; then
    SHELL_CONFIG="~/.bashrc"
else
    SHELL_CONFIG="~/.profile"
fi

# Add environment variables if not already present
if ! grep -q "UDOSGO_ROOT" "$SHELL_CONFIG"; then
    cat >> "$SHELL_CONFIG" << 'EOL'

# uDosGo Local Ecosystem Environment Variables
export UDOSGO_ROOT="$HOME/uDosGo"
export VAULT_ROOT="$HOME/Vault"
export CODE_ROOT="$HOME/Code"
export APPS_ROOT="$HOME/Code/Apps"
export PATH="$PATH:$UDOSGO_ROOT/scripts"
export PATH="$PATH:$APPS_ROOT/Utilities"
EOL
    echo "✅ Environment variables added to $SHELL_CONFIG"
    echo "Please run 'source $SHELL_CONFIG' to apply them"
else
    echo "✅ Environment variables already configured"
fi

# 8. Final verification
echo ""
echo "=== Local Ecosystem Setup Complete ==="
echo ""
echo "4 Home Folders Setup:"
echo "1. uDosGo: ~/uDosGo/"
echo "2. Vault:   ~/Vault/"
echo "3. Code:    ~/Code/"
echo "4. Apps:    ~/Code/Apps/"
echo ""
echo "Next steps:"
echo "1. Run: source $SHELL_CONFIG"
echo "2. Review the README files in each directory"
echo "3. Begin using the ecosystem for development"
echo ""
echo "For full ecosystem setup, run: ./implement_go.sh"