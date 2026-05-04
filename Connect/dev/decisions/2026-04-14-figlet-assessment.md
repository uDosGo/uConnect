# Decision: FIGlet for ASCII Banner Generation

- Date: 2026-04-14
- Status: locked
- Scope: A1 ASCII/Teletext pipeline and header generation

## Decision

Adopt FIGlet as an external-tool reference in A1 to generate ASCII banners that feed into uDos Teletext conversion.

## Rationale

- FIGlet is strong at one narrow concern: text->ASCII art banners.
- This aligns directly with uDos header/title generation needs.
- External command integration minimizes implementation risk and keeps A1 moving.

## A1 Actions

- Document usage in `docs/tools/figlet.md`.
- Add CLI lane proposal:
  - `udo ascii banner`
  - `udo ascii fonts list`
- Map banner output into existing Teletext conversion in `core-rs`.

## A2 Considerations

- Evaluate native `.flf` parser (Rust/WASM) if external dependency becomes limiting.
- Optional evaluation of `toilet` for colour-aware variants.

## Non-Goals

- No full FIGlet reimplementation in A1.
- No mandatory FIGlet dependency for all runtime paths.
