# Completion rounds — workspaces, proof surfaces, and local stack

**Current planning spine:** **`~/Code/archive/uDosGo-v4-backup/`** (integration) and **`~/Code/uDos/…`** (this repo and nested family trees) — [`../../docs/family-workspace-layout.md`](../../docs/family-workspace-layout.md). Historical text below still refers to **`~/Code/uDOS-family/`** and flat sibling names; map those peers under **`~/Code/uDos/`** when following the new layout.

**Location:** `uDOS-dev/workspaces/archive/v2/completion-round-*.code-workspace` (multi-root Cursor / VS Code).  
**How to open:** **File → Open Workspace from File…** and pick a file under **`archive/v2/`**.

**Family `v2.6` (binder spine) alignment:** rounds **0–4** are updated so PR work stays consistent with **binder spine v1** and the completed family plan (`v2.6-rounds.md`). **Inbox** drafts such as `@dev/inbox/udos-family-v2.6` may describe a **different** “v2.6” (MDC App Store product ladder) — see **`docs/archive/v2/completion-rounds-v2-6-alignment.md`** before mixing roadmaps.

These rounds support **family repo completion and PR work** with extra roots for **control plane** (`uDOS-dev`), **reader docs** (`uDOS-docs`), and **dependencies** (for example `uDOS-plugin-index`, `uDOS-alpine`, `uDOS-core`, `uDOS-wizard`) as listed per round.

## Round index

| Round | Workspace file | Primary repos (theme) |
| --- | --- | --- |
| **0 (pre-round)** | `archive/v2/completion-round-00-v2-6-spine-parity.code-workspace` | **Core, ThinUI, Workspace, Host, Wizard, Shell** + dev, docs — **spine parity** maintenance (`v2.6` rounds A–D) |
| **1** | `archive/v2/completion-round-01-install-distribution.code-workspace` | **sonic-screwdriver**, **sonic-ventoy** (+ `uDOS-alpine`, `uDOS-plugin-index`, **`uDOS-core`**, dev, docs) |
| **2** | `archive/v2/completion-round-02-startup-networking-mcp.code-workspace` | **uDOS-alpine**, **uDOS-core**, **uDOS-gpthelper**, **uDOS-host**, **uDOS-wizard**, **`uDOS-thinui`**, **`uDOS-workspace`** (+ `uDOS-shell`, `uDOS-plugin-index`, dev, docs) |
| **3** | `archive/v2/completion-round-03-tui.code-workspace` | **uDOS-core**, **uDOS-grid**, **uDOS-shell**, **uDOS-workflow**, **`uDOS-thinui`**, **`uDOS-plugin-index`** (+ `uDOS-host`, dev, docs) |
| **4** | `archive/v2/completion-round-04-gui.code-workspace` | **uDOS-empire**, **uDOS-host**, **uDOS-surface**, **uDOS-themes**, **uDOS-thinui**, **uDOS-workspace** (+ `uDOS-wizard`, `uDOS-core`, **`uDOS-gpthelper`**, dev, docs) |

Paths inside each JSON file are **relative to `workspaces/archive/v2/`** (same pattern as `archive/v2/uDOS-v2-public.code-workspace`).

## Preparing for Round 00

Before you open or edit **`archive/v2/completion-round-00-v2-6-spine-parity.code-workspace`**, use the checklist: **`completion-round-00-v2-6-spine-parity.md`** (checkout layout, tooling, optional per-repo smoke, full **`run-v2-6-release-pass.sh`** gate).

## Proof contract (TUI vs GUI)

Completion work should be **demonstrable**:

- **TUI / measurable terminal output:** prefer each repo’s `scripts/run-*-checks.sh`, pytest, or documented CLI (see per-repo `README.md`, `docs/activation.md`).
- **GUI / measurable browser or HTTP output:** prefer **`uDOS-host`** command-centre checks and sibling GUI repos’ `npm run …` / local preview docs.

**Single entry points (macOS):** double-clickable **`.command`** launchers live in **`completion-launchers/`** (sibling to this file):

| Launcher | Role |
| --- | --- |
| `Open-Host-Command-Centre-GUI.command` | Runs **`uDOS-host`** `scripts/verify-command-centre-http.sh` — proves static command-centre demo over HTTP with the **“uDOS command centre”** marker (measurable GUI lane proof). |
| `Open-Shell-TUI.command` | Runs **`uDOS-shell`** `npm run go:run` (Bubble Tea TUI) when `node_modules` is installed — measurable TUI proof. |
| `Run-v2-6-release-pass.command` | Runs **`uDOS-dev`** `scripts/run-v2-6-release-pass.sh` — full **family `v2.6`** spine verification (workspace + Core + ThinUI + host + roadmap status). |

These assume **sibling checkouts** next to the control-plane repo (historically `~/Code/uDOS-family/uDOS-dev`, …). With the **uDos** spine, place the same repo names under **`~/Code/uDos/`** (or keep a flat `~/Code/` tree and adjust paths). See [`../../docs/family-workspace-layout.md`](../../docs/family-workspace-layout.md).

**Repos that are not meant for standalone execution** (library-only or scaffold) should ship a root **`requirements.txt`** (Python) or the repo’s canonical manifest (**`pyproject.toml`**, **`package.json`**) plus **installation / activation** notes in **`README.md`**. Example: **`uDOS-workflow`** is still a thin scaffold — see that repo’s README and `requirements.txt`.

## Local stack and folder philosophy (refinement)

This section captures **design intent** for the uDOS family on disk; authoritative contracts remain in **`docs/boundary.md`**, **`docs/udos-host-platform-posture.md`**, and **`uDOS-host`** runtime layout docs.

- **OS posture:** uDOS is **built for Linux** first. **`uDOS-alpine`** describes the **base build** lane; **Ubuntu** (`uDOS-host`) is the **reference host** implementation on top; **macOS** is a **tier-2 developer** surface with wrappers and path hygiene — the **system should remain aware of the OS** it runs on (`runtime-layout`, host scripts, activation docs).
- **Decentralised home / LAN:** target posture is **multiple devices on the same network**, optional **always-on** host, and **explicit** external sync (for example iCloud / Google) — not silent cloud-of-truth. See **`uDOS-dev`** pathway and host docs for LAN and sync vocabulary.
- **Single-repo clone:** a **downloaded single repo** must remain usable; it may **clone sibling repos** into a **flat** tree when needed (no nesting requirement inside one repo).
- **Default path mapping** (conceptual; map through Alpine → Ubuntu → modern Mac conventions in tooling):

| Role | Default |
| --- | --- |
| **Runtime state** | `~/.udos/` |
| **Local vault root** | `~/Documents` (or operator-chosen; not hard-coded in every repo) |
| **Family repo checkout root** | `~/Code` — **sibling repos**, **flat**, **not nested**; **not tracked** as one mega-repo |
| **Publishable / LAN-readable docs** | `~/Public` (or host-served publish roots per docs) |

External sync (iCloud, Google Drive, etc.) is **opt-in** and should remain **explicit**; an **always-on** machine may centralise library or publish folders **by policy**, not by implicit sync.

## Related

- `README.md` (this directory) — workspace index
- **`docs/archive/v2/completion-rounds-v2-6-alignment.md`** — family `v2.6` spine vs inbox MDC pack; workspace mapping
- `docs/pr-checklist.md` — semver and release habits
- `docs/next-family-plan-gate.md` — when to name a new `v2.x`
- `docs/udos-host-platform-posture.md` — OS tiers and product naming
- `@dev/notes/roadmap/archive/v2/v2.6-rounds.md` — completed family `v2.6` rounds A–E
