#!/usr/bin/env bash
# uDosConnect — main launcher with self-healing and dependency management
# This script ensures all dependencies are installed and the system is ready before launching
set -euo pipefail

# Get script directory and root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UDOS_ROOT="$(dirname "$SCRIPT_DIR")"
VAULT_ROOT="${UDOS_VAULT:-$HOME/vault}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo "${BLUE}🎮 Starting uDosConnect${NC}"

# Check if we're in the correct directory
if [[ ! -d "$UDOS_ROOT/core" ]]; then
  echo "${RED}❌ uDosConnect not found at $UDOS_ROOT${NC}"
  echo "Please ensure you're in the uDosConnect repository root."
  read -r -n 1 -s
  exit 1
fi

# Ghost Mode: Check if this is first run and create ghost profile silently
FIRST_RUN_FLAG="$VAULT_ROOT/.first_run_complete"
PROFILE_FILE="$VAULT_ROOT/@user/profile.json"

if [[ ! -f "$FIRST_RUN_FLAG" ]]; then
  echo "${CYAN}👻 Creating Ghost profile (anonymous mode)...${NC}"
  
  # Create ghost profile using Node.js script
  node -e "
    const { createGhostProfile, writeGhostProfile, markFirstRunComplete } = require('$UDOS_ROOT/core/dist/actions/ghost.js');
    const profile = createGhostProfile('$VAULT_ROOT');
    writeGhostProfile(profile, '$VAULT_ROOT');
    markFirstRunComplete('$VAULT_ROOT');
    console.log('✅ Ghost profile created');
  " 2>/dev/null || echo "${YELLOW}⚠️ Could not create ghost profile (will create on first command)${NC}"
  
  echo "${CYAN}👻 Ghost Mode: You are running as an anonymous user.${NC}"
  echo "${CYAN}   Type 'udo setup' to complete registration.${NC}"
  echo
fi

# Self-healing function to install dependencies
install_dependencies() {
  echo "${YELLOW}🔧 Installing/updating dependencies${NC}"
  
  # Check for Node.js
  if ! command -v node &> /dev/null; then
    echo "${RED}❌ Node.js is required but not installed.${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    read -r -n 1 -s
    exit 1
  fi
  
  # Check for npm or pnpm
  if command -v pnpm &> /dev/null; then
    echo "${BLUE}📦 Using pnpm for dependency management${NC}"
    (cd "$UDOS_ROOT" && pnpm install --silent)
  elif command -v npm &> /dev/null; then
    echo "${BLUE}📦 Using npm for dependency management${NC}"
    (cd "$UDOS_ROOT" && npm install --silent)
  else
    echo "${RED}❌ Neither pnpm nor npm found. Please install Node.js.${NC}"
    read -r -n 1 -s
    exit 1
  fi
  
  # Install UI dependencies specifically
  echo "${BLUE}🎨 Installing UI dependencies${NC}"
  (cd "$UDOS_ROOT/ui" && npm install --silent)
  
  # Build core
  echo "${BLUE}🔨 Building core${NC}"
  (cd "$UDOS_ROOT/core" && npm run build --silent) 2>/dev/null || true
}

# Skip build for now (dev mode)
echo "${BLUE}ℹ️ Skipping build step (dev mode)${NC}"

# Start the TUI launcher instead
echo "${BLUE}🎮 Starting uDosConnect TUI Launcher${NC}"
node "$SCRIPT_DIR/dist/tui-launcher.js" "$@"
exit_code=$?

if [[ $exit_code -ne 0 ]]; then
  echo ""
  echo "${RED}❌ Launcher failed with exit code $exit_code${NC}"
  echo "Press any key to close"
  read -r -n 1 -s
fi
exit "$exit_code"
