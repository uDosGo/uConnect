# Task Specification v4.0

**Version:** 4.0.0  
**Status:** Locked (refinable)  
**Base Standard:** [Obsidian Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks)  
**File Format:** GFM Enhanced (`.md` files)  
**Principle:** Human clarity first. Machine richness second.

> **Naming — Obsidian Task Format vs Task Forge:** The **syntax** for task lines in markdown is **Obsidian Task Format** — baseline **[Obsidian Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks)** (see [User Guide](https://publish.obsidian.md/tasks/)). **Task Forge** is the family name for **repo task tracking** (`TASKS.md`, checkbox ids such as `[UDEV-R00]` in dev repos). It is **not** a different task grammar: it is how we batch engineering work in git. Optional uDos extensions on a task line remain valid Obsidian Tasks lines with extra tokens that standard parsers may ignore.
>
> **Canonical copy (git):** [`uDosConnect/uDosDev/docs/specs/v4/TASK_SPEC_v4.md`](https://github.com/fredporter/uDosDev/blob/main/docs/specs/v4/TASK_SPEC_v4.md) — edit there first, then refresh this note if you mirror it in Obsidian.

---

## 1. Purpose

This specification defines a **markdown-native task format** that:

- Works in any GFM-compatible editor (Obsidian, GitHub, any markdown viewer)
- Supports due dates, recurrence, priorities, and metadata
- Extends Obsidian Tasks with optional structured metadata, contact references, and MCP hints
- Remains human-readable and machine-parseable
- Serves as the shared task protocol across uDos-compatible systems

---

## 2. Core Principles

| Principle | Meaning |
|-----------|---------|
| **Markdown is canonical** | The task line is the source of truth. Parsers derive state; they don't replace it. |
| **Obsidian Tasks first** | All Obsidian Tasks syntax is valid. |
| **Extensions are additive** | Optional extensions never break existing parsers. |
| **Human clarity first** | If a task line is ugly, you're doing it wrong. |

---

## 3. Base Standard: Obsidian Tasks

This specification adopts the **Obsidian Tasks** syntax as its baseline. Everything in the [Obsidian Tasks User Guide](https://publish.obsidian.md/tasks/) is valid.

### 3.1 Supported Obsidian Tasks Features

| Feature | Syntax | Example |
|---------|--------|---------|
| Basic task | `- [ ]` | `- [ ] Call Sam` |
| Completed task | `- [x]` | `- [x] Call Sam` |
| Due date | `📅 YYYY-MM-DD` | `- [ ] Call Sam 📅 2026-04-10` |
| Scheduled date | `⏳ YYYY-MM-DD` | `- [ ] Call Sam ⏳ 2026-04-10` |
| Recurrence | `🔁 every week` | `- [ ] Call Sam 🔁 every week 📅 2026-04-10` |
| Priority | `🔺`, `🔼`, `🔽` | `- [ ] 🔺 Call Sam` |
| Global filter | `#task` | `- [ ] #task Call Sam` |
| Queries | ````tasks ... ```` | See Obsidian Tasks docs |

### 3.2 What We Preserve

- **Checkbox state** (`[ ]` / `[x]`) is canonical for completion
- **Due dates** use the `📅` emoji
- **Recurrence** uses the `🔁` emoji
- **Global filters** use `#task` (or any other tag)

---

## 4. Optional Extensions

The following **optional extensions** may be used by uDos-compatible systems. All extensions degrade gracefully — they are ignored by Obsidian Tasks but may be parsed by other tools.

### 4.1 Inline Tokens (Compact Metadata)

Inline tokens keep metadata on the same line as the task. Format: `#key/value`

| Token | Meaning | Example |
|-------|---------|---------|
| `#priority/low|medium|high|critical` | Priority level | `#priority/high` |
| `#type/action|review|decision|research|write|publish|followup` | Task type | `#type/write` |
| `#status/draft|active|blocked|waiting|done` | Status override | `#status/blocked` |
| `#due/YYYY-MM-DD` | Due date (alternative to `📅`) | `#due/2026-04-10` |
| `#owner/name` | Task owner | `#owner/fred` |
| `#estimate/30m|2h` | Time estimate | `#estimate/30m` |
| `#context/name` | Context (project, tool, app) | `#context/launch` |
| `#contact/id` | Linked contact | `#contact/cnt_01` |
| `#loc/PlaceRef` | Spatial location | `#loc/L305-DA11` |
| `#mcp/intent` | MCP intent hint | `#mcp/document.draft` |

**Example:**
```markdown
- [ ] Draft launch proposal #priority/high #type/write #due/2026-04-14 #owner/self
```

**Token density rule:** Use 0-3 tokens per task normally. 4-6 only when necessary.

### 4.2 Indented Metadata (Structured Details)

For tasks with 3+ tokens or multi-line context, use indented `key:: value` lines.

**Supported keys:**

| Key | Meaning | Example |
|-----|---------|---------|
| `due::` | Due date | `due:: 2026-04-10` |
| `priority::` | Priority | `priority:: high` |
| `type::` | Task type | `type:: write` |
| `status::` | Status override | `status:: blocked` |
| `owner::` | Task owner | `owner:: fred` |
| `estimate::` | Time estimate | `estimate:: 30m` |
| `context::` | Context | `context:: launch` |
| `contact::` | Linked contact ID | `contact:: cnt_01` |
| `loc::` | Spatial location | `loc:: L305-DA11` |
| `scope::` | File/module scope | `scope:: src/parser.ts` |
| `outcome::` | Definition of done | `outcome:: supports dynamic columns` |
| `depends::` | Dependency task ID | `depends:: TASK-001` |
| `notes::` | Additional context | `notes:: see design doc for details` |

**Example:**
```markdown
- [ ] Refactor grid renderer
  ↳ scope:: src/renderer/grid.ts
  ↳ outcome:: supports variable column widths
  ↳ depends:: TASK-001
  ↳ estimate:: 2h
  ↳ notes:: keep existing API unchanged
```

**Indentation rule:** Use 2 spaces or a tab. The `↳` character is optional but recommended for visual clarity.

### 4.3 Contact References

Contacts are stored as markdown files with YAML frontmatter:

```yaml
---
type: contact
id: cnt_01
first_name: George
last_name: Rivers
company: Venue Co
email: george@venue.co
---
```

Reference a contact in a task using:

**Inline token:**
```markdown
- [ ] Follow up with George #contact/cnt_01 #type/followup
```

**Indented metadata:**
```markdown
- [ ] Follow up with George
  ↳ contact:: cnt_01
  ↳ due:: 2026-04-16
```

### 4.4 MCP Intent Hints

MCP hints suggest to the orchestration layer what kind of action this task represents.

**Standard `#type/` values and their MCP mappings:**

| Type | MCP Intent | Description |
|------|-----------|-------------|
| `#type/write` | `document.draft` | Draft new content |
| `#type/review` | `review.inspect` | Review existing content |
| `#type/research` | `research.query` | Gather information |
| `#type/publish` | `publish.dispatch` | Publish to target |
| `#type/decision` | `decision.record` | Make a decision |
| `#type/followup` | `followup.remind` | Follow up on something |
| `#type/action` | `action.execute` | Generic action |

**Explicit MCP hint:**
```markdown
- [ ] Deploy to production #type/publish #mcp/deploy.trigger
  ↳ target:: aws
  ↳ environment:: prod
```

**Rule:** MCP hints are **suggestions only**. The orchestration layer may ignore them.

### 4.5 Spatial Metadata

For tasks with a spatial location (maps, grids, surfaces), use:

```markdown
- [ ] Place marker on map #loc/EARTH:SUR:L305-DA11
```

Or with indented metadata:
```markdown
- [ ] Place marker on map
  ↳ loc:: EARTH:SUR:L305-DA11
  ↳ layer:: 2
```

### 4.6 Workflow Steps

Ordered lists with task syntax represent workflow steps:

```markdown
# Launch Workflow

1. [ ] Review current assets #type/review
2. [ ] Draft launch brief #type/write #due/2026-04-14
3. [ ] Confirm timeline #type/decision
4. [ ] Publish plan #type/publish
```

**Frontmatter for workflow pages:**
```yaml
---
type: workflow
title: Launch Workflow
status: active
workflow_mode: sequential
---
```

---

## 5. Validation Rules

A valid task MUST:

1. Begin with a GFM checkbox: `- [ ]` or `- [x]`
2. Have readable text after the checkbox
3. Remain valid markdown after any parsing

A valid task MAY:

1. Include Obsidian Tasks emoji dates (`📅`, `⏳`, `🔁`)
2. Include inline tokens (`#key/value`) — ignored by Obsidian
3. Include indented metadata (`key:: value`) — ignored by Obsidian

A valid task MUST NOT:

1. Hide canonical state in a database
2. Require a parser to be understood by a human
3. Break when opened in Obsidian

---

## 6. Examples

### 6.1 Minimal Task (Pure GFM)

```markdown
- [ ] Call Sam about launch
```

### 6.2 Obsidian Tasks Only

```markdown
- [ ] Call Sam about launch 📅 2026-04-10 🔁 every week
```

### 6.3 With Optional Inline Tokens

```markdown
- [ ] Call Sam about launch #priority/high #type/followup #due/2026-04-10 #contact/cnt_01
```

### 6.4 With Optional Indented Metadata

```markdown
- [ ] Call Sam about launch
  ↳ due:: 2026-04-10
  ↳ priority:: high
  ↳ type:: followup
  ↳ contact:: cnt_01
  ↳ notes:: Confirm venue availability
```

### 6.5 Complex Workflow Task

```markdown
- [ ] Implement grid renderer
  ↳ scope:: src/renderer/grid.ts
  ↳ outcome:: supports 80x30 viewport with 16x24 tiles
  ↳ depends:: TASK-013
  ↳ estimate:: 4h
```

---

## 7. Compatibility Guarantees

| Tool | Compatibility | Notes |
|------|--------------|-------|
| **Obsidian (vanilla)** | ✅ Full | Extensions appear as plain text; no breakage |
| **Obsidian Tasks plugin** | ✅ Full | All base syntax works; extensions ignored |
| **GitHub Markdown** | ✅ Full | Renders as task lists; extensions visible but harmless |
| **uDos-compatible systems** | ✅ Full | May parse extensions |

---

## 8. Future Extensions (v5+)

The following are **reserved** for future versions and not required for v4 compliance:

| Feature | Proposed Syntax | Status |
|---------|----------------|--------|
| Dependency tokens | `#after/task_01` | Reserved |
| Recurrence rules | `#repeat/weekly` | Reserved (use Obsidian Tasks `🔁`) |
| Automation hints | `#tool/publish` | Reserved |
| File references | `#page/page_02` | Reserved |

---

## 9. One-Line Summary

> **This specification defines Obsidian Tasks as the base task format, with optional extensions for structured metadata, contact references, spatial location, and MCP hints — all in `.md` files, with markdown as the source of truth.**

---

## 10. References

- [Obsidian Tasks User Guide](https://publish.obsidian.md/tasks/)
- [Obsidian Tasks GitHub Repository](https://github.com/obsidian-tasks-group/obsidian-tasks)
- [GFM Enhanced Specification](https://pb.inkdown.me/inkdown/book/docs/Docs/Introduction)

---

**End of Task Specification v4.0**

---
