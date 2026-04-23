# Round 3 Consolidation — `uDosDev` -> active monorepo lanes

Date: 2026-04-14  
Mode: continuous

## Scope

- `uDosDev/automation/`
- `uDosDev/wiki/`
- `uDosDev/workspaces/`

## First-batch consolidation (completed)

### Automation scripts

Copied into `scripts/migrated-round3/automation/`:

- `apply-github-settings.sh`
- `check-github-contract-rollforward.sh`
- `check-repo-governance.sh`
- `family-repos.sh`
- `rollout-family-governance.sh`
- `verify-family-governance.sh`

### Wiki references

Copied into `docs/contributor/migrated-round3/wiki/`:

- `README.md`
- `unit-01-dev-basics.md`

### Workspace planning docs

Copied into `dev/roadmaps/migrated-round3/workspaces/`:

- `README.md`
- `completion-rounds-and-local-stack.md`

## Next step

- Round 3B: de-duplicate against existing root `.github/workflows` and `scripts/`.
- Mark retained vs archive-only automation/docs.
