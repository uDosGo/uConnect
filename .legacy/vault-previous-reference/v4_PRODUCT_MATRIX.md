# uDos v4.0.0 → Product Compliance Matrix (FINAL)

**Status:** Locked  
**Products:** Linkdown Core, Linkdown Premium, Syncdown  
**Shared layer:** Markdown vault (canonical truth)  
**Last updated:** 2026-04-10

---

## 1. Core Specifications

| uDos Spec | Linkdown Core | Linkdown Premium | Syncdown |
|-----------|---------------|------------------|----------|
| **GFM Enhanced** | ✅ Implements | — | ✅ Implements |
| **Task syntax** | ✅ Implements | — | ✅ Implements |
| **Vault topology** | ✅ Implements | — | ✅ Implements |
| **Canonical links** | ✅ Implements | — | ✅ Implements |
| **Contact schema** | ⚠️ Reads/shows | ✅ Workflows | ✅ Owns |
| **View engine** | ⚠️ List only | — | ✅ Full |
| **Agent write model** | ❌ | ✅ Implements | ❌ |
| **Spatial metadata** | ❌ | ❌ | 🔄 Future v5 |

---

## 2. View Engine Ownership

| View Type | Linkdown Core | Linkdown Premium | Syncdown |
|-----------|---------------|------------------|----------|
| **Table view** | ❌ | ❌ | ✅ |
| **List view** | ✅ Task lists | — | ✅ Operational |
| **Board view** | ❌ | ❌ | ✅ |
| **Timeline view** | ❌ | ❌ | ✅ |
| **Feed view** | ❌ | ❌ | ✅ |

---

## 3. Markdown & Task Features

| Feature | Linkdown Core | Linkdown Premium | Syncdown |
|---------|---------------|------------------|----------|
| GFM baseline | ✅ | — | ✅ |
| YAML frontmatter | ✅ | — | ✅ |
| Obsidian Tasks syntax | ✅ | — | ✅ |
| Inline tokens | ✅ | — | ✅ |
| Indented metadata | ✅ | — | ✅ |
| Contact references | ✅ | ✅ | ✅ |
| MCP intent hints | ❌ | ✅ | ❌ |
| Basic task queries | ✅ | — | ✅ |
| Advanced task queries | ❌ | ✅ | ✅ |

---

## 4. Contact Ownership

| Feature | Linkdown Core | Linkdown Premium | Syncdown |
|---------|---------------|------------------|----------|
| Read contact files | ✅ | ✅ | ✅ |
| Display contacts | ✅ | ✅ | ✅ |
| Write contact files | ❌ | ✅ | ✅ |
| Contact processing | ❌ | ✅ | ✅ |
| Contact workflows | ❌ | ✅ | ✅ |
| Contact sync (Apple) | ❌ | ❌ | ✅ |

---

## 5. Agent & MCP

| Feature | Linkdown Core | Linkdown Premium | Syncdown |
|---------|---------------|------------------|----------|
| MCP tool exposure | ❌ | ✅ | ❌ |
| Patch-proposal writes | ❌ | ✅ | ❌ |
| `vault.*` tools | ❌ | ✅ | ❌ |
| `note.*` tools | ❌ | ✅ | ❌ |
| `task.*` tools | ❌ | ✅ | ❌ |
| `contact.*` tools | ❌ | ✅ | ❌ |
| `workflow.*` tools | ❌ | ✅ | ❌ |

---

## 6. Apple Ecosystem & Automation (Syncdown Only)

| Feature | Linkdown | Syncdown |
|---------|----------|----------|
| Apple Notes sync | ❌ | ✅ |
| Apple Reminders sync | ❌ | ✅ |
| Apple Mail integration | ❌ | ✅ |
| Apple Contacts sync | ❌ | ✅ |
| Apple Calendar sync | ❌ | ✅ |
| Finder tags | ❌ | ✅ |
| Rule engine | ❌ | ✅ |
| Background daemon | ❌ | ✅ |
| Advanced task queries | ❌ | ✅ |

---

## 7. Free vs Premium (Linkdown Only)

| Feature | Linkdown Core | Linkdown Premium |
|---------|---------------|------------------|
| Markdown editor | ✅ | — |
| Vault management | ✅ | — |
| Task lists | ✅ | — |
| Contact display | ✅ | — |
| MCP runtime | ❌ | ✅ |
| Task workflows | ❌ | ✅ |
| Contact workflows | ❌ | ✅ |
| Advanced queries | ❌ | ✅ |

---

## 8. Implementation Status (v4.0.0)

| Area | Linkdown Core | Linkdown Premium | Syncdown |
|------|---------------|------------------|----------|
| Markdown editing | ✅ Complete | — | ✅ Complete |
| Vault storage | ✅ Complete | — | ✅ Complete |
| Task lists | ✅ Complete | — | ✅ Complete |
| Advanced task queries | ❌ | ✅ | 🔄 In progress |
| Contact display | ✅ Complete | ✅ | ✅ Complete |
| Contact processing | ❌ | ✅ | ✅ Complete |
| Table/board/timeline/feed | ❌ | ❌ | 🔄 In progress |
| Sync engine | ❌ | ❌ | 🔄 4.0.3 |
| Rule engine | ❌ | ❌ | 🔄 4.0.4 |
| MCP tools | ❌ | ✅ Complete | ❌ |
| Apple integrations | ❌ | ❌ | 🔄 4.0.3+ |

---

## 9. Final Compliance Statement

> **Linkdown Core v4.0.0 implements the uDos v4.0.0 specifications for markdown editing, task lists, and vault topology. Linkdown Premium adds MCP orchestration, task workflows, and contact write/process capabilities.**
>
> **Syncdown v4.0.0 is a full GFM Enhanced citizen — it reads, writes, and processes all markdown content. It owns contact record processing (including deduplication), advanced task queries, operational views (table, board, timeline, feed), Apple ecosystem sync, and automation rules. Syncdown does not implement MCP.**
>
> **All products share the same canonical markdown vault as source of truth.**

---

## 10. One-Line Summary

> **Linkdown = specialised editing workspace (free + premium MCP). Syncdown = full markdown citizen + operational control tower + Apple sync + automation — both read/write the same vault, with Syncdown owning contact processing and advanced queries.**

---

**End of Compliance Matrix — LOCKED.**