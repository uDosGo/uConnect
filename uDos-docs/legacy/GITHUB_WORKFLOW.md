# GitHub Workflow for uDosGo

## Overview

This document describes how the uDosGo GitHub organization is configured for collaboration, automation, and project management. It covers the integration between GitHub features, uDoui workflows, Continue.dev, and the GitHub Desktop app as a complementary visual dev tool.

## GitHub Organization

**URL**: https://github.com/uDosGo
**Plan**: Free

### Repositories

| Repository | Visibility | Purpose |
|-----------|-----------|---------|
| `Connect` | Public | Main uDosGo monorepo |
| `SonicScrewdriver` | Public | Smart home automation |
| `uCode1` | Public | BBC BASIC terminal surface |
| `uCode2` | Public | AMOS terminal surface |
| `uCode3` | Public | Home automation surface |
| `uCode4` | Private | Spatial computing surface |
| `Groovebox` | Public | Music production |
| `3dWorld` | Private | 3D world builder |
| `Demo` | Public | Demo projects |

## Collaboration Features

### Discussions
- **URL**: https://github.com/uDosGo/Connect/discussions
- **Categories**: General, Ideas, Q&A, Show and Tell

### Issue Templates
- **Bug Report**: Structured format with environment details
- **Feature Request**: Includes uDoui Extension checkbox
- **Config**: Links to Discussions and docs

### Branch Protection (main)
- 1 approval required
- "Continue Quality Gates" check required
- Dismiss stale reviews
- Auto-merge enabled
- Delete branch on merge

## Automation Features

### Dependabot
- pip (Python) — weekly Monday
- cargo (Rust) — weekly Monday
- GitHub Actions — weekly Monday

### Key Workflows

| Workflow | Purpose |
|----------|---------|
| `continue-checks.yml` | Quality gates on PR |
| `publish-extension.yml` | uDoui extension publishing |
| `publish.yml` | Release publishing |
| `ci.yml` | General CI |

### uDoui Extension Publishing Flow

```
Edit manifest → Push → Validate → Catalog rebuild → Discoverable
```

## GitHub Projects (Kanban)

### uDoui Kanban Board
**URL**: https://github.com/orgs/uDosGo/projects/1

**Columns**: 📋 Backlog → 🔜 Next Up → 🏗️ In Progress → 👀 In Review → ✅ Done

**Workflow**:
1. Issues created via templates (auto-labeled)
2. Issues added to Kanban board
3. Work moves through columns
4. PRs linked to issues auto-update status
5. Completed items archived weekly

## GitHub Desktop Integration

### Overview
GitHub Desktop provides a visual Git client that complements uDoui's terminal-based workflows. It runs side-by-side with uDoui as an alternative dev surface for visual operations.

### Installation

**macOS**:
```bash
brew install --cask github
```

**Linux (Ubuntu/Debian)**:
```bash
wget -O ~/Downloads/GitHubDesktop.deb https://desktop.github.com/download/linux/
sudo dpkg -i ~/Downloads/GitHubDesktop.deb
sudo apt-get install -f
```

### Side-by-Side Workflow

```
┌─────────────────────┐  ┌─────────────────────┐
│   Terminal (uDoui)   │  │  GitHub Desktop     │
│                      │  │                     │
│  udo ext list        │  │  Visual diff view   │
│  git commit -m "..." │  │  Branch management  │
│  git push            │  │  PR creation        │
│  udo ext publish     │  │  History browsing   │
│                      │  │  Conflict resolver  │
└─────────────────────┘  └─────────────────────┘
```

### Recommended Workflow

1. **Terminal (uDoui)**: Code, run tests, manage extensions
2. **GitHub Desktop**: Review diffs, create PRs, resolve conflicts
3. **GitHub Web**: Kanban board, discussions, CI monitoring

### GitHub Desktop Settings

**Preferences → Appearance**: Dark theme (matches uDoui)

**Preferences → Git**:
- Default branch: `main`
- Rebase current branch: On

**Repository → Repository Settings**:
- Default branch name: `main`
- Pull request defaults: `uDosGo/Connect`

### Cross-Platform Notes

**macOS**:
- Integrates with macOS Keychain for auth
- Use `gh auth login` for CLI parity
- iTerm2 + GitHub Desktop = ideal dual-surface setup

**Linux**:
- Available as .deb package
- May require `libappindicator` and `libgdk-pixbuf2.0-dev`
- GNOME Terminal + GitHub Desktop = recommended
- For Wayland: set `GDK_BACKEND=x11` if rendering issues

### Complementary Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **uDoui (Terminal)** | Code, extensions, automation | Daily development |
| **GitHub Desktop** | Visual Git, diffs, PRs | Code review, conflict resolution |
| **VS Code** | IDE with Continue.dev | Heavy development |
| **GitHub Web** | Kanban, discussions, CI | Project management |

## Continue.dev Integration

### Local Setup
- **Config**: `config/hivemind-continue-config.json` in DevStudio
- **MCP Servers**: Hivemind SSE (port 30010) + Hivemind Direct (stdio)
- **Model**: Hivemind (local) via OpenRouter-compatible API

### CI Integration
- **Workflow**: `.github/workflows/continue-checks.yml`
- **Runs on**: PR to main/dev
- **Checks**: Build, lint, test, security audit
- **Required for**: Branch protection on main

## Publishing Flow

### Extension Publishing
```
1. Develop extension in udoui/extensions/manifests/
2. Validate locally: udo ext validate <name>
3. Commit and push to main
4. GitHub Actions validates and publishes
5. Extension appears in catalog
6. Users install: udo ext install <name>
```

### Release Publishing
```
1. Tag release: git tag v1.2.3
2. Push tag: git push origin v1.2.3
3. publish.yml workflow builds and publishes
4. Release created on GitHub
5. Users update: udo update
```

## Quick Reference

### For Contributors
```bash
git clone https://github.com/uDosGo/Connect.git
cd Connect
git checkout -b feature/my-feature
# make changes
git add -A && git commit -m "feat: my feature"
git push origin feature/my-feature
gh pr create --fill
```

### For Maintainers
```bash
gh pr list
gh pr review <number> --approve
gh pr merge <number> --auto --squash
# Kanban: https://github.com/orgs/uDosGo/projects/1
```

---

*Last Updated: 2026-05-10*
*Part of uDosGo documentation*
