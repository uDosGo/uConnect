# Lexicon + Yarnspinner Integration – Complete uCode1 Command System

**Version:** 1.0 (uCode1)  
**Status:** LOCKED  
**Core Principle:** The Lexicon defines **what things are called** (names, aliases, emoji, descriptions). Yarnspinner uses the Lexicon to **translate** feed events into human‑readable stories. The 128 command slots are the **executable actions** that users can invoke.

---

## 1. Three Tables, One System

| Table | Slots | Purpose |
|-------|-------|---------|
| **Command Slot** | 0-31 | Executable machine functions (`note`, `feed`, `snack run`, etc.) |
| **Snack Slot** | 32-63 | Executable containers (`P100-U899` → Postie) |
| **Alias Slot** | 96-127 | Human‑friendly names that map to Command or Snack slots |
| **Character Slot** | 0-127 | ANSI + Emoji + Word (visual representation) |

**Note:** Character slots overlap with Command/Snack slots (they are the same 128 slots). Each slot has:
- **Executable** (optional – command or snack)
- **Visual** (always – ANSI/emoji/word)
- **Lexicon entry** (always – name, description, tags)

---

## 2. Command Slots (0-31) – Executable Functions

These are the **core uCode1 commands**. Each has:
- Slot ID (0-31)
- Machine name (internal)
- Human name (displayed in help)
- Description (for Yarnspinner)
- Tags (for grouping)

| Slot | Machine | Human | Emoji | Description | Tags |
|------|---------|-------|-------|-------------|------|
| 0 | `udos:note` | Note | 📝 | "Create or manage vault notes" | `core`, `vault` |
| 1 | `udos:feed` | Feed | 📡 | "Query the feed spool" | `core`, `spool` |
| 2 | `udos:map` | Map | 🗺️ | "Explore spatial data" | `core`, `spatial` |
| 3 | `udos:ok` | OK | 🤖 | "Ask the OK agent" | `core`, `ai` |
| 4 | `udos:publish` | Publish | 📤 | "Publish to GitHub Pages" | `core`, `web` |
| 5 | `udos:story` | Story | 📖 | "Run interactive stories" | `core`, `narrative` |
| 6 | `udos:snack` | Snack | 🍱 | "Manage executable snacks" | `core`, `execution` |
| 7 | `udos:cell` | Cell | 🔲 | "Access storage cells" | `core`, `storage` |
| 8 | `udos:grid` | Grid | 🧩 | "Display grid UI" | `core`, `ui` |
| 9 | `udos:daemon` | Daemon | ⚙️ | "Control background services" | `core`, `system` |
| 10 | `udos:doctor` | Doctor | 🩺 | "System health check" | `core`, `diagnostic` |
| 11 | `udos:dev` | Dev | 🛠️ | "Development environment" | `core`, `dev` |
| 12-31 | (reserved) | – | – | "Future commands" | `reserved` |

---

## 3. Snack Slots (32-63) – Executable Containers

These are user‑installed or system‑bundled snacks. Each has:
- Slot ID (32-63)
- Snack ID (machine identifier)
- Human name
- Emoji (from Lexicon)
- Description

| Slot | Snack ID | Human | Emoji | Description | Tags |
|------|----------|-------|-------|-------------|------|
| 32 | `P100-U899` | Postie | 📬 | "Fetch VIP emails to vault" | `email`, `ingest` |
| 33 | `R200-C789` | RSS Puller | 📡 | "Pull RSS feeds into spool" | `feeds`, `ingest` |
| 34 | `S300-D456` | PR Summary | 📊 | "Summarize GitHub PRs" | `github`, `summary` |
| 35 | `T400-E567` | Note Tidy | 🧹 | "Clean up old notes" | `vault`, `maintenance` |
| 36 | `U500-F678` | Story Weaver | 🧶 | "Generate story from feed" | `narrative`, `yarn` |
| 37 | `V600-G789` | Cell Mapper | 🗺️ | "Map cells to grid" | `spatial`, `storage` |
| 38-63 | (available) | – | – | "User‑installed snacks" | `user` |

---

## 4. Alias Slots (96-127) – Human‑Friendly Names

Aliases **consume slots** (96-127). They point to Command or Snack slots. Each alias has:
- Slot ID (96-127)
- Human name (the alias)
- Target slot (0-63)
- Emoji (can differ from target)
- Description

| Slot | Alias | Target Slot | Target Name | Emoji | Description |
|------|-------|-------------|-------------|-------|-------------|
| 96 | `write` | 0 | Note | ✍️ | "Alias for note command" |
| 97 | `query` | 1 | Feed | 🔍 | "Alias for feed command" |
| 98 | `explore` | 2 | Map | 🧭 | "Alias for map command" |
| 99 | `ask` | 3 | OK | 💬 | "Alias for ok agent" |
| 100 | `deploy` | 4 | Publish | 🚀 | "Alias for publish" |
| 101 | `tell` | 5 | Story | 📖 | "Alias for story run" |
| 102 | `run` | 6 | Snack | ▶️ | "Alias for snack run" |
| 103 | `mail` | 32 | Postie | 📧 | "Alias for Postie snack" |
| 104 | `feeds` | 33 | RSS Puller | 📰 | "Alias for RSS Puller" |
| 105 | `prs` | 34 | PR Summary | 🔀 | "Alias for PR Summary" |
| 106 | `clean` | 35 | Note Tidy | 🧼 | "Alias for Note Tidy" |
| 107-127 | (available) | – | – | – | "User‑defined aliases" |

---

## 5. Yarnspinner Lexicon Lookup

When Yarnspinner processes a feed event (e.g., `command_execution` on slot 0), it:

1. **Looks up the slot** in the Lexicon
2. **Resolves the best representation** based on mode:
   - `--game` mode → use alias if available
   - `--user` mode → use human name
   - `--dev` mode → use machine name
3. **Generates story text** using the description

### Example: User runs `note create hello.md`

**Feed event:**
```json
{
  "event_type": "command_execution",
  "slot": 0,
  "machine": "udos:note",
  "success": true,
  "output": "Created hello.md"
}
```

**Yarnspinner with Lexicon (user mode):**
```
Lookup slot 0 → human_name = "Note", emoji = "📝"
Story: "📝 Note created hello.md"
```

**Yarnspinner with Lexicon (game mode, alias `write` exists):**
```
Lookup alias for slot 0 → alias = "write", emoji = "✍️"
Story: "✍️ The Wizard writes a new scroll: hello.md"
```

**Yarnspinner with Lexicon (dev mode):**
```
Lookup slot 0 → machine = "udos:note"
Story: "udos:note executed successfully (hello.md)"
```

---

## 6. User‑Defined Aliases & Customisation

Users can add their own aliases (using slots 107-127) and override descriptions.

### Example: User adds `scribble` alias for `note` command

```bash
ucode alias add scribble --target 0 --emoji 🖍️ --description "The Wizard scribbles a note"
```

**Result:** Slot 107 → alias `scribble`, target slot 0, emoji 🖍️.

When user runs `scribble`, it executes `note`. Yarnspinner uses the custom description.

---

## 7. Complete Slot Allocation Summary

| Slot Range | Count | Content Type | Executable | Visual | Alias Target |
|------------|-------|--------------|------------|--------|--------------|
| 0-31 | 32 | Command | Yes (machine) | ANSI + emoji + word | No |
| 32-63 | 32 | Snack | Yes (snack ID) | ANSI + emoji + word | No |
| 64-95 | 32 | Character only | No | ANSI + emoji + word | No |
| 96-127 | 32 | Alias | No (points to 0-63) | ANSI + emoji + word | Yes (slot 0-63) |

**Total: 128 slots.** All 128 have visual representation. 64 (0-63) are executable. 32 (96-127) are aliases pointing to executables.

---

## 8. Lexicon YAML for uCode1

```yaml
# ~/.lex/ucode1.yaml
version: 1
edition: uCode1
max_slots: 128

slots:
  - id: 0
    type: command
    machine: "udos:note"
    human: "Note"
    aliases: []
    emoji: "📝"
    teletext: 0x10
    ansi: "N"
    word: ":note:"
    description: "Create or manage vault notes"
    tags: ["core", "vault"]

  - id: 32
    type: snack
    snack_id: "P100-U899"
    human: "Postie"
    aliases: []
    emoji: "📬"
    teletext: 0x14
    ansi: "P"
    word: ":postie:"
    description: "Fetch VIP emails to vault"
    tags: ["email", "ingest"]

  - id: 96
    type: alias
    target: 0
    human: "write"
    emoji: "✍️"
    teletext: 0x1A
    ansi: "W"
    word: ":write:"
    description: "The Wizard writes a scroll"
    tags: ["game", "alias"]
```

---

## 9. Yarnspinner Template with Lexicon Variables

Yarnspinner story templates can reference Lexicon fields:

```yaml
# .yarnspinner/templates/command_execution.yaml
template: |
  {{#if (eq mode "game")}}
    {{#if alias}}
      {{alias.emoji}} {{alias.description}}
    {{else}}
      {{slot.emoji}} {{slot.description}}
    {{/if}}
  {{else if (eq mode "user")}}
    {{slot.emoji}} {{slot.human}} {{action}}
  {{else}}
    {{slot.machine}} {{action}}
  {{/if}}
```

When `note create` runs:
- Game mode with alias `write` → `✍️ The Wizard writes a scroll`
- Game mode without alias → `📝 Create or manage vault notes` (less good)
- User mode → `📝 Note create`
- Dev mode → `udos:note create`

---

## 10. CLI Commands for Lexicon + Yarnspinner

| Command | Description |
|---------|-------------|
| `ucode alias add <name> --target <slot>` | Add alias (consumes slot 96-127) |
| `ucode alias remove <slot>` | Remove alias (frees slot) |
| `ucode describe <slot> --text "..."` | Override description for Yarnspinner |
| `ucode yarn test <event>` | Preview how Yarnspinner would translate an event |
| `ucode lexicon stats` | Show used/available slots, aliases, commands, snacks |

---

## 11. Locked Summary

| Aspect | Specification |
|--------|---------------|
| **Total slots** | 128 (0-127) |
| **Command slots** | 0-31 (32 total, executable) |
| **Snack slots** | 32-63 (32 total, executable) |
| **Visual‑only slots** | 64-95 (32 total, no executable) |
| **Alias slots** | 96-127 (32 total, point to 0-63) |
| **Executable total** | 64 (commands + snacks) |
| **Alias total** | 32 (consumes slots) |
| **Yarnspinner** | Uses Lexicon to translate events with mode‑specific templates |
| **Customisation** | Users can add aliases (slots 96-127) and override descriptions |

---

**Locked for uCode1.** The Lexicon + Yarnspinner integration is now complete – 128 slots, 64 executables, 32 aliases, full visual mapping (ANSI/emoji/word), and mode‑aware storytelling.
