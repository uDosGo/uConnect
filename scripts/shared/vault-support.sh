#!/bin/bash
# Vault Support for DevStudio and SonicScrewdriver
# Manages ~/Vault directory for md docs, .local runtime, .env files
# Complies with uDos (universal spec) defaults

set -euo pipefail

VAULT_ROOT="${VAULT_ROOT:-$HOME/Vault}"
PROJECT="${1:-SonicScrewdriver}"

echo "🔐 Vault Support for $PROJECT"
echo "=============================="

# Function to create minimal Vault structure
create_vault_structure() {
    echo "Creating minimal functional ~/Vault structure..."
    
    # Main Vault directories
    mkdir -p "$VAULT_ROOT/md"          # Markdown documentation
    mkdir -p "$VAULT_ROOT/.local"      # Local runtime
    mkdir -p "$VAULT_ROOT/env"        # Environment files
    mkdir -p "$VAULT_ROOT/logs"       # Log files
    mkdir -p "$VAULT_ROOT/cache"      # Cache files
    mkdir -p "$VAULT_ROOT/config"     # Configuration files
    mkdir -p "$VAULT_ROOT/secrets"    # Sensitive files (restricted)
    mkdir -p "$VAULT_ROOT/backups"     # Backup files
    
    # Project-specific directories
    mkdir -p "$VAULT_ROOT/md/$PROJECT"
    mkdir -p "$VAULT_ROOT/.local/$PROJECT"
    mkdir -p "$VAULT_ROOT/env/$PROJECT"
    mkdir -p "$VAULT_ROOT/logs/$PROJECT"
    mkdir -p "$VAULT_ROOT/config/$PROJECT"
    
    # Create README in md directory
    if [ ! -f "$VAULT_ROOT/md/README.md" ]; then
        cat > "$VAULT_ROOT/md/README.md" << EOF
# Vault - Documentation

This directory contains all markdown documentation for projects managed by DevStudio.

## Structure

| Directory | Purpose |
|-----------|---------|
| /md/<project>/ | Project-specific markdown docs |
| /env/<project>/ | Environment files for project |
| /logs/<project>/ | Log files for project |
| /config/<project>/ | Configuration files for project |

## Projects
- [SonicScrewdriver](/md/SonicScrewdriver/README.md)
EOF
    fi
    
    # Create basic .gitignore for Vault
    if [ ! -f "$VAULT_ROOT/.gitignore" ]; then
        cat > "$VAULT_ROOT/.gitignore" << EOF
# Vault - Git Ignore

# Local runtime
.local/

# Environment files (contain secrets)
env/
!.gitignore

# Logs
logs/
!.gitkeep

# Cache
cache/

# Secrets
secrets/

# Backups
backups/

# Specific file types
*.env
*.env.*
*.key
*.pem
*.crt
*.secret
*.token
EOF
    fi
    
    # Create .gitkeep files in empty directories for version control
    for dir in md .local env logs cache config backups; do
        if [ ! -f "$VAULT_ROOT/$dir/.gitkeep" ]; then
            touch "$VAULT_ROOT/$dir/.gitkeep"
        fi
    done
    for dir in md env logs config; do
        if [ ! -f "$VAULT_ROOT/$dir/$PROJECT/.gitkeep" ]; then
            touch "$VAULT_ROOT/$dir/$PROJECT/.gitkeep"
        fi
    done
    
    # Set permissions on secrets directory
    chmod 700 "$VAULT_ROOT/secrets" 2>/dev/null || true
    
    echo "✅ Vault structure created at $VAULT_ROOT"
}

# Function to create project documentation stub
create_project_docs() {
    local project_dir="$VAULT_ROOT/md/$PROJECT"
    
    if [ ! -f "$project_dir/README.md" ]; then
        cat > "$project_dir/README.md" << EOF
# $PROJECT Documentation

> Managed by DevStudio Vault

## Overview

$PROJECT is a ...

## Quick Start

\)bash
# Installation
# Usage
EOF
    fi
    
    if [ ! -f "$project_dir/DEVLOG.md" ]; then
        cat > "$project_dir/DEVLOG.md" << EOF
# $PROJECT DEVLOG

> **Concise, non-verbose, feed-styled development log**
> *Published/Released updates only, in order of application*

---

## Latest Release

### v0.0.0 - $(date +%Y-%m-%d)
- Initial Vault integration

---

## Archived

| Version | Date | Status |
|---------|------|--------|
| v0.0.0 | $(date +%Y-%m-%d) | Development |
EOF
    fi
    
    # Create .compost directory for uDos spec compliance
    if [ ! -d "$VAULT_ROOT/.compost" ]; then
        mkdir -p "$VAULT_ROOT/.compost"
        cat > "$VAULT_ROOT/.compost/README.md" << EOF
# .compost

Universal spec (uDos) compliant compost directory for transient and temporary files.

This directory is used for:
- Temporary build artifacts
- Cache files
- Transient state
- Files that can be safely deleted

## Cleanup

Run `rm -rf $VAULT_ROOT/.compost/*` to clear all transient files.
EOF
        touch "$VAULT_ROOT/.compost/.gitkeep"
    fi
    
    echo "✅ Project documentation stubs created"
}

# Function to create .env template
create_env_template() {
    local env_dir="$VAULT_ROOT/env/$PROJECT"
    
    if [ ! -f "$env_dir/.env.example" ]; then
        cat > "$env_dir/.env.example" << EOF
# $PROJECT Environment Configuration
# Copy this to .env and customize for your environment

# General
PROJECT_NAME=$PROJECT
ENVIRONMENT=development
DEBUG=true
VERBOSE=true

# Paths
GOPATH=$HOME/.local/go
PATH=\$PATH:\$HOME/.local/bin:\$HOME/.local/go/bin
ARCHIVE_DIR=$HOME/Code/DevStudio/Archives/$PROJECT

# DevStudio
DEV_MODE=true
DEVSTUDIO_DEV_MODE=true
SONIC_DEV_MODE=true

# VibeCli
VIBE_HOME=
VIBE_SESSION_ID=

# Runtime
HOST=localhost
PORT=8080

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=${PROJECT,,}
DB_USER=
DB_PASSWORD=
EOF
    fi
    
    if [ ! -f "$env_dir/.gitignore" ]; then
        cat > "$env_dir/.gitignore" << EOF
# Ignore all .env files
env*
!.env.example
!.gitignore
EOF
    fi
    
    echo "✅ Environment templates created"
}

# Function to scaffold minimal functional Vault
scaffold_vault() {
    echo "Scaffolding minimal functional Vault for $PROJECT..."
    echo ""
    
    create_vault_structure
    create_project_docs
    create_env_template
    
    # Create a Vault index
    cat > "$VAULT_ROOT/INDEX.md" << EOF
# Vault Index

Managed by DevStudio | uDos Compliant

## Structure

- [md/](md/) - Markdown documentation
- [.local/](.local/) - Local runtime files
- [env/](env/) - Environment configurations
- [.compost/](.compost/) - Transient files (uDos spec)
- [logs/](logs/) - Log files
- [cache/](cache/) - Cache files
- [config/](config/) - Configuration files
- [secrets/](secrets/) - Sensible files (RESTRICTED)
- [backups/](backups/) - Backup files

## Projects
- [$PROJECT](md/$PROJECT/README.md)

## uDos Compliance
- ✅ ~/.local for runtime
- ✅ ~/.compost for transient files
- ✅ Standardized vault structure
- ✅ Environment separation

## Usage

All DevStudio and SonicScrewdriver development should use ~/Vault for:
- Documentation (md/)
- Local configurations (.local/)
- Environment files (env/)
- Logs (logs/)
- Secrets (secrets/ - RESTRICTED)
EOF
    
    echo ""
    echo "✅ Vault scaffolded at $VAULT_ROOT"
    echo ""
    echo "Next steps:"
    echo "  1. Add ~/Vault to your version control (optional)"
    echo "  2. Add ./Vault to .gitignore if you don't want to track it"
    echo "  3. Update environment variables to use ~/Vault paths"
}

# Function to check uDos compliance
check_udos_compliance() {
    echo "Checking uDos (universal spec) compliance..."
    echo ""
    
    local compliant=true
    
    # Check .local directory
    if [ -d "$VAULT_ROOT/.local" ]; then
        echo "  ✅ ~/.local directory exists"
    else
        echo "  ❌ ~/.local directory missing"
        compliant=false
    fi
    
    # Check .compost directory
    if [ -d "$VAULT_ROOT/.compost" ]; then
        echo "  ✅ ~/.compost directory exists"
    else
        echo "  ❌ ~/.compost directory missing"
        compliant=false
    fi
    
    # Check md directory
    if [ -d "$VAULT_ROOT/md" ]; then
        echo "  ✅ ~/md directory exists"
    else
        echo "  ⚠️  ~/md directory missing (recommended)"
    fi
    
    # Check env directory
    if [ -d "$VAULT_ROOT/env" ]; then
        echo "  ✅ ~/env directory exists"
    else
        echo "  ⚠️  ~/env directory missing (recommended)"
    fi
    
    echo ""
    if $compliant; then
        echo "uDos Compliance: ✅ PASS"
    else
        echo "uDos Compliance: ⚠️  PARTIAL"
        echo "Run: $0 scaffold to create full structure"
    fi
}

# Main execution
COMMAND="${2:-scaffold}"

case "$COMMAND" in
    scaffold|setup|init)
        scaffold_vault
        ;;
    check|compliance)
        check_udos_compliance
        ;;
    docs|documentation)
        create_project_docs
        ;;
    env|environment)
        create_env_template
        ;;
    help|--help|-h)
        echo "DevStudio Vault Support"
        echo ""
        echo "Usage: $0 [project] [command]"
        echo ""
        echo "Commands:"
        echo "  scaffold    - Create minimal functional Vault structure"
        echo "  check      - Check uDos compliance"
        echo "  docs       - Create project documentation stubs"
        echo "  env        - Create environment templates"
        echo ""
        echo "Examples:"
        echo "  $0 SonicScrewdriver scaffold"
        echo "  $0 SonicScrewdriver check"
        ;;
    *)
        scaffold_vault
        ;;
esac

exit 0
