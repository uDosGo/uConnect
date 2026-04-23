# Level 03 — Automation Over Markdown

**Codename:** Automation Over Markdown  
**Tagline:** *When a file changes, the world changes with it.*

**Retro angle:** Rube Goldberg in text — new contact, new signal; new task, new log line. Wires made of paths and frontmatter.

**Target:** Automation enthusiasts, workflow builders, API authors  
**Length:** 5–6 hours (when fully authored)  
**Platforms:** freeCodeCamp-style projects, YouTube, Dev.to

**Family contracts:** feed / task / event shapes in [uDosGo `docs/DATA-MODEL.md`](https://github.com/fredporter/uDosGo/blob/main/docs/DATA-MODEL.md) and uDosDev task spec — automation must **respect vault as truth**.

**Suite & pathway:** [courses/README.md](../README.md) (retro suite + catalog links).

---

## Modules

| # | Title | Retro vibe |
| --- | --- | --- |
| 1 | The Watcher | Filesystem or event streams — the universe listens |
| 2 | Triggers and Spells | `contact.md` appears → workflow runs |
| 3 | The Mail Golem | Email or console — prove the pipeline |
| 4 | Task Spawning | New project → seeded task file |
| 5 | Webhook Portal | Outbound calls when vault changes |
| 6 | The Automation Loom | Compose triggers — *one story, many knots* |

---

## The project — contact automation pipeline (pattern)

```
1. Operator creates vault/contacts/sam.md
        ↓
2. Watcher / Host event sees new file
        ↓
3. Service reads frontmatter (CONTACT_SCHEMA-shaped)
        ↓
4. Side effect: log line, email dry-run, or webhook (sandboxed)
        ↓
5. Follow-up task stub in tasks/
```

**Final checkpoint:** Create a contact. Watch the cascade. **Dry-run first**, then promote to real side effects.

```
[WATCHER] New file: vault/contacts/ada.md
[AUTOMATION] Workflow: new-contact
[OUTBOUND] (dry-run) Would notify channel / send mail
[TASK] Stub: tasks/follow-up-ada.md
[COMPLETE] 0 errors

[SYSTEM] Your files are not only data. They are intent.
```

**YouTube hook:** *Turn a text file into a trigger — responsibly.*

---

## Next

→ [Level 04 — The Modular Mind](../04-modular-architecture/README.md)
