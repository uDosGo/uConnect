# uDos courses — learning pathway (v4)

**Tagline:** *Build your own knowledge operating system. No cloud required. Just markdown, Linux, and you.*

**Status:** Locked structure · **content** grows per course folder.  
**Pathway docs:** [Retro-futuristic suite](https://github.com/fredporter/uDosDocs/blob/main/docs/educational-content/v4-retro-course-suite.md) · [Educational user acquisition](https://github.com/fredporter/uDosDocs/blob/main/docs/educational-content/v4-educational-user-acquisition-pathway.md) · [Courses catalog & style](https://github.com/fredporter/uDosDocs/blob/main/docs/educational-content/v4-courses-catalog-and-style.md) · [uCode course pathway](https://github.com/fredporter/uDosDocs/blob/main/docs/educational-content/ucode-course-pathway.md).

## Catalog

| Level | Codename | Folder | Role |
| --- | --- | --- | --- |
| 00 | Orientation | [`00-orientation/`](00-orientation/README.md) | What the family is; how repos relate |
| 01 | **The Markdown Grimoire** | [`01-markdown-first/`](01-markdown-first/README.md) | Vaults, frontmatter, links, tasks |
| 02 | **The Local-First Engine** | [`02-local-first-dev/`](02-local-first-dev/README.md) | Runnable local loop (uDosGo-shaped) |
| 03 | **Automation Over Markdown** | [`03-api-automation/`](03-api-automation/README.md) | Watchers, triggers, workflows |
| 04 | **The Modular Mind** | [`04-modular-architecture/`](04-modular-architecture/README.md) | Boundaries, manifests, contracts |
| 05 | **Personal Infrastructure** | [`05-personal-infrastructure/`](05-personal-infrastructure/README.md) | Home / LAN / ops / rescue |
| 06 | **uCode runtime** | [`06-ucode-runtime/`](06-ucode-runtime/README.md) | uCode language + CLI + sandbox (specs in uDosDev) |

### Tool-family / adjunct courses (unnumbered)

| Codename | Folder | Role |
| --- | --- | --- |
| **Build Your Own Social Media Manager** (Postiz) | [`postiz-beginner/`](postiz-beginner/README.md) | Optional **AGPL** self-host; open-box config + clone helper — pairs [Postiz lock (uDosDev)](https://github.com/fredporter/uDosDev/blob/main/docs/specs/v4/UDOS_TOOL_FAMILY_POSTIZ_NAME_GENERATOR_UCOIN_LOCKED_v1.md) |
| **How Does Crypto Work?** (uCoin intake) | [`ucoin-crypto-intake/`](ucoin-crypto-intake/README.md) | Required reading before **uCoin** crypto mode — pairs [`modules/ucoin/`](../modules/ucoin/) |

## Validate

From **uDos** repo root:

```bash
bash scripts/validate-courses.sh
```

## Principle

One **uDos** checkout holds **`dev/`**, **`docs/`**, **`courses/`** (this tree), **`scripts/`**, **`modules/`** — versioned together (no Git submodules). Upstream **[uDosDev](https://github.com/fredporter/uDosDev)** / **[uDosDocs](https://github.com/fredporter/uDosDocs)** remain archives for cherry-picks; do **not** recreate **`uDosDev/`** / **`uDosDocs/`** folders at the repo root ([CONTRIBUTING.md](../CONTRIBUTING.md)).
