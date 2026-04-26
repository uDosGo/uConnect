# Local artifacts, downloads, and disk layout

Where large or cached files land when you use Sonic, Docker demos, and the wider uDOS family.

## Docker `ubuntu:22.04` (TUI demo / `docker-tui-shell.sh`)

Sonic **does not** download Ubuntu into the repo or into `~/.udos/` by itself.

When a script runs `docker run … ubuntu:22.04`, **Docker Engine** pulls **image layers** from a registry (default: Docker Hub) into **Docker’s own image store**:

- **macOS (Docker Desktop):** inside Docker’s Linux VM / disk image — **not** a normal folder next to your clone. Inspect usage with **`docker system df`** or **Docker Desktop → Settings** (disk / data location varies by version).
- **Linux:** often under `/var/lib/docker` (root-owned), unless you use rootless Docker or a custom `data-root`.

Packages installed **inside** a container with **`apt-get`** (demo bootstrap) live in that container’s filesystem. With **`docker run --rm`**, that filesystem is **discarded** when the container exits — nothing is left under your home directory unless you **mount a volume** into the container.

So: **“Ubuntu on disk” from the demo path = Docker images + ephemeral container layers**, managed by Docker, not by Sonic.

## Family shared library (mirrors, installers, ISOs)

For **prefetched** payloads, **mirrored** installers, **ISOs**, release bundles, and other content you want to **reuse across tools and survive offline**, the uDOS family standard is:

**`~/.udos/library/`**

See **`uDOS-dev/docs/foundation-distribution.md`** (path standard table and **LAN library / prefetch** paragraph) and **`uDOS-dev/docs/udos-host-platform-posture.md`** (offline-first posture).

Suggested layout (convention; create as you need):

| Subdirectory (example) | Purpose |
| --- | --- |
| `library/iso/` | Ubuntu / recovery ISOs referenced by profiles |
| `library/packages/` | Cached `.deb` / wheel mirrors where tooling supports it |
| `library/bundles/` | Release zips / staged payloads |

Nothing in Sonic **requires** these folders yet for the Docker demo; they are the **agreed place** for future prefetch/stage work and host-side mirrors.

Optional override for shell scripts (when sourced):

- Environment variable **`UDOS_LIBRARY_DIR`** — defaults to **`$HOME/.udos/library`**; see **`scripts/lib/udos-paths.sh`**.

## Sonic repo–local layout (not the shared home library)

- **`memory/sonic/`** — generated manifests, staged stick roots, operator scratch for **this clone** (gitignored or local-only; see repo README).
- **`memory/sonic/artifacts/payloads`** — default payloads root for plan/init flows (`sonic plan --help` / `--payloads-dir`).

Keep **big** mirrored assets in **`~/.udos/library/`**; keep **run-specific** outputs under **`memory/sonic/`** unless you explicitly point tools at the library.

## Python venv (Sonic CLI)

Default editable / first-run venv:

**`~/.udos/venv/sonic-screwdriver`**

Override with **`UDOS_VENV_DIR`** (see `scripts/first-run-preflight.sh`, `scripts/vm-linux-tui-demos.sh`, **`scripts/lib/ensure-host-tui-deps.sh`**). Finder TUI flow uses the same venv via **`scripts/finder-tui-demos.sh`**.

## Reclaiming space (`sonic udos-resources`)

Sonic can **summarize** and **trim** bulky content under **`~/.udos`** without touching the repo:

```bash
sonic udos-resources              # human-readable sizes per known top-level dir
sonic udos-resources --json       # machine-readable
sonic udos-resources --apply --clean cache --clean tmp
sonic udos-resources --apply --clean logs --clean memory
```

**Safe-ish targets:** `cache`, `tmp`, `logs` (contents cleared), `memory` (session-style tree under `~/.udos/memory`).

**Destructive (explicit opt-in):**

- **`library`** — requires **`--allow-library-destructive`** (wipes mirrored ISOs/bundles; empty `library/` is recreated).
- **`sonic-venv`** — removes **`~/.udos/venv/sonic-screwdriver`** (reinstall with your usual pip / first-run flow).

**Not handled here:** **`vault/`** and **`state/`** (and Docker’s own image store). Use host tools or product-specific docs for those.

Override the root with **`UDOS_HOME`** (tests and nonstandard layouts).

## Related

- **`docs/tui-vm-demo.md`** — Docker vs host demos.
- **`uDOS-dev/docs/foundation-distribution.md`** — full **`~/.udos/`** table.
