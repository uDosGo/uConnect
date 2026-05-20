# Level 02 — The Local-First Engine

**Codename:** The Local-First Engine  
**Tagline:** *Your data lives where you live. On your machine. Always.*

**Retro angle:** A little robot on your desk — it does not need permission from the cloud to be useful.

**Target:** Developers, self-hosters, Linux tinkerers  
**Length:** 4–5 hours (when fully authored)  
**Platforms:** GitHub Learning-style labs, YouTube, Linux Foundation–adjacent narratives

**Reference implementation:** [uDosGo](https://github.com/fredporter/uDosGo) — ThinUI + Host + vault-backed loop (`npm run dev` / `npm run launch` per repo docs).

**Suite & pathway:** [courses/README.md](../README.md) (retro suite + catalog links).

---

## Modules

| # | Title | Retro vibe |
| --- | --- | --- |
| 1 | The Server Awakens | One command wakes the local stack *(see uDosGo `docs/QUICKSTART.md`)* |
| 2 | The Indexer's Gaze | SQLite / events as *seeing eyes* over files — still vault-first |
| 3 | Reading the Vault | Scripts that treat `.md` as source of truth |
| 4 | The Local API | HTTP from `127.0.0.1` — your machine serves truth |
| 5 | No Cloud Day | Airplane mode — core loop still runs |
| 6 | The Sync Decision | Git, rsync, or nothing — *you* choose |

---

## The project — local-first contact API (pattern)

Design a **read-only or patch-proposal** API sketch:

- `GET /contacts` → JSON derived from `vault/contacts/*.md`  
- Writes as **patch proposals** or explicit append — *no silent overwrite of operator files*

**Final checkpoint:** With network off, you can still read local data and trust the story the files tell.

```
$ curl http://127.0.0.1:<port>/api/v1/health
{"ok":true,"service":"udos-host",...}

[SYSTEM] No cloud services were harmed in the making of this response.
[SYSTEM] Your machine is sovereign.
```

**YouTube hook:** *I built an API that works without the internet — here's the file-backed pattern.*

---

## Next

→ [Level 03 — Automation Over Markdown](../03-api-automation/README.md)
