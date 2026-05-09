#!/bin/bash
# udos student fetch — Download and install Student Kits from GitHub Packages
#
# Usage:
#   udos student fetch --week 1          # Fetch latest Week 1 kit
#   udos student fetch --week 2 --version 1.0  # Specific version
#   udos student list                    # List available kits
#   udos student install <archive>       # Install a local kit
#
# This script is the student-facing CLI for the GitHub Packages distribution.
# It uses the GitHub API (unauthenticated for public packages) to list and
# download versioned Student Kits.

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
ORG="${UDOS_ORG:-uDosGo}"
REPO="${UDOS_REPO:-uDosGo}"
REGISTRY="${UDOS_REGISTRY:-ghcr.io}"
PACKAGES_URL="https://api.github.com/repos/${ORG}/${REPO}/releases"
INSTALL_DIR="${UDOS_INSTALL_DIR:-${HOME}/.udos/kits}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step()  { echo -e "${CYAN}→${NC} $1"; }

# ── Help ─────────────────────────────────────────────────────────────────────
show_help() {
    cat << 'HELP'
Usage: udos student <command> [options]

Commands:
  fetch   Download a student kit by week
  list    List available kits
  install Install a kit from a local archive
  help    Show this help

Options:
  --week <n>       Week number (1-52)
  --version <v>    Kit version (default: latest)
  --lane <lane>    Distribution lane: student|story|theme|legacy (default: student)

Examples:
  udos student fetch --week 1
  udos student fetch --week 2 --version 1.0
  udos student list
  udos student install ./udos-student-week1-v1.0.tar.gz
HELP
}

# ── List Available Kits ──────────────────────────────────────────────────────
list_kits() {
    log_info "Fetching available kits from ${ORG}/${REPO}..."

    # Use GitHub API to list releases tagged with student/week*
    if command -v gh &> /dev/null; then
        gh release list \
            --repo "${ORG}/${REPO}" \
            --limit 50 \
            --json tagName,createdAt,name \
            --jq '.[] | select(.tagName | startswith("vudos-student")) | {tag: .tagName, name: .name, date: .createdAt}' \
            2>/dev/null || {
            log_warn "gh CLI not available, falling back to API..."
            list_kits_api
        }
    else
        list_kits_api
    fi
}

list_kits_api() {
    # Fallback: use curl to query GitHub API
    curl -s "${PACKAGES_URL}?per_page=30" \
        | jq -r '.[] | select(.tag_name | startswith("vudos-student")) | "\(.tag_name) | \(.name) | \(.published_at)"' \
        2>/dev/null || echo "No kits found or API unavailable"
}

# ── Fetch a Kit ──────────────────────────────────────────────────────────────
fetch_kit() {
    local week="$1"
    local version="${2:-latest}"
    local lane="${3:-student}"

    # Construct package name
    local package_name="udos-${lane}-week${week}"
    local tag="v${package_name}-${version}"

    log_step "Fetching ${package_name} (${tag}) from ${ORG}/${REPO}..."

    # Create install directory
    mkdir -p "${INSTALL_DIR}"

    if command -v gh &> /dev/null; then
        # Use gh CLI to download
        log_info "Downloading with gh CLI..."
        gh release download "${tag}" \
            --repo "${ORG}/${REPO}" \
            --dir "${INSTALL_DIR}" \
            --pattern "*.tar.gz" \
            2>/dev/null || {
            log_error "Failed to download. Try: gh release download ${tag} --repo ${ORG}/${REPO}"
            exit 1
        }
    else
        # Fallback: direct download from GitHub
        local download_url="${PACKAGES_URL}/tags/${tag}"
        log_info "Downloading from ${download_url}..."

        local archive_url=$(curl -s "${download_url}" | jq -r '.assets[0].browser_download_url' 2>/dev/null)
        if [[ -z "$archive_url" || "$archive_url" == "null" ]]; then
            log_error "No assets found for tag: ${tag}"
            log_info "Available releases:"
            list_kits
            exit 1
        fi

        log_step "Downloading: ${archive_url}"
        curl -L -o "${INSTALL_DIR}/${package_name}-${version}.tar.gz" "${archive_url}"
    fi

    log_ok "Downloaded to ${INSTALL_DIR}/"

    # Extract and show contents
    local archive_file=$(ls "${INSTALL_DIR}"/*.tar.gz 2>/dev/null | head -1)
    if [[ -n "$archive_file" ]]; then
        log_step "Kit contents:"
        tar -tzf "$archive_file" | head -20
    fi
}

# ── Install a Kit ────────────────────────────────────────────────────────────
install_kit() {
    local archive="$1"

    if [[ ! -f "$archive" ]]; then
        log_error "Archive not found: ${archive}"
        exit 1
    fi

    log_step "Installing kit from ${archive}..."

    local kit_name=$(basename "$archive" .tar.gz)
    local extract_dir="${INSTALL_DIR}/${kit_name}"

    mkdir -p "$extract_dir"
    tar -xzf "$archive" -C "$extract_dir"

    log_ok "Installed to ${extract_dir}"

    # Show manifest if available
    if [[ -f "${extract_dir}/manifest.json" ]]; then
        log_step "Kit info:"
        cat "${extract_dir}/manifest.json" | jq '.name, .description, .version' 2>/dev/null || true
    fi

    # Show lessons if available
    if [[ -d "${extract_dir}/lessons" ]]; then
        log_step "Lessons:"
        ls "${extract_dir}/lessons/"*.md 2>/dev/null | while read -r lesson; do
            echo "  📖 $(basename "$lesson" .md)"
        done
    fi

    # Show starter vault if available
    if [[ -d "${extract_dir}/starter-vault" ]]; then
        log_step "Starter vault ready at: ${extract_dir}/starter-vault"
        log_info "Run: udos vault init ${extract_dir}/starter-vault"
    fi

    echo ""
    log_ok "Kit '${kit_name}' installed successfully!"
    echo ""
    echo "  Next steps:"
    echo "    cd ${extract_dir}"
    echo "    cat README.md"
    echo "    udos vault init starter-vault"
}

# ── Main ─────────────────────────────────────────────────────────────────────
main() {
    local command="${1:-help}"

    case "$command" in
        fetch)
            shift
            local week=""
            local version="latest"
            local lane="student"

            while [[ $# -gt 0 ]]; do
                case "$1" in
                    --week) week="$2"; shift 2 ;;
                    --version) version="$2"; shift 2 ;;
                    --lane) lane="$2"; shift 2 ;;
                    *) log_error "Unknown option: $1"; exit 1 ;;
                esac
            done

            if [[ -z "$week" ]]; then
                log_error "Missing --week argument"
                echo "Usage: udos student fetch --week <n> [--version <v>] [--lane <lane>]"
                exit 1
            fi

            fetch_kit "$week" "$version" "$lane"
            ;;

        list)
            list_kits
            ;;

        install)
            shift
            local archive="${1:-}"
            if [[ -z "$archive" ]]; then
                log_error "Missing archive path"
                echo "Usage: udos student install <archive.tar.gz>"
                exit 1
            fi
            install_kit "$archive"
            ;;

        help|--help|-h)
            show_help
            ;;

        *)
            log_error "Unknown command: ${command}"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
