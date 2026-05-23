#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# uDOS Vault Union Mount — Layer vault-user, vault-shared, vault-global
# ═══════════════════════════════════════════════════════════════════
# Usage:
#   bash scripts/vault-union-mount.sh          # Mount union at ~/Vault/
#   bash scripts/vault-union-mount.sh --open   # Mount & open in Obsidian
#   bash scripts/vault-union-mount.sh --status # Check mount status
#   bash scripts/vault-union-mount.sh --umount # Unmount
#   bash scripts/vault-union-mount.sh --init   # Clone repos & init
# ═══════════════════════════════════════════════════════════════════

set -e

HOME_DIR="$HOME"
CODE_DIR="$HOME_DIR/Code"
VAULT_DIR="$HOME_DIR/Vault"
UNION_CACHE="$CODE_DIR/.union"

# Layer paths
VAULT_USER="$CODE_DIR/vault-user"
VAULT_SHARED="$CODE_DIR/vault-shared"
VAULT_GLOBAL="$CODE_DIR/vault-global"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   🗄️  uDOS Vault Union Mount v3.0                      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ─── Check prerequisites ────────────────────────────────────────
check_prereqs() {
  if ! command -v unionfs &> /dev/null; then
    echo "  ⚠️  unionfs not found. Install with:"
    echo "     brew install unionfs-fuse"
    echo "     or use the software union fallback."
    echo ""
    return 1
  fi
  return 0
}

# ─── Initialize vault repos ─────────────────────────────────────
init_vaults() {
  echo "  📦 Initializing vault repositories..."
  echo ""

  # vault-user
  if [ ! -d "$VAULT_USER" ]; then
    echo "  🔧 Creating vault-user..."
    mkdir -p "$VAULT_USER"
    cd "$VAULT_USER"
    git init
    mkdir -p workspaces orbs daily journals attachments
    cat > README.md <<- 'EOF'
# vault-user

Personal knowledge vault. Top layer in the uDOS union filesystem.

## Structure
- `workspaces/` — Active project workspaces
- `orbs/` — Personal knowledge orbs
- `daily/` — Daily notes
- `journals/` — Journals and logs
- `attachments/` — File attachments
EOF
    git add -A
    git commit -m "init: vault-user"
    echo "  ✅ vault-user initialized at $VAULT_USER"
  else
    echo "  ✅ vault-user exists at $VAULT_USER"
  fi

  # vault-shared
  if [ ! -d "$VAULT_SHARED" ]; then
    echo "  🔧 Creating vault-shared..."
    mkdir -p "$VAULT_SHARED"
    cd "$VAULT_SHARED"
    git init
    mkdir -p '@public' '@sigs/ai-research' '@sigs/indie-dev' '@sigs/knowledge-graph' '@collab' orbs
    cat > README.md <<- 'EOF'
# vault-shared

Shared knowledge vault. Middle layer in the uDOS union filesystem.

## Structure
- `@public/` — Web-publish zone
- `@sigs/` — Special Interest Groups
- `@collab/` — Active collaborations
- `orbs/` — Shared knowledge orbs
EOF
    git add -A
    git commit -m "init: vault-shared"
    echo "  ✅ vault-shared initialized at $VAULT_SHARED"
  else
    echo "  ✅ vault-shared exists at $VAULT_SHARED"
  fi

  # vault-global
  if [ ! -d "$VAULT_GLOBAL" ]; then
    echo "  🔧 Creating vault-global..."
    mkdir -p "$VAULT_GLOBAL"
    cd "$VAULT_GLOBAL"
    git init
    mkdir -p categories schemas orbs
    cat > README.md <<- 'EOF'
# vault-global

Global knowledge vault. Base layer in the uDOS union filesystem (read-only).

## Structure
- `categories/` — Global Knowledge Categories
- `schemas/` — Orb and metadata schemas
- `orbs/` — Global topic orbs
EOF
    git add -A
    git commit -m "init: vault-global"
    echo "  ✅ vault-global initialized at $VAULT_GLOBAL"
  else
    echo "  ✅ vault-global exists at $VAULT_GLOBAL"
  fi

  # Union cache
  mkdir -p "$UNION_CACHE/overlay" "$UNION_CACHE/whiteouts"

  echo ""
  echo "  ℹ️  To connect to remote repos:"
  echo "     git remote add origin git@github.com:fredporter/vault-user.git"
  echo "     git remote add origin git@github.com:fredporter/vault-shared.git"
  echo "     git remote add origin git@github.com:uDosGo/vault-global.git"
  echo ""
}

# ─── Software union (fallback when unionfs not available) ───────
software_union() {
  echo "  🔗 Using software union (symlink-based)..."
  echo ""

  mkdir -p "$VAULT_DIR"

  # Link global (base) first
  if [ -d "$VAULT_GLOBAL" ]; then
    echo "  📎 Linking vault-global..."
    for item in "$VAULT_GLOBAL"/*; do
      name=$(basename "$item")
      target="$VAULT_DIR/$name"
      if [ ! -e "$target" ]; then
        ln -s "$item" "$target" 2>/dev/null || true
      fi
    done
  fi

  # Link shared (overlay)
  if [ -d "$VAULT_SHARED" ]; then
    echo "  📎 Linking vault-shared..."
    for item in "$VAULT_SHARED"/*; do
      name=$(basename "$item")
      target="$VAULT_DIR/$name"
      if [ ! -e "$target" ]; then
        ln -s "$item" "$target" 2>/dev/null || true
      fi
    done
  fi

  # Link user (top overlay)
  if [ -d "$VAULT_USER" ]; then
    echo "  📎 Linking vault-user..."
    for item in "$VAULT_USER"/*; do
      name=$(basename "$item")
      target="$VAULT_DIR/$name"
      # Remove existing symlink from lower layer
      if [ -L "$target" ]; then
        rm "$target"
      fi
      ln -s "$item" "$target" 2>/dev/null || true
    done
  fi

  echo ""
  echo "  ✅ Software union mounted at $VAULT_DIR"
  echo "  ⚠️  Note: This is a simple symlink union."
  echo "     For full unionfs features, install unionfs-fuse."
}

# ─── Mount union filesystem ─────────────────────────────────────
mount_union() {
  echo "  🔍 Checking vault directories..."
  echo ""

  for dir in "$VAULT_USER" "$VAULT_SHARED" "$VAULT_GLOBAL"; do
    if [ -d "$dir" ]; then
      echo "  ✅ $(basename $dir) found"
    else
      echo "  ⚠️  $(basename $dir) not found. Run --init first."
      return 1
    fi
  done

  mkdir -p "$VAULT_DIR"

  # Check if already mounted
  if mount | grep -q "$VAULT_DIR"; then
    echo "  ℹ️  Already mounted at $VAULT_DIR"
    return 0
  fi

  if check_prereqs; then
    echo ""
    echo "  🚀 Mounting union filesystem..."
    echo "     Layers (lowest → highest):"
    echo "       $VAULT_GLOBAL (ro)"
    echo "       $VAULT_SHARED (rw)"
    echo "       $VAULT_USER (rw)"
    echo ""

    # Mount using unionfs-fuse
    unionfs \
      -o cow \
      -o allow_other \
      "$VAULT_GLOBAL=ro:$VAULT_SHARED=rw:$VAULT_USER=rw" \
      "$VAULT_DIR"

    echo "  ✅ Union mounted at $VAULT_DIR"
  else
    software_union
  fi
}

# ─── Check mount status ─────────────────────────────────────────
check_status() {
  echo "  🔍 Checking vault union status..."
  echo ""

  for dir in "$VAULT_USER" "$VAULT_SHARED" "$VAULT_GLOBAL"; do
    if [ -d "$dir" ]; then
      echo "  ✅ $(basename $dir): exists"
      if [ -d "$dir/.git" ]; then
        echo "     Git repo: $(cd "$dir" && git remote get-url origin 2>/dev/null || echo 'no remote')"
        echo "     Branch:   $(cd "$dir" && git branch --show-current 2>/dev/null || echo 'unknown')"
      fi
    else
      echo "  ⚠️  $(basename $dir): not found"
    fi
  done

  echo ""
  if [ -d "$VAULT_DIR" ]; then
    if mount | grep -q "$VAULT_DIR"; then
      echo "  🟢 Union mounted at $VAULT_DIR"
    else
      echo "  🟡 Software union at $VAULT_DIR"
    fi
    echo "  Contents: $(ls -1 "$VAULT_DIR" 2>/dev/null | wc -l) items"
  else
    echo "  🔴 Not mounted"
  fi
  echo ""
}

# ─── Unmount ────────────────────────────────────────────────────
unmount_union() {
  echo "  ⏹  Unmounting..."
  echo ""

  if mount | grep -q "$VAULT_DIR"; then
    umount "$VAULT_DIR" 2>/dev/null || fusermount -u "$VAULT_DIR" 2>/dev/null || true
    echo "  ✅ Union unmounted"
  else
    echo "  ℹ️  Not mounted via unionfs"
  fi

  # Clean up symlinks if software union was used
  if [ -d "$VAULT_DIR" ]; then
    find "$VAULT_DIR" -type l -delete 2>/dev/null || true
    echo "  ✅ Symlinks cleaned"
  fi
}

# ─── Main ───────────────────────────────────────────────────────
case "${1:-mount}" in
  mount|--mount)
    mount_union
    ;;
  --open)
    mount_union
    echo ""
    echo "  🚀 Opening in Obsidian..."
    open -a Obsidian "$VAULT_DIR" 2>/dev/null || echo "  ⚠️  Obsidian not found, open $VAULT_DIR manually"
    echo ""
    ;;
  --status)
    check_status
    ;;
  --umount|--unmount)
    unmount_union
    ;;
  --init)
    init_vaults
    ;;
  *)
    echo "  Usage: bash scripts/vault-union-mount.sh [option]"
    echo ""
    echo "  Options:"
    echo "    mount       Mount union at ~/Vault/ (default)"
    echo "    --open      Mount & open in Obsidian"
    echo "    --status    Check mount status"
    echo "    --umount    Unmount"
    echo "    --init      Initialize vault repos"
    echo ""
    ;;
esac
