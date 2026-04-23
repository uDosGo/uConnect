---
title: "Documentation maintenance workflow"
tags:
  - "--public"
audience: public
slot: 5
---

# Documentation maintenance workflow

## When to update

| Doc type | Triggers |
| --- | --- |
| **A1 repo map** ([A1-structure-locked.md](A1-structure-locked.md)) | New top-level folders, npm workspaces, or VS Code workspace roots |
| **Pre-v5 family notes** ([roadmap/pre-v5-family-notes.md](roadmap/pre-v5-family-notes.md)) | Changes to **PRE5-R01–R07** order or execution-rounds snapshot under **`dev/workflow/imported/`** |
| **VA1 style guide** ([specs/va1-style-guide.md](specs/va1-style-guide.md)) | UI tokens, colours, grid maths, fonts |
| **Command reference** ([public/ucode-commands.md](public/ucode-commands.md)) | New/changed `udo` commands, env vars, flags |
| **Specs** (`docs/specs/`) | Technical contract changes (OBF, grid, fonts) |

## Who updates

| Area | Typical process |
| --- | --- |
| **Public** (`docs/public/`, `docs/specs/`) | Contributors via PR |
| **Student** (`docs/student/`) | Contributors via PR; may reference public docs |
| **Dev-only** (`dev/`, private) | Core team; **not** linked from public student-facing pages |

## Review checklist

1. Edit on a branch; keep **audiences separated** (see [documentation-policy.md](documentation-policy.md)).
2. Run **`udo doctor`** after workspace/build changes.
3. Preview static output if relevant: **`udo publish preview`** (vault content).
4. Open PR; merge after review.
5. Deploy mirrors per your hosting (not automated by this repo alone).

**Note:** Public docs are the **source of truth** for VA1 CLI summaries; student docs **may link to** public docs but must not require contributor-only paths for core learning flows.
