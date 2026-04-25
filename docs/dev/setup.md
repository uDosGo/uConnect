# Development Setup Guide

## Prerequisites

### Required Software
- **Rust**: 1.70+ (install via [rustup](https://rustup.rs/))
- **Node.js**: 18+ (LTS recommended)
- **SQLite**: 3+ (usually pre-installed)
- **Git**: 2.30+
- **Tauri**: Will be installed automatically

### Recommended Tools
- **VS Code** with Rust Analyzer extension
- **Docker** for containerized testing
- **GitHub CLI** for repository management

## Installation

### 1. Clone the Home Repository

```bash
git clone --recursive git@github.com:uDosGo/home-repo.git ~/Code/uDosGo
cd ~/Code/uDosGo
```

### 2. Install Dependencies

```bash
# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Node.js (using nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
nvm install --lts

# Tauri prerequisites (macOS)
brew install cmake pkg-config openssl
```

### 3. Build the System

```bash
make build
```

This will:
- Build uCode1 (Rust)
- Build ThinUI (Tauri + React)

### 4. Verify Installation

```bash
make doctor
```

Should show all health checks passing.

## Development Workflow

### Starting Services

```bash
# Start core daemon
make core

# In another terminal, start ThinUI
make thinui

# Or start everything together
make dev
```

### Development Mode

Always use `--dev` flag when testing:

```bash
udos --dev note create test.md
```

This isolates:
- Logs to `~/.uds/dev/`
- State from production
- Safe experimentation

### Testing Changes

```bash
# Run health checks
make doctor

# Clean build artifacts
make clean

# Rebuild
make build
```

## Directory Structure

```
~/Code/uDosGo/
├── uCode1/          # Core CLI (Rust)
├── ThinUI/          # Dashboard (Tauri + React)
├── docs/            # Documentation
├── scripts/         # Utility scripts
├── .compost/        # Deleted files (30d TTL)
├── .state/          # Working files
└── Vendor/          # External dependencies
```

## Common Tasks

### Create a Plugin

```bash
# Develop in Toybox
cd ~/Code/uDosGo/Toybox
mkdir my-plugin
cd my-plugin
echo '{"name":"my-plugin","version":"0.1.0"}' > manifest.json

# Promote to Sandbox
cd ~/Code/uDosGo
./promote-plugin.sh my-plugin --from Toybox --to Sandbox
```

### Run Health Checks

```bash
# Check specific plugin
./health-check.sh --plugin my-plugin --stage Sandbox --verbose

# General system check
./health-check.sh --verbose
```

### Clean Compost

```bash
# Dry run first
./clean-compost.sh --dry-run --verbose

# Actual cleanup
./clean-compost.sh --older-than 30
```

## Debugging

### Logs

```bash
# Development logs
cat ~/.uds/dev/*.log

# Production logs
cat ~/.uds/*.log

# Feed spool (all events)
tail -f ~/Code/Vault/.uds/state/feed_spool/replies.jsonl
```

### Common Issues

**Issue: MCP server not responding**
```bash
# Check if daemon is running
udos daemon status

# Start if not running
udos daemon start

# Test connection
echo '{"Ping": null}' | nc -U ~/.uds/mcp.sock
```

**Issue: Plugin not loading**
```bash
# Check plugin stage
ls ~/Code/uDosGo/Deploy/  # Production
ls ~/Code/uDosGo/Launch/   # Release candidates

# Verify manifest
cat ~/Code/uDosGo/Deploy/my-plugin/manifest.json
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `UDOS_DEV_MODE` | Enable development mode |
| `UDOS_VAULT_PATH` | Custom vault location |
| `UDOS_LOG_LEVEL` | Set log level (debug, info, warn, error) |

Example:
```bash
UDOS_DEV_MODE=1 UDOS_LOG_LEVEL=debug udos note create test.md
```

## Updating

```bash
# Update all submodules
git pull --recurse-submodules
git submodule update --remote --recursive

# Rebuild
make build
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## Troubleshooting

### Build Failures

```bash
# Clean and rebuild
make clean
make build

# Check Rust version
rustc --version

# Update Rust
rustup update
```

### Permission Issues

```bash
# Fix socket permissions
chmod 777 ~/.uds/mcp.sock

# Fix directory permissions
chmod -R 755 ~/Code/Vault
```

## Support

- **GitHub Issues**: Report bugs in the appropriate repository
- **Documentation**: Check `docs/` directory
- **Community**: Join our Discord (link in README)

## License

MIT License - See [LICENSE](../LICENSE) for details.