# GitHub Workflow for uDosGo Ecosystem

## Overview

This document describes how the uDosGo GitHub organization is configured for collaboration, automation, and project management. It covers the integration between GitHub features, uDoui workflows, Continue.dev, and the GitHub Desktop app as a complementary visual dev tool.

## GitHub Organization: uDosGo

**URL**: https://github.com/uDosGo
**Plan**: Free (public repos, up to 10,000 private repos)

### Repositories

| Repository | Visibility | Purpose |
|-----------|-----------|---------|
| `Connect` | Public | Main uDosGo monorepo (docs, core, ui, tools) |
| `SonicScrewdriver` | Public | Smart home automation platform |
| `uCode1` | Public | BBC BASIC terminal surface |
| `uCode2` | Public | AMOS terminal surface |
| `uCode3` | Public | Home automation surface |
| `uCode4` | Private | Spatial computing surface |
| `Groovebox` | Public | Music production tool |
| `3dWorld` | Private | 3D world builder |
| `Demo` | Public | Demo projects |

## Collaboration Features

### Discussions
- **Enabled on**: Connect repo
- **URL**: https://github.com/uDosGo/Connect/discussions
- **Purpose**: Community Q&A, ideas, general discussion
- **Categories**: General, Ideas, Q&A, Show and Tell

### Issue Templates
Located in `.github/ISSUE_TEMPLATE/`:

1. **Bug Report** (`bug_report.md`)
   - Structured format with environment details
   - Labels: `bug`

2. **Feature Request** (`feature_request.md`)
   - Includes uDoui Extension checkbox
   - Labels: `enhancement`

3. **Config** (`config.yml`)
   - Links to Discussions and docs

### Branch Protection (main)
- **Required reviews**: 1 approval
- **Required status checks**: "Continue Quality Gates"
- **Dismiss stale reviews**: Yes
- **Enforce for admins**: Yes
- **Auto-merge**: Enabled
- **Delete branch on merge**: Enabled

## Automation Features

### Dependabot (`.github/dependabot.yml`)
- **pip** (Python) — weekly, Monday
- **cargo** (Rust) — weekly, Monday
- **GitHub Actions** — weekly, Monday
- Labels: `dependencies`, `python`/`rust`/`ci`

### GitHub Actions Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `continue-checks.yml` | PR to main/dev | Quality gates (lint, test, build, security) |
| `ci.yml` | Push/PR | General CI pipeline |
| `ci-cd.yml` | Push to main | Build and deploy |
| `auto-fix.yml` | Issues/PRs | Automated fixes |
| `auto-heal.yml` | Schedule | Self-healing checks |
| `core-ci.yml` | Push/PR | Core module tests |
| `publish.yml` | Release | Package publishing |
| `publish-student-kit.yml` | Push | Student kit publishing |
| `publish-extension.yml` | Push to manifests | uDoui extension catalog publishing |
| `lock-boundary.yml` | Push | Boundary lock validation |
| `validate-courses.yml` | Push | Course validation |
| `validate_config.yml` | Push | Config validation |

### uDoui Extension Publishing Flow

```
Developer edits manifest in udoui/extensions/manifests/
  → Push to main
    → publish-extension.yml validates manifest against schema
      → Catalog index auto-rebuilds
        → Extensions discoverable via `udo ext list`
          → Installable via `udo ext install <name>`
```

## GitHub Projects (Kanban)

### uDoui Kanban Board
**URL**: https://github.com/orgs/uDosGo/projects/1

**Columns**:
| Column | Purpose |
|--------|---------|
| 📋 Backlog | Ideas and unprioritized work |
| 🔜 Next Up | Prioritized for next sprint |
| 🏗️ In Progress | Currently being worked on |
| 👀 In Review | PRs awaiting review |
| ✅ Done | Completed work |

**Workflow**:
1. Issues are created via templates (auto-labeled)
2. Issues are added to the Kanban board
3. Work moves through columns as it progresses
4. PRs linked to issues auto-update status
5. Completed items are archived weekly

## GitHub Desktop App Integration

### Overview
GitHub Desktop provides a visual Git client that complements uDoui's terminal-based workflows. It runs side-by-side with uDoui as an alternative dev surface for visual operations.

### Installation

#### macOS
```bash
brew install --cask github
```

#### Linux (Ubuntu/Debian)
```bash
# Download from https://desktop.github.com/
# Or use the .deb package:
wget -O ~/Downloads/GitHubDesktop.deb https://desktop.github.com/download/linux/
sudo dpkg -i ~/Downloads/GitHubDesktop.deb
sudo apt-get install -f
```

### Configuration for uDosGo

#### Repository Setup
1. Open GitHub Desktop
2. File → Clone Repository → URL tab
3. Enter: `https://github.com/uDosGo/Connect.git`
4. Choose local path: `~/Code/uDosGo`
5. Click Clone

#### Side-by-Side Workflow with uDoui

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

#### Recommended Workflow

1. **Terminal (uDoui)**: Code, run tests, manage extensions
2. **GitHub Desktop**: Review diffs, create PRs, resolve conflicts
3. **GitHub Web**: Kanban board, discussions, CI monitoring

#### GitHub Desktop Settings for uDosGo

**Preferences → Appearance**:
- Theme: Dark (matches uDoui aesthetic)

**Preferences → Git**:
- Default branch: `main`
- Rebase current branch: On (matches uDosGo workflow)

**Repository → Repository Settings**:
- Default branch name: `main`
- Pull request defaults: `uDosGo/Connect`

### Cross-Platform Notes

#### macOS
- GitHub Desktop integrates with macOS Keychain for auth
- Use `gh auth login` for CLI parity
- iTerm2 + GitHub Desktop = ideal dual-surface setup

#### Linux
- GitHub Desktop for Linux is available as a .deb package
- May require `libappindicator` and `libgdk-pixbuf2.0-dev`
- GNOME Terminal + GitHub Desktop = recommended setup
- For Wayland: set `GDK_BACKEND=x11` if rendering issues occur

### Complementary Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **uDoui (Terminal)** | Code, extensions, automation | Daily development |
| **GitHub Desktop** | Visual Git, diffs, PRs | Code review, conflict resolution |
| **VS Code** | IDE with Continue.dev | Heavy development |
| **GitHub Web** | Kanban, discussions, CI | Project management |

## Continue.dev Integration

### Local Setup
- **Config**: `config/hivemind-continue-config.json` in DevStudio (legacy — Hivemind moved to [Toybox](https://github.com/fredporter/Toybox))
- **MCP Servers**: Snackbar (port 8765) via mcp-remote
- **Model**: OpenRouter or local Ollama

### CI Integration
- **Workflow**: `.github/workflows/continue-checks.yml`
- **Runs on**: PR to main/dev, push to main/dev
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
# Clone
git clone https://github.com/uDosGo/Connect.git
cd Connect

# Create branch
git checkout -b feature/my-feature

# Make changes, commit, push
git add -A
git commit -m "feat: my feature"
git push origin feature/my-feature

# Create PR via GitHub Desktop or CLI
gh pr create --fill

# Wait for CI checks to pass
# Get review, merge
```

### For Maintainers
```bash
# Review PRs
gh pr list
gh pr review <number> --approve

# Merge
gh pr merge <number> --auto --squash

# Manage Kanban
# Visit: https://github.com/orgs/uDosGo/projects/1
```

---

*Last Updated: 2026-05-12*
*Part of DevStudio documentation*
*See also: [ECOSYSTEM_MAP.md](./ECOSYSTEM_MAP.md), [ARCHITECTURE.md](../uDosGo/docs/ARCHITECTURE.md)*
