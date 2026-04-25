# ThinUI Plugin Promotion Workflow

## Overview

ThinUI provides a safe, staged pipeline for developing and distributing plugins, extensions, and themes. This document describes the 4-stage promotion workflow, directory structure, and integration points.

## Directory Layout

All paths are relative to `~/Code/uDosGo/`:

| Path | Stage | Description |
|------|-------|-------------|
| `Toybox/` | 0 – Experimental | Unstable, personal, no guarantees. Breakage expected. |
| `Sandbox/` | 1 – Testing | Must have tests & manifest; isolated from production. |
| `Launch/` | 2 – Release Candidate | Signed, documented, beta-ready. API frozen. |
| `Deploy/` | 3 – Production | Stable, backward compatible. Official releases. |
| `Vendor/` | External sources | Contains `.legacy/` with pristine vendor clones. |
| `.compost/` | Trash | Deleted files, TTL 30 days. Auto-cleaned weekly. |
| `.state/` | Working files | Autosaves, caches, temp configs. Not versioned. |

## Promotion Stages

### Stage 0: Toybox
- **Purpose**: Experimental development
- **Requirements**: None
- **Access**: Developer-only
- **Testing**: Optional
- **Manifest**: Optional

### Stage 1: Sandbox
- **Purpose**: Integration testing
- **Requirements**: 
  - Valid manifest (`manifest.json` or `manifest.yaml`)
  - Passing tests
  - Documentation
- **Access**: Team-only
- **Testing**: Required
- **Manifest**: Required

### Stage 2: Launch
- **Purpose**: Release candidate
- **Requirements**:
  - All Sandbox requirements
  - Code signing
  - API documentation
  - Changelog
- **Access**: Beta testers
- **Testing**: Automated + manual
- **Manifest**: Required with version

### Stage 3: Deploy
- **Purpose**: Production release
- **Requirements**:
  - All Launch requirements
  - Backward compatibility
  - Security audit
  - Performance benchmarks
- **Access**: Public
- **Testing**: Full regression suite
- **Manifest**: Required with version + signature

## State Database

The promotion system uses a SQLite database at `~/.udos/state.db`:

```sql
CREATE TABLE plugins (
    id TEXT PRIMARY KEY,
    name TEXT,
    stage TEXT CHECK(stage IN ('Toybox','Sandbox','Launch','Deploy')),
    version TEXT,
    manifest TEXT,
    promoted_at DATETIME
);

CREATE TABLE hidden_folders (
    path TEXT PRIMARY KEY,
    type TEXT CHECK(type IN ('compost','state','legacy')),
    size_bytes INTEGER,
    last_accessed DATETIME,
    ttl_days INTEGER
);

CREATE TABLE promotion_history (
    plugin_id TEXT,
    from_stage TEXT,
    to_stage TEXT,
    promoted_by TEXT,
    timestamp DATETIME
);
```

## Promotion Script

Use the `promote-plugin.sh` script to move plugins between stages:

```bash
# Promote from Toybox to Sandbox
./promote-plugin.sh my-plugin --from Toybox --to Sandbox

# Promote from Sandbox to Launch
./promote-plugin.sh my-plugin --from Sandbox --to Launch

# Promote from Launch to Deploy
./promote-plugin.sh my-plugin --from Launch --to Deploy
```

The script:
1. Validates source and destination stages
2. Runs health checks
3. Copies plugin files
4. Updates the state database
5. Records promotion history

## Health Checks

Run health checks manually:

```bash
# Check specific plugin
./health-check.sh --plugin my-plugin --stage Sandbox --verbose

# General system check
./health-check.sh --verbose
```

Checks include:
- Plugin directory exists
- Manifest file present
- Tests exist (for Sandbox+)
- Directory structure valid

## Compost Management

The `.compost/` directory stores deleted files with a 30-day TTL:

```bash
# Clean files older than 30 days (default)
./clean-compost.sh

# Clean files older than 7 days
./clean-compost.sh --older-than 7

# Dry run (show what would be deleted)
./clean-compost.sh --dry-run --verbose
```

## Integration Points

### ThinUI Core
ThinUI loads plugins in this order:
1. `Deploy/` (production)
2. `Launch/` (release candidates)
3. `Sandbox/` (only if `--dev` flag is set)

### SonicScrewdriver
The health check system integrates with SonicScrewdriver:
- `health-check.sh` runs daily via cron
- `clean-compost.sh` runs weekly
- Results logged to `~/.udos/health.log`

### uCode1
Plugins can declare:
- Grid renderers
- Font providers
- ThinUI widgets
- Custom components

## Usage Examples

### Add a Vendor Repository

```bash
# Clone a vendor repository into Vendor/.legacy
uvendor add https://github.com/example/theme.git --as mytheme
```

### Promote a Plugin

```bash
# Develop in Toybox
cd ~/Code/uDosGo/Toybox
mkdir my-plugin
cd my-plugin
echo '{"name":"my-plugin","version":"0.1.0"}' > manifest.json

# Promote to Sandbox
cd ~/Code/uDosGo
./promote-plugin.sh my-plugin --from Toybox --to Sandbox

# Add tests
cd Sandbox/my-plugin
mkdir tests
echo "console.log('test');" > tests/test.js

# Promote to Launch
cd ~/Code/uDosGo
./promote-plugin.sh my-plugin --from Sandbox --to Launch

# Promote to Deploy
./promote-plugin.sh my-plugin --from Launch --to Deploy
```

### Run Health Checks

```bash
# Check all plugins in Sandbox
for plugin in Sandbox/*; do
    ./health-check.sh --plugin "$(basename "$plugin")" --stage Sandbox
 done
```

### Clean Compost

```bash
# Dry run first
./clean-compost.sh --dry-run --verbose

# Actual cleanup
./clean-compost.sh --older-than 30
```

## Best Practices

1. **Start in Toybox**: All development begins in Toybox
2. **Test in Sandbox**: Ensure plugins work in isolation
3. **Document in Launch**: Add comprehensive documentation
4. **Sign in Deploy**: Only signed plugins reach production
5. **Clean regularly**: Run compost cleanup weekly
6. **Monitor health**: Run health checks daily
7. **Version everything**: Use semantic versioning
8. **Document changes**: Maintain changelogs

## Troubleshooting

### Plugin not loading
- Check plugin is in correct stage directory
- Verify manifest file exists and is valid
- Ensure ThinUI is running with appropriate flags (`--dev` for Sandbox)

### Promotion fails
- Check source directory exists
- Verify destination doesn't already exist
- Run health checks manually first
- Check state database permissions

### Health checks fail
- Ensure manifest file is present
- Add required tests for Sandbox+ stages
- Check directory structure matches expectations

## Future Enhancements

- Automatic promotion based on test results
- Web interface for promotion management
- Email notifications for promotion events
- Integration with CI/CD pipelines
- Plugin signing and verification
- Dependency management between plugins