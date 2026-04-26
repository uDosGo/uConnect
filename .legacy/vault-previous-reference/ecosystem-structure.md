# uDos Ecosystem Structure

This document outlines the structure of the uDos ecosystem, including the organization of repositories, documentation, and workflows.

## Overview

The uDos ecosystem is organized into two main GitHub organizations:

1. **AgentDigitalOK**: Core infrastructure and open-source projects.
2. **uDosGo**: Consumer-facing applications and tools.

## Repository Structure

### AgentDigitalOK

The `AgentDigitalOK` organization hosts the core infrastructure and open-source projects:

- **Docs**: Central documentation repository.
- **Framework**: Core development framework.
- **Hivemind**: Intelligence orchestration layer.
- **Re3ngine**: Reasoning engine.
- **PublishLane**: Publishing gateway.
- **Vendor**: Forked dependencies and external projects.

### uDosGo

The `uDosGo` organization hosts consumer-facing applications and tools:

- **Connect**: Main UI framework and modules.
- **GrooveBox**: Music production and sequencing.
- **Home**: Home automation and smart home integration.
- **SonicScrewdriver**: API gateway and security layer.
- **3dWorld**: 3D virtual environment engine.

## Documentation Workflow

### Source of Truth

The source of truth for all documentation is located in `~/Vault/documentation/`. This directory contains the following structure:

```
~/Vault/documentation/
├── AppStore/         # App Store documentation
├── Framework/        # Framework documentation
├── Hivemind/         # Hivemind documentation
├── GrooveBox/        # GrooveBox documentation
├── Connect/          # Connect documentation
├── Home/             # Home documentation
├── drafts/           # Work in progress
├── edits/            # Changes to existing docs
├── published/        # Ready to sync
├── sync-config.yaml  # Sync configuration
└── README.md         # Documentation guide
```

### Sync Points

Documentation is synced from the Vault to the following locations:

1. **AgentDigitalOK/Docs**: Central documentation repository.
2. **AgentDigitalOK/Framework/Docs**: Framework documentation.
3. **uDosGo/GrooveBox/Docs**: GrooveBox documentation.

### Compiled View

A compiled view of the documentation is generated in `~/Code/Docs/` for local browsing. This view is automatically updated when changes are synced from the Vault.

## Development Workflow

### Roles and Boundaries

- **Wizard (@fredporter)**: Full access to everything, source of truth for all documentation, can push to any repo.
- **Developer**: Can propose changes via PR, cannot directly push to main, works in forks or branches.
- **User**: Read-only access to public repos, can submit issues.
- **System**: Sync scripts run as GitHub Actions, pull from Vault, push to sync points.

### Documentation Flow

1. **Wizard Creates/Edits Documentation**:
   - Edit files in `~/Vault/documentation/`.
   - Move to `published/` when ready.
   - Run `./sync-to-upstream.sh` to push to all sync points.

2. **Developer Proposes Changes**:
   - Fork the repository.
   - Submit a PR with changes.
   - Wizard reviews and merges the PR.
   - Wizard pulls changes into Vault and syncs.

3. **Sync to Repositories**:
   - Run `./sync-to-upstream.sh` to push updates to all repositories.
   - Changes are automatically validated and deployed.

4. **Compile View**:
   - Generate the compiled view for local browsing:
     ```bash
     ~/Code/Docs/compile.sh
     ```

## Ecosystem Diagram

```yaml
┌─────────────────────────────────────────────────────────────────────┐
│                    uDos Ecosystem Structure                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  AgentDigitalOK (Core Infrastructure)                             │
│     │                                                               │
│     ├── Docs/                         # Central documentation     │
│     ├── Framework/                    # Core framework            │
│     ├── Hivemind/                     # Intelligence layer        │
│     ├── Re3ngine/                     # Reasoning engine          │
│     ├── PublishLane/                 # Publishing gateway        │
│     └── Vendor/                       # Forked dependencies       │
│                                                                      │
│  uDosGo (Consumer Applications)                                      │
│     │                                                               │
│     ├── Connect/                      # Main UI framework        │
│     ├── GrooveBox/                    # Music production         │
│     ├── Home/                         # Home automation          │
│     ├── SonicScrewdriver/             # API gateway              │
│     └── 3dWorld/                      # 3D environment           │
│                                                                      │
│  Vault (Source of Truth)                                              │
│     └── documentation/                # All documentation         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Sync Configuration

The sync process is configured in `sync-config.yaml`:

```yaml
version: "2.0"

source_of_truth: "~/Vault/documentation/"

sync_points:
  - destination: "~/Code/Vendor/AgentDigitalOK/Docs/"
    repo: "git@github.com:AgentDigitalOK/Docs.git"
    branch: "main"
    exclude: ["drafts/", "edits/", "published/", "sync-*.sh"]
    
  - destination: "~/Code/Vendor/AgentDigitalOK/Framework/Docs/"
    repo: "git@github.com:AgentDigitalOK/Framework.git"
    branch: "main"
    subdir: "Docs/"
    source_subdir: "Framework/"
    
  - destination: "~/uDosGo/GrooveBox/Docs/"
    repo: "git@github.com:uDosGo/GrooveBox.git"
    branch: "main"
    subdir: "Docs/"
    source_subdir: "GrooveBox/"

compiled_view: "~/Code/Docs/"

boundaries:
  wizard: "fredporter"
  wizard_email: "wizard@agentdigital.ok"
  
  protected_branches:
    - "main"
    - "production"
  
  required_reviews: 1
  require_wizard_approval: true

automation:
  sync_interval: "manual"
  ci_validation: true
  auto_deploy: true
```

## Rules and Guidelines

### Documentation Rules

- **NEVER edit docs outside `~/Vault/documentation/`**
- **NEVER commit directly to GitHub docs**
- **NEVER push to main branch directly**
- **Always edit the source in `~/Vault/documentation/` and sync**
- **Developers must submit PRs for review**

### Code Rules

- Follow the existing code style.
- Write clear and concise commit messages.
- Include tests for new features.
- Update documentation as needed.

## License

All documentation and code are licensed under their respective project licenses. See individual repositories for details.

## Support

For issues or questions about the ecosystem structure:
- Open an issue on GitHub
- Check the contributing guidelines
- Review existing documentation for similar topics