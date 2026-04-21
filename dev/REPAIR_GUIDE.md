# Dev Template Repair Guide

## Overview

This guide provides procedures for repairing or restoring the `.dev/` folder in any repository that uses the dev template.

## Repair Procedures

### 1. DESTROY/REPAIR for a Single Repo

#### Backup Current State

```bash
cd /path/to/repo
compost add .dev --message "pre-repair backup $(date +%Y%m%d-%H%M%S)"
```

#### Fresh Replace

```bash
# Remove existing .dev/
rm -rf .dev

# Copy fresh template
cp -r ~/code-vault/Dev/template/.dev .

# Restore critical files from compost if needed
compost restore --path .dev/tasks/backlog.md --from pre-repair-backup
```

#### Alternative: Nest Old in .compost

```bash
# Move old .dev to compost
mv .dev .compost/dev-backup-$(date +%Y%m%d)

# Copy fresh template
cp -r ~/code-vault/Dev/template/.dev .

# Restore specific files if needed
cp -r .compost/dev-backup-$(date +%Y%m%d)/tasks/backlog.md .dev/tasks/
```

### 2. Cross-Repo Recovery

#### Backup from Another Repo

```bash
# Backup uDosConnect's .dev to compost
compost add ~/code-vault/uDosConnect/.dev --message "uDosConnect pre-refactor"
```

#### Restore to Any Repo

```bash
# Restore specific files from another repo's backup
compost restore --repo uDosConnect --path .dev/tasks/ --from pre-refactor
```

### 3. Partial Restoration

#### Restore Specific Files

```bash
# Restore only the config.yaml
compost restore --path .dev/config.yaml --from pre-repair-backup

# Restore entire tasks directory
compost restore --path .dev/tasks/ --from pre-repair-backup
```

### 4. Roadmap/Todos Recovery

#### Backup Roadmap

```bash
compost add .dev/roadmap --message "roadmap backup before changes"
```

#### Restore Roadmap

```bash
compost restore --path .dev/roadmap/ --from "roadmap backup before changes"
```

## Common Scenarios

### Scenario 1: Accidental Deletion

```bash
# If .dev/ was accidentally deleted
cd /path/to/repo

# Restore from compost
compost restore --path .dev/ --from "pre-repair backup"

# Or copy fresh template
cp -r ~/code-vault/Dev/template/.dev .
```

### Scenario 2: Configuration Corruption

```bash
# If config.yaml is corrupted
cd /path/to/repo

# Restore from compost
compost restore --path .dev/config.yaml --from "working backup"

# Or copy from template
cp ~/code-vault/Dev/template/.dev/config.yaml .dev/config.yaml
```

### Scenario 3: Merge Conflicts

```bash
# If there are merge conflicts in .dev/
cd /path/to/repo

# Backup current state
compost add .dev --message "conflict state backup"

# Get clean template
git checkout --theirs .dev/

# Reapply customizations from backup
compost restore --path .dev/config.yaml --from "conflict state backup"
```

## Best Practices

1. **Always backup before major changes**: Use `compost add .dev --message "description"`
2. **Use descriptive backup messages**: Include date and reason for backup
3. **Test restores**: Periodically test restoring from compost
4. **Document customizations**: Keep track of customizations to .dev/ files
5. **Update template regularly**: Keep the template in sync with best practices

## Compost Commands Reference

```bash
# Add to compost
compost add <path> --message "description"

# List backups
compost list

# Restore from compost
compost restore --path <path> --from <backup-name>

# Restore from specific repo
compost restore --repo <repo-name> --path <path> --from <backup-name>

# Show compost status
compost status
```

## Template Source

The source template is located at: `~/code-vault/Dev/template/`

To update the template:

```bash
# Make changes to the template
cd ~/code-vault/Dev/template/
# Edit files as needed

# Apply updated template to all repos
~/code-vault/apply_template.sh
```

## Sonic-Screwdriver Integration

After repair, ensure sonic-screwdriver can read the .dev/ configuration:

```bash
# Test version extraction
sonic build <repo-name> --version from-dev

# Verify configuration
sonic config <repo-name> --show-dev
```
