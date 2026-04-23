# udos-uname-stringgen — integration brief (experimental)

**Status:** ingested into dev-flow · **Working name:** uNameStringGen (experimental module)

**Concept credit:** [TomDoesTech/wu-tang-clan-name-generator](https://github.com/TomDoesTech/wu-tang-clan-name-generator) — minimal Next.js app; no explicit license in upstream at time of brief. **Implementation:** complete rewrite (Vite + TypeScript + Tailwind v4), deterministic hashing, original word lists, LENS/SKIN UI, uDos-oriented hooks.

**Note (heritage):** If verbatim upstream code is ever vendored, locked program rules expect heritage trees under `original/`. This line of work is **original code** (word lists and generator logic written for uDos); the **idea** (Wu-Tang–style name mashups) stays credited to the upstream concept.

---

## Core features

### 1. Deterministic handle generation (`src/generator.ts`)

- **FNV-1a 32-bit** hash: same seed yields the same handle every time.
- `generateHandle({ seed: string })` combines hashes with word lists into a human-readable handle (e.g. “Silent of the Harbor”).

**Use cases:** stable user-facing handles, collectible `uName` minting, deterministic IDs in distributed setups. Related historical specs (GitHub archive): [UDOS_UNAME_GENERATOR_FLOW_LOCKED_v1](https://github.com/fredporter/uDosDev/blob/main/docs/specs/v4/UDOS_UNAME_GENERATOR_FLOW_LOCKED_v1.md).

### 2. Original word lists (`src/wordlists.ts`)

| List | Role | Notes |
| --- | --- | --- |
| **PREFIXES** | First segment | Original compositions (not copied from upstream tables) |
| **CONNECTORS** | Middle phrase | e.g. “of the”, “from”, “near”, … |
| **SUFFIXES** | Closing segment | Original compositions |

### 3. LENS / SKIN dual UI modes

| Mode | Trigger | Behavior |
| --- | --- | --- |
| **SKIN** (default) | — | Full uDos-style wireframe: header, dock rail, notes panel, footer, intro, teletext-style grid background |
| **LENS** | `Ctrl+L` or header control | Hides `.chrome` (sidebars, footer, intro); minimal surface for “preservation” metaphor |

**CSS sketch (`src/index.css`):**

```css
html.lens-active .chrome {
  display: none;
}
html.lens-active {
  color-scheme: light;
}
```

### 4. Governance / specs (external archive)

Historical locked docs live in the **uDosDev** GitHub archive (not the monorepo canonical tree):

- [UDOS_TOOL_FAMILY_POSTIZ_NAME_GENERATOR_UCOIN_LOCKED_v1.md](https://github.com/fredporter/uDosDev/blob/main/docs/specs/v4/UDOS_TOOL_FAMILY_POSTIZ_NAME_GENERATOR_UCOIN_LOCKED_v1.md)
- [UDOS_UNAME_GENERATOR_FLOW_LOCKED_v1.md](https://github.com/fredporter/uDosDev/blob/main/docs/specs/v4/UDOS_UNAME_GENERATOR_FLOW_LOCKED_v1.md)

Promote into `docs/` when this experiment graduates from brief-only status.

---

## Integration points for uDos (Universal Device Operating Surface)

| Concern | Support |
| --- | --- |
| Deterministic naming | FNV-1a + wordlist indexing |
| Dual UI metaphor | LENS (minimal) / SKIN (full chrome) |
| USXD alignment | Header / dock / main / footer shell (sibling to other tool-family labs) |
| Tool-family lab | Alongside Postiz, uCoin, UniversalSurfaceXD-style demos |
| CLI | Target: `udos namegen "Ada Lovelace"` (or `uDosGo` lane) — **not implemented** in baseline |

---

## Deeper integration checklist

1. **CLI wrapper** — `udos namegen` (or equivalent) in core / Go lane.
2. **HTTP API** — optional endpoint for other uDos services.
3. **uName minting hook** — align with collectible flow spec when implemented.
4. **Heritage tree** — if upstream code is copied literally, place under `original/` per program rules.

---

## Key files (lab repo layout)

| File | Role |
| --- | --- |
| `src/generator.ts` | Deterministic hashing + handle assembly |
| `src/wordlists.ts` | Prefix / connector / suffix lists |
| `src/main.ts` | LENS/SKIN toggle, form handling, live updates |
| `src/index.css` | Tailwind v4 + teletext grid + dual-mode styles |
| `index.html` | USXD-aligned shell |

---

## Quick start (from lab `QUICKSTART.md`)

```bash
cd ~/Code/tool-family/uNameStringGen
npm install
npm run dev   # http://localhost:5173/
npm test      # Vitest
npm run build # dist/
```

**LENS/SKIN:** `Ctrl+L` or header control toggles chrome; repeat to restore SKIN.

---

## Summary

| Aspect | Status |
| --- | --- |
| Concept credit | TomDoesTech/wu-tang-clan-name-generator |
| Deterministic handles | FNV-1a + original word lists |
| LENS / SKIN | Toggle + CSS chrome hiding |
| Governance specs | Linked above (uDosDev archive); migrate into `docs/` when active |
| CLI | Backlog — not in baseline |
| Collectible uName | Separate spec; this brief is the generator lab |

**Experimental value:** deterministic handles plus LENS/SKIN as a small, embeddable naming primitive for user handles, asset IDs, or collectible naming.

---

## Tracking

- Alpha roadmap: **T-ALPHA-UNAMEGEN** in [`dev/TASKS.md`](../../TASKS.md).
