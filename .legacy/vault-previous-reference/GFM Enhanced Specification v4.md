# GFM Enhanced Specification v4.0

**Version:** 4.0.0  
**Status:** Locked (refinable)  
**Base Standard:** [GitHub Flavored Markdown (GFM)](https://github.github.com/gfm/)  
**File Extension:** `.md`  
**Principle:** Everything that works in GFM works in GFM Enhanced. We only add, never break.

---

## 1. Purpose

GFM Enhanced defines a **universal markdown format** for uDos-compatible systems. It is:

- **100% GFM compatible** — every valid GFM document is valid GFM Enhanced
- **Obsidian-compatible** — vaults open in Obsidian without data loss
- **Extensible** — adds frontmatter, task syntax, and canonical links
- **Portable** — works in any markdown editor, on any platform

GFM Enhanced is **not** a new file format. It is GFM plus **optional structured features** that plain markdown renderers safely ignore.

---

## 2. Core Principles

| Principle | Meaning |
|-----------|---------|
| **GFM first** | All GFM syntax is valid. No breaking changes. |
| **Additive only** | New features are optional. They never break existing parsers. |
| **Human-readable** | Even with extensions, the raw markdown should be readable. |
| **Obsidian-safe** | Every GFM Enhanced document opens in Obsidian without errors. |
| **No runtime code** | Executable blocks (`.mdx`) are out of scope for v4. |

---

## 3. What GFM Enhanced Adds

GFM Enhanced adds **three optional features** to baseline GFM:

| Feature | Syntax | Purpose |
|---------|--------|---------|
| **YAML frontmatter** | `---` ... `---` at file top | Structured metadata (type, status, dates, tags) |
| **Obsidian Tasks syntax** | `- [ ]` with emoji dates | Due dates, recurrence, priorities, queries |
| **Canonical links** | `[[entity]]` | Obsidian-style wikilinks with resolution rules |

All three features are **ignored** by standard GFM renderers (GitHub, etc.) but **parsed** by uDos-compatible tools.

---

## 4. YAML Frontmatter

Frontmatter is **optional** but **recommended** for structured data.

### 4.1 Syntax

```yaml
---
key: value
list: [one, two]
nested:
  subkey: subvalue
---
```

**Rules:**
- Must be at the very top of the file
- Must be valid YAML
- Must start and end with `---` on their own lines
- Everything after the closing `---` is normal markdown

### 4.2 Canonical Fields (Recommended)

| Field | Type | Meaning |
|-------|------|---------|
| `type` | string | Entity type: `note`, `task`, `contact`, `event`, `view`, `workflow` |
| `title` | string | Display title (overrides filename) |
| `status` | string | `active`, `pending`, `archived`, `draft` |
| `tags` | array | List of tags as strings |
| `created` | date | ISO 8601 creation date |
| `updated` | date | ISO 8601 last update date |
| `source` | string | Origin: `manual`, `import`, or system identifier |
| `owner` | string | Owner identifier |
| `links` | array | List of `[[canonical-links]]` |

### 4.3 Example

```yaml
---
type: task
title: Launch Preparation
status: active
tags: [project, launch]
created: 2026-04-10
updated: 2026-04-10
source: manual
owner: fred
links: [[project-launch]], [[contact:jane]]
---
```

**Compatibility:** Obsidian displays frontmatter collapsed. GitHub renders it as a code block. Neither breaks.

---

## 5. Task Syntax (Obsidian Tasks)

GFM Enhanced adopts the **Obsidian Tasks** syntax for task management. See the [Task Specification v4.0](TASK_SPEC_V4.md) for full details.

### 5.1 Basic Syntax

```markdown
- [ ] Call Sam about launch
- [x] Completed task
- [ ] Call Sam 📅 2026-04-10
- [ ] Call Sam 🔁 every week 📅 2026-04-10
- [ ] 🔺 High priority task
```

### 5.2 Optional Extensions (uDos-specific)

uDos-compatible systems may also support:

**Inline tokens:**
```markdown
- [ ] Draft proposal #priority/high #type/write #due/2026-04-14
```

**Indented metadata:**
```markdown
- [ ] Refactor parser
  ↳ scope:: src/parser.ts
  ↳ outcome:: remove legacy code
  ↳ estimate:: 2h
```

**Contact references:**
```markdown
- [ ] Follow up with George #contact/cnt_01
```

**Spatial metadata:**
```markdown
- [ ] Place marker #loc/L305-DA11
```

**MCP hints:**
```markdown
- [ ] Deploy #type/publish #mcp/deploy.trigger
```

**Compatibility:** Obsidian Tasks ignores all extensions. Vanilla Obsidian shows them as plain text. No breakage.

---

## 6. Canonical Links

GFM Enhanced supports **Obsidian-style wikilinks** as the canonical linking mechanism.

### 6.1 Basic Syntax

```markdown
See [[project-launch]] for details
Reference [[contact:jane-doe]]
Link to [[note:2026-04-10-daily-log]]
```

### 6.2 Resolution Rules

| Link Format | Resolves To |
|-------------|-------------|
| `[[entity-name]]` | Entity by ID, title, or alias |
| `[[type:id]]` | Entity with matching type and ID |
| `[[path/to/file]]` | File at relative path |
| `[[alias\|display]]` | Alias with custom display text |

### 6.3 Resolution Order

1. Exact ID match (if entity has `id` in frontmatter)
2. Title match (case-insensitive)
3. Alias match (from `aliases` frontmatter array)
4. Filename match (without extension)
5. Path match (relative to vault root)

**Rule:** Link resolution is **deterministic**. The same link in the same vault always resolves to the same target.

**Compatibility:** Obsidian handles wikilinks natively. GitHub renders them as plain text `[[...]]`. No breakage.

---

## 7. Validation Rules

A valid GFM Enhanced document MUST:

1. Be valid GFM
2. Have no syntax errors in YAML frontmatter (if present)
3. Open in Obsidian without errors

A valid GFM Enhanced document MAY:

1. Include YAML frontmatter
2. Include Obsidian Tasks syntax
3. Include canonical links
4. Include optional extensions (tokens, indented metadata, etc.)

A valid GFM Enhanced document MUST NOT:

1. Require custom parsing to be human-readable
2. Break when opened in GitHub or Obsidian
3. Hide canonical data in non-standard locations

---

## 8. What GFM Enhanced Is NOT

| Not This | Because |
|----------|---------|
| A new file extension | `.md` files only in v4 |
| A replacement for GFM | GFM is the baseline |
| A runtime format | No executable blocks (`.mdx` is v5+) |
| Obsidian-incompatible | All features degrade safely |
| A database | Everything is plain text |

---

## 9. Examples

### 9.1 Minimal GFM Enhanced (Pure GFM)

```markdown
# My Note

This is plain GFM. It's also valid GFM Enhanced.
```

### 9.2 With Frontmatter

```markdown
---
type: note
title: My Note
created: 2026-04-10
tags: [example, documentation]
---

# My Note

This note has structured metadata.
```

### 9.3 With Tasks

```markdown
---
type: task
title: Project Tasks
---

# Project Tasks

- [ ] Call Sam 📅 2026-04-15
- [ ] Draft proposal #priority/high #type/write
- [ ] Review design
  ↳ due:: 2026-04-12
  ↳ owner:: jane
```

### 9.4 With Links

```markdown
---
type: note
links: [[project-launch]], [[contact:sam]]
---

See [[project-launch]] for the overall plan.
Contact [[sam]] if you have questions.
```

---

## 10. Compatibility Matrix

| Feature | GitHub | Obsidian (vanilla) | Obsidian Tasks | uDos Tools |
|---------|--------|-------------------|----------------|------------|
| GFM baseline | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| YAML frontmatter | ✅ Renders as code | ✅ Collapsed view | ✅ Collapsed view | ✅ Parsed |
| Obsidian Tasks syntax | ⚠️ Plain text | ✅ Renders | ✅ Full | ✅ Full |
| Inline tokens (`#key/value`) | ⚠️ Plain text | ⚠️ Plain text | ⚠️ Ignored | ✅ Parsed |
| Indented metadata | ⚠️ Plain text | ⚠️ Plain text | ⚠️ Ignored | ✅ Parsed |
| Canonical links `[[link]]` | ⚠️ Plain text | ✅ Resolves | ✅ Resolves | ✅ Resolves |

**Legend:** ✅ Full support | ⚠️ Degrades gracefully (no breakage)

---

## 11. Relationship to Other Specs

| Spec | Relationship |
|------|--------------|
| **GFM** | Baseline. Every GFM Enhanced document is valid GFM. |
| **Obsidian Tasks** | Task syntax adopted as-is. Extensions are additive. |
| **Task Specification v4.0** | Defines task syntax in detail. GFM Enhanced references it. |
| **uDos Core Spec v4.0** | Defines vault topology, agents, views. GFM Enhanced is the file format. |
| **MDX (future)** | Runtime blocks. Out of scope for v4. |

---

## 12. One-Line Summary

> **GFM Enhanced is GitHub Flavored Markdown plus optional YAML frontmatter, Obsidian Tasks syntax, and canonical links — all in `.md` files, fully compatible with Obsidian and every GFM renderer.**

---

## 13. References

- [GitHub Flavored Markdown Spec](https://github.github.com/gfm/)
- [Obsidian Tasks User Guide](https://publish.obsidian.md/tasks/)
- [Task Specification v4.0](TASK_SPEC_V4.md)
- [uDos Core Specification v4.0](UDOS_CORE_SPEC_V4.md)

---

**End of GFM Enhanced Specification v4.0**