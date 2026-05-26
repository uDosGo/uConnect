---
title: "Vault Workspaces"
version: "1.0.0"
status: "draft"
tags: [--public]
audience: public
slot: 5
apple_color: Blue
last_reviewed: "2026-04-15"
applies_to: "uDos A2+ (workspace model); VA1 remains compatible as Master Vault"
---

# Vault Workspaces Specification

**Document status:** Draft (v1.0.0) · **Last updated:** 2026-04-15 · **Applies to:** uDos A2 and later (see [Implementation scope](#implementation-scope) below).

## Overview

This spec defines the workspace and binder system for uDos vaults — a unified model for organizing user content, system resources, experiments, and published work using prefix-based conventions.

The core principle: **everything is a workspace**. The Master Vault is the default workspace at root. `@` and `#` prefixes create separate workspaces/binders that are excluded from the master index but remain visible to the user.

### Implementation scope

Layout rules and CLI examples below describe the **target** product surface for **A2 and later**. VA1 today implements a smaller vault bootstrap and command set; see [Relationship to VA1 vault layout (today)](#relationship-to-va1-vault-layout-today) and [public/ucode-commands.md](../public/ucode-commands.md). Cloud boundary: [a1-a2-boundary.md](a1-a2-boundary.md).

### Separation of concerns (at a glance)

| Layer | Location | Contents | User editable | Syncable |
| --- | --- | --- | --- | --- |
| **User data** | `@user/*` | tasks, contacts, workflows, templates, feeds | Yes | Yes |
| **System read-only** | `@system/*` | schemas, prompts, workflow templates, feed presets | No | N/A (system) |
| **Code** | `uDos/` (repo) | task engine, workflow executor, CLI, MCP server | No (dev only) | N/A (code) |
| **Dependencies** | `.local/lib/`, `.local/bin/` | installed requirements, binaries | No | No |
| **Runtime** | `.local/cache/`, `.local/indexes/`, `.local/state.db`, `.local/logs/` | compiled views, search indexes, vault state | No | No |
| **Hidden archive** | `.compost/` (any folder) | soft-deleted items, version backups | Yes (restore) | No |

---

## Relationship to VA1 vault layout (today)

VA1 `udo init` creates **`content/`**, **`system/`** (including **`system/usxd/`**), **`spool/`**, **`feeds/`**, **`ucode/`**, and **`.compost/`** at the vault root — see `core/src/actions/vault.ts`. That tree remains valid as **Master Vault** content (unprefixed paths). This specification adds **`@` / `#` roots** and **`.local/`** as an **optional evolution** for A2+; existing vaults without `@`/`#` continue to work with no forced migration ([§13.1](#131-backward-compatibility)).

**Naming note:** VA1 **`system/`** (mutable paths like active USXD theme under `vault/system/usxd/`) is **not** the same folder as **`@system/`** (read-only packaged resources). Future tooling should document the mapping when `@system/` ships.

---

## 1. Core Concepts

### 1.1 Master Vault

The vault root folder **is** the Master Vault. Any folder or file at root that does **not** start with `@`, `#`, or `.` is part of the Master Vault.

```
~/Documents/udos-vault/
├── projects/          ← Master Vault content
├── notes/             ← Master Vault content
├── todo.md            ← Master Vault content
```

VA1’s **`content/`** (markdown for publish) and other bootstrap dirs live here as Master Vault paths.

### 1.2 Workspace (`@` prefix)

Folders starting with `@` at vault root are **workspaces** — separate contexts excluded from master index.

```
@toybox/               ← Experiments, throwaway tests
@sandbox/              ← Drafts, WIP, active development
@private/              ← Completed, not shared
@shared/               ← Selective access
@public/               ← World-readable
@legacy/               ← Inactive, unpublished
@dev/                  ← System dev (symlink)
@system/               ← System resources (read-only)
@user/                 ← User data
```

### 1.3 Binder (`#` prefix)

Folders starting with `#` at vault root are **binders** — project or topic containers. They follow the same rules as workspaces but are intended for user-defined project grouping.

Binders represent **flat file structures** — all content within a binder is at the same level (no nested folders required, though allowed).

```
#client-acme/          ← Project binder
#research-234/         ← Topic binder
```

### 1.4 Hidden (`.` prefix)

Folders starting with `.` are **hidden** — not visible in normal listings, excluded from all indexes.

```
.local/                ← Runtime, cache, state
.compost/              ← Soft-deleted items (can appear in any folder)
```

---

## 2. Prefix Rules

| Prefix | Type | Visible | Master index | Sync | Example |
| --- | --- | --- | --- | --- | --- |
| (none) | Master Vault | Yes | Yes | Configurable | `projects/` |
| `@` | Workspace | Yes | No | Per workspace | `@sandbox/` |
| `#` | Binder | Yes | No | Per binder | `#project/` |
| `.` | Hidden | No | No | No | `.local/` |

**Important:** Prefixes only matter at vault root. `@` or `#` inside subfolders are treated as regular folder names.

---

## 3. Standard Workspaces

### 3.1 Flushable workspaces (user)

| Workspace | Purpose | Flushable |
| --- | --- | --- |
| `@toybox/` | Experiments, throwaway tests, evaluating external projects | Yes (any time) |
| `@sandbox/` | Drafts, WIP, active development | Yes (any time) |

**Note:** `@toybox` and `@sandbox` can contain multiple binders inside them. A user may use `@sandbox` to compile a project first, then create a dedicated binder from it.

### 3.2 Published workspaces

| Workspace | Purpose | Visibility | Sync |
| --- | --- | --- | --- |
| `@private/` | Completed, not shared | Local only | No |
| `@shared/` | Completed, selective access | Selective users/groups | Yes |
| `@public/` | Completed, world-readable | Anyone | Yes |
| `@legacy/` | Inactive, unpublished | Preserves original | Yes (read-only) |

### 3.3 System workspaces

| Workspace | Purpose | User editable |
| --- | --- | --- |
| `@system/` | System resources (read-only) | No |
| `@dev/` | Symlink to uDos/dev | No (dev only) |
| `@user/` | User-owned data | Yes |

### 3.4 System workspace structure

```
@system/
├── schemas/            # Task, contact, workflow schemas
├── prompts/            # System AI prompts
├── workflow/           # System workflow templates
└── feeds/              # Feed presets

@user/
├── tasks/              # User tasks
├── contacts/           # User contacts
├── workflows/          # User workflows
├── feeds/              # User feed subscriptions
└── templates/          # User templates
```

---

## 4. Compost system (soft delete + versioning)

**Any folder** can contain a `.compost/` subfolder for soft-deleted content and version backups.

```
any-folder/
├── current-file.md
└── .compost/                      ← Hidden, local-only
    ├── 2026-04-15T10-30-00_deleted-note.md
    ├── 2026-04-15T11-45-00_current-file-v2.md
    └── ...
```

### 4.1 Compost rules

| Property | Value |
| --- | --- |
| Location | Any folder |
| Visibility | Hidden (`.compost/`) |
| Sync | Never synced |
| Index | Excluded from all searches |
| Retention | Automatic (system health / resources based) |

### 4.2 Automatic versioning

When a user opens a document in `@sandbox` or `@toybox`:

- A version backup is automatically copied to `.compost/`
- The backup is mapped to the live document
- Multiple versions per session are preserved

### 4.3 Compost retention policy

Retention is based on **system health and resources**, not simple time rules:

| Factor | Consideration |
| --- | --- |
| Disk space | Is space needed? Low space triggers cleanup |
| Age | How long ago was this composted? Older items prioritized |
| Version freshness | Is there a newer version not composted? Redundant versions cleaned |
| Document activity | Active documents have versions retained longer |
| Binder importance | Published/shared binders retain versions longer than toybox |

```bash
# Manual cleanup (system also does automatic)
udo compost clean --aggressive          # Free space aggressively
udo compost clean --dry-run             # Show what would be deleted
udo compost stats                       # Show compost size, age, version counts

# Restore from version history
udo compost restore <file> --version <timestamp>   # Restore specific version
udo compost versions <file>              # List available versions
```

### 4.4 Compost commands

```bash
udo compost <file>                     # Move to .compost/ with timestamp
udo compost list                       # List compost contents
udo compost list --by-binder           # Group by binder
udo restore .compost/<file> ./         # Restore to original location
udo restore .compost/<file> <binder>   # Restore to different binder
udo compost versions <file>            # List available versions
udo compost restore <file> --version <timestamp>   # Restore specific version
udo compost clean --aggressive         # System-driven cleanup
udo compost stats                      # Show compost statistics
```

---

## 5. Local runtime (`.local/`)

Hidden folder at vault root for machine-specific runtime data.

```
.local/
├── lib/                     # Installed dependencies
├── bin/                     # Installed binaries
├── cache/                   # Compiled views, thumbnails
├── indexes/                 # Search indexes
├── state.db                 # Complete vault state record
└── logs/                    # uDos operation logs
```

### 5.1 `state.db` — vault state database

Records everything in the vault:

- All files and folders
- Metadata (tags, relationships)
- Indexes for fast search
- Workspace state
- Compost version mappings

```bash
udo state rebuild            # Rebuild state.db from filesystem (target CLI)
udo state verify             # Check consistency
udo state export             # Export for debugging
```

### 5.2 Dependency management

```bash
udo install <package>        # Install to .local/
udo list installed           # Show installed packages
udo remove <package>         # Remove from .local/
```

---

## 6. Tags

Tags can be applied to items in applicable workspaces.

### 6.1 Ecosystem tags (any workspace)

| Tag | Meaning |
| --- | --- |
| `--local` | Intended for local-only operation |
| `--cloud` | Intended for cloud/sync operation |

These are **vault/ecosystem** tags. They are distinct from **documentation** audience tags (`--public`, `--student`, …) in [audience-tags.md](audience-tags.md).

### 6.2 Sandbox tags (`@sandbox` only)

| Tag | Meaning |
| --- | --- |
| `--review` | Ready for feedback |
| `--staged` | Review complete, ready to promote |

### 6.3 Tag commands

```bash
udo tag @sandbox/item --review          # Apply tag
udo tag @sandbox/item --cloud           # Apply ecosystem tag
udo untag @sandbox/item --review        # Remove tag
udo tags @sandbox/item                  # List tags on item
```

---

## 7. Workspace commands

### 7.1 Management

```bash
udo workspace list                       # Show all @ workspaces
udo workspace create @name               # Create new workspace
udo workspace delete @name               # Delete workspace (with confirmation)
udo workspace enter @sandbox             # Switch active context
```

### 7.2 Flush (flushable workspaces only)

```bash
udo flush @toybox                        # Move all to .compost/
udo flush @sandbox --older-than 7d       # Move old items to .compost/
udo flush @toybox --hard                 # Permanently delete (no compost)
udo flush @sandbox --confirm             # Confirm before flushing
```

### 7.3 Promotion

```bash
udo promote @sandbox/item @private       # Keep local
udo promote @sandbox/item @shared        # Selective access
udo promote @sandbox/item @public        # World-readable
udo demote @public/item @legacy          # Move to legacy (unpublished)
udo restore @legacy/item @public         # Restore from legacy
```

### 7.4 Search

```bash
udo search "query"                       # Master Vault only (excludes legacy)
udo search "query" --workspace @sandbox  # Search specific workspace
udo search "query" --all                 # Search everything except .local
udo search "query" --include-legacy      # Include legacy items
```

---

## 8. System resources

### 8.1 Versioned templates

`@system/templates/` is versioned. User copies are independent.

```
@system/templates/
├── v1/
│   └── proposal.md
├── v2/
│   └── proposal.md
└── current -> v2/          # Symlink to latest version
```

When uDos updates:

- New template versions are added as `vN/`
- `current` symlink updates to latest
- User copies (`@user/templates/`) are **never overwritten**
- User can compare versions and manually update their copies

```bash
udo template list --versions             # Show available versions
udo template use system/proposal.md@v1 @sandbox/   # Use specific version
udo template diff system/proposal.md @user/templates/proposal.md   # Compare versions
udo template update @user/templates/proposal.md --to v2   # Manually update copy
```

### 8.2 Template management

```bash
udo template list                        # Show all templates (system + user)
udo template list --system               # System templates only
udo template list --user                 # User templates only
udo template list --versions             # Show versioned system templates

udo template use system/proposal.md @sandbox/my-proposal.md   # Copy from system (latest)
udo template use system/proposal.md@v1 @sandbox/              # Copy specific version
udo template new user/client-brief.md                         # Create user template
udo edit @user/templates/client-brief.md                      # Edit user template

udo template diff system/proposal.md @user/templates/proposal.md   # Compare versions
udo template update @user/templates/proposal.md --to v2            # Update user copy
```

### 8.3 System prompts

```bash
udo system prompts list                  # List available prompts
udo system prompt show <name>            # Display prompt content
udo system copy prompts/<name> @user/prompts/   # Copy for customization
```

### 8.4 System schemas

```bash
udo system schemas list                  # List available schemas
udo system schema show <name>            # Display schema
udo system copy schema/<name> @user/tasks/schema.yaml   # Copy for customization
```

---

## 9. Task and contact management (user data)

### 9.1 Tasks

```bash
udo task list                            # Show tasks from @user/tasks/
udo task add "Write spec" --priority high
udo task done <id>
udo task board                           # Show kanban view
udo task tag <id> --cloud                # Apply ecosystem tag to task
```

### 9.2 Contacts

```bash
udo contact list                         # Show contacts from @user/contacts/
udo contact add "John Doe" --email john@example.com
udo contact group "team"                 # Show contacts in group
udo contact tag <id> --local             # Apply ecosystem tag
```

---

## 10. Promotion flow

```
@toybox ──(worth keeping)──> @sandbox
                                  │
                                  ├── tag --review ──(feedback)──> iterate
                                  │
                                  └── tag --staged ──(ready)──> promote to:
                                                                    ├── @private
                                                                    ├── @shared
                                                                    └── @public

@private ──(inactive)──> @legacy (preserves visibility, unpublished status)
@shared  ──(inactive)──> @legacy
@public  ──(inactive)──> @legacy
```

### 10.1 Binder creation from sandbox

A user may choose to use `@sandbox` to compile their project first, then create a dedicated binder:

```bash
# Work in sandbox
cd @sandbox
mkdir my-project
# ... develop ...

# When ready, promote to binder
udo binder create '#my-project'
udo move @sandbox/my-project/* '#my-project/'
```

---

## 11. Summary of location responsibilities

| What | Where | Editable by user? | Syncable? |
| --- | --- | --- | --- |
| User tasks | `@user/tasks/` | Yes | Yes |
| User contacts | `@user/contacts/` | Yes | Yes |
| User workflows | `@user/workflows/` | Yes | Yes |
| User templates | `@user/templates/` | Yes | Yes |
| System schemas | `@system/schemas/` | No | N/A |
| System prompts | `@system/prompts/` | No | N/A |
| System workflow templates | `@system/workflow/` | No | N/A |
| System templates (versioned) | `@system/templates/vN/` | No | N/A |
| Task engine code | `uDos/core/` | No (dev only) | N/A |
| Installed dependencies | `.local/lib/`, `.local/bin/` | No | No |
| Runtime cache | `.local/cache/` | No | No |
| Search indexes | `.local/indexes/` | No | No |
| Vault state | `.local/state.db` | No (rebuildable) | No |
| Soft-deleted items + versions | `.compost/` (any folder) | Yes (restore) | No |

---

## 12. Examples

### 12.1 Experiment → published

```bash
# 1. Try something in toybox
cd @toybox
git clone https://github.com/some/project
# ... test it ...

# 2. Worth keeping, move to sandbox
udo promote @toybox/project @sandbox
cd @sandbox/project

# 3. Mark as cloud-intended
udo tag @sandbox/project --cloud

# 4. Develop, mark for review
udo tag @sandbox/project --review

# 5. After feedback, staged
udo tag @sandbox/project --staged

# 6. Publish to shared (team access)
udo promote @sandbox/project @shared

# 7. Later, move to legacy
udo demote @shared/project @legacy
```

### 12.2 Using versioned system templates

```bash
udo template list --versions
udo template use system/proposal.md@v1 @sandbox/my-proposal.md
udo edit @sandbox/my-proposal.md
udo template diff system/proposal.md @sandbox/my-proposal.md
udo template update @sandbox/my-proposal.md --to v2
```

### 12.3 Soft delete, versioning, and cross-binder restore

```bash
udo edit @sandbox/draft.md
# ... makes changes, closes ...
# Version backup automatically in .compost/

udo compost @sandbox/draft.md
udo compost versions draft.md
udo compost restore draft.md --version 2026-04-15T11-45-00 --to-binder '#client-acme/'
udo compost stats
```

### 12.4 Sandbox to binder workflow

```bash
cd @sandbox
mkdir client-work
# ... develop, iterate, test ...

udo binder create '#client-acme'
udo move @sandbox/client-work/* '#client-acme/'
cd '#client-acme'
```

### 12.5 Managing tasks

```bash
udo task add "Review A1 spec" --priority high --tag cloud
udo task list
udo task done 3
udo task board
```

---

## 13. Implementation notes

### 13.1 Backward compatibility

Existing vaults without `@`/`#` structure continue to work as Master Vault. No forced migration.

### 13.2 Vault bootstrap and `@dev` symlink

**Shipping CLI (VA1):** **`udo init`** and **`udo vault init [path]`** both call the same bootstrap in `core/src/actions/vault.ts`: Master Vault dirs plus **`@toybox/`**, **`@sandbox/`**, **`.local/`** (cache, indexes, logs, lib, bin) and an empty **`.local/state.db`** placeholder. **`udo init`** uses `UDOS_VAULT` or `~/vault`. **`udo vault init`** accepts an optional path to that vault root.

**State DB maintenance (target):** Prefer **`udo state rebuild`**, **`udo state verify`**, **`udo state export`** — not yet implemented in VA1; see [public/ucode-commands.md](../public/ucode-commands.md).

**`@dev/` (target):** May symlink to `../uDos/dev` when a `uDos` checkout sits adjacent to the vault root. Optional developer convenience; path is machine-specific. **VA1 bootstrap does not create `@dev/`** yet.

### 13.3 `state.db` schema

To be defined in separate spec. Must support:

- File/folder indexing with prefix-based exclusions
- Tag storage and querying
- Workspace-specific indexes
- Compost tracking and version mapping
- Template versioning

### 13.4 Automatic compost versioning

When a user opens a document in `@sandbox` or `@toybox`:

1. Check if file already has a version in `.compost/` from today
2. If yes, compare content; if changed, create new version
3. If no, create initial version backup
4. Maximum versions per document per session configurable (default: 10)

### 13.5 CLI vs VA1 today

**Shipped in VA1:** **`udo init`**, **`udo vault init [path]`**, and the vault file commands in [public/ucode-commands.md](../public/ucode-commands.md) through the **Vault** table. Workspace skeleton dirs (**`@toybox/`**, **`@sandbox/`**, **`.local/`**, placeholder **`.local/state.db`**) are created by those init commands.

Sections 4–9 otherwise list **target** subcommands for the full workspace model; track gaps in `dev/TASKS.md` rather than assuming parity today.

### 13.6 Repo `.compost/` vs vault `.compost/`

Repository policy may use **`.compost/`** at the **repo** root for developer tidying; that is separate from **vault** `.compost/` semantics in this spec.

---

## 14. Questions to close

| # | Question | Answer |
| --- | --- | --- |
| 1 | **Compost retention** — Automatic cleanup policy based on system health/resources (disk space, age, version freshness, document activity, binder importance), not simple time rules. | Specified in [§4.3](#43-compost-retention-policy) |
| 2 | **Cross-folder compost restore** — Can restore target a different binder than origin? Yes, if requested by operator. Speak in terms of binders; binders use flat file structures (at least by definition). | [§4.4](#44-compost-commands) |
| 3 | **`@experiments` vs `@toybox`** — Final name is `@toybox` (experiments space). | [§3.1](#31-flushable-workspaces-user) |
| 4 | **`@system` updates** — Versioned templates; user copies never overwritten; version comparison and manual update commands; compost versioning integrated. | [§8.1](#81-versioned-templates), [§4.2](#42-automatic-versioning) |
| 5 | **Sandbox and binders** — User may compile work in `@sandbox`, then create a dedicated binder; `@sandbox` and `@toybox` can contain multiple binders. | [§3.1](#31-flushable-workspaces-user), [§10.1](#101-binder-creation-from-sandbox) |

---

## 15. Changelog

| Date | Change |
| --- | --- |
| 2026-04-15 | Initial spec |
| 2026-04-15 | Questions to close; compost retention policy; `@experiments` → `@toybox`; versioned templates; cross-binder restore; sandbox→binder workflow; integrated repo notes (VA1 bridge, scope, tags) |
| 2026-04-15 | §13.2: **`udo init`** + **`udo vault init [path]`** documented; §5.1 state commands → **`udo state *`** (target) |
