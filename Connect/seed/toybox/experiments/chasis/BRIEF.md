# CHASIS Brief

**Status:** Experiment (A1 prototype, A2/A3 production)  
**Location:** `@toybox/experiments/chasis/`  
**Purpose:** Run cloned repos locally in containers, connect to uDos surfaces, preserve original source, complement with adaptor code

---

## 1. What is CHASIS?

**CHASIS** (Container Hosted Application Surface Integration System) is a module that:

- Runs a cloned repo inside a container while preserving original source
- Connects the project to uDos surfaces (ThinUI, terminal, teletext)
- Wraps it with an adaptor that adds uDos integration without modifying original source
- Renders as a full-screen project with its own navigation

Analogy:

- **Widget** = embeddable component (task list, chart, form) - small, focused
- **CHASIS** = full application (game, WordPress admin, monitoring dashboard) - complete system, own navigation

---

## 2. Widget vs CHASIS

| Aspect | Widget | CHASIS |
|--------|--------|--------|
| Scope | Small component | Full application/project |
| Screen usage | Embedded in USXD surface | Full screen, own navigation |
| Source | Usually written for uDos | External repo, preserved as-is |
| Integration | Direct USXD markup | Adaptor wrapper + container |
| Examples | Task list, feed viewer, chart | WordPress, game engine, Grafana, Jupyter |
| Navigation | None (parent surface navigates) | Internal (app has its own routing) |
| Lifecycle | Created/destroyed with surface | Persistent, can run headless |

---

## 3. CHASIS Architecture

```text
uDos Core
  <-> Adaptor (uDos code)
  <-> CHASIS Manager
  <-> Container Runtime (Docker)
  <-> Cloned Repo (original, untouched)
  <-> Surface (full page)
```

---

## 4. CHASIS Lifecycle

1. User clones repo into `@toybox/projects/`
2. User runs `udo chasis init ./cloned-repo --name my-project`
3. CHASIS manager detects runtime, creates Dockerfile (if needed), generates adaptor stub, registers surface metadata
4. User runs `udo chasis start my-project`
5. Container starts; original code remains untouched
6. Adaptor provides uDos API hooks, variable injection, event handling, and surface embedding
7. User opens `udo surface open my-project` for full-screen access

---

## 5. CHASIS Commands (A1 prototype)

```bash
udo chasis init ./cloned-repo --name my-project
udo chasis list
udo chasis start my-project
udo chasis stop my-project
udo surface open my-project
udo chasis logs my-project
udo chasis adaptor edit my-project
udo chasis remove my-project
```

---

## 6. CHASIS Directory Structure

```text
@toybox/projects/
  my-project/                 # original cloned repo (untouched)

.local/chasis/
  my-project/
    Dockerfile
    docker-compose.yaml
    adaptor/
      adaptor.yaml
      api.js
      events.js
      surface.js
    state.db
    logs/
```

---

## 7. Adaptor for CHASIS

The adaptor is separate from original source. It complements and never modifies the cloned repo.

```yaml
name: my-project
version: 1
original_repo: "@toybox/projects/my-project"

runtime:
  type: node
  build: "npm install"
  start: "npm start"
  port: 3000

integration:
  variables:
    - name: UDOS_USER
      source: "{{ user.name }}"
    - name: UDOS_VAULT_PATH
      source: "{{ vault.path }}"
    - name: UDOS_THEME
      source: "{{ ui.theme }}"
  api:
    - path: "/api/status"
      method: GET
      action: "return container health"
  events:
    - name: "project:updated"
      action: "spool process"

surface:
  mode: "fullscreen"
  navigation: "internal"
```

---

## 8. CHASIS + SKIN + LENS (A3 preview)

| Concept | Description | A1 stub |
|---------|-------------|---------|
| SKIN | Visual theme applied to CHASIS | Pass `UDOS_SKIN` / `UDOS_THEME` env vars only |
| LENS | Data transformation filter | Pass `UDOS_LENS` env var; optional trivial API proxy filter |

A1 scope here is stub-only (env vars and basic plumbing), with full SKIN/LENS behavior deferred to A3.

---

## 9. Experiment Goals (`@toybox/experiments/chasis/`)

| Goal | Success Criteria |
|------|------------------|
| Clone any repo | `git clone` into `@toybox/projects/` |
| Auto-detect runtime | Identify Node, Python, Go, static |
| Generate Dockerfile | Container runs original untouched |
| Create adaptor stub | YAML + JS skeleton |
| Start/stop container | Basic container lifecycle commands |
| Inject variables | Env vars from uDos |
| Open in surface | Full-screen view via ThinUI |
| Preserve original | No modifications to cloned repo |

---

## 10. A1 Prototype Scope

What A1 should deliver:

- `udo chasis init` (runtime detect + Dockerfile + adaptor stub)
- `udo chasis start` / `udo chasis stop` / `udo chasis list`
- `udo surface open` (basic full-screen proxy/iframe path)
- Env var injection (`UDOS_THEME`/`UDOS_SKIN`, `UDOS_LENS`)
- Preserve original repo as mounted source

What A1 does not deliver:

- Full SKIN/LENS implementation (A3)
- Advanced API proxying (A2)
- Multi-container compose orchestration (A2)
- Rich state persistence beyond baseline metadata (A2)

---

## 11. Test Projects for A1

See `test-projects.yaml` in this folder.

---

## 12. Relationship to Other Systems

| System | Role in CHASIS |
|--------|----------------|
| Docker | Container runtime |
| Adaptor | Integration layer separate from original |
| Surface | Full-screen rendering (ThinUI) |
| USXD | Widgets can be embedded inside CHASIS surfaces |
| Compost | Not primary path; original sources are preserved |
| Feeds | CHASIS can emit events as feed items |
| Spool | CHASIS output can be spooled for compression |

---

## 13. Summary: Widget vs CHASIS vs Adaptor

| Concept | Purpose | Screen | Integration |
|---------|---------|--------|-------------|
| Widget | Embeddable component | Embedded in USXD | Direct USXD markup |
| CHASIS | Full application | Full screen | Container + adaptor |
| Adaptor | Integration layer | N/A | Separate code wrapping external systems |

All three can participate in SKIN/LENS concepts, but A1 keeps this at env-var stub level.

