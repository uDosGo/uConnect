# 🚀 uDos Quickstart Guide

Welcome to **uDos** — a modular, vault-native platform for knowledge management, spatial computing, and creative productivity.

This guide gets you up and running in **5 minutes**. No prior experience needed.

---

## ✅ What You'll Need

- **Git** — to clone the repo
- **Node.js** v18+ — for the web UI
- **Python** 3.10+ — for the binder CLI tools
- A **terminal** (Terminal.app on Mac, GNOME Terminal on Linux, etc.)

---

## 📦 1. Clone the Repo

```bash
git clone https://github.com/uDosGo/Connect.git
cd Connect
```

---

## 📖 2. Explore What's Here

```bash
# See the top-level structure
ls

# Read the docs
ls docs/

# Check out the courses
ls courses/
```

---

## 🧪 3. Try the Binder CLI

The binder is a Python tool for working with structured data (snacks, spools, feeds).

```bash
# Go to the binder directory
cd binder

# Install dependencies (recommended: use a virtual env)
python -m venv .venv
source .venv/bin/activate
pip install -e .

# See available commands
python -m binder --help
```

---

## 🌐 4. Launch the Web UI (Optional)

```bash
cd ui
npm install
npm run dev
```

Open your browser to `http://localhost:5173` (or whatever port Vite prints).

### Desktop Launchers

| Platform | How to Launch |
|----------|---------------|
| **macOS** | Double-click `udosui.command` in Finder (after `chmod +x udosui.command`) |
| **Linux** | Run `bash scripts/udosui-launcher.sh --install` once, then find "uDos UI" in your app menu |
| **Any** | `bash scripts/udosui-launcher.sh` from the terminal |

---

## 📚 5. Start Learning

| Resource | What It Covers |
|----------|---------------|
| **[Courses](../courses/)** | Step-by-step learning paths (start with `01-markdown-first`) |
| **[Student Guide](student/)** | Tutorials in everyday language — no jargon |
| **[User Manual](ucode-user-manual.md)** | All `udo` commands explained |
| **[Lexicon](lexicon.md)** | What all the terms mean |

---

## 🆘 Need Help?

- Open an [issue](https://github.com/uDosGo/Connect/issues)
- Start a [discussion](https://github.com/uDosGo/Connect/discussions)

---

*Happy building! 🚀*
