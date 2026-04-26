# ThinUI unified workspace — entry points

Binder-native unified workspace: one **#binder** shown as Board, Table, Docs, Calendar, Social, Ops, and Editor modes.

## Canonical implementation

All code and demo data live in **`uDOS-thinui`** (not under this repo’s ignored `@dev/inbox` copy).

| Area | Path |
|------|------|
| Types + parser | `uDOS-thinui/src/workspace/` |
| Demo binder JSON | `uDOS-thinui/src/workspace/demo-binder.json` (includes `schema_version: "1"`) |
| Example copy | `uDOS-thinui/examples/demo-binder.json` |
| Browser shell | `uDOS-thinui/demo/workspace.html`, `workspace.css`, `workspace-main.ts` |

## Run

```bash
cd uDOS-thinui
npm install
npm run dev:workspace
```

Or `npm run dev` and open `http://localhost:5179/workspace.html`.

## Binder data source (optional backlog Round 1)

- **Bundled default:** no query param — workspace uses the compiled-in demo binder (`src/workspace/default-demo-binder.ts`), parsed as **binder spine v1** (see `uDOS-core/docs/binder-spine-payload.md`).
- **Fetch JSON:** `?binder=/demo-binder.json` (served from `demo/public/demo-binder.json` in dev/build) or any same-origin relative path; absolute URLs work if CORS allows. When the response includes `schema_version: "1"`, ThinUI validates and parses it as spine v1 (aligned with Core). Use `?binderLegacy=1` to force the legacy parser for JSON **without** `schema_version`.
- **Host-backed:** same-origin URLs work (for example `/api/binder.json` or a static path your host serves); the `binder=` value is resolved with `URL(relative, document.baseURI)` and passed to `fetch`.
- **API:** `BinderWorkspaceSource`, `createBinderSourceFromLocationSearch`, `createFetchBinderSource`, `createBundledDemoBinderSource`, `parseBinderSpinePayloadV1`, `isBinderSpineV1Payload` in `uDOS-thinui/src/workspace/` (re-exported from package `src/index.ts`).
- **CI / local check:** `npm run validate:binder-spine` validates the bundled, public, and example demo JSON files.

Ledger: **`docs/optional-backlog-rounds-1-7.md`** Round 1. **Family plan `v2.6` Round B** (`#binder/thinui-v2-6-workspace-bridge`) — spine v1 bridge + docs above.

## Architecture (short)

- **ThinUI** — Shell, mode router, palette, drawer; binder snapshot loaded via **`BinderWorkspaceSource`** (bundled or fetch); Core/host bridge can replace the source later.
- **Core** — Binder identity, persistence, compile semantics (to be wired).
- **Empire** — Social/campaign domain when the queue is live.
- **Wizard / automation** — Ops and scheduled execution surfaces later.

Patterns only from AppFlowy, Outline, Cal.com/Socioboard, Mixpost, Budibase, Typo/SvelteKit — no wholesale embeds.

## Local inbox mirror

`@dev/inbox/` is **gitignored**; use it for local intake only. Distributable brief templates and policy live in `docs/dev-inbox-framework.md` and `docs/dev-inbox/`. This file is the durable pointer for the ThinUI workspace implementation.
