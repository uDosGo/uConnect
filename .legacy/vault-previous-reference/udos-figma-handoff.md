# Figma handoff — uDOS / ThinUI (UniversalSurfaceXD)

Use when uDOS / ThinUI / host frames should land as **interchange** surfaces or **catalog** labels (not MDC Mac).

## Intake order

1. **Intent** — ThinUI workspace, host contract, or theme fork?
2. **`meta.profileId`** — `udos.thinui`, `udos.host`, or `udos.themes` (see [udos-surface-vocabulary.md](udos-surface-vocabulary.md)).
3. **Panels first** — Prefer `shell.panel` rows until a region repeats enough to warrant `udos.*` catalog components.
4. **JSON** — Add or edit `interchange/examples/surface-udos-*.json` only (no duplicate under `browser-mockup/`).
5. **Validate** — `npm run ux:validate-surfaces` from the UniversalSurfaceXD repo root.
6. **Composer** — `/lab/composer?sample=udosThinui` or `?sample=udosHost`.

## Checklist (copy for PRs)

- [ ] Vocabulary row updated if new `profileId` or prefix
- [ ] Sibling ThinUI / themes / host docs still accurate (links in vocabulary)
- [ ] No ThinUI runtime reimplemented inside SvelteKit

## Relation to MDC

[figma-handoff-mdc-mac-app.md](figma-handoff-mdc-mac-app.md) stays authoritative for **Mac shell** frames. This file covers **uDOS** only.
