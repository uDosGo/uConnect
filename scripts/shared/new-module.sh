#!/bin/bash
# new-module.sh - Generate boilerplate for a new uCode1 module

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <module-name>"
    exit 1
fi

MODULE_NAME=$1
TARGET_DIR="~/Code/uDosGo/uCode1/Sandbox/$MODULE_NAME"

mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

# Create Cargo.toml
cat > Cargo.toml << 'EOF'
[package]
name = "ucode1-${MODULE_NAME}"
version = "0.1.0"
edition = "2024"

[dependencies]
ucode1-core = { path = "../../core" }
EOF

# Create src directory and lib.rs
mkdir -p src
cat > src/lib.rs << 'EOF'
// ${MODULE_NAME} module for uCode1
pub fn init() {
    println!("{} module initialized", env!("CARGO_PKG_NAME"));
}
EOF

# Create a basic README
cat > README.md << 'EOF'
# ${MODULE_NAME} Module

Part of uCode1 platform.

## Usage

Add to your Cargo.toml:
```toml
[dependencies]
ucode1-${MODULE_NAME} = { path = "../Sandbox/${MODULE_NAME}" }
```
EOF

echo "Created new module: $MODULE_NAME in $TARGET_DIR"