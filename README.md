# uDosGo/Connect Repository

**Version:** v1.1.1  
**Status:** Active development

This is the **repository folder** for the `udos` system. It is a **Git repository** and contains version-controlled project files.

## Purpose
- **Version Control**: All files in this folder are tracked by Git and synced with the remote repository.
- **Development**: Contains the main project codebase, documentation, and modules.
- **Collaboration**: Intended for team collaboration and contributions.

## Key Directories
- `docs/` — Project documentation (synced to `~Vault/docs/uDosGo/Connect`)
- `core/` — Core system modules
- `ui/` — User interface components
- `tools/` — Development tools and utilities
- `scripts/` — Utility scripts
- `templates/` — Project templates
- `.archive/` — Archived legacy directories (gitignored)

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test
```

## Structure

| Directory | Purpose | Status |
|-----------|---------|--------|
| `core/` | Core system modules | 🟢 Active |
| `ui/` | User interface components | 🟢 Active |
| `tools/` | Development tools | 🟢 Active |
| `docs/` | Documentation | 🟢 Active |
| `.archive/` | Archived legacy directories | 📦 Archive |

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Architecture overview
- [`docs/roadmap.md`](docs/roadmap.md) — Development roadmap
- [`docs/specs/`](docs/specs/) — Format specifications

## Related Repositories

- **SonicScrewdriver** (`~/Code/SonicScrewdriver`) — TARDIS Console: API Central Hub for smart home automation, secrets management, and container orchestration
- **DevStudio** (`~/Code/DevStudio`) — Development environment configuration and tooling
- **Vault** (`~/Code/Vault`) — Secure storage for notes, maps, feeds, and configuration

## Example Commands
- Pull the latest changes:
  ```bash
  git pull
  ```
- Commit and push changes:
  ```bash
  git add .
  git commit -m "Your commit message"
  git push
  ```
- Sync `docs/` to `Vault`:
  ```bash
  cp -r docs/* ~/Vault/docs/uDosGo/Connect/
  ```
