# Working TUI demos — Sonic + sonic-ventoy (this terminal first)

**Default:** run everything in the **terminal you already have** (macOS or Linux). Dry-run / stdio previews do not need Docker. **Real stick apply** still requires Linux; see `sonic compat`.

Optional **Docker** is only for a **Linux-shaped** environment (doctor parity, CI-like isolation). It is **not** started unless you ask for it.

## What you get

| Surface | Command | Notes |
| --- | --- | --- |
| **Sonic Track A** | `sonic tui` | Platform, doctor, dry-run USB plan. **Textual** full-screen if installed. |
| **Sonic (capture)** | `sonic tui --stdio` | Same content on **stdout** (logs, SSH batch, weak TTYs). |
| **sonic-ventoy** | `python3 scripts/ventoy_tui.py` | Template/profile inventory from `ventoy.json` + `profiles/`. |
| **sonic-ventoy (capture)** | `python3 scripts/ventoy_tui.py --stdio` | Stdout-only. |

**Ventoy’s boot menu** (GRUB at power-on) is **not** a terminal TUI; it is covered in `demo-vm-runbook.md` with QEMU/USB. This doc is the **repo tooling** TUIs.

## Fast path: this shell (no Docker)

From **sonic-screwdriver** (sibling **sonic-ventoy** at `../sonic-ventoy`):

```bash
bash scripts/vm-linux-tui-demos.sh
```

Prints **both** stdio TUIs in the **current** window. Does **not** open or wait on Docker Desktop.

**macOS Finder:** **`scripts/sonic-docker-tui.command`** runs **`scripts/finder-tui-demos.sh`**, which **creates/updates** **`~/.udos/venv/sonic-screwdriver`** with **`pip install -e '.[tui]'`** before stdio demos or full-screen **`sonic tui`** (override with **`SONIC_SKIP_HOST_TUI_ENSURE=1`** for unusual setups). Default menu choice is **stdio in this Terminal**; **Docker** only if you pick the Linux-shell option. When a run finishes, the script waits for **Return** (or **45s** if input fails).

For **full-screen Textual** on the host:

```bash
cd /path/to/sonic-screwdriver
pip install -e '.[tui]'   # once
sonic tui
```

## Optional: Docker Linux environment

Use when you want **ubuntu:22.04** + Linux doctor checks without a full VM.

**Where does Ubuntu go?** Sonic does not download it under the repo. **`docker pull` / `docker run ubuntu:22.04`** stores image layers in **Docker’s data directory** (macOS: inside Docker Desktop’s disk). Container **`apt`** installs are **ephemeral** with **`--rm`**. For family-wide mirrors and installers on disk, use **`~/.udos/library/`** — see **`docs/local-artifact-paths.md`**.

### Stdio transcript inside a container

```bash
bash scripts/vm-linux-tui-demos.sh --docker
# or: SONIC_DEMO_USE_DOCKER=1 bash scripts/vm-linux-tui-demos.sh
```

If Docker is missing or the daemon is down, the script **falls back** to the same stdio output on the **host** and prints a short NOTE.

### Interactive shell (full-screen Textual in Docker)

Opens **ubuntu:22.04** with deps + editable Sonic, then drops you into **bash** (`-it` TTY):

```bash
bash scripts/docker-tui-shell.sh
```

`docker-tui-shell.sh` calls **`scripts/lib/ensure-docker-daemon.sh`** on macOS when the daemon is down so Terminal can start Docker when you **explicitly** run this script.

Inside the container run **`sonic tui`** or **`python3 /tmp/ventoy/scripts/ventoy_tui.py`**. Type **`exit`** to leave.

**TTY:** interactive mode mounts **`scripts/lib/docker-tui-bootstrap.sh`** into the container. Using `bash -s` plus a heredoc for bootstrap steals stdin and breaks `docker run -it` with “the input device is not a TTY”.

### Docker Desktop “Exec” vs a real terminal

The **in-app Exec** tab is a **browser-based** pseudo-terminal. **Textual** may render a flat-looking page (no real menu chrome) and **keyboard focus** can be wrong — that is expected.

- Prefer **Open in external terminal** (link in the Exec UI) or **`docker exec -it … bash`** from **Terminal.app**, then run **`sonic tui`** there.
- Or use **`sonic tui --stdio`** inside Exec for plain text.

**Product note:** **`sonic tui` Track A** is intentionally a **read-only summary** (platform, doctor, dry-run plan), not a nested installer wizard. Press **`r`** to refresh the snapshot, **`q`** to quit. Command discovery stays on **`sonic`** (REPL) and subcommands like **`sonic plan`**.

### chmod (optional)

```bash
chmod +x scripts/vm-linux-tui-demos.sh scripts/sonic-docker-tui.command
```

**Manual** `docker run -it` (same as the shell script): see commands inside **`scripts/docker-tui-shell.sh`**.

## Real VM (QEMU / UTM / virt-manager)

1. Install **Ubuntu Server 22.04** (or Alpine with `python3` + `pip`) in the VM.
2. Share or clone **sonic-screwdriver** and **sonic-ventoy** into the guest (e.g. `~/Code/sonic-family/...`).
3. In the guest:

   ```bash
   sudo apt install -y python3 python3-pip python3-venv
   cd ~/Code/sonic-family/sonic-screwdriver
   python3 -m pip install --user 'textual>=0.47,<2'
   python3 -m pip install --user -e '.[tui]'
   export PATH="$HOME/.local/bin:$PATH"
   sonic tui --stdio    # quick verify
   sonic tui              # full-screen Textual
   python3 ../sonic-ventoy/scripts/ventoy_tui.py --stdio
   python3 ../sonic-ventoy/scripts/ventoy_tui.py
   ```

4. Optional: attach a USB stick image and follow **`docs/demo-vm-runbook.md`** for the **Ventoy boot menu** (graphical boot path).

## Troubleshooting

- **`sonic: command not found`** — ensure `export PATH="$HOME/.local/bin:$PATH"` after `pip install --user`.
- **No Textual** — install `pip install 'textual>=0.47,<2'`; without it, both tools still print the same report with `--stdio` / default fallback.
- **Ventoy path** — set `SONIC_VENTOY_ROOT` when running `vm-linux-tui-demos.sh` if the repo is not `../sonic-ventoy`.

## Related

- `docs/demo-vm-runbook.md` — QEMU + USB stick / Ventoy **boot** menu.
- `sonic compat` — OS matrix before you invest in VM time.
