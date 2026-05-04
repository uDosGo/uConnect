# Hivemind: Deferred, Reimagined, Rebriefed

## Status Update

| Aspect | Previous | Current |
|--------|----------|---------|
| **Timeline** | A2 | Deferred to A3/A4 |
| **Scope** | Developer agent swarm | General Purpose Agent (non-dev) |
| **Integration** | Tight with vibecli | Standalone, optional |
| **Implementation** | Custom build | Adopt existing framework |

**Reason for deferral:** Mastra now handles developer AI tasks (codegen, explain, refactor). Hivemind will focus on **non‑developer** agent scenarios – home automation, family scheduling, vault organization, personal knowledge management.

---

## What Hivemind Is NOT (Anymore)

- Not a replacement for Mastra
- Not focused on code generation
- Not requiring API keys or LLM endpoints
- Not tied to vibecli or uDos development workflows

---

## What Hivemind IS (New Vision)

**Hivemind is a general purpose agent swarm for everyday users.**

It helps non‑technical users with:

| Domain | Example Tasks |
|--------|---------------|
| **Home** | "Turn off lights at 10pm", "Remind me to water plants" |
| **Family** | "Add milk to shared grocery list", "When is Sophie's recital?" |
| **Vault** | "Find all documents tagged #taxes", "Archive last month's receipts" |
| **Scheduling** | "Find a time for dinner with Alex next week" |
| **Notifications** | "Alert me when the Doom container crashes" |
| **Questions** | "How much disk space is left?", "Is Docker running?" |

**Key characteristic:** Hivemind agents are **specialized, local, and privacy‑preserving**. They don't send data to the cloud unless explicitly allowed.

---

## Architecture (A3 Stub)

```
┌─────────────────────────────────────────────────────────────┐
│                      User (natural language)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Hivemind Orchestrator                     │
│  - Parses intent                                             │
│  - Routes to appropriate agent                               │
│  - Aggregates responses                                      │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Home Agent   │    │ Vault Agent  │    │ Family Agent │
│ - Lights     │    │ - Search     │    │ - Calendar   │
│ - Thermostat │    │ - Tag        │    │ - Lists      │
│ - Reminders  │    │ - Archive    │    │ - Messages   │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## Agent Definitions (Stub for A3)

### Home Agent
```yaml
name: home
capabilities:
  - smart_home_control (via Matter/HomeKit stub)
  - timers_and_reminders
  - environmental_queries ("temperature in office")
state_location: ~/.local/share/hivemind/home/
```

### Vault Agent
```yaml
name: vault
capabilities:
  - full_text_search (ripgrep under the hood)
  - topic_tagging (#family, #work, #receipts)
  - file_organization (move to @inbox, @workspace, @archive)
state_location: ~/.local/share/hivemind/vault_index.db
```

### Family Agent
```yaml
name: family
capabilities:
  - shared_calendar (ical format)
  - grocery_list (plain text, sync via uHomeSync)
  - announcements ("Everyone: dinner at 6pm")
state_location: ~/vault/family/
```

---

## How Hivemind Differs from Mastra

| Aspect | Mastra | Hivemind |
|--------|--------|----------|
| **User** | Developer | Non‑technical end user |
| **Primary task** | Code generation | Home/vault automation |
| **LLM required** | Yes (API key) | No (rules + local models optional) |
| **Output** | Code, explanations | Actions, notifications, search results |
| **Integration** | vibecli, uDos dev | uDos surfaces, voice, mobile |
| **Complexity** | High (agents call APIs) | Low (deterministic actions) |

**Hivemind may eventually use a local LLM (e.g., Ollama) for natural language understanding, but A3 will start with simple keyword/intent matching.**

---

## Timeline (Revised)

| Phase | Deliverable | Target |
|-------|-------------|--------|
| **A2 (current)** | Defer – no work | Now |
| **A3 (stub)** | Intent parser + home/vault/family agent stubs | Month 6 |
| **A4 (functional)** | Real smart home integration (Matter) | Month 9 |
| **A5 (polish)** | Local LLM integration (Ollama) | Month 12 |

---

## What Happens to Existing Hivemind Code?

The current `tools/localhost-library/src/hivemind.ts` is a **prototype for developer testing**. It will be:

- Moved to `dev/experiments/hivemind-legacy/`
- Not used in production
- Replaced by new implementation in `@modules/hivemind/` (A3)

**No cleanup needed now.** Just leave it as a stub.

---

## User Interaction Example (Future)

```bash
# Natural language (via uDos surface or voice)
udos ask "turn off the office lights"
→ Hivemind routes to Home Agent
→ Home Agent executes (via Matter bridge)
→ Response: "Office lights turned off"

# Vault query
udos ask "find all receipts from last month"
→ Hivemind routes to Vault Agent
→ Vault Agent searches ~/vault/@inbox/ and ~/vault/family/receipts/
→ Response: List of 7 files

# Family coordination
udos ask "add 'buy milk' to the grocery list"
→ Hivemind routes to Family Agent
→ Family Agent appends to ~/vault/family/lists/grocery.txt
→ Response: "Added 'buy milk' to grocery list"
```

---

## Relationship to Sonic and uDos

- **Sonic‑screwdriver** – provides container runtime (unrelated to Hivemind)
- **uDos** – provides surfaces and vault where Hivemind operates
- **Hivemind** – optional add‑on for non‑developer automation

**Hivemind is not required for uDos or Sonic to function.**

---

## Decision Log

| Date | Decision |
|------|----------|
| 2025-04-20 | Hivemind deferred from A2 to A3/A4 |
| 2025-04-20 | Scope changed from developer swarm to general purpose agent |
| 2025-04-20 | Mastra adopted for developer AI tasks instead |

---

## References

- Mastra integration: `VIBECLI_MASTER_GRADUATION.md`
- Babyvibe graduation: `BABYVIBE_GRADUATION_PLAN.md`
- DSC2 reasoning engine: `DSC2_IMPLEMENTATION_SPEC.md`

---

**Hivemind sleeps. It will wake when the time is right.**
