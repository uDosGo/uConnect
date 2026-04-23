---
title: "Publishing slots 0–7 (locked)"
tags: [--public]
audience: public
slot: 5
---

# Publishing slots — locked

Slots describe **where content may appear** (local vs cloud, public vs restricted). Map each doc to **one primary slot**; use frontmatter for tooling and filters.

| Slot | Tag | Apple colour | Meaning | Typical use |
| --- | --- | --- | --- | --- |
| **0** | `--private` | Gray | Local only; never synced | Secrets, machine-local drafts |
| **1** | `--public-local` | Green | Public on LAN | Family / lab share |
| **2** | `--password-local` | Yellow | Password on LAN | Household finances |
| **3** | `--group-local` | Orange | Specific users on LAN | Small team LAN |
| **4** | `--unpublished` | White | Cloud draft; not public | WIP in cloud storage |
| **5** | `--published` | Blue | Public on the internet | Blog, public docs site |
| **6** | `--password-cloud` | Purple | Password on cloud | Client portals |
| **7** | `--group-cloud` | Red | Specific users on cloud | Team SaaS workspace |

**Frontmatter example**

```yaml
---
title: "My Document"
tags: [--published, --public]
slot: 5
apple_color: Blue
---
```

**Notes**

- **Audience tags** (`--public`, `--student`, …) and **slot** are orthogonal: e.g. a `--student` doc might be slot **4** (unpublished cloud) until released.
- Renderers may map `apple_color` to Finder-style badges in internal tools only; HTML export should use accessible labels, not colour alone.
