# uDos Navigation Guide

This guide explains the distinction between the **home folder** (`uDosGo`) and the **repository folder** (`uDosGo/Connect`) to avoid confusion.

## Key Distinctions

### 1. Home Folder (`uDosGo`)
- **Purpose**: Local configurations, user data, and extensions.
- **Git Tracking**: Not tracked (local-only).
- **Use Case**: Managing local installations, user settings, or extensions.
- **Example Commands**:
  ```bash
  cd uDosGo
  vibe  # Manage local modules or configurations
  sonic-express  # Install files locally
  ```

### 2. Repository Folder (`uDosGo/Connect`)
- **Purpose**: Version-controlled project files (e.g., documentation, modules, code).
- **Git Tracking**: Tracked (synced with remote repository).
- **Use Case**: Development, documentation, or modules that are part of the repository.
- **Example Commands**:
  ```bash
  cd uDosGo/Connect
  git pull  # Pull latest changes
  git add . && git commit -m "Your message" && git push  # Commit and push changes
  ```

## Best Practices

### For Development Work
- **Always start in `uDosGo/Connect`** to ensure your changes are version-controlled.
- Sync `Docs/` to `~Vault/docs/uDosGo/Connect` for centralized documentation:
  ```bash
  cp -r Docs/* ~/Vault/docs/uDosGo/Connect/
  ```

### For Local Management
- **Start in `uDosGo`** to manage local configurations or user data.
- Use `sonic-express` to install files locally in `uDosGo`.

## Directory Structure

### Home Folder (`uDosGo`)
- `Memory/`: Local-only data and state.
- `Users/`: User-specific configurations.
- `Vault/`: Synced with a private repository (`fredporter/Vault`).
- `Connect/`: Repository folder (version-controlled).

### Repository Folder (`uDosGo/Connect`)
- `Docs/`: Project documentation (synced to `~Vault/docs/uDosGo/Connect`).
- `Modules/`: Reusable modules for the `udos` system.
- `src/`: Source code for the project.
- `tests/`: Test files for the project.

## Quick Reference

| **Task**                     | **Start in**          | **Command**                          |
|------------------------------|-----------------------|--------------------------------------|
| Development work             | `uDosGo/Connect`      | `git pull`, `git commit`, `git push` |
| Local configurations         | `uDosGo`              | `vibe`, `sonic-express`              |
| Sync `Docs/` to `Vault`      | `uDosGo/Connect`      | `cp -r Docs/* ~/Vault/docs/uDosGo/Connect/` |
| Install files locally        | `uDosGo`              | `sonic-express`                      |

## Related
- `uDosGo/README.md`: Home folder documentation.
- `uDosGo/Connect/README.md`: Repository folder documentation.
