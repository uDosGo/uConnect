#!/bin/bash

# uDosGo Launcher - Main Script
# Installs dependencies, self-heals, and launches ucode1 CLI in Rust TUI mode
# Note: ucode1 CLI is implemented in uCode2 Rust workspace

set -e

# Configuration
REPO_DIR="/Users/fredbook/Code/uDosGo"
UCODE_DIR="$REPO_DIR/uCode2"
LOG_FILE="$REPO_DIR/uDosGo_install.log"
TIMEOUT_SECONDS=300
MAX_RETRIES=3

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Enhanced spinner with timeout detection
spinner() {
    local pid=$1
    local max_time=${2:-300}  # Default 5 minutes timeout
    local delay=0.1
    local spinstr='|/-\'
    local elapsed=0
    local last_update=0
    
    echo -n " "  # Start spinner on same line
    
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ] && [ $(awk "BEGIN {print ($elapsed < $max_time) ? 1 : 0}") -eq 1 ]; do
        local temp=${spinstr#?}
        printf "[%c] " "$spinstr"
        local spinstr=$temp${spinstr%?}
        sleep $delay
        printf "\b\b\b\b"
        elapsed=$(awk "BEGIN {print $elapsed + $delay}")
        
        # Show progress every 30 seconds
        if [ $(awk "BEGIN {print ($elapsed >= $last_update + 30) ? 1 : 0}") -eq 1 ]; then
            local minutes=$(awk "BEGIN {print int($elapsed/60)}")
            local seconds=$(awk "BEGIN {print int($elapsed%60)}")
            echo -n " [$(printf '%02d:%02d' $minutes $seconds)]"
            last_update=$elapsed
        fi
    done
    
    if [ $(awk "BEGIN {print ($elapsed >= $max_time) ? 1 : 0}") -eq 1 ]; then
        echo "\n${RED}Timeout reached ($max_time seconds) - process may be hanging${NC}"
        return 1
    else
        printf "\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b"
        printf "[✓] "
    fi
}

# Enhanced progress bar with ETA
progress_bar() {
    local duration=${1}
    local start_time=$(date +%s)
    
    for (( elapsed=1; elapsed<=$duration; elapsed++ )); do
        local current_time=$(date +%s)
        local eta=$((duration - elapsed))
        local percent=$((elapsed*100/duration))
        
        # Calculate bar length based on terminal width
        local cols=$(tput cols 2>/dev/null || echo 80)
        local bar_width=$((cols > 50 ? 50 : cols - 30))
        local filled=$((percent * bar_width / 100))
        local empty=$((bar_width - filled))
        
        local bar=$(printf "#%.0s" $(seq 1 $filled))$(printf " %.0s" $(seq 1 $empty))
        
        printf "\r[%s] %d%% [ETA: %ds]" "$bar" "$percent" "$eta"
        sleep 1
    done
    printf "\n"
}

# Hang detection wrapper for long-running commands
execute_with_timeout() {
    local cmd="$1"
    local timeout=${2:-300}  # Default 5 minutes
    local start_time=$(date +%s)
    
    echo "Starting: $cmd"
    
    # Run command in background
    eval "$cmd" &
    local cmd_pid=$!
    
    # Show spinner while command runs
    if ! spinner $cmd_pid $timeout; then
        echo "${RED}Command timed out after ${timeout} seconds${NC}"
        kill $cmd_pid 2>/dev/null
        return 1
    fi
    
    # Check command exit status
    wait $cmd_pid
    local status=$?
    
    if [ $status -eq 0 ]; then
        echo "${GREEN}Completed successfully${NC}"
    else
        echo "${RED}Command failed with exit code $status${NC}"
    fi
    
    return $status
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install Rust if not present
install_rust() {
    echo "${BLUE}Checking Rust installation...${NC}"
    if ! command_exists rustc; then
        echo "${YELLOW}Rust not found. Installing Rust...${NC}"
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y >> "$LOG_FILE" 2>&1
        source "$HOME/.cargo/env"
        echo "${GREEN}Rust installed successfully${NC}"
    else
        local rust_version=$(rustc --version | awk '{print $2}')
        echo "${GREEN}Rust $rust_version is already installed${NC}"
        
        # Check if Rust version is too old for some packages
        if [[ "$rust_version" < "1.91.0" ]]; then
            echo "${YELLOW}Note: Some cargo packages may require Rust 1.91+. Consider upgrading: rustup update${NC}"
        fi
    fi
}

# Install dependencies
install_dependencies() {
    echo "${BLUE}Installing dependencies...${NC}"
    
    # Check and install git
    if ! command_exists git; then
        echo "${YELLOW}Installing git...${NC}"
        brew install git >> "$LOG_FILE" 2>&1
    fi
    
    # Check and install cargo packages
    echo "${BLUE}Updating cargo packages...${NC}"
    
    # Try to install cargo-edit with locked mode to avoid version conflicts
    echo -n "  Checking cargo-edit..."
    if ! cargo install --list | grep -q cargo-edit; then
        echo -n " (installing)"
        if execute_with_timeout "cargo install --locked cargo-edit >> \"$LOG_FILE\" 2>&1" 120; then
            echo " ${GREEN}✓${NC}"
        else
            echo " ${YELLOW}⚠ (skipped - version compatibility)${NC}"
        fi
    else
        echo " ${GREEN}✓ (already installed)${NC}"
    fi
    
    # Try to install cargo-watch with locked mode
    echo -n "  Checking cargo-watch..."
    if ! cargo install --list | grep -q cargo-watch; then
        echo -n " (installing)"
        if execute_with_timeout "cargo install --locked cargo-watch >> \"$LOG_FILE\" 2>&1" 120; then
            echo " ${GREEN}✓${NC}"
        else
            echo " ${YELLOW}⚠ (skipped - version compatibility)${NC}"
        fi
    else
        echo " ${GREEN}✓ (already installed)${NC}"
    fi
    
    echo "${GREEN}Dependencies check complete${NC}"
}

# Self-heal function
self_heal() {
    echo "${YELLOW}Running self-heal checks...${NC}"
    
    # Check if repository exists
    if [ ! -d "$UCODE_DIR" ]; then
        echo "${RED}uCode2 directory not found. Cloning repository...${NC}"
        git clone https://github.com/uDosGo/Connect.git "$UCODE_DIR" >> "$LOG_FILE" 2>&1
    fi
    
    # Check if Cargo.toml exists
    if [ ! -f "$UCODE_DIR/Cargo.toml" ]; then
        echo "${RED}Cargo.toml not found in uCode2. Repository may be corrupted.${NC}"
        exit 1
    fi
    
    echo "${GREEN}Self-heal checks passed${NC}"
}

# Build uCode2 with timeout and retry
build_ucode() {
    local retry_count=0
    local success=false
    
    while [ $retry_count -lt $MAX_RETRIES ] && [ "$success" = false ]; do
        echo "${BLUE}Building uCode2 (Attempt $((retry_count + 1)) of $MAX_RETRIES)...${NC}"
        
        # Use timeout wrapper for build process
        if execute_with_timeout "cd \"$UCODE_DIR\" && cargo build --release >> \"$LOG_FILE\" 2>&1" 600; then
            success=true
            echo "${GREEN}uCode2 built successfully${NC}"
        else
            retry_count=$((retry_count + 1))
            echo "${RED}Build failed or timed out. Retrying...${NC}"
            sleep 5
        fi
    done
    
    if [ "$success" = false ]; then
        echo "${RED}Failed to build uCode2 after $MAX_RETRIES attempts${NC}"
        echo "${YELLOW}Check $LOG_FILE for details${NC}"
        exit 1
    fi
}

# Main execution
main() {
    echo "${BLUE}=== uDosGo Launcher ===${NC}"
    echo "${YELLOW}Note: ucode1 CLI is implemented in uCode2 Rust workspace${NC}"
    echo ""
    
    # Create log file
    touch "$LOG_FILE"
    echo "Logging to: $LOG_FILE"
    echo ""
    
    # Install Rust
    install_rust
    
    # Install dependencies
    install_dependencies
    
    # Run self-heal
    self_heal
    
    # Build uCode1
    build_ucode
    
    # Launch uCode1 in Rust TUI mode
    echo "${BLUE}Launching ucode1 in Rust TUI mode...${NC}"
    cd "$UCODE_DIR"
    
    # Show progress bar for 3 seconds before launching
    progress_bar 3
    
    # Launch with TUI mode
    cargo run --bin ucode1 -- --tui
}

# Execute main function with error handling
main "$@"

exit 0