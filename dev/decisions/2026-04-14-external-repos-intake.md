# Decision: External Repos Intake for A1/A2 Study

- Date: 2026-04-14
- Status: locked
- Scope: `vendor/` intake and architecture inspiration lanes

## Decision

Track and study external repositories under `vendor/` for patterns and interoperability, while keeping uDos implementation native to this monorepo.

## Repos Cloned

- `vendor/nextchat` — MCP-capable chat platform candidate for v2 chat surface.
- `vendor/markdownify-mcp` — ingestion server patterns for converting source material to markdown.
- `vendor/masquerain` — image-to-teletext Level 1 conversion reference.
- `vendor/edit.tf` — browser teletext frame editor for widget embedding tests.
- `vendor/airpaint` — browser ASCII/XP editor reference.
- `vendor/milkdown` — plugin-driven markdown WYSIWYG framework reference.

## A1 Fit Summary

- Use as design pattern sources and widget/service candidates only.
- Prioritize direct uDos implementation in `core-rs/`, `modules/`, and `ui/`.
- Do not fork architecture or replace uDos data model (`~/vault`, OBF, USXD, uCode).

## Next Actions

- Wire `ui/src/widget-test` wrappers against `vendor/edit.tf` and `vendor/nextchat`.
- Capture command-level bridge points from `markdownify-mcp` and `masquerain`.
- Continue Milkdown plugin work in `modules/milkdown-plugins/`.
