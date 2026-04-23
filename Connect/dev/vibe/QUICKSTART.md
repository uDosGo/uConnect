# VibeCLI — contributor onboarding

**Canonical implementation** (v4 monorepo): **`packages/hivemind/src/vibecli/`** inside **[uDosGo](https://github.com/fredporter/uDosGo)** — if you keep a local clone, it may live at **`~/Code/archive/uDosGo-v4-backup/`** (see **`~/Code/archive/README.md`**) or anywhere you `git clone`. This repo holds **rules and config templates** under **`dev/vibe/`** for alignment and future packaging.

## Layout

| Path | Role |
| --- | --- |
| `vibe/rules/*.toml` | Commit, release, budget, test rules (edit to change behaviour) |
| `vibe/config/vibe.yaml.example` | Copy to `~/.config/vibe.yaml` and customise |

## Rules

TOML files in `rules/` are tracked; start from `example.toml` and split by concern (`commit.toml`, `release.toml`, …) as tooling grows.

## Config

```bash
mkdir -p ~/.config
cp dev/vibe/config/vibe.yaml.example ~/.config/vibe.yaml
```

## Personal drafts

Put scratch notes under **`dev/local/docs/`** (gitignored). See [`../README.md`](../README.md).
