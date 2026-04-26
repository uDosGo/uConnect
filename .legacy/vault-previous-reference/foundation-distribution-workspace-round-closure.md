# Foundation and distribution workspace — round closure pathway

**Workspace:** `cursor-02-foundation-distribution.code-workspace`

**Repos in this phase:** `sonic-screwdriver`, `uDOS-host`, `sonic-ventoy` (optional
checkout), `uDOS-alpine`, `uDOS-plugin-index`, `uDOS-core`, `uDOS-dev`, `uDOS-docs`

**Canonical spec:** `uDOS-dev/docs/foundation-distribution.md`

**Latest cursor-02 closure:** **2026-03-31** — `@dev/notes/rounds/cursor-02-foundation-distribution-2026-03-30.md`.

**Three-step rule:** `uDOS-dev/docs/round-closure-three-steps.md` (Workspace 02 table)

**Sonic path:** workspace file assumes `../sonic-family/sonic-screwdriver` relative
to the `uDOS-family` root. Override with `SONIC_SCREWDRIVER_ROOT` if needed.

---

## Step 1 — Automated verification

Run the bundled lane-2 checks (Sonic pytest + Ubuntu + command-centre HTTP +
core + plugin-index + alpine + docs + dev):

```bash
bash uDOS-host/scripts/foundation-distribution-workspace-proof.sh
```

Sonic defaults to `../sonic-family/sonic-screwdriver` relative to the family
root; set `SONIC_SCREWDRIVER_ROOT` if your checkout differs. Equivalent to the
automated portion of `foundation-distribution-round-proof.sh` without the
step-3 reminder.

---

## Step 2 — Integration / terminal proof

For Workspace 02, the script above **is** the integration chain (multi-repo,
ordered, same as step 1 in practice). Optionally re-run Ubuntu regression alone:

```bash
bash uDOS-host/scripts/run-ubuntu-checks.sh
bash uDOS-host/scripts/verify-command-centre-http.sh
```

---

## Step 3 — Final GUI render (mandatory)

Until Sonic or Ventoy documents a different primary operator GUI for this lane,
use the **uDOS command centre** as the regression anchor (same as Workspace 01).

**Operator instructions (URLs, LAN, SSH port-forward):** read
`uDOS-dev/docs/command-centre-browser-preview.md` — that is the canonical
browser-preview runbook.

Quick start (same machine):

```bash
cd uDOS-host
bash scripts/serve-command-centre-demo.sh
```

Then open **`http://127.0.0.1:7107/`** (or the URL the script prints) in a real
browser and confirm you **see** the **“uDOS command centre”** heading.

LAN / second device:

```bash
bash uDOS-host/scripts/serve-command-centre-demo-lan.sh
```

**Record** completion in
`@dev/notes/rounds/cursor-02-foundation-distribution-2026-03-30.md` (or dated
successor) and/or `@dev/notes/devlog.md`.

---

## One-shot reminder script

```bash
bash uDOS-host/scripts/foundation-distribution-round-proof.sh
```

Prints the step-3 instructions after automated gates pass.

---

## Next lane

After Workspace 02 is **closed** (all three steps recorded), open
`cursor-03-uhome-stream.code-workspace` per `docs/cursor-execution.md`.
