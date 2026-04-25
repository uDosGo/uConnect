# uDos Scripts

This directory contains utility scripts for managing the uDos ecosystem.

## Available Scripts

### 1. `promote-plugin.sh`

**Purpose:** Promote plugins between development stages

**Usage:**
```bash
./promote-plugin.sh <plugin-id> --from <stage> --to <stage>
```

**Stages:** Toybox → Sandbox → Launch → Deploy

**Example:**
```bash
./promote-plugin.sh my-plugin --from Toybox --to Sandbox
```

**Features:**
- Validates source and destination stages
- Runs pre-promotion health checks
- Updates state database
- Records promotion history

### 2. `health-check.sh`

**Purpose:** Validate system and plugin health

**Usage:**
```bash
# Check specific plugin
./health-check.sh --plugin <id> --stage <stage> --verbose

# General system check
./health-check.sh --verbose
```

**Checks:**
- Plugin directory exists
- Manifest file present
- Tests exist (for Sandbox+ stages)
- Directory structure valid

### 3. `clean-compost.sh`

**Purpose:** Clean up old files from compost directory

**Usage:**
```bash
# Dry run (show what would be deleted)
./clean-compost.sh --dry-run --verbose

# Actual cleanup (default: 30 days)
./clean-compost.sh --older-than 30

# Custom cleanup
./clean-compost.sh --older-than 7 --verbose
```

**Features:**
- Respects TTL (Time-To-Live) settings
- Dry run mode for safety
- Verbose output for debugging
- Updates state database

### 4. `install-udos.sh`

**Purpose:** Install uDos components

**Usage:**
```bash
./install-udos.sh [component]

# Install all components
./install-udos.sh all

# Install specific component
./install-udos.sh uCode1
```

**Features:**
- Dependency checking
- Build from source
- Installation verification

### 5. `test-udos.sh`

**Purpose:** Run uDos test suite

**Usage:**
```bash
./test-udos.sh [component]

# Run all tests
./test-udos.sh all

# Run specific tests
./test-udos.sh uCode1
```

**Features:**
- Unit tests
- Integration tests
- Health checks
- Test reporting

## Script Conventions

### Exit Codes

- `0`: Success
- `1`: General error
- `2`: Invalid arguments
- `3`: Missing dependencies
- `4`: Permission denied

### Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `UDOS_DEV_MODE` | Enable development mode | `0` |
| `UDOS_VERBOSE` | Enable verbose output | `0` |
| `UDOS_DRY_RUN` | Dry run mode | `0` |

### Logging

All scripts log to:
- Console (stdout/stderr)
- Feed spool (`~/Code/Vault/.uds/state/feed_spool/replies.jsonl`)

## Development

### Creating New Scripts

1. **Location:** Place in `scripts/` directory
2. **Naming:** Use lowercase with hyphens (e.g., `my-script.sh`)
3. **Permissions:** Make executable (`chmod +x`)
4. **Documentation:** Add to this README

### Script Template

```bash
#!/bin/bash
# Script Name: description
# Usage: ./script-name.sh [options]

set -e

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case "$1" in
        --option) OPTION="$2"; shift ;;
        --verbose) VERBOSE=true ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
    shift
done

# Main logic here
echo "Script executed successfully"

# Log to feed spool
echo '{"type":"move","action":"script.name","result":"success"}' >> ~/Code/Vault/.uds/state/feed_spool/replies.jsonl
```

## Best Practices

1. **Idempotency:** Scripts should be safe to run multiple times
2. **Dry Run:** Support `--dry-run` for safety
3. **Verbose Mode:** Support `--verbose` for debugging
4. **Error Handling:** Provide clear error messages
5. **Logging:** Always log to feed spool

## Testing

### Test Scripts Individually

```bash
# Test promote-plugin.sh
./promote-plugin.sh test-plugin --from Toybox --to Sandbox --dry-run --verbose

# Test health-check.sh
./health-check.sh --verbose

# Test clean-compost.sh
./clean-compost.sh --dry-run --verbose
```

### Test in Development Mode

```bash
UDOS_DEV_MODE=1 ./promote-plugin.sh my-plugin --from Toybox --to Sandbox
```

## Troubleshooting

### Script Not Found

```bash
# Check script exists
ls -la scripts/

# Check permissions
chmod +x scripts/*.sh
```

### Permission Denied

```bash
# Check script permissions
chmod +x scripts/script-name.sh

# Run with sudo if needed
sudo ./scripts/script-name.sh
```

### Missing Dependencies

```bash
# Check script requirements
head -20 scripts/script-name.sh

# Install missing tools
brew install required-tool
```

## License

MIT License - See [LICENSE](../LICENSE) for details.