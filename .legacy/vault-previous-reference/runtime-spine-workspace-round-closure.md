# Runtime spine workspace — round closure pathway

**Workspace:** `cursor-01-runtime-spine.code-workspace` (family root, sibling of `uDOS-core`)

**Repos in this phase:** `uDOS-core`, `uDOS-host`, `uDOS-wizard`, `uDOS-grid`, `uDOS-dev`, `uDOS-docs`

**Latest cursor-01 closure:** **2026-03-30** — `@dev/notes/rounds/cursor-01-runtime-spine-2026-03-30.md`.

**Canonical three-step rule (also Workspace 02):** `uDOS-dev/docs/round-closure-three-steps.md`

---

## Three-step round closure (Workspace 01)

| Step | Name | Automatable? |
| --- | --- | --- |
| **1** | **Automated verification** | Yes |
| **2** | **Full workspace cycle (terminal)** | Yes |
| **3** | **Final GUI render** (real browser, human eyes) | **No** |

**The round stays open until step 3 is done and recorded.** Steps 1–2 alone are not closure.

---

## Step 1 — Automated verification

From `uDOS-host`:

1. **`bash scripts/run-ubuntu-checks.sh`** — file/contract gates, layout smoke, **`verify-udos-runtime-daemons.sh`** (hostd, vaultd, syncd, commandd, web, six aux; `/host/*`, commandd smoke).

2. **`bash scripts/verify-command-centre-http.sh`** — curls `127.0.0.1` and `localhost` on an **ephemeral** port; body must contain the **“uDOS command centre”** marker. This proves the HTML artefact is served; it is **not** step 3 and **not** a GUI substitute.

---

## Step 2 — Full workspace cycle (terminal)

**One-shot (from `uDOS-host`, sibling repos on default paths):**

```bash
bash scripts/runtime-spine-round-proof.sh
```

This runs **automated HTTP verify** then **`runtime-spine-workspace-tui.sh`** (all repos below). That satisfies **step 2** when it exits zero; it does **not** satisfy step 3.

**TUI phases:**

| Phase | Repo | What runs |
| --- | --- | --- |
| 0 | *(web)* | `verify-command-centre-http.sh` |
| 1 | uDOS-core | `run-core-checks.sh`, `run-contract-enforcement.sh`, `pytest -m green_proof` |
| 2 | uDOS-host | `run-ubuntu-checks.sh`, sample `udos-commandd` output |
| 3 | uDOS-wizard | `run-wizard-checks.sh` (set `SKIP_WIZARD=1` only for quick smoke) |
| 4 | uDOS-grid | `run-grid-checks.sh` |
| 5 | uDOS-dev | Pathway artefacts: workspace file, `docs/runtime-spine.md`, `docs/cursor-execution.md` |
| 6 | uDOS-docs | `run-docs-checks.sh` (needs **Node** for `generate-site-data.mjs --check`) |

Optional pause: `ROUND_PAUSE_SEC=2 bash scripts/runtime-spine-workspace-tui.sh`

**Pass vs open work:** after the summary table, the script prints **Test-reporting rollup** and **Open development queue**. The narrower `lane1-runtime-proof-tui.sh` ends with a pointer to the full TUI.

**Runtime note:** **`udos-web.sh`** serves the static tree plus **full** Wizard **`/host/*`** from `wizard-host-surface.v1.json`. **`udos-commandd.sh`** (default) runs **commandd HTTP**. Aux roles are minimal HTTP (`/health.json`, `/v1/status`).

---

## Step 3 — Final GUI render (mandatory)

You must **open a real browser** and **see** the command-centre page rendered (e.g. **“uDOS command centre”** heading). Headless checks and `curl` do not count.

**Canonical operator runbook:** `uDOS-dev/docs/command-centre-browser-preview.md`.

**Localhost (acceptable for dev):**

```bash
bash uDOS-host/scripts/serve-command-centre-demo.sh
```

Open the printed URL (defaults in `scripts/lib/udos-web-listen.sh`, often `http://127.0.0.1:7107/`).

**LAN (preferred for Workspace 01 sign-off):**

1. Start a LAN-visible server (pick one):
   - `bash uDOS-host/scripts/serve-command-centre-demo-lan.sh`, or
   - `bash uDOS-host/scripts/install-command-centre-demo-lan-user-service.sh --now` (see `uDOS-host/docs/lan-command-centre-persistent.md` for **linger** if the unit should survive reboot without login).
2. From **another machine on the LAN** (or a second browser on the host), open `http://<host-ip>:<UDOS_WEB_PORT>/` and **confirm the rendered GUI**.
3. Optional: `curl -s http://<host-ip>:<port>/health.json` with `"service":"udos-web"` — supplementary only.

**Record** completion in `uDOS-dev/@dev/notes/rounds/` or `@dev/notes/devlog.md`.

**Only after step 3** is it appropriate to treat Workspace 01 as closed and switch Cursor to **`cursor-02-foundation-distribution.code-workspace`**.

**Bootstrap hook:** `UDOS_BOOTSTRAP_INSTALL_LAN_SERVICE=1` with `linux-family-bootstrap.sh` installs the systemd user unit per `docs/lan-command-centre-persistent.md`.

---

## Prerequisites

- `python3`, `curl`, `bash`
- `uDOS-docs` checks: **Node** for `scripts/generate-site-data.mjs`
- `uDOS-wizard` checks: Python **3.11+** and venv bootstrap (first run can be slow)

## Linux “from scratch” litmus (public `uDOS-host` only)

- **`uDOS-host/docs/linux-first-run-quickstart.md`**
- **`bash uDOS-host/scripts/linux-family-bootstrap.sh`** (after cloning `uDOS-host`)

Bootstrap runs **steps 1–2** via `runtime-spine-round-proof.sh`. **Step 3 is still required afterward** unless you explicitly complete GUI render and record it.

## Related docs

- `uDOS-dev/docs/round-closure-three-steps.md` — **Workspace 01 and 02** three-step contract
- `uDOS-dev/docs/runtime-spine.md` — ownership and lane-1 narrative
- `uDOS-dev/docs/cursor-execution.md` — lane order
- `contracts/udos-web/command-centre-static-demo.v1.json` — web listen contract
