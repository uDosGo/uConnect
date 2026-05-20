#!/bin/bash
# promote-to-registry.sh - Promote a module from Sandbox to Registry

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <module-name> <version>"
    exit 1
fi

MODULE_NAME=$1
VERSION=$2
SANDBOX_DIR="~/Code/uDosGo/uCode1/Sandbox/$MODULE_NAME"
REGISTRY_DIR="~/Code/uDosGo/Registry/$MODULE_NAME"

if [ ! -d "$SANDBOX_DIR" ]; then
    echo "Error: Module $MODULE_NAME not found in Sandbox"
    exit 1
fi

# Create registry directory
mkdir -p "$REGISTRY_DIR"

# Copy module to registry
cp -r "$SANDBOX_DIR" "$REGISTRY_DIR/$VERSION"

# Update version in Cargo.toml
sed -i '' "s/version = \"0.1.0\"/version = \"$VERSION\"/" "$REGISTRY_DIR/$VERSION/Cargo.toml"

# Create registry manifest entry
REGISTRY_MANIFEST="~/Code/uDosGo/Registry/manifest.yaml"
mkdir -p "$(dirname "$REGISTRY_MANIFEST")"

if [ ! -f "$REGISTRY_MANIFEST" ]; then
    cat > "$REGISTRY_MANIFEST" << 'EOF'
modules:
EOF
fi

# Add module to registry manifest
echo "  - name: $MODULE_NAME" >> "$REGISTRY_MANIFEST"
echo "    version: $VERSION" >> "$REGISTRY_MANIFEST"
echo "    path: $MODULE_NAME/$VERSION" >> "$REGISTRY_MANIFEST"

echo "Promoted $MODULE_NAME v$VERSION to Registry"