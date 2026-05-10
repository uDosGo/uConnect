# 🤝 Contributing to uDosGo / Connect

Thank you for your interest in contributing! Whether you're fixing a typo, writing a course, or adding a new feature — you're welcome here.

---

## 🎯 Who Can Contribute?

### 👋 Beginners & Learners

**Yes, you can contribute!** Even small contributions help:

- **Fix a typo** in documentation or a course
- **Improve a tutorial** — if something was confusing, make it clearer
- **Add examples** — show how you used a command or feature
- **Report bugs** — if something doesn't work, let us know
- **Ask questions** — your questions help us write better docs

**No coding experience needed.** Start with documentation or courses.

### 🔧 Enthusiasts & Developers

- **Write code** — Rust, Python, TypeScript, shell scripts
- **Create courses** — design learning paths for others
- **Build extensions** — add new tools and integrations
- **Improve tests** — help us catch regressions
- **Review PRs** — help maintain quality

---

## 🚀 Quick Start

### 1. Fork the Repository

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Connect.git
cd Connect

# Add the upstream remote
git remote add upstream https://github.com/uDosGo/Connect.git
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/...` — New features
- `fix/...` — Bug fixes
- `docs/...` — Documentation changes
- `course/...` — Course content
- `refactor/...` — Code refactoring

### 3. Make Your Changes

Follow the existing style and conventions. If you're unsure, ask in a [Discussion](https://github.com/uDosGo/Connect/discussions).

### 4. Test Your Changes

```bash
# Run tests
npm test

# Run linting
npm run lint

# Run validation
bash scripts/shakedown.sh
```

### 5. Commit and Push

Use [conventional commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new vault search command"
git push origin feature/your-feature-name
```

### 6. Open a Pull Request

1. Go to [github.com/uDosGo/Connect](https://github.com/uDosGo/Connect)
2. Click **"Compare & pull request"**
3. Describe your changes clearly
4. Link any related issues

---

## 📋 What to Work On

### Good First Issues

- **Documentation**: Fix typos, clarify explanations, add examples
- **Courses**: Improve learning paths, add exercises
- **Tests**: Add test coverage for existing features
- **Bug reports**: Reproduce and document issues

### How to Find Tasks

- **[Kanban Board](https://github.com/orgs/uDosGo/projects/1)** — See what's in progress and backlog
- **[Issues](https://github.com/uDosGo/Connect/issues)** — Browse open issues
- **[Discussions](https://github.com/uDosGo/Connect/discussions)** — Ask what needs help
- **[TASKS.md](dev/TASKS.md)** — Current development tasks

---

## 📚 Documentation Contributions

### Source of Truth

The **source of truth** for uDos documentation is in `~/Vault/documentation/`. This repo contains a **read-only mirror**.

**For small fixes** (typos, clarifications):
- Edit directly in this repo and submit a PR
- We'll sync back to the vault

**For large changes** (new docs, restructuring):
- Edit in `~/Vault/documentation/` first
- Run the sync script to push to all repos:
  ```bash
  ~/Vault/documentation/sync-to-upstream.sh
  ```

### Documentation Standards

- Use **Markdown** format
- Write in **everyday language** — avoid jargon where possible
- Include **code examples** for commands
- Link to the **[Lexicon](docs/lexicon.md)** for terminology
- Keep it **beginner-friendly** — assume the reader is new

---

## 🧪 Code Contributions

### Code Standards

| Language | Style Guide | Linter |
|----------|------------|--------|
| Python | [PEP 8](https://peps.python.org/pep-0008/) | `ruff` |
| Rust | [Rust Style](https://doc.rust-lang.org/1.89.0/style-guide/) | `clippy` |
| TypeScript | [ESLint config](eslint.config.js) | `eslint` |
| Shell | [Google Shell Style](https://google.github.io/styleguide/shellguide.html) | `shellcheck` |

### Commit Messages

Use [conventional commits](https://www.conventionalcommits.org/):

| Prefix | When to Use |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation |
| `style:` | Code style (formatting, etc.) |
| `refactor:` | Code restructuring |
| `test:` | Adding or updating tests |
| `chore:` | Maintenance, dependencies |
| `course:` | Course content |

### Pull Request Checklist

Before submitting your PR:

- [ ] Code compiles without errors
- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow conventional commits
- [ ] Branch is up to date with `main`

---

## 🏗️ Architecture Overview

The Connect repo is the **shared infrastructure hub** for the uDos ecosystem. Key components:

- **`binder/`** — Python binder system for structured data
- **`src/`** — Rust source (MCP server, core services)
- **`ui/`** — Web UI (Vite + React)
- **`scripts/`** — Automation and utility scripts
- **`docs/`** — Documentation corpus
- **`courses/`** — Learning paths

### Layer Architecture

```
uCode4 (Spatial/3D)     ← Voxels, cubes, spatial algebra
uCode3 (Vector/SVG)     ← Home automation, smart surfaces
uCode2 (Sprite/BOB)     ← Terminal graphics, retro UI
uCode1 (Text/ASCII)     ← Vault, CLI, MCP server (foundation)
```

Connect sits **across all layers**, providing shared infrastructure.

---

## 🧑‍🤝‍🧑 Community Guidelines

### Be Respectful

- Everyone is welcome regardless of experience level
- Assume good intent
- Be constructive in feedback

### Contributor Tiers

| Tier | Role | Tag |
|------|------|-----|
| 🧙 Wizard | Architect, super admin | `--wizard` |
| 🔮 Sorcerer | Trusted contributor, approvals | `--sorcerer` |
| 🧝 Elf | Submitter (issue/PR) | `--elf` |
| 👻 Ghost | No unique username | `--ghost` |
| 🕵️ Spy | Anonymous / not logged in | `--spy` |

### Code of Conduct

Be excellent to each other. We're all here to learn and build.

---

## ❓ Getting Help

- **[Discussions](https://github.com/uDosGo/Connect/discussions)** — Ask questions, share ideas
- **[Issues](https://github.com/uDosGo/Connect/issues)** — Report bugs, request features
- **[Dev Guide](dev/README.md)** — Contributor workflow and templates
- **[Quickstart](docs/QUICKSTART.md)** — Get up and running

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

*Thank you for helping make uDos better! 🚀*
