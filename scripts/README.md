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

### 6. `bootstrap-family-python.sh`

**Purpose:** Shared bash helpers for Python env bootstrap, multi-repo checks, and `~/.udos` path conventions used across the family workspace.

**Usage:**
```bash
./scripts/bootstrap-family-python.sh
```

### 7. `validate-courses.sh`

**Purpose:** Ensures each `courses/[0-9][0-9]-*/` folder has a `README.md`.

**Usage:**
```bash
./scripts/validate-courses.sh
```

### 8. `check-workspace-drift.sh`

**Purpose:** Verifies npm workspace resolution and validates `uDos.code-workspace` required folders and path sanity (no machine-specific absolute paths).

**Usage:**
```bash
./scripts/check-workspace-drift.sh
```

### 9. `bootstrap-markdownify-runtime.sh`

**Purpose:** Creates `vendor/markdownify-mcp/.venv` with a pinned upstream MarkItDown build (`Python >=3.10`, prefers `python3.11`) and verifies CLI availability.

**Usage:**
```bash
./scripts/bootstrap-markdownify-runtime.sh
```

### 10. `check-mcp-stdio.sh`

**Purpose:** Starts local `udo mcp start`, runs framed MCP handshake (`initialize`, `tools/list`, `tools/call markdownify.status`), and fails fast if protocol wiring is broken.

**Usage:**
```bash
./scripts/check-mcp-stdio.sh
```

### 11. `check-usxd-go-scaffold.sh`

**Purpose:** Runs `modules/usxd-go` tests, boots `usxd-server`, and verifies `/healthz` + `/api/usxd/state` payload shape.

**Usage:**
```bash
./scripts/check-usxd-go-scaffold.sh
```

### 12. `check-usxd-story.sh`

**Purpose:** Runs `modules/usxd-go/story` tests, executes `examples/story-onboarding`, and validates serialized `application/vnd.usxd.story` envelope/version.

**Usage:**
```bash
./scripts/check-usxd-story.sh
```

### 13. `check-uos.sh`

**Purpose:** Runs `modules/uos` tests and validates `uos launch ... --dry-run` output markers for runtime selection, GPU profile wiring, and passthrough expansion.

**Usage:**
```bash
./scripts/check-uos.sh
```

### 14. `shakedown.sh`

**Purpose:** `dev/TASKS.md`, v4 spec index, course validation, `check-tasks-md.sh` (sparse clones skip absent sibling repos). Optional: `UDOS_SHAKEDOWN_FULL=1` runs `v4-dev/family-health-check.sh` (USXD surfaces when present).

**Usage:**
```bash
./scripts/shakedown.sh
```

### 15. `imported/2026-04-15-uDosDocs/`

**Purpose:** Upstream `run-docs-checks.sh`; merge or wire cautiously (paths assume a full uDosDocs tree).

**Usage:**
```bash
./scripts/imported/2026-04-15-uDosDocs/README.md
```

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
- Feed spool (`~/Code/Vault/.local/state/feed_spool/replies.jsonl`)

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
echo '{"type":"move","action":"script.name","result":"success"}' >> ~/Code/Vault/.local/state/feed_spool/replies.jsonl
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