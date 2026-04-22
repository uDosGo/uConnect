# Decision: Remark as Unified Markdown Pipeline

- Date: 2026-04-14
- Status: locked
- Scope: `modules/remark-pipeline`, `core-rs do md` command surface

## Decision

Adopt Remark/unified as the shared markdown processing engine for formatting, linting, TOC generation, frontmatter extraction, link checks, and render pipelines (HTML + teletext).

## Implemented A1 Bridge

- New workspace package: `modules/remark-pipeline`
- CLI bridge script: `modules/remark-pipeline/src/cli.mjs`
- Custom uDos plugin stubs:
  - `udos-obf`
  - `udos-usxd`
  - `udos-ucode`
  - `udos-teletext`
- Rust command bridge in `core-rs`:
  - `udo md format`
  - `udo md lint`
  - `udo md toc`
  - `udo md render --format html|teletext`
  - `udo md frontmatter`
  - `udo md check`

## Notes

- A1 uses a Rust->Node bridge for Remark execution.
- Plugin package path is local workspace-first and ready for future extraction/publishing.
