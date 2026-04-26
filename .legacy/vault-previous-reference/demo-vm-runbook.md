# Demo VM runbook (Track C)

Operator-facing steps to **prove** Sonic + Ventoy media in a VM before touching bare metal. Adjust paths to your checkout layout (`~/Code` siblings per `uDOS-dev` foundation-distribution docs).

**Terminal TUIs (Sonic + sonic-ventoy repos)** — **`docs/tui-vm-demo.md`**; host-first **`scripts/vm-linux-tui-demos.sh`**, optional **`--docker`**.

## 1 — Ventoy menu from a generated stick layout

**Host:** Linux (recommended) so `sonic init` can run.

1. Clone **`sonic-screwdriver`** and **`sonic-ventoy`** as siblings (or set `SONIC_SCREWDRIVER_ROOT` / ventoy path per repo docs).
2. From `sonic-screwdriver`:
   - `bash scripts/first-run-preflight.sh` (or `sonic doctor`)
   - `sonic compat` — confirm `sonic_init` is **ok** on this host.
   - `sonic init --stick-root memory/sonic/artifacts/sonic-stick` (add `--dry-run` only if your CLI supports it for init; otherwise use a disposable path).
3. Copy a small test ISO into the stick’s ISO folder per **`sonic-ventoy`** `docs/examples.md` / profile manifest conventions.
4. **QEMU** (illustrative):

   ```bash
   qemu-system-x86_64 -m 2048 -usb -device usb-storage,drive=stick -drive if=none,id=stick,file=/path/to/usb.img,format=raw
   ```

   Prefer **UTM** (macOS) or **virt-manager** with USB passthrough of a real flash drive if image attach is awkward.

5. **Pass:** Ventoy menu appears with uDOS-themed entries; you can select the test ISO.

## 2 — Ubuntu + Classic Modern posture (checklist)

Classic Modern is the **family Ubuntu host profile** (see `uDOS-docs` classic-modern pack and `docs/sonic-tui-charter.md`). Sonic plans **profiles**; the host image and post-install tuning are owned by **`uDOS-host`** + family docs.

1. Boot your planned Ubuntu installer or recovery image from the stick.
2. After install (or on a reference VM), confirm against **`uDOS-docs`** classic-modern host profile checklist (workspace, command-centre posture, de-modernised GNOME targets as documented there).
3. **Pass:** Documented profile items you care about for the round are visibly met (capture notes in your round closure file).

## 3 — Alpine + ThinUI (current reality)

**Today:** ThinUI demo is driven from the host via `sonic test thinui` when **`uDOS-thinui`** is a sibling (`scripts/demo-thinui-launch.sh`). A **single bootable “Alpine + ThinUI primary GUI”** image is cross-repo work (`uDOS-alpine` + ThinUI packaging).

1. On a Linux/macOS dev host: `sonic compat` → note **thinui_demo** row.
2. With sibling ThinUI: `sonic test thinui` — expect JSON payload + optional Node window.
3. **Pass for this round:** demo path documented green; full Alpine boot story stays on the Alpine/ThinUI roadmap.

## Related

- `sonic tui` — Track A terminal preview (no VM required).
- `sonic compat` — Track B matrix.
- `uDOS-host/scripts/foundation-distribution-workspace-proof.sh` — family lane-2 bundle.
