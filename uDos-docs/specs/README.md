---
title: "Technical specifications index"
tags: [--public]
audience: public
slot: 5
---

# Technical specifications (`docs/specs/`)

Locked reference material for **Open Box Format (OBF)**, **grid**, **display sizes**, **audience tags**, and **publishing slots**. All files here are **`--public`** (technical, no login required to read the spec text).

## v1.4 (Alpha) Specifications

See [v4/README.md](v4/README.md) for **spatial algebra**, **Tower of Knowledge**, and **uCell ↔ voxel mapping**.

| Spec | Purpose |
| --- | --- |
| [va1-style-guide.md](va1-style-guide.md) | **VA1** consolidated style (colours, type, grid summary, OBF UI) |
| [obf-grid-spec.md](obf-grid-spec.md) | **OBF Grid** (` ```grid`), **`udo grid`**, module **`@udos/obf-grid`** |
| [obf-spec.md](obf-spec.md) | Alias → [open-box-format.md](open-box-format.md) |
| [font-system.md](font-system.md) | Alias → [font-system-obf.md](font-system-obf.md) |
| [usxd-spec.md](usxd-spec.md) | USXD index → templates + commands |
| [audience-tags.md](audience-tags.md) | Audience tags: `--public`, `--student`, `--contributor`, `--devonly`, `--draft` |
| [publishing-slots.md](publishing-slots.md) | Slots **0–7** + Apple file colours + frontmatter |
| [open-box-format.md](open-box-format.md) | OBF: `obf`, `obf-style`, `grid`, `usxd`, `template` code blocks |
| [obf-components.md](obf-components.md) | Example OBF components (button, card, form) |
| [obf-ui-blocks.md](obf-ui-blocks.md) | OBF UI authoring blocks (`COLUMNS`, `CARD`, `TABS`, `ACCORDION`) |
| [grid-spec.md](grid-spec.md) | Teletext **text** grid: 2×6 chars, 12×12 default |
| [grid-cell-cube-maths.md](grid-cell-cube-maths.md) | **Pixel/QR** cell (24×24 default), cube, bricks, size variants |
| [display-sizes.md](display-sizes.md) | Text-terminal profiles + **pixel cell** table |
| [font-system-obf.md](font-system-obf.md) | Monaspace, OBF font sources, CDN, **`udo font`** |
| [style-guide-obf.md](style-guide-obf.md) | Wireframe style tokens in **`obf-style`** form |
| [workflow-network-a1-a2.md](workflow-network-a1-a2.md) | A1 local workflow vs A2 always-on server/network split |
| [usxd-ascii-blocks.md](usxd-ascii-blocks.md) | USXD ASCII surface authoring reference |
| [a1-a2-boundary.md](a1-a2-boundary.md) | Locked A1/A2 boundary matrix and precedence |
| [LOCKED-REGISTRY.md](LOCKED-REGISTRY.md) | Source-of-truth lock registry + exception whitelist |
| [version-ladder-a1-a2.md](version-ladder-a1-a2.md) | Locked A1/A2 version ladder (A1.0→A2.1) |
| [version-mapping-a1.md](version-mapping-a1.md) | A1 release mapping guidance (1.0→1.3 alignment) |
| [vault-workspaces.md](vault-workspaces.md) | `@` / `#` workspaces, `.local/`, compost — **A2+** model; VA1 init scaffold |
| [markdownify-integration.md](markdownify-integration.md) | MarkItDown / MCP integration path (A1 spec, A2 implementation) |
| [feeds-and-spool.md](feeds-and-spool.md) | Feeds (watchers) + spools (text processors); `.local/*.yaml` model |
| [commonmark-reference.md](commonmark-reference.md) | CommonMark canonical links + uDos markdown pointers |
| [docker-integration.md](docker-integration.md) | Docker use patterns for uDos (A2/A3) |
| [vector-db-research.md](vector-db-research.md) | Foam → vector / WordPress cloud (A3 planning) |
| [usxd-go.md](usxd-go.md) | USXD-GO draft architecture (CHASIS/WIDGET/SKIN/LENS) |
| [usxd-story-format.md](usxd-story-format.md) | Story surface spec: step schema, keyboard rules, panel taxonomy, theme adapters |
| [usxd-story-schema.json](usxd-story-schema.json) | JSON Schema artifact for `application/vnd.usxd.story` envelopes (non-Go tooling) |
| [uos-launcher.md](uos-launcher.md) | UOS launcher operator contract (runtime, GPU profiles, passthrough, smoke gate) |

Parent policy overview: [../documentation-policy.md](../documentation-policy.md).
