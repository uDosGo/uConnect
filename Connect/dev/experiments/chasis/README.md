# CHASIS (Experiment)

Container Hosted Application Surface Integration System.

This directory is intentionally experimental:

- unstable interfaces
- breaking changes allowed
- no production guarantees

Scope:

- run cloned repos in containers
- keep original sources untouched
- generate an adaptor sidecar for uDos integration
- expose full-screen surface workflow

Storage model (A1):

- SQLite: `~/.local/share/chasis/chasis.db`
- Repos: `~/.local/share/chasis/repos/<name>/` (preserved originals)
- Adaptors: `~/.local/share/chasis/adaptors/<name>.yaml`
- Runtime metadata: `~/.local/share/chasis/containers/`, `downloads/`, `lenses/`

Legal and packaging boundary:

- CHASIS does not bundle ROMs, games, or copyrighted payloads
- Users provide their own assets and licenses
- Open source dependencies are fetched from upstream at runtime or by user install

See also:

- `PROMOTION.md` for graduation criteria to `@modules/`
- `bin/chasis` for the experimental CLI
- `test-projects.yaml` for fixture matrix

Roadmap guardrail:

- A2 and later implementation requires explicit operator permission after A1 operator check passes.

## Curated Library Model

uDos CHASIS is not a "run any GitHub repo" system as a primary product path.

Primary model:

1. uDos provides a curated library of tested configurations.
2. Users run `chasis install <name>` for known-good setups.
3. Advanced users can run `chasis init --unsupported <repo>` at their own risk.

Official curated targets (A3 planning):

| Name | Type | Source | Adaptor |
| --- | --- | --- | --- |
| express | Node | GitHub | express.yaml |
| fastapi | Python | GitHub | fastapi.yaml |
| nethack | Amiga | nethack.org | nethack-amiga.yaml |
| elite | BBC Micro | GitHub | elite-bbc.yaml |
| wordpress | PHP | wordpress.org | wordpress.yaml |

Intended UX (post-A1):

```bash
# Primary flow: curated
udo chasis list-available
udo chasis install nethack

# Advanced flow: unsupported
udo chasis init --unsupported https://github.com/random/repo
```

Why curated:

- Guaranteed working configurations
- Finite support burden
- Respect for original code through pinned versions
- Clear legal boundary (no ROM distribution, configs only)

Roadmap impact (planning only, not started in A1):

- **A2**: add `chasis list-available` and `chasis install`
- **A2**: curated index at `modules/chasis/library/index.yaml`
- **A3**: build initial curated config set
- **A3**: `chasis init` becomes advanced `--unsupported` flow (optionally hidden)
