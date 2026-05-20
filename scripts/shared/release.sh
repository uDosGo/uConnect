#!/bin/bash
# release.sh - Create tagged releases for DevStudio
#
# This script creates Git tags and pushes them to trigger the GitHub Actions
# release pipeline, which builds Docker images and publishes to GHCR.
#
# USAGE:
#   # Create a new release (patch version bump)
#   ./scripts/release.sh
#
#   # Create a specific version
#   ./scripts/release.sh v1.2.3
#
#   # Create a pre-release
#   ./scripts/release.sh v1.2.3-alpha
#
#   # Dry run (show what would be done)
#   ./scripts/release.sh --dry-run
#
#   # Force push (replace existing tag)
#   ./scripts/release.sh --force v1.2.3

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

DRY_RUN=false
FORCE=false
VERSION=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        -*)
            echo "Unknown option: $1"
            exit 1
            ;;
        *)
            VERSION="$1"
            shift
            ;;
    esac
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_echo()  { echo -e "${BLUE}  ${NC} $1"; }

# Get current version
get_current_version() {
    # Try to get latest tag
    if git describe --tags --match "v[0-9]*" --abbrev=0 2>/dev/null; then
        return
    fi
    echo "v0.0.0"
}

# Bump version
bump_version() {
    local current="$(get_current_version)"
    local base=${current#v}
    
    IFS='.' read -r major minor patch <<< "$base"
    
    # If pre-release, strip suffix
    if [[ "$patch" =~ - ]]; then
        local suffix="${patch#*-}"
        patch="${patch%%-*}"
    fi
    
    # Bump patch
    patch=$((patch + 1))
    echo "v${major}.${minor}.${patch}"
}

# Main logic
echo ""

if [[ -z "$VERSION" ]]; then
    VERSION=$(bump_version)
    log_info "Auto-bumping version to: $VERSION"
else
    log_info "Creating release: $VERSION"
fi

# Validate version format
if ! [[ "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$ ]]; then
    log_error "Invalid version format: $VERSION"
    log_error "Expected format: vX.Y.Z or vX.Y.Z-suffix"
    exit 1
fi

# Check if tag exists
if git rev-parse "$VERSION" >/dev/null 2>&1; then
    if [[ "$FORCE" = true ]]; then
        log_warn "Tag $VERSION already exists - will be replaced"
    else
        log_error "Tag $VERSION already exists"
        log_error "Use --force to replace, or specify a new version"
        exit 1
    fi
fi

# Show what will be done
log_info "Release checklist:"
log_echo "  1. Create Git tag: $VERSION"
log_echo "  2. Push tag to origin"
log_echo "  3. GitHub Actions will:"
log_echo "     - Build Docker images (secret-server, snackbar-linux)"
log_echo "     - Push to GHCR (ghcr.io/${GITHUB_REPOSITORY:-okagentdigital/devstudio})"
log_echo "     - Create GitHub Release with notes"
log_echo ""

if [[ "$DRY_RUN" = true ]]; then
    log_info "Dry run - exiting without changes"
    exit 0
fi

# Create tag
log_info "Creating tag $VERSION..."
git tag -a "$VERSION" -m "Release $VERSION"
log_info "✅ Tag created"

# Push tag (triggers release pipeline)
log_info "Pushing tag to origin..."
if [[ "$FORCE" = true ]]; then
    git push origin "$VERSION" --force
else
    git push origin "$VERSION"
fi
log_info "✅ Tag pushed"

log_info ""
log_info "✅ Release $VERSION triggered!"
log_info ""
log_info "Monitor progress at:"
log_echo "  https://github.com/${GITHUB_REPOSITORY:-OkAgentDigital/DevStudio}/actions"
log_info ""
log_info "Docker images will be available at:"
log_echo "  ghcr.io/${GITHUB_REPOSITORY:-okagentdigital/devstudio}/secret-server:$VERSION"
log_echo "  ghcr.io/${GITHUB_REPOSITORY:-okagentdigital/devstudio}/snackbar-linux:$VERSION"
