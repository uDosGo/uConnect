# 🧠 uDos Agent Dev Practice: Universal Dev Template & Repository Hygiene

## Document: `UDOS_DEV_PRACTICE_TEMPLATE.md`

**Status:** Recommended Practice  
**Applies to:** All uDos ecosystem repositories (executed from `~/code-vault/uDosConnect/`)
**Version:** 1.0  
**Last Updated:** 2026-04-19

---

## 1. Overview

This document defines the **standard development environment** for all repositories in the uDos ecosystem. Every repo – whether core (`uDosConnect`), ancillary (`GrooveBox888`, `uHomeNest`), or siloed app (`Apps/*`) – must follow this template structure.

The template lives at `../Dev/template/` (relative to this repo) and serves as the **source of truth** for new and existing repos.

---

## 2. Repository Categories (Relative to uDosConnect)

| Category | Path (relative) | Examples | Dev Template Required |
|----------|-----------------|----------|----------------------|
| **Core** | `./` (this repo) | uDosConnect | ✅ Yes |
| **Ancillary Desktop** | `../GrooveBox888/`, `../uHomeNest/` | GrooveBox888, uHomeNest | ✅ Yes |
| **Siloed App** | `../Apps/*/` | McSnackbar, Marksmith | ✅ Yes |
| **Tooling** | `../Dev/`, `../Tools/` | template, experiments | ❌ No (self-contained) |
| **Packager** | `../sonic-screwdriver/` | sonic-screwdriver | ❌ No (special role) |

---

## 3. Template Structure (for this repo)

```
~/code-vault/uDosConnect/               # Current repo root
├── .dev/                              # Dev workflow root (commit this)
│   ├── config.yaml                    # Project configuration
│   ├── safety/
│   │   ├── rules.yaml                 # Safety check rules
│   │   └── exceptions.yaml            # Approved exceptions
│   ├── tasks/
│   │   ├── backlog.md                 # Prioritized tasks
│   │   ├── in-progress.md             # Current sprint
│   │   └── completed/                 # Done tasks archive
│   ├── agents/
│   │   ├── codegen.agent.yaml         # DSC2 agent config
│   │   ├── tester.agent.yaml          # Vibe-CLI test agent
│   │   └── reviewer.agent.yaml        # OpenRouter reviewer
│   ├── flows/
│   │   ├── dev-cycle.flow.yaml        # Development workflow
│   │   ├── review.flow.yaml           # Safety review flow
│   │   └── release.flow.yaml          # Release process
│   ├── roadmap/
│   │   ├── milestones.yaml            # Milestone definitions
│   │   └── major/                     # Major version plans
│   ├── devlog/                        # Daily logs (YYYY-MM-DD.md)
│   ├── feed/                          # Reply feed cache (local)
│   ├── spines/                        # Architecture variants
│   │   ├── main/                      # Current spine
│   │   └── experimental/              # Future spine
│   └── docs/
│       ├── api/                       # API documentation
│       └── guides/                    # User guides
│
├── .compost/                          # AI state archive (gitignored)
│   ├── objects/                       # Compressed blobs
│   └── refs/                          # Pointers to heads
│
├── .gitignore                         # Must include .compost/
├── README.md                          # Project description
└── LICENSE                            # MIT (default)
```

---

## 4. Applying the Template to This Repo

### 4.1 Initial Setup (if .dev/ is missing)

```bash
cd ~/code-vault/uDosConnect

# Copy template from Dev/template/
cp -r ../Dev/template/. .

# Initialize git if needed
git add .
git commit -m "chore: initialize from uDos dev template"
```

### 4.2 Updating from Template (merge mode)

```bash
cd ~/code-vault/uDosConnect

# Merge template (don't overwrite existing files)
rsync -av --ignore-existing ../Dev/template/. .

# Ensure .compost/ is gitignored
grep -q "^.compost/" .gitignore || echo ".compost/" >> .gitignore

git add .
git commit -m "chore: merge uDos dev template updates"
```

---

## 5. Repairing a Corrupted Dev Folder (from within this repo)

When `.dev/` becomes corrupted or out of sync:

```bash
cd ~/code-vault/uDosConnect

# 1. Backup current state to compost
compost add .dev --message "pre-repair backup $(date +%Y%m%d-%H%M%S)"

# 2. Replace with fresh template
rm -rf .dev
cp -r ../Dev/template/.dev .

# 3. Restore critical files from compost (optional)
compost restore --path .dev/tasks/backlog.md --from pre-repair-backup
compost restore --path .dev/roadmap/milestones.yaml --from pre-repair-backup

# 4. Verify
git status
```

**Alternative (nest old folder):**
```bash
cd ~/code-vault/uDosConnect
mv .dev .compost/dev-backup-$(date +%Y%m%d)
cp -r ../Dev/template/.dev .
```

---

## 6. Compost Integration (from within this repo)

`.compost/` is the AI state archive. It stores:

- Previous versions of `.dev/` contents
- AI-generated replies and decisions
- Rollback points for safety recovery

**Commands (run from this repo):**
```bash
# Save current state
compost add .dev --message "before major refactor"

# List snapshots
compost list --path .dev/

# Restore a specific file
compost restore --path .dev/tasks/backlog.md --from "before major refactor"

# Full rollback
compost checkout --path .dev --from "before major refactor"
```

---

## 7. Cross-Repo Operations (from uDosConnect)

Since this repo is the core, you can manage other repos' dev folders from here:

```bash
# Check status of all repos
for repo in . ../GrooveBox888 ../uHomeNest ../Apps/*; do
    echo "=== $repo ==="
    ls -la "$repo/.dev" 2>/dev/null || echo "⚠️ No .dev folder"
done

# Repair another repo's dev folder
cd ../GrooveBox888
compost add .dev --message "pre-repair backup"
rm -rf .dev
cp -r ../Dev/template/.dev .
compost restore --path .dev/tasks/ --from pre-repair-backup

# Sync template to all repos
for repo in . ../GrooveBox888 ../uHomeNest ../Apps/*; do
    if [ -d "$repo" ]; then
        rsync -av --ignore-existing ../Dev/template/. "$repo/"
    fi
done
```

---

## 8. Sonic-Screwdriver Integration

`screwdriver` (the packager/installer/distributor at `../sonic-screwdriver/`) reads `.dev/config.yaml` from this repo:

```yaml
# .dev/config.yaml example for uDosConnect
project:
  name: uDosConnect
  version: 0.5.0
  type: core

sonic:
  build_command: "npm run build"
  output_dir: "./dist"
  dependencies: ["node", "rust"]
```

**Commands (run from anywhere):**
```bash
# Build this repo using its .dev config
sonic build uDosConnect

# Package for distribution
sonic package uDosConnect --output ../sonic-screwdriver/packages/

# Install to target system
sonic install uDosConnect --from-local
```

---

## 9. Per-Repo Customization

This repo can override template defaults by:

1. **Adding files** – New files in `.dev/` are preserved
2. **Modifying files** – Changes are kept during merge (rsync won't overwrite)
3. **Removing files** – Delete explicitly; they won't come back on merge

**To force a full template reset:**
```bash
cd ~/code-vault/uDosConnect
rm -rf .dev
cp -r ../Dev/template/.dev .
```

---

## 10. Verification Checklist (for this repo)

After applying or repairing this repo's dev folder, verify:

- [ ] `.dev/` exists with all subdirectories
- [ ] `.compost/` exists and is in `.gitignore`
- [ ] `.dev/config.yaml` has correct project name (`uDosConnect`) and type (`core`)
- [ ] `.dev/safety/rules.yaml` is present
- [ ] `.dev/tasks/backlog.md` exists (can be empty)
- [ ] `.dev/agents/*.agent.yaml` files exist
- [ ] `.dev/flows/*.flow.yaml` files exist
- [ ] `.dev/roadmap/milestones.yaml` exists
- [ ] `.dev/devlog/` directory exists
- [ ] `.dev/feed/` directory exists
- [ ] `.dev/spines/main/` exists

---

## 11. Agent Instructions for This Practice

```
When working from ~/code-vault/uDosConnect/:

1. ALWAYS check if .dev/ follows the template structure
2. If missing or corrupted, run repair procedure (section 5)
3. Before major changes, compost the current state
4. When updating from template, use rsync --ignore-existing
5. Never hardcode absolute paths - use relative paths (../vault/, ../code-vault/)
6. Respect .dev/config.yaml for project-specific settings
7. Use cross-repo commands from section 7 to manage sibling repos

The template source of truth is ../Dev/template/ (relative to this repo)
```

---

## 12. Related Documents (in this repo)

- `DEVELOPMENT_ROADMAP_ROUNDS.md` – 21-round development plan
- `UDOS_ARCHITECTURE.md` – Core system design
- `docs/LEXICON_DATABASE.md` – Terminology reference
- `core/src/` – TypeScript source
- `core-rs/src/` – Rust source

---

## 13. Quick Reference Card

| Action | Command (from this repo) |
|--------|--------------------------|
| Initial setup | `cp -r ../Dev/template/. .` |
| Merge updates | `rsync -av --ignore-existing ../Dev/template/. .` |
| Backup before repair | `compost add .dev --message "backup"` |
| Full repair | `rm -rf .dev && cp -r ../Dev/template/.dev .` |
| Restore file | `compost restore --path .dev/tasks/backlog.md --from backup` |
| Sync to all repos | `for r in . ../GrooveBox888 ../uHomeNest ../Apps/*; do rsync -av --ignore-existing ../Dev/template/. "$r/"; done` |
| Build with sonic | `sonic build uDosConnect` |

---

**This practice is mandatory for all uDos ecosystem development. Deviations require explicit approval and documentation.**