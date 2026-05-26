---
title: "Audience tags (locked)"
tags: [--public]
audience: public
slot: 5
---

# Audience tags — locked

Every document declares **who it is for** using these tags (YAML frontmatter or explicit prose in README tables).

| Tag | Audience | Visibility | Location in repo | Examples |
| --- | --- | --- | --- | --- |
| **`--public`** | Everyone (no login) | Always safe to show in public builds | `docs/public/`, repo `README.md`, `docs/specs/` | User guides, technical specs |
| **`--student`** | Learners (logged-in hub) | Learning hub / classroom bundles only | `docs/student/`, course-adjacent stubs | Tutorials, course intros |
| **`--contributor`** | Contributors (invite) | Dev portal / contributor channel | `docs/contributor/` | Architecture notes, contribution how-tos |
| **`--devonly`** | Core maintainers | Not in default public site export | `dev/` (tracked), private infra | Roadmaps, internal runbooks |
| **`--draft`** | Author only | Local or gitignored | `dev/local/` (per [dev/README.md](../../dev/README.md)) | WIP, scratch |

**Rules**

- Prefer **YAML frontmatter** at the top of each markdown file: `tags: [--public]` (or multiple tags if policy allows).
- **Publishing slot** (where it lands on disk / CDN) is separate from audience; see [publishing-slots.md](publishing-slots.md).
- **Canonical governance** for this monorepo lives under **`dev/`** (tracked). The **uDosDev** GitHub repo is an upstream archive for merges and cherry-picks, not a required parallel checkout. This table applies to **uDos `docs/`** layout.
