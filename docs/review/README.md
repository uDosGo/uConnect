# Review — Docs Under Review

This directory holds documentation that is **under review** — content that is:

- **Iffy / uncertain** — may be outdated, inaccurate, or no longer relevant
- **Work in progress** — draft specs, incomplete proposals, experimental ideas
- **Needs triage** — unclear if it should be kept, updated, or moved to `legacy/`

## Purpose

Not every doc is ready for prime time. Some are great ideas that never fully landed. Some are speculative. Some are duplicates that need dedup. This folder gives us a place to park them while we decide.

## Triage Criteria

| Move to `legacy/` if... | Keep in `review/` if... | Move back to `docs/` if... |
|---|---|---|
| Clearly superseded by another doc | Needs updating but still relevant | Updated and confirmed accurate |
| Implements something that never shipped | Speculative / forward-looking | Spec is now being implemented |
| Duplicate of a canonical doc elsewhere | Uncertain if still accurate | Deduped and confirmed canonical |
| Historical / no longer applicable | WIP that might be picked up | Ready for prime time |

## Review Process

1. Read the doc
2. Decide: keep, update, legacy, or delete
3. If keeping: move back to `docs/` (or appropriate subdir)
4. If legacy: move to `../legacy/`
5. If deleting: archive in git history only

---

*Last updated: 2026-05-24*
