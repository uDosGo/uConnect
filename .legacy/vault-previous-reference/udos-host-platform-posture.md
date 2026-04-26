# uDOS-host platform posture (naming + OS support)

**Family coordination doc.** Defines how we **name** the runtime host lane, which
**OSes** we target, and where **Windows** fits (narrow scope).

## Product names vs git repo

| Name | Meaning |
| --- | --- |
| **uDOS-host** | The **product**: local runtime host that materialises operator state (e.g. `~/.udos/`), runs command-centre services, and owns the **on-disk install/repair** story next to Core contracts. |
| **uDOS-server** | The **same implementation**, described as an **always-on / LAN / household** deployment profile. Not a separate product unless the family later splits packaging. **Do not** use this name for the git repository — it names a **deployment posture** only. |
| **`uDOS-host` (git repo)** | **Target canonical repository name** for the implementation that ships today from the legacy repo **`uDOS-host`**. The old name collides mentally with “Ubuntu + GNOME” as a product; **uDOS-host** is the implementation repo for the **host role** on an **Ubuntu-family baseline**. **Public docs and new work** should say **uDOS-host** for the repo. Local checkouts may still be folder `uDOS-host` until GitHub rename + path updates land. |
| **`uDOS-host` (legacy)** | **Legacy git remote / folder name** for the same repo until renamed. Prefer **`uDOS-host`** in prose; keep **`Ubuntu`** for **distro/image** references only. |

### Git repository rename (legacy `uDOS-host` → `uDOS-host`)

**Intent:** rename the GitHub repository and default clone name to **`uDOS-host`** so operators are not led to think this repo “is GNOME Ubuntu.” **Not** renaming to `uDOS-server` — that term stays reserved for the **LAN / always-on profile** of the same host implementation.

**Checklist (when executing the rename):** GitHub repo rename; update sibling **workspace** `.code-workspace` paths, **`uDOS-docs`** `family-source.json` / site data, CI **checkout** names, cross-repo **docs links**, and any scripts that hard-code `uDOS-host`. Until then, docs may dual-label **uDOS-host** (canonical) + **`uDOS-host`** (legacy path).

There is still **no monorepo “family home”**: the operator chooses checkout paths; the host materialises canonical layout under the home profile (see `docs/workspace-08-exit-evidence.md` § 1).

## Cross-compatible Linux and macOS

| Tier | OS | Intent |
| --- | --- | --- |
| **Tier 1** | **Linux** (Ubuntu-family baseline in-repo) | Full host story: layout, checks, activation, command-centre posture as documented. |
| **Tier 2** | **macOS** | **Cross-compatible** for **developer and operator** workflows: Wizard, partial scripts, docs, and any host paths we explicitly support and test. **Not** advertised as full parity with Linux until each subsystem is listed and green. |

Design rule: **one conceptual uDOS-host**; implementation may gate features per OS behind clear capability flags and docs.

## Windows (explicitly narrow)

- **Not** a first-class uDOS-host target for generic Windows-only installs.
- **Allowed scope:** **uHOME dual-boot gaming** (and similar) where **Windows coexists with Linux** — the **uDOS spine runs on Linux**; Windows is a partition/use-case, not the host runtime.
- **Sonic / family posture for “old Windows machines”:** the supported story is **install Linux** (Ventoy/USB, Sonic bootstrap, then uDOS-host on Linux) — not “run full uDOS-host on bare Windows.”

## Offline-first survival posture — LAN library and prefetch

uDOS is **offline-first at its core**: contracts and runtime behaviour assume the
**wide internet may be absent**. A critical failure mode is waiting until the
**grid is down** to fetch packages, updates, images, or family artifacts — then
it is **too late** to download what you need to stay alive.

**Heritage (v1 / planned):** the **host** lane (**uDOS-host** git repo, legacy folder **`uDOS-host`**)
was intended to **predownload** requirements and updates, hold them in a **local
library**, and **serve** them on the **LAN** for installs and repairs **later**
— including other household machines. **Sonic** was (and remains) a natural
peer for **staging** and **profile-driven prefetch** before apply.

**Target behaviour (family):**

| Piece | Role |
| --- | --- |
| **uDOS-host** | While connected, **prefetch** into managed storage (see `~/.udos/library/` in `docs/foundation-distribution.md`), expose a **LAN-facing** install/mirror surface where documented, and keep **update payloads** ready for **offline-first repair**. |
| **Sonic** | **Plan → prefetch → verify → stage** for media and bundles; align with host library so USB and LAN stories do not fork. |
| **Wizard** | Surface **“prepare for offline”** / **“sync library”** intents without duplicating host ownership of paths. |

**Lean vs library host:** default installs stay **on-demand** for unused features
(`docs/family-first-run-operator-flow.md`). A **household library** or **full
local offline** profile is where **aggressive prefetch** and **LAN mirror**
behaviour belongs — operator choice, not silent bulk for every laptop.

## System health, disk budget, and retention

Prefetch and **local library** compete with **runtime**: there is **no point**
keeping a **5 GB Ubuntu 22.04 installer** (or **several** generations of images)
on disk if they **consume the space** the system needs to **execute** vault,
sync, spool, and services. **Offline-first** includes **staying operational** —
not just **having** files.

**Family mechanisms (existing or planned):**

| Mechanism | Role |
| --- | --- |
| **Sonic partitions / layout policy** | Separate **staging**, **library**, and **runtime** concerns so large ISOs and mirrors do not land on the same slice as hot state; see `sonic-screwdriver/docs/` for partition and profile intent. |
| **Health checks** | Host and family scripts report **disk pressure**, **service state**, and **layout** sanity before and after prefetch (e.g. **uDOS-host** check scripts — legacy path `uDOS-host/scripts/` — and family vitals). |
| **Compost** (`.compost` / superseded material) | **Build, compact, rotate** archived or superseded payloads so organic cruft does not grow without bound. |
| **Feeds / spool** | Keep **binder lifecycle** and **spool** semantics aligned so queues do not **bloat** silently; Core + host contracts remain authoritative. |

**Wizard as family health and resource manager (target):** **Wizard** should be
the **operator-facing** place to see **“how is the family machine doing?”** —
disk headroom, largest library items, stale caches, recommended **compost** or
**retention** actions — and to **run** delegated fixes (scripts on **uDOS-host**,
Sonic profiles, repo check targets). It is a **dashboard and router**, not a
replacement for **host-owned** layout or **Core** semantics. If in doubt, open
Wizard; heavy lifting stays in the repos that **own** the paths.

## Related

- `docs/family-operator-organisation-map.md` — single index of family operator docs
- `docs/family-first-run-operator-flow.md` — Wizard-led first-time journey, GUI-first, Sonic DB model
- `docs/gui-system-family-contract.md` — host vs Wizard vs browser surfaces
- `docs/workspace-08-exit-evidence.md` — ownership table (update wording over time to “uDOS-host” where it means the role)
- **`uDOS-host`** repo `docs/` (legacy checkout **`uDOS-host/docs/`**) — implementation manuals (activation, first-run, architecture)
- `sonic-screwdriver/docs/` — cold start / USB / recovery lane adjacent to host
