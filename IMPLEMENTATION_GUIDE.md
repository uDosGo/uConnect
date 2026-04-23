# uDosGo Ecosystem Implementation Guide

This guide explains how to implement the `go.md` setup instructions and provides scripts for ecosystem management.

## Available Scripts

### 1. Full Ecosystem Setup: `implement_go.sh`

This script implements the complete `go.md` guide:

**What it does:**
- Cleans up existing uDosGo, Code, and Vault directories (with backups)
- Creates the complete directory structure
- Clones all core repositories
- Sets up AgentDigitalOK repositories
- Installs applications (Marksmith, McSnackbar)
- Configures environment variables
- Downloads ecosystem scripts
- Sets up documentation
- Configures Git and SSH
- Runs health checks

**Usage:**
```bash
./implement_go.sh
```

**Note:** This script requires SSH access to GitHub repositories and will prompt for Git configuration if not already set up.

### 2. Current Repository Realignment: `realign_current.sh`

This script focuses on cleaning up and realigning the current repository:

**What it does:**
- Checks for uncommitted changes (with option to stash)
- Cleans up untracked files and directories
- Resets hard to match remote branch
- Pulls latest changes
- Cleans up build artifacts
- Option to reapply stashed changes

**Usage:**
```bash
./realign_current.sh
```

## Implementation Options

### Option A: Full Ecosystem Setup (Recommended for new systems)
```bash
# Make sure the script is executable
chmod +x implement_go.sh

# Run the full setup
./implement_go.sh
```

### Option B: Clean and Realign Current Repository
```bash
# Make sure the script is executable
chmod +x realign_current.sh

# Run the realignment
./realign_current.sh
```

### Option C: Manual Implementation

If you prefer to implement the `go.md` guide manually, follow these steps:

1. **Create Directory Structure:**
```bash
mkdir -p ~/uDosGo/{Home,3dWorld,Connect,Memory,Users,scripts,dev,Docs,SonicScrewdriver,Vendor}
mkdir -p ~/Code/{Apps,Dev,Vendor,Private}
mkdir -p ~/Vault/{.compost,-inbox,-outbox}
```

2. **Clone Core Repositories:**
```bash
git clone git@github.com:uDosGo/Home.git ~/uDosGo/Home
git clone git@github.com:uDosGo/3dWorld.git ~/uDosGo/3dWorld
git clone git@github.com:uDosGo/Connect.git ~/uDosGo/Connect
git clone git@github.com:uDosGo/Code.git ~/Code
git clone git@github.com:uDosGo/Vault.git ~/Vault
```

3. **Set Up Environment Variables:**
Add to your `~/.zshrc` or `~/.bashrc`:
```bash
export UDOSGO_ROOT="$HOME/uDosGo"
export CODE_ROOT="$HOME/Code"
export VAULT_ROOT="$HOME/Vault"
export PATH="$PATH:$CODE_ROOT/Vendor/AgentDigitalOK/Hivemind/bin"
export PATH="$PATH:$UDOSGO_ROOT/Home/scripts"
```

4. **Download Scripts and Documentation:**
```bash
curl -o ~/uDosGo/Home/scripts/ecosystem-health-check.sh https://raw.githubusercontent.com/uDosGo/Home/main/scripts/ecosystem-health-check.sh
curl -o ~/uDosGo/Home/scripts/ecosystem-maintenance.sh https://raw.githubusercontent.com/uDosGo/Home/main/scripts/ecosystem-maintenance.sh
chmod +x ~/uDosGo/Home/scripts/*.sh

curl -o ~/uDosGo/Docs/ECOSYSTEM-RULES.md https://raw.githubusercontent.com/uDosGo/Home/main/docs/ECOSYSTEM-RULES.md
curl -o ~/uDosGo/Docs/FINAL-ECOSYSTEM-SUMMARY.md https://raw.githubusercontent.com/uDosGo/Home/main/docs/FINAL-ECOSYSTEM-SUMMARY.md
curl -o ~/uDosGo/Docs/AGENT-SHARING-INSTRUCTIONS.md https://raw.githubusercontent.com/uDosGo/Home/main/docs/AGENT-SHARING-INSTRUCTIONS.md
```

## Troubleshooting

### Permission Issues
```bash
chmod -R 755 ~/uDosGo
chmod -R 755 ~/Code
chmod -R 755 ~/Vault
```

### Git Clone Failures
- Ensure SSH keys are properly set up
- Verify repository URLs are correct
- Check network connectivity

### Script Execution Issues
```bash
chmod +x ~/uDosGo/Home/scripts/*.sh
```

### Environment Variable Issues
- Verify variables are set correctly with `echo $VARIABLE_NAME`
- Ensure they're added to your shell configuration file
- Run `source ~/.zshrc` or `source ~/.bashrc` after adding variables

## Post-Implementation Steps

1. **Review Documentation:**
   - `~/uDosGo/Docs/ECOSYSTEM-RULES.md`
   - `~/uDosGo/Docs/FINAL-ECOSYSTEM-SUMMARY.md`
   - `~/uDosGo/Docs/AGENT-SHARING-INSTRUCTIONS.md`

2. **Run Health Check:**
   ```bash
   bash ~/uDosGo/Home/scripts/ecosystem-health-check.sh
   ```

3. **Set Up Additional Tools:**
   - Install any dependencies required by specific applications
   - Configure IDEs and development tools

4. **Begin Development:**
   - Familiarize yourself with the ecosystem structure
   - Start using the ecosystem for development and collaboration

## Support

For any issues or questions, refer to the documentation in `~/uDosGo/Docs/` or contact the Ecosystem Architecture Team.