# Linkdown — product model (locked)

**Status:** architecture lock-in for vault, narrative layer, and product split.  
**Spelling:** **Obsidian** (not “Obsedian”), **canonical** (not “cananconical”).

**Spec v1 (V22):** Canonical vault layout, frontmatter vocabulary, view engine, and indexing stance live under `docs/V22_*.md` and `docs/INDEXING_ENGINE.md`. Older v2.1 companion specs live under [archive/legacy-v21/](archive/legacy-v21/README.md); [V21_VAULT_SCHEMA.md](V21_VAULT_SCHEMA.md) stays at repo root for the binder tree.

## Truth model (Spec v1)

1. **Canonical truth** — markdown files in the vault (frontmatter + body), stable `id`s.
2. **Derived runtime** — `.linkdown/index.db` and caches; rebuildable from the vault; **not** authoritative.
3. **Operational machine-native** — JSON (or append-only logs) for spools/feeds where structured streams are appropriate; still subordinate to documented vault contracts.

## Core product model

Linkdown is a **local-first vault app** with four native data classes:

- Markdown notes
- Tasks
- Contacts
- Feeds / spools / dates

And three structural concepts:

- **Vault layout** — typed folders (`docs/`, `tasks/`, `entities/`, … per `V22_VAULT_SCHEMA.md`); legacy “binders” in V21 map to folders under Spec v1
- **Canonical links** — Obsidian-style wikilinks plus stable URI tags
- **Workspace data layer** — table/list/board/timeline views over vault entities ([V22_VIEW_ENGINE.md](V22_VIEW_ENGINE.md))

## Canonical rule

**Authoritative data** is markdown on disk. SQLite in `.linkdown/index.db` is a **derived index** for queries and views. Legacy or auxiliary stores (e.g. older `contacts.db` patterns) should converge on entity markdown + index, not parallel “app truth.”

Linkdown is not “markdown-only” as a UX statement; as a **storage contract**, Spec v1 is markdown-first with a derived index.

## Release mapping

- **v2.1**: vault schema, frontmatter parser, binder=folder, task parsing/index, canonical IDs/URLs, contacts.db, workflow/MCP JSON, feed/spool storage.
- **v2.2**: MCP integration over notes/contacts/tasks/feed-spools/date context.
- **v2.3**: Studio data views (table/list/board/timeline, entity panels, feed/spool dashboards).
- **v2.4**: GitHub integration/publishing for selected binder trees.

## Architecture lock-in

**Contacts are structured records with Markdown note companions. Tasks are Markdown-native. Dates are derived views over dated vault objects.**

## Normative schemas

**Current (Spec v1 / V22):**

- `docs/V22_VAULT_SCHEMA.md`
- `docs/V22_FRONTMATTER_SCHEMA.md`
- `docs/V22_VIEW_ENGINE.md`
- `docs/INDEXING_ENGINE.md` (derived `index.db` schema, watcher, FTS, spools)

**Legacy / migration reference:**

- `docs/V21_VAULT_SCHEMA.md` (binder tree — active)
- `docs/archive/legacy-v21/V21_FRONTMATTER_SCHEMA.md`
- `docs/archive/legacy-v21/V21_CONTACTS_DB_SCHEMA.md`
- `docs/archive/legacy-v21/V21_SYSTEM_RULES.md`

## Split contract

- **Linkdown** = workspace/editor/publishing/MCP environment (public fork; see [V30_FREE_PREMIUM_BOUNDARY.md](V30_FREE_PREMIUM_BOUNDARY.md) for v3+ free vs premium).
- **Linkdown-premium** = paid extension for premium runtime, workflows, and advanced publishing.
- **Syncdown** = system sync/automation/control app (Swift, always-on).
- All interoperate through the shared vault only.
