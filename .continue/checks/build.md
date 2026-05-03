---
name: Build Verification
description: Ensure all components build successfully
type: check
---

## Python Package

```bash
cd uCode1 && python -m build --wheel
```

## Rust Workspace

```bash
cd uCode2 && cargo build --workspace --verbose
```

## ThinUI Shell

```bash
cd uCode2/ThinUI && npm ci && npm run build
```
