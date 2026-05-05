# `sonic-express`

TypeScript/Node tool for **Sonic** packaging, distribution metadata, and **uCode1/uCode2 ecosystem setup**. **Spawned or invoked** by `@udos/core` where needed.

## Commands

| Command | Description |
| :--- | :--- |
| `install` | Install / refresh uDos core and link `udo` globally |
| `update` | Pull latest (if git), rebuild core, relink `udo` |
| `start` | Start uDos services |
| `stop` | Stop uDos services |
| `restart` | Restart uDos services |
| `health` | Check system health and status |
| `self-heal` | Automatically detect and fix issues |
| `cleanup` | Clean up temporary files and cache |
| `doctor` | Run comprehensive system diagnostics |
| `python-deps` | Install Python dependencies required by uCode1 (e.g. `liquidpy`) |
| `python-deps --check` | Check which Python packages are missing without installing |
| `ucode1` | Set up uCode1 (Python dependencies + package install) |
| `ucode1 --python-only` | Only install Python dependencies, skip package install |
| `ucode1 --check` | Only check what's missing, don't install |
| `ucode2` | Set up uCode2 (Rust build + ThinUI frontend) |
| `ucode2 --dev` | Build in debug mode (faster for development) |
| `ucode2 --rust-only` | Only build Rust workspace, skip ThinUI |
| `ucode2 --thinui-only` | Only build ThinUI frontend, skip Rust |
| `ucode2 --tauri` | Also build ThinUI Tauri desktop app |
| `setup-all` | Set up entire uCode ecosystem (uCode1 + uCode2) |
| `setup-all --dev` | Build uCode2 in debug mode |
| `setup-all --tauri` | Also build ThinUI Tauri desktop app |

## Python Dependency Management (uCode1)

uCode1 requires several Python packages for its runtime. The `python-deps` command:

1. Detects `pip3` or `pip` on the system
2. Checks if each required package is already installed
3. Installs any missing packages via `pip install`

```bash
# Install all Python deps
sonic-express python-deps

# Check what's missing
sonic-express python-deps --check
```

### Required Python Packages

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `pyyaml` | >=6.0 | YAML parsing for snack manifests |
| `liquidpy` | >=0.9 | Liquid template engine |
| `click` | >=8.0.0 | CLI framework |
| `pygments` | >=2.0.0 | Syntax highlighting |
| `rich` | >=10.0.0 | Terminal formatting |
| `pytest` | >=8.0 | Testing framework |
| `pytest-cov` | >=4.0 | Test coverage |
| `ruff` | >=0.3 | Python linter |
| `mypy` | >=1.8 | Type checking |
| `flask` | >=3.0 | Web server |

## uCode1 Setup

Sets up the uCode1 lane (BBC BASIC + teletext runtime):

```bash
# Full setup (Python deps + package install)
sonic-express ucode1

# Python dependencies only
sonic-express ucode1 --python-only

# Check what's missing
sonic-express ucode1 --check
```

## uCode2 Setup

Sets up the uCode2 lane (Rust workspace + ThinUI frontend):

```bash
# Full setup (Rust release build + ThinUI)
sonic-express ucode2

# Debug build (faster for development)
sonic-express ucode2 --dev

# Rust workspace only
sonic-express ucode2 --rust-only

# ThinUI frontend only
sonic-express ucode2 --thinui-only

# Include Tauri desktop app build
sonic-express ucode2 --tauri
```

## Full Ecosystem Setup

Sets up both uCode1 and uCode2 in sequence:

```bash
# Full setup
sonic-express setup-all

# With debug build for uCode2
sonic-express setup-all --dev

# With Tauri desktop app
sonic-express setup-all --tauri
```

## Related

Family specs under `uDosDev/docs/specs/v4/` (Sonic, Ventoy, USXD). Historical UI code may live under other repos' `distro/` trees until migrated.
