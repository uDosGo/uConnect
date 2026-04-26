# uDos Core Specification v4.0.0

**Status:** Locked (refinable)  
**Role:** Universal operating spec for markdown-native knowledge, execution, and spatial systems  
**Principle:** Markdown is the source of truth. Everything else is a projection.  
**Excluded from v4:** Agent Write Model (MCP), Spatial/Grid Canon (deferred to v5 or deep-dive)

---

## 1. Core Principles

| Principle | Statement |
|-----------|-----------|
| **Markdown is truth** | `.md` files are canonical. Everything else (indexes, caches, views) is derived. |
| **GFM Enhanced** | GitHub Flavored Markdown plus frontmatter, task syntax, and canonical links. |
| **Obsidian compatibility** | Any uDos-compliant vault must open in Obsidian without data loss. |
| **Canonical linking** | `[[entity]]` links resolve to entities by ID, title, or alias. |
| **Local-first** | Filesystem-first. Git-friendly. No cloud dependency. |
| **Views are projections** | UI state is never canonical. Views render from markdown + indexes. |
| **Products implement, not extend** | uDos defines the spec. Products (Linkdown, Syncdown, etc.) implement it. |

---

## 2. Markdown Canon (GFM Enhanced)

uDos adopts **GFM Enhanced v4.0.0** as its canonical markdown format. See [GFM Enhanced Specification v4.0.0](GFM_Enhanced_Specification_v4.md) for full details.

### 2.1 Core Requirements

| Requirement | Description |
|-------------|-------------|
| **GFM baseline** | All GitHub Flavored Markdown is valid. |
| **YAML frontmatter** | Optional but recommended for structured data. |
| **Obsidian Tasks syntax** | Task format with due dates, recurrence, priorities. |
| **Canonical links** | `[[entity]]` wikilinks with resolution rules. |

### 2.2 Optional Extensions (Product-Specific)

Products may add optional extensions (inline tokens, indented metadata) as long as:
- They degrade gracefully in Obsidian
- They do not break GFM compatibility
- They are documented as extensions, not core spec

---

## 3. Task Canon (Task Specification)

uDos adopts **Task Specification v4.0.0** as its canonical task format. See [Task Specification v4.0.0](TASK_SPEC_v4.md) for full details.

### 3.1 Core Requirements

| Requirement | Description |
|-------------|-------------|
| **Obsidian Tasks baseline** | All Obsidian Tasks syntax is valid. |
| **Checkbox state** | `[ ]` = open, `[x]` = completed. |
| **Due dates** | `📅 YYYY-MM-DD` |
| **Recurrence** | `🔁 every week` |
| **Priorities** | `🔺`, `🔼`, `🔽` |

### 3.2 Optional Extensions

Products may add:
- Inline tokens (`#priority/high`, `#type/write`)
- Indented metadata (`due:: 2026-04-10`)
- Contact references (`#contact/id`)
- MCP intent hints (deferred to v4.1+)

---

## 4. Contact Canon (Contact Schema)

uDos adopts **Contact Schema v4.0.0** as its canonical contact data model. See [Contact Schema v4.0.0](CONTACT_SCHEMA_v4.md) for full details.

### 4.1 Core Requirements

| Requirement | Description |
|-------------|-------------|
| **Storage** | Contacts are `.md` files with `type: contact` frontmatter. |
| **Required fields** | `id`, `type: contact`, `created`, `updated`. |
| **Core fields** | `first_name`, `last_name`, `company`, `email`, `phone`. |
| **Platform mapping** | Apple Contacts, Google Contacts, HubSpot. |

### 4.2 Product Ownership

| Product | Contact Role |
|---------|--------------|
| **Linkdown Core** | Read and display only. |
| **Linkdown Premium** | Read, write, process, workflows. |
| **Syncdown** | Full ownership (read, write, process, deduplication, Apple sync). |

---

## 5. Vault Topology

### 5.1 Core Requirements

A uDos-compliant vault has **no required folder structure**. Type is derived from frontmatter `type:` field, not file path.

### 5.2 Reserved Directories

| Directory | Purpose | Tracked |
|-----------|---------|---------|
| `.local/` | Ephemeral, machine-specific state (caches, patches, temp files) | ❌ Never commit |
| `.compost/` | Archive — never delete, always move here | ❌ Never commit |
| `.index/` or `index.db` | Derived cache (SQLite), rebuildable from vault | ⚠️ Optional |

### 5.3 Vault Seed (Recommended Structure)

New vaults should be seeded with the following **optional** structure. Products may use different structures, but this is the recommended convention:

```
Vault/                      # Root (user-named)
├── docs/                   # Notes (type: note)
├── tasks/                  # Task records (type: task)
├── entities/               # Contacts, companies (type: contact/entity)
├── tables/                 # Structured table definitions
├── feeds/                  # Generated read models
├── spools/                 # Append-only event streams
├── rules/                  # Automation rules
├── activity/               # Logs and operational snapshots
├── system/views/           # View definitions (type: view)
├── attachments/            # Binary assets
├── .local/                 # Ephemeral, untracked
├── .compost/               # Archive, untracked
└── index.db                # Derived cache
```

### 5.4 Vault Seed Principles

| Principle | Description |
|-----------|-------------|
| **Convention, not requirement** | Folders are optional. Type from frontmatter is authoritative. |
| **Portable** | Any product can read a vault regardless of folder structure. |
| **Seedable** | Products may seed new vaults with this structure as a starting point. |

### 5.5 Working Set (Binder) Health

A **working set** (or binder) is the collection of actively used files in a vault session. uDos defines health boundaries to prevent system overload and maintain responsive performance.

| Size | Status | Behaviour |
|------|--------|-----------|
| **1-10 files** | ✅ Ideal | Full context loading, fast operations, optimal UX |
| **10-20 files** | ⚠️ Acceptable | Reduced auto-loading; prioritise recent/active files |
| **20-50 files** | 🔴 Caution | Summarise inactive files; require explicit selection for deep reads |
| **50+ files** | ❌ Overload | Never flat-read; require explicit queries or pagination |

**Rules:**
- Systems should guide users toward 5-10 active files
- Never automatically read 50+ files in a single operation
- Provide tools for splitting, archiving, or summarising large binders

**Rationale:** Protects both human cognitive load and system performance. Markdown is simple; large-scale operations are not.

---

## 6. View Engine (Universal Projection Model)

### 6.1 Core Principle

> **Views are projections, not storage.**

A view is a declarative definition that describes:
- The dataset to query
- The filters to apply
- The sort order and grouping
- The layout and visible fields
- Optional presentation hints

### 6.2 View Definition Storage

Views are stored as markdown files with `type: view` frontmatter.

**Example:**

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

### 6.3 Supported Layouts (Universal)

| Layout | Purpose | Implemented By |
|--------|---------|----------------|
| `table` | Dense structured editing | Syncdown |
| `list` | Lightweight browsing | Linkdown, Syncdown |
| `board` | Kanban workflow | Syncdown |
| `timeline` | Date-based scheduling | Syncdown |
| `feed` | Activity streams | Syncdown |

### 6.4 Query Model

| Component | Description |
|-----------|-------------|
| **Source** | `collection`, `table`, `type`, `path`, `spool`, `feed` |
| **Filters** | Equality, text, numeric, date, boolean, membership |
| **Sort** | Multi-field, ascending/descending |
| **Group** | Optional grouping by field |
| **Limit** | Optional row limit |

### 6.5 Field Renderers

| Renderer | Purpose |
|----------|---------|
| `text` | Plain text |
| `markdown` | Markdown content |
| `badge` | Coloured badge |
| `tags` | Tag list |
| `date` | Date formatting |
| `datetime` | Date and time |
| `checkbox` | Boolean toggle |
| `entity_ref` | Link to entity |
| `link` | URL |
| `number` | Numeric value |
| `status` | Status indicator |

### 6.6 Writeback Rule

Views may edit source records **only when**:
- The source resolves to a canonical markdown-backed item
- The field is editable
- The renderer supports a write action

**Feed layout defaults to read-only.**

---

## 7. Entity Model

### 7.1 Core Entity Types

uDos defines **5 core entity types**. Everything else is a Note with a custom `type` value.

| Entity | Definition | Canonical Form |
|--------|------------|----------------|
| **Note** | Universal container | `.md` file, no `type` required |
| **Task** | Actionable item | `.md` with `type: task` + Task Spec syntax |
| **Contact** | Person or organization | `.md` with `type: contact` + Contact Schema |
| **Event** | Timestamped occurrence | `.md` with `type: event` + `dt-start` |
| **View** | Projection definition | `.md` with `type: view` + query + layout |

### 7.2 Required Frontmatter (All Types)

```yaml
---
id: string                    # Unique, stable identifier
type: note | task | contact | event | view
created: YYYY-MM-DDTHH:MM:SSZ
updated: YYYY-MM-DDTHH:MM:SSZ
---
```

### 7.3 Optional Frontmatter (Recommended)

```yaml
title: string                 # Display title
status: active | pending | archived | draft
tags: string[]
links: string[]               # [[canonical-links]]
owner: string
source: string                # Origin: manual, import, product-name
```

---

## 8. Deferred to v5 or Deep-Dive

The following are **explicitly out of scope** for uDos Core v4.0.0:

| Feature | Reason | Target |
|---------|--------|--------|
| **Agent Write Model (MCP)** | Spec may change during deep-dive | v4.1+ or deep-dive outcome |
| **Spatial/Grid Canon** | Not needed for v4 products | v5 |
| **MDX runtime blocks** | Requires TypeScript in markdown | v5 |
| **Real-time sync** | Product-specific (Syncdown) | Out of scope |

---

## 9. Product Compliance

| Product | Role | uDos v4.0.0 Compliance |
|---------|------|------------------------|
| **Linkdown Core** | Markdown editor, task lists, vault | ✅ Implements GFM Enhanced, Task Spec, Vault Topology |
| **Linkdown Premium** | MCP, workflows, contact processing | ✅ Implements Contact Schema (write/process) |
| **Syncdown** | Sync, automation, operational views | ✅ Implements full GFM Enhanced, View Engine, Contact Schema |

See [v4 Product Matrix](v4_PRODUCT_MATRIX.md) for detailed compliance mapping.

---

## 10. System Health Principles

uDos-compliant systems should maintain vault health automatically. These principles are **universal** — they apply to any product that reads, writes, or manages a uDos vault.

| Principle | Description | Implementation Notes |
|-----------|-------------|---------------------|
| **Clean on write** | Normalise whitespace, heading structure, and frontmatter during save operations | Preserve semantic meaning; don't rewrite aggressively |
| **Normalise structure** | Enforce canonical patterns (heading levels, list formats, task syntax) over time | Gradual, non-destructive; suggest changes before applying |
| **Detect duplicates** | Identify exact and near-duplicate content across the vault | Surface suggestions; never auto-delete; compost originals |
| **Compost, never delete** | Move superseded or replaced versions to `.compost/` with timestamp | Preserves recoverability; no data loss |
| **Scale with size** | Adapt indexing depth, parsing scope, and caching based on vault size | See Section 10.1 below |
| **Never flat-read large binders** | Follow working set rules (Section 5.5) | Enforce bounded context |

### 10.1 Resource-Aware Scaling Tiers

| Vault Size | Indexing Behaviour | Parsing Scope | Caching Strategy |
|------------|-------------------|---------------|------------------|
| **Small (<100 files)** | Full indexing | Full parse | Aggressive cache |
| **Medium (100-1,000 files)** | Selective indexing (frontmatter + tasks + links) | Parsed on demand | Prioritised cache |
| **Large (1,000+ files)** | Lazy indexing; query-based | Extract only required fields | Minimal cache; prefer direct file reads |

**Principle:** Scale behaviour with system capacity. Don't treat all vaults the same.

---

## 11. Attribution Model

uDos supports a **two-layer attribution model** to preserve provenance while protecting privacy.

### 11.1 Visible References (Safe Layer)

Stored in frontmatter or markdown body as plain text:

```yaml
---
author: Jane Smith
source: https://example.com/article
contributors: [Fred Porter, Sam Rivers]
---
```

Or in body text:
```markdown
Source: [Launch Announcement](https://example.com/article) via @janesmith
```

**Rules:**
- Visible references must not contain private data (emails, phone numbers, internal IDs)
- Any markdown renderer can display them safely
- Products may render them as citations, footnotes, or badges

### 11.2 Private Resolution Pack (Full Data Layer)

Stored separately from the visible markdown — options include:
- Sidecar file (`.meta.json` or `.attribution.json`)
- `.local/attribution/` directory
- Dedicated `attribution.db` (SQLite)

**Example private pack:**

```json
{
  "refs": [
    {
      "id": "src_01",
      "url": "https://example.com/article",
      "accessed": "2026-04-10"
    }
  ],
  "authors": [
    {
      "id": "auth_01",
      "display_name": "Jane Smith",
      "full_name": "Jane Elizabeth Smith",
      "email": "jane@example.com"
    }
  ]
}
```

### 11.3 Resolution Rules

| Use Case | Visible Ref | Private Pack | Notes |
|----------|-------------|--------------|-------|
| **Export to public** | ✅ Keep | ❌ Exclude | Strip private data |
| **Internal search** | ✅ Index | ✅ Index | Full resolution |
| **Agent context** | ✅ Include | ⚠️ Permissioned | Agents need approval for private data |
| **Sync between devices** | ✅ Sync | ⚠️ Optional | User chooses whether to sync private pack |

### 11.4 Products Supporting Attribution

| Product | Support Level |
|---------|---------------|
| **Chatdown** | Generates attribution pack on output |
| **Linkdown Core** | Displays visible refs; stores private pack (no processing) |
| **Linkdown Premium** | Full attribution resolution and query |
| **Syncdown** | May use attribution for rule triggers |

**Principle:** Attribution is preserved, privacy is respected, and the markdown remains portable.

---

## 12. References

- [GFM Enhanced Specification v4.0.0](GFM_Enhanced_Specification_v4.md)
- [Task Specification v4.0.0](TASK_SPEC_v4.md)
- [Contact Schema v4.0.0](CONTACT_SCHEMA_v4.md)
- [v4 Product Matrix](v4_PRODUCT_MATRIX.md)
- [Chatdown v4.0.0 Product Specification](CHATDOWN_v4.md)
- [Linkdown v4.0.0 Product Specification](LINKDOWN_v4.md)

---

**End of uDos Core Specification v4.0.0**