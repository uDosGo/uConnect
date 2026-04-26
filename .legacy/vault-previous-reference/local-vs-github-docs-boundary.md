# Local vs GitHub documentation boundary

Where to edit, where to read, and what is canonical when **local checkouts**, **GitHub**, and **Pages** disagree.

## Canonical by content type

| Content | Canonical location | Review path |
| --- | --- | --- |
| Family library navigation, featured links, repo cards | `uDOS-docs` `site/data/family-source.json` | PR on `uDOS-docs`; run `generate-site-data.mjs --check`. |
| Stable public docs in this repo | `uDOS-docs/docs/`, `architecture/` | PR on `uDOS-docs`. |
| Module-specific docs | Each repo `docs/` | PR on that repo. |
| Wiki units (beginner modules) | Each repo `wiki/` | PR on that repo; URLs listed in `family-source.json` `wiki_units` / learning hub cards. |
| Control-plane and Cursor lanes | `uDOS-dev/docs/`, `@dev/notes/` | PR on `uDOS-dev`. |

## GitHub Pages

- **Pages** serves the **built** `site/` output. If you change only markdown under `docs/` and do not update `family-source.json`, the **library shell** will not reflect new pages until you add links/cards.
- **Deep links** to `https://github.com/.../blob/main/...` always show the **current default branch** file; they are the right choice for “read the source” from the static site.

## Local preview

- Regenerate JSON before judging link fixes: `node scripts/generate-site-data.mjs`.
- Relative links in `site/` (e.g. `./learning.html`) work from a static server or `file://` only if the full `site/` tree is present.

## Related

- `docs/publishing-architecture.md`
- `uDOS-dev/docs/repo-local-dev-workspaces.md` (workspace policy)
