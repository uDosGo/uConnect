---
title: "FIGlet integration (A1)"
audience: "--contributor"
tags:
  - "--contributor"
slot: 5
---

# FIGlet integration (A1)

The Rust **`udos-core`** CLI shells out to the **`figlet`** binary when it is on `PATH`. If `figlet` is missing or returns an error, **`udo ascii banner`** prints a **boxed ASCII fallback** so scripts never fail silently.

## Commands (`udos-core`)

| Command | Behaviour |
| --- | --- |
| `udo ascii banner <text> [--font <name>]` | Run `figlet -f <font> <text>` (default font `standard`) |
| `udo ascii banner <text> --to-teletext` | Same source text, then encode each output line as **space-separated hex** teletext codes (same mapping as `udo teletext convert`) |
| `udo ascii fonts list` | Prefer `showfigfonts`; else `figlet -I2` (font directory); else stub message |
| `udo ascii fonts install <name>` | **A1 stub** — copy `<name>.flf` manually into `FIGLET_FONTDIR` or the system fonts path |
| `udo ascii fonts preview --font <name> <text>` | Same as `banner` with explicit font |

Install **figlet** on macOS: `brew install figlet`. Set **`FIGLET_FONTDIR`** for extra `.flf` fonts.

## Related

- `core-rs/src/cli/ascii.rs`
- `core-rs/src/teletext/ascii.rs` (character → teletext code for `--to-teletext`)
