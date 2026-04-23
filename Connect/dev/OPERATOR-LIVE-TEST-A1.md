# Operator live test — **alpha** A1 milestone (uDos)

**Milestone:** Rust core tasks **T001–T021**, TypeScript VA1 `**@udos/core`** tests, repo hygiene (shakedown), optional Rust `**udos-core`** CLI smoke. (**Alpha** = A1/A2 product line; **beta** = historical program docs.)

**When:** Before tagging a release or declaring A1 "operator accepted."

## Preconditions

- **Node.js** ≥ 18 (workspace recommends 20+ — see `core/package.json`).
- **Rust** toolchain (`cargo`, `rustc`) for `core-rs/`.
- Clone at `**~/Code/uDos/`** (or any path); no root `uDosDev/` / `uDosDocs/` folders required.

## One-shot automated gate

From the **repository root**:

```bash
npm run verify:a1
```

This runs, in order: full workspace **build**, `**@udos/core`** tests, **shakedown**, `**core-rs`** `cargo test`. Exit non-zero stops the chain.

## Manual smoke (student / installer path)

After `npm install` at root and `npm run build` (or use `**launcher/install.sh`** / `**launcher/udos.command**` per root `README.md`):

1. `**udo help**` — CLI responds.
2. `**udo doctor**` — reports healthy workspace assumptions.
3. `**udo tour**` — short walkthrough (if installed via launcher).
4. Optional: `**udo init**` in a throwaway directory / temp vault path if your install uses vault defaults.

## Manual smoke (CHASIS A1 experiment lane)

From repo root:

```bash
dev/experiments/chasis/bin/chasis --help
printf 'y\n' | dev/experiments/chasis/bin/chasis list
```

Expected:

- CLI help prints command surface
- `list` runs with experimental warning + confirmation gate
- Database path resolves to `~/.local/share/chasis/chasis.db`

Do not execute A2 sprint tasks from this runbook. A2 starts only after explicit operator approval post-check.

## Rust CLI smoke (`udos-core`)

From repo root:

```bash
cd core-rs
cargo run -- --help
cargo run -- init --path /tmp/udos-vault-smoke-test
rm -rf /tmp/udos-vault-smoke-test
```

Use a disposable `--path` under `/tmp` for live tests; remove afterward.

## Reference

- Command tables: `[docs/public/ucode-commands.md](../docs/public/ucode-commands.md)`
- Task closure: `[TASKS.md](TASKS.md)` (T001–T021 **done**)
- Migration phase: `[decisions/2026-04-15-migration-phase-closure.md](decisions/2026-04-15-migration-phase-closure.md)`

## Sign-off

Record **date**, **git SHA**, and **pass/fail** of `npm run verify:a1` in your dev notes or PR when closing the milestone.