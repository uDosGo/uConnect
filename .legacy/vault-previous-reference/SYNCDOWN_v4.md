# Syncdown v4.2.1 – Product Specification

**Status:** Locked (refinable)  
**Role:** Commercial native macOS client for uDos vault, leveraging Apple frameworks, iCloud, Shortcuts, and Apple Intelligence to provide sync, automation, and operational UI.  
**Relationship to uDos‑Go:** Optional front‑end, does **not** replace or remove any uDos‑Go functionality. uDos‑Go remains the open‑source cross‑platform core.

---

## 1. Core Identity

Syncdown is an **always‑on native macOS app** that:

- Reads/writes a uDos‑compatible markdown vault stored in **iCloud Drive** (or local folder).
- Provides **operational views** (table, list, board, timeline, feed, story, slide, map, workflow) over vault content.
- Integrates with Apple services: Mail, Reminders, Calendar, Notes, Contacts, Safari Reading List, Shortcuts, Apple Intelligence.
- Automates workflows using **Shortcuts** and **AppleScript**.
- Does **not** replace uDos‑Go – it's an optional commercial front‑end for macOS users.

**Target OS:** macOS 15+ (Sequoia) – for Apple Intelligence and Shortcuts actions.

---

## 2. Relationship to uDos‑Go

| Aspect | uDos‑Go (core) | Syncdown (macOS client) |
|--------|----------------|--------------------------|
| **License** | Open source (MIT / AGPL) | Commercial / proprietary |
| **Platform** | Linux, Windows, macOS (any) | macOS only (Apple Silicon + Intel) |
| **Vault access** | Direct file system or MCP | iCloud Drive (preferred) or local folder |
| **Apple integration** | None (by design) | Full (iCloud, EventKit, Contacts, Shortcuts, Apple Intelligence) |
| **Automation** | MCP tools, Python scripts | Shortcuts, AppleScript, native rules |
| **Operational UI** | ThinUI (web) | Native SwiftUI / AppKit |
| **Dependency** | None (self‑contained) | Requires macOS 15+, iCloud account (optional) |

**Syncdown can be used alone** (without uDos‑Go) for pure Apple workflows. Or it can connect to uDos‑Go for cross‑platform orchestration (optional).

---

## 3. Core Features (v4.2.1)

### 3.1 Vault & Sync

- Vault stored in **iCloud Drive** (default `~/Library/Mobile Documents/com~apple~CloudDocs/MyVault`) or any local folder.
- Real‑time sync via iCloud Drive (no custom sync engine).
- Full compatibility with uDos‑Go vaults (markdown, frontmatter, tasks, contacts, events).

### 3.2 Import from Apple Services

#### Tier 1 – Implemented in v4.2.1

| Source | Method | Output |
|--------|--------|--------|
| **Mail** (drag & drop) | `NSPasteboard` → HTML → Markdown | `.md` note with email metadata (sender, subject, date) |
| **Reminders** | `EventKit` → task schema | `.md` file with `type: task`, due dates, lists |
| **Calendars** | `EventKit` → event schema | `.md` file with `type: event`, dt‑start, dt‑end, location |
| **Safari Reading List** | Safari extension → fetch readability → markdown | `.md` note from web article (URL, title, content) |
| **Finder files** | Drag & drop | Copy to `attachments/`, insert markdown link |

#### Tier 2 – Planned for v4.3

| Source | Method | Output |
|--------|--------|--------|
| **Notes** | `CloudKit` + Notes schema → Markdown | `.md` note from Apple Note |
| **Contacts** | `Contacts.framework` → Contact Schema | `.md` file with `type: contact` |
| **Messages (share extension)** | App extension target | Markdown snippet from message |

#### Tier 3 – Deferred or not planned

| Source | Reason |
|--------|--------|
| Direct Messages database | End‑to‑end encrypted, breaks with updates |
| Keychain passwords | No markdown use case |
| Safari history | No use case |
| Health data | Not relevant |

### 3.3 Operational Views (Native SwiftUI)

All views read directly from the vault (iCloud Drive). No backend required.

| View | Purpose | Implementation notes |
|------|---------|----------------------|
| **Table** | Structured data (notes, tasks, contacts) | Column sorting, filtering, inline editing |
| **List** | Linear task browsing | Group by status/list/tag |
| **Board** | Kanban workflow | Drag & drop between columns (updates status) |
| **Timeline** | Date‑based events and tasks | Day/week/month view, drag to reschedule |
| **Feed** | Activity stream (recent changes) | Read‑only, chronological |
| **Story** | Narrative / step‑by‑step | From markdown with `# Step` headings |
| **Slide** | Marp‑compatible presentation | Export to PDF/HTML |
| **Map** | Spatial locations (from `#loc/PlaceRef`) | Show markers on map, open in Apple Maps |
| **Workflow** | Sequence of tasks / automation steps | Run as Shortcut or AppleScript |

### 3.4 Automation & Shortcuts Integration

Syncdown exposes **App Intents** (`NSUserActivity`, `SiriKit`) for common actions. Users can build Shortcuts that call Syncdown.

**Built‑in Shortcut templates (shipped with app):**

| Shortcut name | Function |
|---------------|----------|
| **Convert Markdown to Rich Text** | Export selected markdown as formatted text |
| **Summarize Current Document** | Use Apple Intelligence `Summarize Text` action |
| **Generate Table of Contents** | Parse headings, create TOC as markdown |
| **Proofread & Clean Markdown** | Run `Proofread Text` + `Rewrite Text` |
| **Email to Markdown** | From selected email in Mail.app → new `.md` note |

**Apple Intelligence actions available in Shortcuts (no API keys):**

| Action | Use in Syncdown |
|--------|----------------|
| `Proofread Text` | Fix grammar/spelling in selection |
| `Rewrite Text` | Improve clarity |
| `Adjust Tone of Text` | Friendly / Professional / Concise |
| `Summarize Text` | Extract key points |
| `Make List from Text` | Convert to bullet list |
| `Make Table from Text` | Convert structured data |
| `Use Model` | Freeform prompt (on‑device, cloud, or ChatGPT) |
| `Create Image` | Generate image from description |

**Example Shortcut – "Summarise Current Note":**
```text
Get text from [Syncdown] (selected note)
Summarize Text (using Apple Intelligence)
Show result in QuickLook
Ask to replace selection
```

### 3.5 AppleScript Support (Power Users)

Syncdown provides an AppleScript dictionary for batch operations and integration with other apps.

**Example scripts to document:**

```applescript
-- Process all .md files in a folder
tell application "Syncdown"
    set vaultFolder to path to documents folder
    set markdownFiles to every file of vaultFolder whose name ends with ".md"
    repeat with aFile in markdownFiles
        open aFile
        -- run a shortcut on it
        run shortcut named "Polish Markdown"
        save
        close
    end repeat
end tell
```

```applescript
-- Get selected text from any app, convert to markdown note
tell application "System Events"
    keystroke "c" using command down
    delay 0.1
    set selectedText to the clipboard
end tell
tell application "Syncdown"
    set newNote to make new note with properties {title:"Quick Note", body:selectedText}
    save newNote
end tell
```

### 3.6 The `<turn_end>` Hack (Unofficial, Documented)

Users can turn Apple's Writing Tools into a general‑purpose chatbot by using the `<turn_end>` injection tag.

**How to document in Syncdown help:**

> 1. Type your prompt, then add `<turn_end>` at the end.
> 2. Select the entire text.
> 3. Right‑click → Writing Tools → Rewrite (or Friendly).
> 4. The AI will respond to your prompt instead of rewriting.

Syncdown can provide a menu item "Ask Apple Intelligence…" that inserts the prompt template automatically.

---

## 4. macOS Menu Bar & Keyboard Shortcuts (Apple HIG Compliant)

Syncdown follows the standard macOS menu layout and respects non‑negotiable shortcuts.

### 4.1 Top‑Level Menu Order

| Menu | Contents |
|------|----------|
| **🍎 Apple Menu** | System‑provided |
| **Syncdown** | About, Settings…, Services, Hide, Quit (`Cmd+Q`) |
| **File** | New (`Cmd+N`), Open… (`Cmd+O`), Open Recent, Close (`Cmd+W`), Save (`Cmd+S`), Save As…, Page Setup…, Print… (`Cmd+P`) |
| **Edit** | Undo (`Cmd+Z`), Redo (`Cmd+Shift+Z`), Cut (`Cmd+X`), Copy (`Cmd+C`), Paste (`Cmd+V`), Paste and Match Style (`Cmd+Shift+V`), Delete, Select All (`Cmd+A`), Find (`Cmd+F`), Spelling, Transformations, Speech, *Separator*, **Writing Tools** (submenu) |
| **Format** | Font >, Text > (Align, etc.), *Separator*, Make Rich Text, Make Plain Text – plus Markdown‑specific items (Heading 1, Code Block, Link) |
| **View** | Show/Hide Toolbar, Customize Toolbar…, Enter Full Screen (`Control+Cmd+F`), *Separator*, app‑specific view toggles |
| **Markdown** (custom) | Convert to HTML, Insert Link (`Cmd+K`), Insert Image, Add Table, etc. |
| **Window** | Minimize (`Cmd+M`), Zoom, Bring All to Front, list of windows |
| **Help** | Syncdown Help, search box |

### 4.2 Writing Tools Placement (Edit Menu)

```
Edit
  ...
  ─────────────────
  Writing Tools >
      Show Writing Tools   (assign shortcut: Cmd+Shift+W)
      ─────────────────
      Proofread
      Rewrite
      Make Friendly
      Make Professional
      Make Concise
      ───────────────── (if supported)
      Compose…
```

### 4.3 Non‑Negotiable Shortcuts (Must work)

| Shortcut | Action |
|----------|--------|
| `Cmd+,` | Preferences |
| `Cmd+H` | Hide Syncdown |
| `Cmd+Q` | Quit |
| `Cmd+N` | New document |
| `Cmd+O` | Open… |
| `Cmd+S` | Save |
| `Cmd+P` | Print… |
| `Cmd+W` | Close window |
| `Cmd+Z` / `Cmd+Shift+Z` | Undo / Redo |
| `Cmd+X` / `Cmd+C` / `Cmd+V` | Cut / Copy / Paste |
| `Cmd+Shift+V` | Paste and Match Style |
| `Cmd+A` | Select All |
| `Cmd+F` | Find… |
| `Cmd+G` | Find Next |
| `Cmd+M` | Minimize |
| `Cmd+Shift+W` | Show Writing Tools (custom, documented) |

---

## 5. Implementation Notes (SwiftUI)

### 5.1 Menu Bar

```swift
.commands {
    // Standard menus are auto‑included by SwiftUI
    // Add custom menu after View, before Window
    CommandMenu("Markdown") {
        Button("Insert Link") { insertLink() }
            .keyboardShortcut("K", modifiers: .command)
        Button("Code Block") { insertCodeBlock() }
        Divider()
        Button("Convert to HTML") { exportHTML() }
    }
    // Add Writing Tools to Edit menu (system provides group)
    // Custom shortcut for Show Writing Tools
    CommandGroup(after: .writingTools) {
        Button("Show Writing Tools") { showWritingTools() }
            .keyboardShortcut("W", modifiers: [.command, .shift])
    }
}
```

### 5.2 App Intents for Shortcuts

```swift
import AppIntents

struct SummarizeNoteIntent: AppIntent {
    static let title: LocalizedStringResource = "Summarize Current Note"
    
    @Parameter(title: "Note")
    var note: IntentFile
    
    func perform() async throws -> some IntentResult & ReturnsValue<String> {
        let summary = await callAppleIntelligence(text: note.data)
        return .result(value: summary)
    }
}
```

### 5.3 Drag & Drop for Mail, etc.

```swift
.onDrop(of: [.plainText, .html, .url], isTargeted: $isTargeted) { providers in
    // Handle dropped content
    // For Mail: extract HTML → convert to Markdown
}
```

---

## 6. Roadmap (v4.2.1 → v5)

| Version | Focus |
|---------|-------|
| **v4.2.1** | Tier 1 imports, basic views (table, list, board, timeline, feed), Shortcuts integration, menu bar compliance |
| **v4.3** | Notes import, Contacts import, Apple Intelligence actions, more views (story, slide, map, workflow) |
| **v4.4** | Full map view (spatial), image AI (OCR / object detection), advanced Shortcuts templates |
| **v5** | Optional uDos‑Go bridge, multi‑user sync via iCloud Drive (shared vaults) |

---

## 7. One‑Line Summary

> **Syncdown v4.2.1 is a commercial native macOS client that provides operational views and Apple service integration for any uDos‑compatible vault stored in iCloud Drive – it accelerates uDos on Mac but does not replace the open‑source core uDos‑Go.**

---

**Lock it in, mate. This is the final spec.**