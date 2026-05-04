---
title: "Documentation and style policy (A1 locked)"
tags: [--public]
audience: public
slot: 5
---

# Documentation and style policy (A1 locked)

**Principles**

1. **Every doc has a tag.** Audience and publishing intent are explicit (see [specs/audience-tags.md](specs/audience-tags.md) and [specs/publishing-slots.md](specs/publishing-slots.md)).
2. **Every tag has an audience.** Folder layout mirrors visibility: `docs/public/`, `docs/student/`, `docs/contributor/`, plus `dev/` for `--devonly` and `dev/local/` for `--draft`.
3. **Every UI is a text code block.** **Open Box Format (OBF)** only: if it is not in a markdown fenced block, it is not open box (see [specs/open-box-format.md](specs/open-box-format.md)).

**Audience boundaries (locked)**

- **Public** docs do **not** depend on or link to **dev-only** internal plans as required reading.
- **Student** docs may **reference public** specs and guides; public docs **must not** assume enrollment or link *only* to student-only paths for core definitions.
- **`docs/specs/`** is **public** (open box / technical truth).
- **Dev-only** material is excluded from public site builds and must not leak secrets into `docs/public/` or `docs/student/`.

**VA1 anchors**

- Style guide: [specs/va1-style-guide.md](specs/va1-style-guide.md)
- Command reference: [public/ucode-commands.md](public/ucode-commands.md)
- Maintenance: [DOCUMENTATION-MAINTENANCE.md](DOCUMENTATION-MAINTENANCE.md)

**Where to read the full rules**

| Topic | Spec |
| --- | --- |
| Audience tags | [specs/audience-tags.md](specs/audience-tags.md) |
| Publishing slots 0–7 + Apple colours | [specs/publishing-slots.md](specs/publishing-slots.md) |
| OBF blocks (`obf`, `obf-style`, `grid`, …) | [specs/open-box-format.md](specs/open-box-format.md) |
| Example OBF components | [specs/obf-components.md](specs/obf-components.md) |
| Teletext grid (text) | [specs/grid-spec.md](specs/grid-spec.md) |
| Pixel / QR / cube maths | [specs/grid-cell-cube-maths.md](specs/grid-cell-cube-maths.md) |
| Display sizes (text + pixel) | [specs/display-sizes.md](specs/display-sizes.md) |
| Fonts (Monaspace, OBF, CDN) | [specs/font-system-obf.md](specs/font-system-obf.md) |
| Style tokens (wireframe) | [specs/style-guide-obf.md](specs/style-guide-obf.md) |
| **VA1 style guide (consolidated)** | [specs/va1-style-guide.md](specs/va1-style-guide.md) |
| **`udo` command reference** | [public/ucode-commands.md](public/ucode-commands.md) |
| **OBF Grid** | [specs/obf-grid-spec.md](specs/obf-grid-spec.md) |
| **Vault workspaces** (`@` / `#` / `.local`) | [specs/vault-workspaces.md](specs/vault-workspaces.md) |
| **Markdownify MCP** (A1 spec + A2 wiring) | [specs/markdownify-integration.md](specs/markdownify-integration.md) |
| **Feeds and spool** (A1 foundation → A2) | [specs/feeds-and-spool.md](specs/feeds-and-spool.md) |
| **CommonMark reference** | [specs/commonmark-reference.md](specs/commonmark-reference.md) |
| **Docker integration patterns** | [specs/docker-integration.md](specs/docker-integration.md) |
| **Vector DB research (WordPress)** | [specs/vector-db-research.md](specs/vector-db-research.md) |

**Templates** with sample frontmatter: [templates/](templates/).

**Landings**

- **Public:** [public/README.md](public/README.md)
- **Student:** [student/README.md](student/README.md)
- **Contributor:** [contributor/README.md](contributor/README.md)
