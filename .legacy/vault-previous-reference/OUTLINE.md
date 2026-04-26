# Course outline — Build Your Own Social Media Manager (Postiz)

**Pre-v5** · **Tool Family** · optional install

## Module 1 — What you are installing (~20 min)

- What Postiz does (schedule, queues, calendars — verify against upstream README).
- AGPL-3.0 and your obligations when self-hosting.
- What uDos provides: **teaching + config worksheet** — not a hosted service.

## Module 2 — Open-box config sheet (~15 min)

- Domain (or hostname) you will use.
- Email / notification path (transactional or mailbox — your choice).
- **One** social platform to connect first (avoid boiling the ocean).

## Module 3 — Infrastructure choices (~25 min)

- Container vs bare metal — pick one path and note trade-offs.
- Secrets: where API keys live; never commit them.
- Backup posture: what to snapshot before first real use.

## Module 4 — Clone and first run (~40 min)

- Use upstream docs as primary; this course aligns intent with [`clone-postiz.ucode`](clone-postiz.ucode).
- Health check: can you log in and schedule a test post?

## Module 5 — Operate and maintain (~20 min)

- Updates: how you will pull new upstream releases.
- Failure modes: SSL, OAuth redirects, rate limits — where to look first.

## Module 6 — Boundaries (~10 min)

- **No** uDos skin — Postiz UI stays as shipped.
- **No** MCP-only automation required — you stay in the loop.
- uDos **teaches**; **you** operate.

**Total (illustrative):** ~2.5 hours active time + your infra setup.
