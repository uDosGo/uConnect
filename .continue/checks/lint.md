---
name: Lint & Format
description: Enforce code style with ruff (Python), clippy (Rust), and prettier (JS)
type: check
---

## Python (ruff)

```bash
cd uCode1 && python -m ruff check --ignore E501,F401 core_py/ narrator/ tests/ --no-cache
```

## Rust (clippy + fmt)

```bash
cd uCode2 && cargo clippy --workspace -- -D warnings
cd uCode2 && cargo fmt --all -- --check
```

## JavaScript (prettier)

```bash
cd uCode2/ThinUI && npx prettier --check .
```
