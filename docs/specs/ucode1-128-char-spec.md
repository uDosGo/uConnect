# uCode1 Complete 128-Character ANSI Set + 128 Emoji Overlays + 128 Word Aliases

**Version:** 1.1 (uCode1)  
**Status:** LOCKED  
**Supersedes:** obf-grid-spec.md (character set section), grid-spec.md (character set section)  
**Core Principle:** We have **128 slots** (0-127). Each slot contains:
1. **One ANSI character** (printable, includes uppercase, lowercase, digits, punctuation, symbols)
2. **One emoji overlay** (optional, maps to same slot)
3. **One word alias** (optional, `:word:` style)

The ANSI character is the **base**. Emoji overlays and word aliases are **optional extras** that do not consume additional slots.

---

## 1. Complete 128 ANSI Character Set (0-127 Slots)

We use **ASCII 0-127** (full 7-bit ASCII). That gives:
- 0-31: Control codes (not printable) – we can use these for **teletext blocks** and **special commands**
- 32-126: Printable (uppercase, lowercase, digits, punctuation)
- 127: DEL (used as placeholder)

| Range | Slots | ASCII | Purpose |
|-------|-------|-------|---------|
| 0-31 | 32 | 0-31 (control) | Teletext blocks, system commands, special graphics |
| 32-126 | 95 | 32-126 (printable) | Uppercase A-Z, lowercase a-z, digits 0-9, punctuation !@#$%^&*() etc. |
| 127 | 1 | 127 (DEL) | Reserved / empty / fallback |

**Total: 32 + 95 + 1 = 128 slots exactly.**

---

## 2. Printable ANSI Breakdown (Slots 32-126)

| Slots | ASCII Range | Content |
|-------|-------------|---------|
| 32 | 32 (space) | Space |
| 33-47 | ! " # $ % & ' ( ) * + , - . / | Punctuation 1 |
| 48-57 | 0-9 | Digits |
| 58-64 | : ; < = > ? @ | Punctuation 2 |
| 65-90 | A-Z | Uppercase alphabet |
| 91-96 | [ \ ] ^ _ ` | Punctuation 3 |
| 97-122 | a-z | Lowercase alphabet |
| 123-126 | { \| } ~ | Punctuation 4 |

This gives **full case sensitivity** – both `A` (65) and `a` (97) exist, no overlay needed.

---

## 3. Control Characters (Slots 0-31) – Teletext & Graphics

These slots have no standard printable representation. In uDos, they are **teletext block graphics** (0x00-0x1F).

| Slot | Teletext Block | Description | Fallback (text) |
|------|----------------|-------------|-----------------|
| 0 | 0x00 | Null / empty | ` ` |
| 1 | 0x01 | Smile | `☺` |
| 2 | 0x02 | Inverse smile | `☻` |
| 3 | 0x03 | Heart | `♥` |
| 4 | 0x04 | Diamond | `♦` |
| 5 | 0x05 | Club | `♣` |
| 6 | 0x06 | Spade | `♠` |
| 7 | 0x07 | Bullet | `•` |
| 8 | 0x08 | Inverse bullet | `◘` |
| 9 | 0x09 | Circle | `○` |
| 10 | 0x0A | Inverse circle | `◙` |
| 11 | 0x0B | Male | `♂` |
| 12 | 0x0C | Female | `♀` |
| 13 | 0x0D | Music note | `♪` |
| 14 | 0x0E | Double note | `♫` |
| 15 | 0x0F | Sun | `☼` |
| 16 | 0x10 | Right arrow | `►` |
| 17 | 0x11 | Left arrow | `◄` |
| 18 | 0x12 | Up/down | `↕` |
| 19 | 0x13 | Double exclamation | `‼` |
| 20 | 0x14 | Paragraph | `¶` |
| 21 | 0x15 | Section | `§` |
| 22 | 0x16 | Full block | `█` |
| 23 | 0x17 | Lower half | `▄` |
| 24 | 0x18 | Upper half | `▀` |
| 25 | 0x19 | Left half | `▌` |
| 26 | 0x1A | Right half | `▐` |
| 27 | 0x1B | Quarter block | `░` |
| 28 | 0x1C | Mid block | `▒` |
| 29 | 0x1D | Dark block | `▓` |
| 30 | 0x1E | Light block | `█` (variant) |
| 31 | 0x1F | Custom (reserved) | ` ` |

---

## 4. Emoji Overlays – One per Slot (128 total)

Each slot (0-127) can have **one emoji overlay**. When emoji rendering is enabled, the emoji is displayed instead of the ANSI/teletext character.

**Mapping rule:** Emoji are **not separate slots** – they are metadata on existing slots.

### Example: Slot 65 (ANSI `A`)

| Mode | Display |
|------|---------|
| Base | `A` |
| Emoji overlay | `🐊` (alligator – for "A") |
| Word alias | `:alligator:` |

### Example: Slot 97 (ANSI `a`)

| Mode | Display |
|------|---------|
| Base | `a` |
| Emoji overlay | `🐜` (ant) |
| Word alias | `:ant:` |

### Example: Slot 3 (Teletext heart `♥`)

| Mode | Display |
|------|---------|
| Base | `♥` |
| Emoji overlay | `❤️` (red heart) |
| Word alias | `:heart:` |

---

## 5. Word Aliases – One per Slot (128 total)

Each slot can have a **word alias** (like `:emoji:` style). This is used by Yarnspinner and the Lexicon to convert between human‑readable terms and slot identifiers.

**Alias mapping table (partial):**

| Slot | Base | Emoji | Word Alias |
|------|------|-------|------------|
| 0 | (null) | `⬛` | `:empty:` |
| 1 | `☺` | `😀` | `:smile:` |
| 2 | `☻` | `😎` | `:cool:` |
| 3 | `♥` | `❤️` | `:heart:` |
| 4 | `♦` | `🔷` | `:diamond:` |
| 5 | `♣` | `🍀` | `:club:` |
| 6 | `♠` | `♠️` | `:spade:` |
| 7 | `•` | `🔘` | `:bullet:` |
| ... | ... | ... | ... |
| 32 | (space) | `⬜` | `:space:` |
| 33 | `!` | `❗` | `:exclaim:` |
| 34 | `"` | `“` | `:quote:` |
| 35 | `#` | `#️⃣` | `:hash:` |
| 36 | `$` | `💵` | `:dollar:` |
| 37 | `%` | `%` | `:percent:` |
| 38 | `&` | `&` | `:and:` |
| 39 | `'` | `'` | `:apostrophe:` |
| 40 | `(` | `(` | `:lparen:` |
| 41 | `)` | `)` | `:rparen:` |
| 42 | `*` | `*️⃣` | `:star:` |
| 43 | `+` | `➕` | `:plus:` |
| 44 | `,` | `,` | `:comma:` |
| 45 | `-` | `➖` | `:minus:` |
| 46 | `.` | `.` | `:period:` |
| 47 | `/` | `/` | `:slash:` |
| 48 | `0` | `0️⃣` | `:zero:` |
| 49 | `1` | `1️⃣` | `:one:` |
| ... | ... | ... | ... |
| 57 | `9` | `9️⃣` | `:nine:` |
| 58 | `:` | `:` | `:colon:` |
| 59 | `;` | `;` | `:semicolon:` |
| 60 | `<` | `<` | `:less:` |
| 61 | `=` | `=` | `:equal:` |
| 62 | `>` | `>` | `:greater:` |
| 63 | `?` | `❓` | `:question:` |
| 64 | `@` | `🐘` | `:at:` |
| 65 | `A` | `🐊` | `:alligator:` |
| 66 | `B` | `🐻` | `:bear:` |
| 67 | `C` | `🐈` | `:cat:` |
| 68 | `D` | `🐕` | `:dog:` |
| 69 | `E` | `🦅` | `:eagle:` |
| 70 | `F` | `🐟` | `:fish:` |
| 71 | `G` | `🐐` | `:goat:` |
| 72 | `H` | `🐴` | `:horse:` |
| 73 | `I` | `🦎` | `:iguana:` |
| 74 | `J` | `🐆` | `:jaguar:` |
| 75 | `K` | `🦘` | `:kangaroo:` |
| 76 | `L` | `🦁` | `:lion:` |
| 77 | `M` | `🐒` | `:monkey:` |
| 78 | `N` | `🐃` | `:bison:` |
| 79 | `O` | `🦉` | `:owl:` |
| 80 | `P` | `🐧` | `:penguin:` |
| 81 | `Q` | `🦆` | `:duck:` |
| 82 | `R` | `🐇` | `:rabbit:` |
| 83 | `S` | `🐍` | `:snake:` |
| 84 | `T` | `🐅` | `:tiger:` |
| 85 | `U` | `🐙` | `:octopus:` |
| 86 | `V` | `🦩` | `:flamingo:` |
| 87 | `W` | `🐋` | `:whale:` |
| 88 | `X` | `❌` | `:x:` |
| 89 | `Y` | `🦬` | `:yak:` |
| 90 | `Z` | `🦓` | `:zebra:` |
| 91 | `[` | `[` | `:lbracket:` |
| 92 | `\` | `\` | `:backslash:` |
| 93 | `]` | `]` | `:rbracket:` |
| 94 | `^` | `^` | `:caret:` |
| 95 | `_` | `_` | `:underscore:` |
| 96 | `` ` `` | `` ` `` | `:backtick:` |
| 97 | `a` | `🐜` | `:ant:` |
| 98 | `b` | `🍌` | `:banana:` |
| 99 | `c` | `🐪` | `:camel:` |
| 100 | `d` | `🐉` | `:dragon:` |
| 101 | `e` | `🥚` | `:egg:` |
| 102 | `f` | `🌿` | `:fern:` |
| 103 | `g` | `🍇` | `:grape:` |
| 104 | `h` | `🍯` | `:honey:` |
| 105 | `i` | `🍦` | `:icecream:` |
| 106 | `j` | `🥤` | `:juice:` |
| 107 | `k` | `🥝` | `:kiwi:` |
| 108 | `l` | `🍋` | `:lemon:` |
| 109 | `m` | `🍄` | `:mushroom:` |
| 110 | `n` | `🥜` | `:nut:` |
| 111 | `o` | `🍊` | `:orange:` |
| 112 | `p` | `🍐` | `:pear:` |
| 113 | `q` | `🤔` | `:question:` |
| 114 | `r` | `🌈` | `:rainbow:` |
| 115 | `s` | `🌞` | `:sun:` |
| 116 | `t` | `🍅` | `:tomato:` |
| 117 | `u` | `☂️` | `:umbrella:` |
| 118 | `v` | `🌋` | `:volcano:` |
| 119 | `w` | `🌊` | `:wave:` |
| 120 | `x` | `❌` | `:xmark:` |
| 121 | `y` | `💛` | `:yellow:` |
| 122 | `z` | `🦓` | `:zebra:` |
| 123 | `{` | `{` | `:lbrace:` |
| 124 | `|` | `|` | `:pipe:` |
| 125 | `}` | `}` | `:rbrace:` |
| 126 | `~` | `~` | `:tilde:` |
| 127 | DEL | `␡` | `:delete:` |

---

## 6. Complete Slots Summary

| Slot Range | Count | ANSI | Teletext (0-31) | Emoji Overlay | Word Alias |
|------------|-------|------|-----------------|---------------|------------|
| 0-31 | 32 | Control codes | 32 blocks | 32 emoji | 32 words |
| 32-126 | 95 | Printable | – | 95 emoji | 95 words |
| 127 | 1 | DEL | – | 1 emoji | 1 word |
| **Total** | **128** | **128** | **32** | **128** | **128** |

---

## 7. Rendering Priority

When displaying a slot (in TUI, ThinUI, or Blitz):

1. If **Emoji mode** is enabled and the slot has an emoji overlay → show emoji
2. Else if the slot has a **word alias** (and word aliases are enabled) → show `:word:`
3. Else if the slot is in range 0-31 and **teletext mode** is enabled → show teletext block
4. Else → show ANSI base character

---

## 8. Lexicon Configuration

```yaml
# ~/.lex/ucode1.yaml
version: 1
edition: uCode1
slots: 128

base_charset: "ASCII 0-127"

teletext_blocks:
  range: 0-31
  mapping: "standard CP437 teletext"

emoji_overlays:
  enabled: true
  mapping: "slot → emoji (128 total)"

word_aliases:
  enabled: true
  mapping: "slot → :word: (128 total)"

rendering:
  priority: ["emoji", "word_alias", "teletext", "ansi"]
```

---

**Locked for uCode1.** This gives you:
- All 128 slots used
- Full uppercase + lowercase + digits + punctuation
- 32 teletext block graphics (slots 0-31)
- 128 emoji overlays (one per slot)
- 128 word aliases (one per slot, `:word:` style)
- Clear rendering priority

This is the complete, integrated Lexicon + Character + Emoji + Word system for uCode1.
