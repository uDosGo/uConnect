# GitHub Actions contract and local source of truth

**Status:** canonical family reference  
**Updated:** 2026-04-03  
**Anchor repo:** `uDOS-host`  
**Roadmap:** `v2-family-roadmap.md` § Engineering backlog

## Purpose

Separate what **must** be true on **GitHub** (CI visibility, merge gates) from
what **operators** treat as ground truth on a real machine (scripts, `~/.udos/`,
sibling clones). This document is the explicit contract; individual repos link
here instead of duplicating long policy prose.

## Branch protection and solo maintenance

The family is maintained **by a single operator**, working **linearly** (one
change stream at a time). **Direct `git push` to `main`** is the **normal**
integration path—not something to apologise for.

- **GitHub “require pull request” rules** are **optional**. If they are left on
  for historical reasons, GitHub may print messages like “Changes must be made
  through a pull request” when you push; **bypassing as repo admin** (or
  relaxing the rule to allow direct pushes to `main`) is **expected** and fine.
  Prefer **disabling PR-only requirements** on `main` where you own the repo,
  so local workflow matches docs and you are not nudged toward fake PRs.
- **CI** can still run on **`push` to `main`** (see `validate.yml` patterns);
  that is independent of whether merges arrive via PR or direct push.
- **Topic branches and PRs** remain useful for **risky experiments**, **long
  WIP**, or **deliberate review isolation**—not as a default for every commit.

### Relaxing `main` in bulk (API, solo operator)

Use the GitHub REST API (or **`gh api`**) when the web UI is tedious across many repos. As of **2026-04-02**, **`main`** on the following **`fredporter/*`** repos was updated to **remove** required pull-request reviews, **required linear history**, and **required conversation resolution**, while leaving lightweight protection in place (no force-push, no branch delete):

`uDOS-themes`, `uDOS-docs`, `sonic-screwdriver`, `uDOS-shell`, `uHOME-client`, `uDOS-empire`, `uHOME-server`, `uDOS-wizard`, `uDOS-plugin-index`, `uDOS-gameplay`, `uDOS-core`, `uDOS-alpine`.

Repos with **no** prior **`main`** rule set (for example **`uDOS-dev`**) were unchanged. **Organization rulesets** (if added later) are separate from classic branch protection; adjust them under the org **Settings** if pushes are still blocked.

Repeat for a repo (after **`gh auth login`** with **`repo`** scope):

```bash
gh api -X PUT "repos/fredporter/REPO_NAME/branches/main/protection" --input - <<'EOF'
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "allow_fork_syncing": false,
  "required_conversation_resolution": false
}
EOF
```

Discover repos that still use classic protection on **`main`**:  
`gh repo list fredporter --limit 300 --json name -q '.[].name' | while read r; do gh api "repos/fredporter/$r/branches/main/protection" --silent && echo "$r"; done`

## GitHub contract (`uDOS-host`)

Applies to the **reference** public layout under `uDOS-host/.github/workflows/`.

| Requirement | Detail |
| --- | --- |
| **Integration branch** | **`main` only** for automated validation. No required `develop` or promote-only pipeline in this repo’s contract. |
| **`validate.yml`** | On **push and pull_request** to `main`: run `bash scripts/run-ubuntu-checks.sh` and `bash scripts/verify-command-centre-http.sh` on `ubuntu-latest`. |
| **`family-policy-check.yml`** | Same triggers: checkout **`uDOS-dev`** (and paths needed for governance scripts) and **`uDOS-core`** for `run-contract-enforcement.sh` as wired in that workflow. |
| **Logic ownership** | **Scripts own behavior**; YAML should invoke scripts, not reimplement checks in ad hoc inline steps. |
| **`promote.yml`** | **Not** part of the ubuntu reference contract. Other repos may add promotion jobs; governance in `uDOS-dev` does not require `promote.yml` for public repos (`automation/check-repo-governance.sh`). |

Sibling public repos may reuse or fork this pattern; when they do, they should
state their triggers and script entrypoints in their own `docs/activation.md`
and keep them aligned with this contract where they claim ubuntu parity.

## Local source of truth

| Layer | Authority |
| --- | --- |
| **Source trees** | Operator’s **sibling clone layout** (e.g. `~/Code/uDOS-family/uDOS-host`, `…/uDOS-dev`, `…/uDOS-core`, …). |
| **Runtime state** | **`~/.udos/`** created and maintained by `scripts/lib/runtime-layout.sh` and `udos-*` host scripts documented in ubuntu. |
| **Green proof** | **On a real Ubuntu host** (or equivalent), `run-ubuntu-checks.sh` + `verify-command-centre-http.sh` passing is the **primary** sign-off for ubuntu lane behaviour. |
| **CI** | A **mirror** of those entrypoints on GitHub-hosted runners—not a second, divergent ruleset. |

## Roll-forward (still backlog)

- Align additional public repos to the same **main-first + script-owned** pattern where claimed.
- Trim redundant reusable workflows in `uDOS-dev` when siblings no longer need them.

### Tracking aid

Use `uDOS-dev/automation/check-github-contract-rollforward.sh --report` for a
machine-readable local snapshot (`aligned` vs `pending`) and include it in the
family conformance sweep report (`scripts/run-family-conformance-sweep.sh`).

**Sibling checkouts (sonic / uHOME, etc.):** repos may live outside `ROOT_DIR`
(next to `uDOS-family`). Set a colon-separated search path so the roll-forward
script can resolve them:

```bash
export UDOS_GITHUB_CONTRACT_REPO_ROOTS="/path/sonic-family:/path/uHOME-family"
bash uDOS-dev/automation/check-github-contract-rollforward.sh --report
```

**Script-owned detection** treats a workflow as aligned when it either runs
`bash scripts/` / `run-*-checks.sh` locally **or** calls the **`uDOS-dev`**
reusable `validate.yml` / `family-policy-check.yml` via `uses:` (same contract
anchor as inline scripts).

**Repo list:** strict roll-forward iterates **`public_repos`** in **`automation/family-repos.sh`** (includes **`uDOS-grid`** and **`uDOS-surface`** as of **2026-04-03**).

## Related

- `uDOS-host/docs/activation.md` § GitHub Actions  
- `uDOS-dev/docs/pr-checklist.md`  
- `uDOS-dev/automation/check-repo-governance.sh`
