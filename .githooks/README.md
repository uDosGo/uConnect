# uDosGo Git Hooks

This directory contains the **pre-commit hook** system for uDosGo. It runs automated checks before each commit to catch issues early, mirroring the CI pipeline.

## Quick Start

```bash
# Install hooks (run once after cloning)
bash .githooks/setup.sh

# Or via Makefile
make hooks-install
```

## What Gets Checked

The hook automatically detects what files changed and runs only the relevant checks:

| Check | Trigger | Tool |
| :--- | :--- | :--- |
| **ruff** | `.py` files | Python linter |
| **mypy** | `.py` files in `uCode1/` | Python type checker |
| **pytest (quick)** | `.py` files in `uCode1/` | Python tests |
| **rustfmt** | `.rs` files | Rust formatter |
| **clippy** | `.rs` files | Rust linter |
| **cargo check** | `.rs` files | Rust compilation check |
| **ESLint** | `.js`, `.ts`, `.vue` files | JS/TS linter |
| **Protobuf lint** | `.proto` files | Protocol Buffers validator |
| **YAML lint** | `.yaml`, `.yml` files | YAML syntax validator |
| **ShellCheck** | `.sh`, `.bash` files | Shell script linter |
| **Markdown lint** | `.md` files | Markdown style checker |
| **Dockerfile lint** | `Dockerfile` | Dockerfile validator |
| **JSON validation** | `.json` files | JSON syntax checker |
| **TOML validation** | `.toml` files | TOML syntax checker |
| **Conflict markers** | All files | Unresolved merge conflict detection |
| **Large files** | All files | Files >5MB warning |
| **Private keys** | All files | Accidental secret/key detection |

## Skipping Checks

In emergencies, you can skip the pre-commit hook:

```bash
# Skip all checks
git commit --no-verify

# Skip specific checks
SKIP=ruff,rust git commit
SKIP=eslint,markdown-lint git commit
```

## Architecture

```
.githooks/
├── pre-commit          # Main hook script (entry point)
├── setup.sh            # Installation/verification script
├── README.md           # This file
├── lib/
│   └── shared.sh       # Shared helper functions (colors, logging, etc.)
└── checks/
    ├── ruff.sh         # Python linting
    ├── mypy.sh         # Python type checking
    ├── pytest-quick.sh # Python tests
    ├── rustfmt.sh      # Rust formatting
    ├── clippy.sh       # Rust linting
    ├── cargo-check.sh  # Rust compilation check
    ├── eslint.sh       # JS/TS linting
    ├── protolint.sh    # Protobuf validation
    ├── yaml-lint.sh    # YAML validation
    ├── shellcheck.sh   # Shell script validation
    ├── markdown-lint.sh# Markdown validation
    ├── docker-lint.sh  # Dockerfile validation
    ├── json-lint.sh    # JSON validation
    ├── toml-lint.sh    # TOML validation
    ├── conflict-markers.sh  # Merge conflict detection
    ├── large-files.sh  # Large file detection
    └── private-keys.sh # Secret/key detection
```

## Adding New Checks

1. Create a new script in `.githooks/checks/`
2. Make it executable: `chmod +x .githooks/checks/my-check.sh`
3. The script should:
   - Exit 0 on success
   - Exit non-zero on failure
   - Print relevant output to stdout/stderr
4. Add it to `.githooks/pre-commit` in the appropriate section

## CI Integration

These checks mirror the CI pipeline defined in `.github/workflows/ci.yml`. The pre-commit hook runs a subset locally; CI runs the full suite.

## Requirements

Most checks gracefully degrade if the required tool isn't installed. For full coverage:

```bash
# Python
pip install ruff mypy pytest

# Rust (via rustup)
rustup component add rustfmt clippy

# Node.js
npm install

# Other (optional)
brew install shellcheck yamllint hadolint taplo
```
