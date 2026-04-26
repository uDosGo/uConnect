# Linkdown protocol stack (architecture)

**Audience:** Product / engineering. **Vocabulary:** Public Linkdown docs use **GFM**, **GFM+Task**, and **YAML frontmatter** — see [SPEC_STANDARDS.md](SPEC_STANDARDS.md) and [MARKDOWN_AND_RENDERING.md](MARKDOWN_AND_RENDERING.md). This file may use **“structured context”** for the machine-readable layer; Linkdown-premium internal specs may still say **MDC** for the same idea.

Unified protocol stack: documents → tasks → structured context → MCP (premium).

⸻

1. Overview

Linkdown defines a multi-layer protocol stack for local-first knowledge, workflow, and AI interaction.

Each layer is:
	•	Composable
	•	Portable
	•	Open where possible
	•	Structured where necessary

⸻

2. The Linkdown Protocol Stack

┌──────────────────────────────┐
│        MCP (Premium)         │  ← Agent / Tool Protocol
├──────────────────────────────┤
│ Structured context (Core+)  │  ← YAML frontmatter + derived index
├──────────────────────────────┤
│     Task Forge (Core)        │  ← Task / List Protocol
├──────────────────────────────┤
│       Obsidian (Core)        │  ← Document Protocol
└──────────────────────────────┘


⸻

3. Layer 1 — Obsidian (Document Protocol)

Role

Defines how content is stored, linked, and structured as documents.

Scope
	•	Markdown files
	•	YAML frontmatter
	•	Wikilinks [[...]]
	•	Tags #tag
	•	Folder structure (Binders)
	•	Obsidian URLs

Key rule

Obsidian = file system + Markdown semantics

Linkdown alignment
	•	Fully compatible
	•	No breaking extensions
	•	All vaults remain portable

⸻

4. Layer 2 — Task Forge (Task/List Protocol)

Role

Defines how tasks and lists are represented inside Markdown.

Scope
	•	Task syntax (- [ ])
	•	Metadata blocks (due::, contact::, etc.)
	•	Task grouping via files (Lists)
	•	Inline and structured metadata

Key rule

Tasks live in Markdown, not in hidden databases

Linkdown alignment
	•	Lists = Markdown files
	•	Tasks = parsed and indexed
	•	No proprietary task storage

⸻

5. Layer 3 — Structured context (YAML frontmatter + index)

Role

Provides structured, machine-readable context for:
	•	AI
	•	workflows
	•	indexing
	•	linking
	•	automation

Scope
	•	YAML frontmatter extension
	•	structured entities
	•	typed schemas
	•	relational references

Structure (illustrative YAML — not a user-facing “MDC file format”)

context:
  entity: contact
  schema: v1
  context:
    company: Venue Co
    role: Promoter

Key rule

Structured YAML frontmatter extends Markdown without breaking it

Linkdown alignment
	•	Optional but first-class
	•	Enables CRM, feeds, workflows
	•	Bridges human and machine layers

⸻

6. Layer 4 — MCP (Agent / Tool Protocol) [Premium]

Role

Defines how AI agents interact with the vault safely.

Scope
	•	Tool definitions
	•	Input/output schemas
	•	permissions
	•	audit logging
	•	workflow execution
	•	automation orchestration

Tool categories

vault.*
note.*
list.*
task.*
contact.*
feed.*
spool.*
workflow.*
publish.*
github.*
system.*

Key rule

MCP never bypasses the vault — it operates on it


⸻

7. Layer Responsibilities

Layer	Responsibility
Obsidian	Documents, links, structure
Task Forge	Tasks, lists, execution units
Structured context	YAML metadata + relationships
MCP	Actions, automation, AI interaction


⸻

8. Data Flow Model

User writes Markdown
        ↓
Obsidian layer stores content
        ↓
Task Forge extracts tasks
        ↓
Frontmatter adds structured context
        ↓
Index builds searchable model
        ↓
MCP exposes tools to AI
        ↓
AI performs safe, logged actions
        ↓
Changes written back to Markdown / vault


⸻

9. Canonical Truth Model

Markdown files = canonical human truth
YAML frontmatter = canonical structured context
Databases / index = derived performance layer
MCP = controlled execution layer


⸻

10. Compatibility Guarantees

Obsidian compatibility
	•	Vault opens unchanged
	•	Notes remain readable/editable
	•	No lock-in

Markdown compatibility
	•	Works in GitHub, editors, etc.
	•	No proprietary syntax required

Task compatibility
	•	Tasks readable anywhere
	•	Task Forge-style metadata is additive

⸻

11. Extension Philosophy

Linkdown follows:

Extend → never replace
Structure → never hide
Index → never own the truth


⸻

12. Premium Boundary

Linkdown Core (Open)
	•	Obsidian protocol
	•	Task Forge protocol
	•	YAML frontmatter
	•	Vault + lists + contacts
	•	Index + local system

Linkdown Premium
	•	MCP runtime
	•	tool orchestration
	•	workflows
	•	automation
	•	GitHub publishing
	•	CRM intelligence
	•	audit + permissions

⸻

13. System Identity

Linkdown is not:
	•	just a Markdown editor
	•	just a notes app
	•	just a task manager
	•	just a CRM

Linkdown is:

A protocol-driven local operating system for knowledge, workflows, and AI


⸻

14. Strategic Positioning

Obsidian = document layer
Task Forge = task layer
Structured context = data layer
MCP = action layer

Combined:

Linkdown = unified system layer


⸻

15. Final Principle

Everything is a file.
Everything is structured.
Everything is accessible.
Everything is controllable.


⸻

16. One-line summary

Linkdown turns Markdown into a fully structured, AI-operable system without breaking its simplicity.


⸻

The next doc to write would be:

👉 LINKDOWN_ARCHITECTURE_DIAGRAM.md (ASCII system diagram)

That would visualise:
	•	Vault
	•	Index
	•	MCP layer
	•	UI (structured views / metadata)
	•	GitHub sync
	•	Local filesystem

And tie everything together visually.