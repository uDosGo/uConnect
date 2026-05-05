#!/bin/bash
# =============================================================================
# uDosGo Git Hooks Setup Script
# =============================================================================
# Installs the pre-commit hook by configuring git to use .githooks/ directory.
#
# Usage:
#   bash .githooks/setup.sh              # Install hooks
#   bash .githooks/setup.sh --verify     # Verify installation
#   bash .githooks/setup.sh --uninstall  # Remove hooks config
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   🔧 uDosGo Git Hooks Setup                                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

install_hooks() {
    echo -e "${BLUE}[INFO]${NC} Installing uDosGo pre-commit hooks..."

    # Configure git to use .githooks directory
    git config core.hooksPath .githooks

    echo -e "${GREEN}[OK]${NC} Git hooks path set to: .githooks"
    echo ""

    # Verify the hook is executable
    if [ -x "$SCRIPT_DIR/pre-commit" ]; then
        echo -e "${GREEN}[OK]${NC} pre-commit hook is executable"
    else
        echo -e "${YELLOW}[WARN]${NC} Making pre-commit hook executable..."
        chmod +x "$SCRIPT_DIR/pre-commit"
        echo -e "${GREEN}[OK]${NC} pre-commit hook is now executable"
    fi

    # Make all check scripts executable
    for script in "$SCRIPT_DIR/checks/"*.sh "$SCRIPT_DIR/lib/"*.sh; do
        if [ -f "$script" ]; then
            chmod +x "$script"
        fi
    done
    echo -e "${GREEN}[OK]${NC} All check scripts are executable"

    echo ""
    echo -e "${GREEN}✅ Hooks installed successfully!${NC}"
    echo ""
    echo "  The pre-commit hook will now run automatically on:"
    echo "    git commit"
    echo ""
    echo "  To skip checks (emergency only):"
    echo "    git commit --no-verify"
    echo "    SKIP=ruff,rust git commit"
    echo ""
}

verify_installation() {
    echo -e "${BLUE}[INFO]${NC} Verifying hook installation..."

    local hooks_path
    hooks_path=$(git config core.hooksPath || echo "")

    if [ "$hooks_path" = ".githooks" ]; then
        echo -e "${GREEN}[OK]${NC} Git hooks path is correctly set to: .githooks"
    else
        echo -e "${RED}[ERROR]${NC} Git hooks path is not set to .githooks"
        echo "  Current value: ${hooks_path:-"(not set)"}"
        echo "  Run 'bash .githooks/setup.sh' to install."
        return 1
    fi

    if [ -x "$SCRIPT_DIR/pre-commit" ]; then
        echo -e "${GREEN}[OK]${NC} pre-commit hook exists and is executable"
    else
        echo -e "${RED}[ERROR]${NC} pre-commit hook not found or not executable"
        return 1
    fi

    # Count check scripts
    local check_count
    check_count=$(find "$SCRIPT_DIR/checks" -name '*.sh' -type f | wc -l | tr -d ' ')
    echo -e "${GREEN}[OK]${NC} $check_count check scripts available"

    echo ""
    echo -e "${GREEN}✅ Installation verified${NC}"
}

uninstall_hooks() {
    echo -e "${YELLOW}[WARN]${NC} Uninstalling uDosGo hooks..."

    # Remove the hooks path config
    git config --unset core.hooksPath || true

    echo -e "${GREEN}[OK]${NC} Git hooks path reset to default (.git/hooks/)"
    echo ""
    echo -e "${YELLOW}Note:${NC} The .githooks/ directory and scripts remain on disk."
    echo "  To remove them: rm -rf .githooks/"
    echo ""
}

# ── Main ────────────────────────────────────────────────────────────────────
case "${1:-install}" in
    install)
        install_hooks
        ;;
    --verify|verify)
        verify_installation
        ;;
    --uninstall|uninstall)
        uninstall_hooks
        ;;
    *)
        echo "Usage: $0 [install|--verify|--uninstall]"
        exit 1
        ;;
esac
