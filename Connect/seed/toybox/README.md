# @toybox

Throwaway experiments, upstream clones, and scratch work **inside your vault** — not synced by default (see [vault-workspaces](../../docs/specs/vault-workspaces.md)).

## Layout

- **`experiments/`** — tracked via `experiments/manifest.yaml`; clone **rnmd**, **marki**, **Foam** here and use experiment briefs for **`usxd-widget/`**, **`chasis/`**, and **`adaptors/`**.
- **`scratch/`** — ephemeral files.

## Quick start (vault)

```bash
cd @toybox/experiments/markdown-runtime
git clone https://github.com/markuspeitl/rnmd rnmd
git clone https://github.com/phillip-england/marki marki
# … document in findings.md
```

See [dev/toybox-experiments/README.md](../../dev/toybox-experiments/README.md) for an in-repo optional clone area (gitignored).

## Experiment briefs

- `experiments/usxd-widget/BRIEF.md` — USXD interactive widgets (testable before A2/A3)
- `experiments/chasis/BRIEF.md` — full-screen containerized project surfaces (A1 prototype scope)
- `experiments/adaptors/BRIEF.md` — third-party adaptors; probe list in `experiments/adaptors/manifest.yaml`
