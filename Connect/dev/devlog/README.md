# DEVLOG — short implementation notes

**Role:** Dated, lightweight entries that **supplement** [`dev/TASKS.md`](../TASKS.md) (task IDs stay authoritative for done/open).

## Naming

- **`YYYY-MM-DD-short-slug.md`** (example: `2026-04-15-verify-a1-rust.md`)
- One topic per file is fine; split if it gets long.

## Contents (suggested bullets)

- **Context** — Task ID (`Txxx`) if any
- **Change** — PR or commit range
- **Verify** — command + result
- **Watch** — follow-up or risk

## Linking

- **Period summaries** in [`dev/summary/`](../summary/) should **link here**, not duplicate paragraphs.
- Formal audits may still use **`docs/dev-reports/`** with slotted templates; mirror policy under **`dev/workflow/`** when you need slot/frontmatter conventions.

## Feed / MCP

There is **no** separate in-repo feed or MCP for DEVLOG. Consumers: **git**, **`TASKS.md`**, and summary indexes. Add automation later without changing the file naming above.
