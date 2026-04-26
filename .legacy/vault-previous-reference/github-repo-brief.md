# Repository brief (open source)

## Public name

**UniversalSurfaceXD** — [github.com/fredporter/UniversalSurfaceXD](https://github.com/fredporter/UniversalSurfaceXD)

npm package name in root `package.json`: `universal-surface-xd` (private workspace; not published to npm by default).

## Positioning

Open-source **portable surface language**, **interchange JSON** (schemas + examples), **Storybook** workshop, and a **browser UX designer** (SvelteKit). Product-neutral: MDC, uDOS, and Syncdown-style samples coexist via `meta.profileId`.

## Mission

Prototype grid- and catalog-driven UIs once, validate JSON in CI, and hand off cleanly to browser, native, or terminal stacks—without owning production runtime in this repo.

## In scope

- Design tokens and spine patterns (`spine/`, `staff/`)
- Browser mockup and Storybook (`browser-mockup/`, `src/stories/`)
- Interchange schemas and examples (`interchange/`)
- Decision docs and Figma handoff notes (`docs/`)
- uDOS v3 grid/style alignment ([udos-v3-style-bridge.md](udos-v3-style-bridge.md))

## Out of scope

- Shipping production features for downstream apps
- Backend services owned here
- Exclusive coupling to one product (consumers opt in via profiles and clones)

## Downstream consumers (examples)

Downstream repositories are **optional** and may be public or private; this repo stays useful without them:

- [uDOS-v3](https://github.com/fredporter/uDOS-v3) — validates `usxd/0.1` surfaces; ThinUI lab
- MDC / Syncdown native apps — separate repositories
- Theme packs — e.g. [uDOS-themes](https://github.com/fredporter/uDOS-themes) when used in a multi-root workspace

## Success criteria

- Documentation is discoverable from the root [README.md](../README.md)
- `npm run ux:validate-surfaces` and mockup `npm run build` stay green on `main`
- New contributors can run the UX designer in minutes ([CONTRIBUTING.md](../CONTRIBUTING.md))
