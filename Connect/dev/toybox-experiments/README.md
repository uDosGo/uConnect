# Toybox experiments (repo mirror)

Optional **in-repo** clones for study when you do not want them inside `~/vault` yet. These directories are **gitignored** once populated.

## Clone (depth 1)

```bash
cd dev/toybox-experiments/markdown-runtime
# rnmd: PyPI package `rnmd`; GitHub canonical tree is markuspeitl/rnmd (rnmd/rnmd may 404).
git clone --depth 1 https://github.com/markuspeitl/rnmd rnmd
git clone --depth 1 https://github.com/phillip-england/marki marki

cd ../foam
git clone --depth 1 https://github.com/foambubble/foam foam
```

## Canonical vault layout

After `udo init` / `udo vault init`, the same layout exists under **vault** `@toybox/` with manifest + findings stubs — see `seed/toybox/` and [docs/specs/vault-workspaces.md](../../docs/specs/vault-workspaces.md).

## Specs

| Topic | Spec |
| --- | --- |
| CommonMark | [docs/specs/commonmark-reference.md](../../docs/specs/commonmark-reference.md) |
| Docker patterns | [docs/specs/docker-integration.md](../../docs/specs/docker-integration.md) |
| Vector DB + WordPress | [docs/specs/vector-db-research.md](../../docs/specs/vector-db-research.md) |
| USXD widgets (brief) | [seed/toybox/experiments/usxd-widget/BRIEF.md](../../seed/toybox/experiments/usxd-widget/BRIEF.md) |
| CHASIS (brief) | [seed/toybox/experiments/chasis/BRIEF.md](../../seed/toybox/experiments/chasis/BRIEF.md) |
| Adaptors (brief) | [seed/toybox/experiments/adaptors/BRIEF.md](../../seed/toybox/experiments/adaptors/BRIEF.md) |
| Adaptor experiment catalog | [seed/toybox/experiments/adaptors/manifest.yaml](../../seed/toybox/experiments/adaptors/manifest.yaml) |
| Manifest template | [dev/tools/toybox-experiments-manifest.yaml.example](../tools/toybox-experiments-manifest.yaml.example) |
