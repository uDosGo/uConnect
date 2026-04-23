# uDev Ecosystem Development Record

## Code-Vault Architecture

This document describes the development environment structure for the uDev ecosystem.

### Directory Structure

```
code-vault/ (local vault, NOT a git repo)
├── @inbox/              # Incoming briefs and requirements
├── @outbox/             # Outgoing summaries, reports, and deliverables
├── udevframework/       # Core framework (git repo)
├── sonic-screwdriver/   # API Central Hub (git repo)
├── uDosConnect/         # Connectivity layer (git repo)
├── uHomeNest/           # Home automation layer (git repo)
└── *.sh                 # Setup and utility scripts
```

## Repositories

### 1. udevframework
- **Purpose**: Core framework and shared utilities
- **Git**: Yes (main branch)
- **Dev Record**: This file

### 2. sonic-screwdriver
- **Purpose**: API Central Hub with secret management, proxy, and integrations
- **Git**: Yes (main branch)
- **Current Version**: v2.1.0 (with Home Assistant integration)

### 3. uDosConnect
- **Purpose**: Connectivity layer and remote access
- **Git**: Yes (main branch)

### 4. uHomeNest
- **Purpose**: Home automation and launcher surface
- **Git**: Yes (main branch)

## Development Workflow

### Incoming Work
1. New briefs and requirements go into `@inbox/`
2. Process briefs and create implementation plans
3. Implement changes in respective repositories

### Outgoing Work
1. Commit changes to individual repos
2. Push changes to origin
3. Create summaries and reports in `@outbox/`
4. Update this dev record as needed

## Setup Instructions for New Machines

To replicate this development environment:

```bash
# Clone the main repositories
mkdir -p code-vault
cd code-vault

# Clone repositories
git clone https://github.com/fredporter/udevframework.git
git clone https://github.com/fredporter/sonic-screwdriver.git
git clone https://github.com/fredporter/uDosConnect.git
git clone https://github.com/fredporter/uHomeNest.git

# Create special directories
mkdir -p @inbox @outbox

# Copy setup scripts (from existing environment)
# cp /path/to/setup-scripts/*.sh .

# Initialize submodules if any
cd udevframework && git submodule update --init --recursive
cd ../sonic-screwdriver && git submodule update --init --recursive
cd ../uDosConnect && git submodule update --init --recursive
cd ../uHomeNest && git submodule update --init --recursive
```

## Current Development Status

### Sprint v2.1.0 (In Progress)
- **Start Date**: 2026-04-29
- **End Date**: 2026-05-05
- **Focus**: Home Assistant integration, Media Player, Feeds/Spool system

### Completed Work (Week 1: 2026-04-22 to 2026-04-28)
- Home Assistant kiosk/guest mode research
- Media catalog data model design
- Feed/spool format specification
- Secret rotation with history tracking
- All Week 1 tasks completed 1 day ahead of schedule

### Current Work (Week 2)
- ✅ Home Assistant iframe embed implementation
- ✅ CLI commands for HA integration
- ✅ Kiosk mode with auto-refresh
- ✅ API connectivity testing
- Next: Media scanner implementation
- Next: Feed parser implementation

## Version Information

| Repository | Current Version | Git Branch |
|------------|-----------------|------------|
| udevframework | v1.0.0 | main |
| sonic-screwdriver | v2.1.0 | main |
| uDosConnect | v1.2.0 | main |
| uHomeNest | v1.1.0 | main |

## Special Directories

### @inbox/
- Purpose: Receive new briefs, requirements, and feature requests
- Processing: Review weekly, prioritize, assign to sprint backlog
- Current contents: See `@inbox/` directory

### @outbox/
- Purpose: Store completed work summaries, reports, and deliverables
- Processing: Archive monthly, keep current sprint deliverables accessible
- Current contents: See `@outbox/` directory

## Maintenance Tasks

1. **Weekly**: Review `@inbox/` for new briefs
2. **Daily**: Update this dev record with progress
3. **Sprint End**: Archive completed work to `@outbox/`
4. **Monthly**: Clean up old archives and backups

## Troubleshooting

### Common Issues

1. **Missing dependencies**: Run setup scripts in order
2. **Permission issues**: Ensure proper ownership of code-vault directory
3. **Git conflicts**: Follow standard git conflict resolution procedures

### Contact

For issues with this setup, contact the development team or refer to individual repository documentation.

## Last Updated

2026-04-29 - Initial ecosystem dev record created
2026-04-29 - Added Home Assistant integration details
2026-04-29 - Updated version information