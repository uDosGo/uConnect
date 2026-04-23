---
title: "cdn.udo.space — cloud deployment (devonly)"
audience: devonly
tags:
  - "--devonly"
---

# CDN cloud setup (`cdn.udo.space`)

**Audience:** core / infra only. **Not** linked from public student paths as required reading.

## Goal

Serve **`https://cdn.udo.space/fonts/*`** with the same paths as [`cdn/fonts/manifest.json`](../cdn/fonts/manifest.json) so `udo font install` works without a local `seed/`.

## Wireframe vs production

| Layer | Role |
| --- | --- |
| **Repo `cdn/`** | Manifest + optional `fonts/seed/` for offline dev |
| **Cloud CDN** | Authoritative bytes; cache headers; HTTPS |

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| **`UDOS_CDN_BASE`** | `https://cdn.udo.space` | Override CDN origin for testing (e.g. staging URL) |

Clients resolve fonts from **`${UDOS_CDN_BASE}`** + `path` in `manifest.json`.

## Deployment checklist (typical)

1. Upload **`manifest.json`** bundles’ files to the bucket/path that backs **`cdn.udo.space/fonts/`** (preserve paths like `/fonts/Teletext50.woff2`).
2. Set **long-cache** for versioned filenames; **immutable** if you use content hashes later.
3. **CORS:** allow `GET` from sites that embed previews (`udo publish preview`) if browsers fetch cross-origin fonts (same-origin is easiest if site and fonts share a parent domain).
4. **TLS:** HTTPS only in production.
5. Document the **staging** base URL for contributors who should not hit prod.

## Monaspace (P3)

Additional **Monaspace** variable-font uploads can live under **`/fonts/monaspace/`** (separate from `retro`); extend `manifest.json` with a **`monaspace`** bundle when ready.

## Related

- Public spec: [`docs/specs/font-system-obf.md`](../docs/specs/font-system-obf.md)
- Local scaffold: [`cdn/README.md`](../cdn/README.md)
