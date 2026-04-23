# Decision: Widget Test Bed + ASCII/Teletext Bridge

- Date: 2026-04-14
- Status: locked
- Scope: `ui/src/widget-test/`, `vendor/`, `core-rs/src/teletext/`

## Decision

Implement an A1 widget integration test harness for external tools and establish a first-pass ASCII↔Teletext Level 1 bridge in Rust CLI.

## Delivered

- Widget test harness:
  - `ui/src/widget-test/index.vue`
  - `ui/src/widget-test/EditTFWidget.vue`
  - `ui/src/widget-test/NextChatWidget.vue`
  - `ui/src/widget-test/README.md`
- Vendor lane:
  - `vendor/README.md`
  - `vendor/nextchat/` cloned
  - `vendor/edit.tf/README.md` placeholder (upstream URL unresolved)
- Teletext bridge:
  - `core-rs/src/teletext/{ascii,blocks,colour,grid,mod}.rs`
  - `udo teletext convert`
  - `udo teletext render`
  - `udo teletext grid render`
  - integration tests in `core-rs/tests/teletext_tests.rs`

## Notes

- `edit.tf` clone failed from provided URL (`repo not found`); awaiting corrected source.
- Current teletext mapping is foundational and can be expanded toward fuller Level 1 attribute coverage.
