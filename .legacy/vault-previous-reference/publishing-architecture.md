# Docs and wiki publishing architecture

How the **uDOS Library** static site is produced, how it relates to **GitHub Pages**, and how **local previews** stay aligned with what readers see on the web.

## Source of truth

| Layer | Location | Role |
| --- | --- | --- |
| **Authoring metadata** | `site/data/family-source.json` | Single JSON editors update; lists hubs, tracks, repo groups, wiki URLs, featured references, courses. |
| **Generated runtime data** | `site/data/family.json`, `site/data/library-manifest.json` | Produced by `scripts/generate-site-data.mjs` — do not hand-edit. |
| **Static pages** | `site/*.html` + `site/app.js`, `site/styles.css` | Client-rendered views that read `family.json`. |
| **Long-form docs** | `docs/`, `architecture/`, `wiki/` (this repo), plus each family repo’s `docs/` and `wiki/` | Canonical prose; the site **links** to GitHub `blob` URLs unless content is inlined later. |

## Build pipeline

1. Edit **`family-source.json`** (structure documented implicitly by `generate-site-data.mjs` and existing keys).
2. Run **`node scripts/generate-site-data.mjs`** (or **`--check`** in CI via `run-docs-checks.sh`).
3. Open **`site/index.html`** locally (file or static server) to verify layout and links.
4. Publish the **`site/`** tree to **GitHub Pages** (or another static host) from the default branch; keep `family.json` committed so Pages and local match.

## Local-hosted vs GitHub-hosted

| View | Use when |
| --- | --- |
| **Local `site/*.html`** | Fast iteration on nav, cards, and manifest shape; no network required after generate. |
| **GitHub `blob` links** | Reading authoritative markdown in context of a repo (versioned, PR-reviewable). |
| **GitHub Pages** | Public, shareable library home; must redeploy after regenerating `family.json` / manifest. |

**Rule:** Markdown **content** lives in repos and changes via **PRs**. The **library shell** (hubs, ordering, featured lists) lives in **`family-source.json`** in `uDOS-docs` and changes with the same discipline.

## Knowledge library and seeds

- **General Knowledge Library** articles: `docs/knowledge/` — index `docs/knowledge/README.md`; normative framing in `architecture/16_general_knowledge_library.md` when present.
- **Seeds:** `seed/` — starter files for runtimes; not the same as the public site tree.

Link the knowledge index from the **Reference Hub** and keep **`library-manifest.json`** listing hubs so bundles and offline mirrors can crawl entry points.

## Operator checklist (Workspace 07 exit gate)

Use this before marking **Workspace 07** closed in `uDOS-dev` (`docs/cursor-focused-workspaces.md` § 07).

1. **Entrypoints:** `docs/README.md` **Start Here** lists publishing docs; `docs/onboarding.md` **Learn** path points at the library and learning metadata (`course-hooks-and-onboarding.md`).
2. **Ownership:** `docs/course-hooks-and-onboarding.md` — wiki units vs `docs/` vs `family-source.json` are explicit.
3. **End-to-end:** Edit `family-source.json` → run `node scripts/generate-site-data.mjs` → spot-check `site/index.html` and `site/reference.html` → run `bash scripts/run-docs-checks.sh` → commit generated JSON and HTML with the source change.
4. **Pages:** Confirm your GitHub Pages (or static host) deploy includes the updated `site/` tree after merge to the publishing branch.

## Related

- [`uDOS-dev` `docs/family-documentation-layout.md`](../../uDOS-dev/docs/family-documentation-layout.md) — `docs/` vs `@dev/` vs `wiki/` across repos (when checkout includes both)
- `docs/local-vs-github-docs-boundary.md` — editing and review boundaries
- `docs/course-hooks-and-onboarding.md` — learning funnel ownership
- `docs/themes-and-display-modes.md` — cross-repo UI docs hub
- `scripts/generate-site-data.mjs`
- `site/README.md` (if present)
