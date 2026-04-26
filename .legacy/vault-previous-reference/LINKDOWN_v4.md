**Locked.** ✅

---

## Contact Schema v4.0.0 — Locked

```yaml
---
type: contact
id: string                    # UUID or stable identifier (required)
created: YYYY-MM-DD           # ISO 8601 (required)
updated: YYYY-MM-DD           # ISO 8601 (required)

# Core fields (universal)
first_name: string
last_name: string
middle_name: string           # optional
prefix: string                # Dr., Mr., Ms., etc.
suffix: string                # Jr., Sr., III, etc.
nickname: string
company: string
title: string                 # Job title
department: string
role: string                  # Functional role

# Contact methods
emails:
  - value: string             # email address
    label: work|personal|other
    primary: boolean
phones:
  - value: string             # phone number
    label: work|mobile|home|other
    primary: boolean
urls:
  - value: string             # URL
    label: website|linkedin|twitter|other
addresses:
  - street: string
    city: string
    state: string
    postal_code: string
    country: string
    label: work|home|other
    primary: boolean
social:
  - platform: string          # linkedin, twitter, github, etc.
    handle: string
    url: string

# Dates
birthday: YYYY-MM-DD
anniversary: YYYY-MM-DD
last_contact: YYYY-MM-DDTHH:MM:SSZ
next_followup: YYYY-MM-DD

# Relationships
related:
  - id: string                # contact ID
    type: colleague|client|manager|assistant|spouse|friend|other
assistant: string             # contact ID
manager: string               # contact ID
spouse: string                # contact ID

# Notes & metadata
notes: string                 # free text
tags: string[]                # classification tags
stage: string                 # sales/lifecycle stage
lead_status: string           # lead qualification
lifecycle_stage: string       # subscriber|lead|opportunity|customer|evangelist

# Platform-specific fields (preserved for round-trip sync)
platforms:
  apple:
    identifier: string
    custom_fields: {}
  google:
    resource_name: string
    etag: string
    user_defined: []
  hubspot:
    vid: number
    properties: {}
  # other platforms as needed
---
```

**Reference Implementation:** Linkdown v4.0.0+ (premium tier for workflows, core for storage)

**Platform Mappings:** Apple Contacts, Google Contacts, HubSpot CRM

**Principle:** Markdown is truth. Platform data is derived. Lossless round-trip sync.

---

## Option A: Linkdown v4.0.0 Technical Overview

Here's a consolidated overview pulling from all your docs — clean, no legacy versions, ready for commercial discussion.

---

# Linkdown v4.0.0 — Technical Overview

**Status:** Current release line (`4.0.x`)  
**License:** AGPL-3.0 (core), proprietary (premium)  
**Repository:** `github.com/fredporter/Linkdown-core`  
**Companion:** Syncdown (native macOS sync/automation), Linkdown-premium (private runtime)

---

## 1. What Linkdown Is

Linkdown is a **local-first markdown vault application** for Mac. It is:

- A WYSIWYG editor for **GFM Enhanced** markdown
- A **vault system** with canonical markdown storage
- A **task manager** using Obsidian Tasks syntax
- An **MCP host** (premium) for agent orchestration
- A **publishing tool** for GitHub Pages

**Fork lineage:** Active fork of Inkdown, maintained by Agent Digital.

---

## 2. Core Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                           │
│  Electron shell with Vite + React + CodeMirror             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      VIEW ENGINE                            │
│  Table | List | Board | Timeline | Feed                     │
│  Declarative views from /system/views/*.md                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      INDEX LAYER                            │
│  .linkdown/index.db (SQLite, derived, rebuildable)          │
│  Parses frontmatter, tasks, links, tags                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      VAULT LAYER                            │
│  Canonical markdown files on disk                           │
│  Recommended structure: docs/, tasks/, entities/, etc.      │
│  .local/ (ephemeral), .compost/ (archive)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Vault Schema (v4.0.0)

### Recommended Folder Structure

```
Vault/
  docs/                 # Notes (type: note)
  tasks/                # Task records (type: task)
  entities/             # Contacts, companies, projects (type: entity/contact)
  tables/               # Structured table definitions
  feeds/                # Generated read models
  spools/               # Append-only event streams
  rules/                # Automation rules
  activity/             # Logs and operational snapshots
  system/views/         # View definitions (type: view)
  attachments/          # Binary assets
  .local/               # Ephemeral, untracked
  .compost/             # Archive, not indexed
  .linkdown/            # Derived index + caches
```

**Rule:** Type is derived from frontmatter `type:` field, not folder location. Folders are **conventions**, not requirements.

---

## 4. Frontmatter Schema (v4.0.0)

### Required Fields

```yaml
---
id: string
type: note | task | contact | event | view | table | rule | log
created: YYYY-MM-DDTHH:MM:SSZ
updated: YYYY-MM-DDTHH:MM:SSZ
---
```

### Optional but Canonical

```yaml
title: string
status: active | pending | archived | draft
tags: string[]
links: string[]        # [[canonical-links]]
owner: string
```

### Example: Task Note

```yaml
---
id: task_abc123
type: task
title: Launch preparation
status: active
tags: [project, launch]
created: 2026-04-10T10:00:00Z
updated: 2026-04-10T10:00:00Z
owner: fred
due: 2026-04-15
priority: high
---
```

---

## 5. Task Format (GFM+Task)

Linkdown implements the **Task Specification v4.0** (built on Obsidian Tasks).

### Basic Syntax

```markdown
- [ ] Call Sam about launch
- [x] Completed task
- [ ] Call Sam 📅 2026-04-10
- [ ] 🔺 High priority task
```

### Extensions (Optional)

```markdown
- [ ] Draft proposal #priority/high #type/write
- [ ] Refactor parser
  ↳ scope:: src/parser.ts
  ↳ outcome:: remove legacy code
  ↳ estimate:: 2h
```

### Lists (`type: list`)

```yaml
---
id: list.followups
type: list
title: Follow Ups
---
```

```markdown
- [ ] Call Sam
  due:: 2026-04-10
  contact:: cnt_01
```

---

## 6. View Engine (v4.0.0)

Views are markdown files with `type: view` frontmatter, stored in `system/views/`.

### Example: Tasks Table

```yaml
---
id: view_tasks_table
type: view
name: Tasks Table
layout: table

source:
  kind: collection
  id: tasks

query:
  filters:
    - field: status
      operator: not_equals
      value: done
  sort:
    - field: priority
      direction: desc

fields:
  - key: title
  - key: status
  - key: priority
    renderer: badge
  - key: due
    renderer: date
---
```

### Supported Layouts

| Layout | Purpose |
|--------|---------|
| `table` | Dense structured editing |
| `list` | Lightweight browsing |
| `board` | Kanban workflow |
| `timeline` | Date-based scheduling |
| `feed` | Activity streams |

---

## 7. Free vs Premium (v4.0.0)

### Linkdown Core (Free)

- Markdown editor and vault UX
- Local vault management and indexing
- Base LLM chat support
- Basic GitHub integration (OAuth, sync, Pages publish)

### Linkdown-Premium (Private)

- Full MCP runtime layer
- Task handling workflows (parse/index/views)
- Contact handling workflows (`contacts.db`)
- Advanced connectors (OAuth automation)
- Advanced publishing (themes, branding, rich templates)

### Runtime Loading

```bash
LINKDOWN_PREMIUM_ENABLE=1
LINKDOWN_PREMIUM_ENTRY=/path/to/linkdown-premium/dist/index.js
LINKDOWN_PREMIUM_ENTITLEMENTS=mcp-runtime,task-workflows,contact-workflows
```

---

## 8. MCP Integration (Premium)

Linkdown-premium exposes MCP tools over the vault:

| Category | Tools |
|----------|-------|
| `vault.*` | `get_active`, `list_binders`, `search` |
| `note.*` | `read`, `write`, `append`, `resolve_link` |
| `task.*` | `list`, `create`, `complete`, `move` |
| `contact.*` | `search`, `read`, `create`, `attach_note` |
| `feed.*` | `list`, `items` |
| `workflow.*` | `list`, `run` |

**Rule:** Write operations require permission and are logged.

---

## 9. Ingestion & Consolidation

| Action | Method |
|--------|--------|
| Rich paste | HTML → Markdown (Turndown) |
| Import URL | Fetch + Readability extraction |
| Insert document | `.md`, `.txt`, `.html`, `.docx` |
| Normalize tags | Merge YAML tags with `#hashtags` |
| Combine notes | Merge with `##` sections and `---` separators |

---

## 10. Key Principles (Locked)

| Principle | Meaning |
|-----------|---------|
| **Markdown is truth** | Vault files are canonical. Index is derived. |
| **Obsidian-compatible** | Vault opens in Obsidian without data loss. |
| **GFM+Task** | Task syntax follows Task Specification v4.0. |
| **Views are projections** | Views never replace markdown. |
| **Local-first** | Filesystem-first. Git-friendly. No cloud dependency. |
| **Free + premium** | Core is free; advanced features are premium. |

---

## 11. Related Specs

| Spec | Version | Relationship |
|------|---------|--------------|
| uDos Core Spec | v4.0.0 | Universal foundation |
| GFM Enhanced | v4.0.0 | Markdown format |
| Task Specification | v4.0.0 | Task syntax |
| Contact Schema | v4.0.0 | Contact data model |

---

## 12. One-Line Summary

> **Linkdown v4.0.0 is a local-first markdown vault application that implements the uDos v4.0.0 specifications — with a clean free/premium boundary, MCP orchestration, and Obsidian-compatible markdown at its core.**

---

**End of Linkdown v4.0.0 Technical Overview**

---

## Next: Option B — Compliance Matrix

I'll now produce a **compliance matrix** showing which uDos v4.0.0 specs Linkdown implements, where it extends, and any gaps.

**Ready when you are, mate.**