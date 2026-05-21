# udoui React Text/Code Editor Component

## Overview

A React-based text/code editor component for the udoui surface system. This component provides a rich editing experience for Markdown documents, code files, and prose content within the uCode2 Publish surface.

## Architecture

```
udoui/
  components/
    Editor/
      index.tsx          — Main editor component
      Toolbar.tsx        — Formatting toolbar
      EditorArea.tsx     — Textarea/code editing area
      Preview.tsx        — Live preview pane
      StatusBar.tsx      — Line/col, mode indicator
    types/
      editor.ts          — TypeScript interfaces
    hooks/
      useEditor.ts       — Editor state management
      useKeyboard.ts     — Keyboard shortcuts
```

## Component API

### `<Editor>`

```tsx
interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  mode: 'markdown' | 'code' | 'plain';
  language?: string;       // Syntax highlighting language (for code mode)
  placeholder?: string;
  readOnly?: boolean;
  showPreview?: boolean;   // Split pane preview (markdown mode)
  theme?: 'dark' | 'light';
  fontSize?: number;
  fontFamily?: string;
  onSave?: (value: string) => void;
  onPublish?: (value: string) => void;
}
```

### State Management (useEditor hook)

```tsx
interface EditorState {
  value: string;
  cursorPosition: { line: number; col: number };
  selection: { start: number; end: number } | null;
  history: string[];        // Undo/redo stack
  historyIndex: number;
  isDirty: boolean;
  wordCount: number;
  charCount: number;
}
```

## Features

### 1. Markdown Mode
- Syntax highlighting for Markdown (headings, bold, italic, code, links, lists)
- Live preview pane (split view or toggle)
- Toolbar buttons: Bold, Italic, Heading, Link, Image, Code, List, Blockquote
- Keyboard shortcuts: Ctrl+B, Ctrl+I, Ctrl+K (link), etc.

### 2. Code Mode
- Syntax highlighting via highlight.js or Prism.js
- Language selector
- Line numbers
- Bracket matching
- Auto-indentation

### 3. Plain Text Mode
- Minimal interface
- Word wrap toggle
- Line count

### 4. Toolbar

```
[B] [I] [H] [🔗] [🖼] [</>] | [👁 Preview] [📤 Publish]
```

- Formatting buttons with active state detection
- Preview toggle
- Publish action button
- Keyboard shortcut tooltips

### 5. Status Bar

```
Line: 42  Col: 15  Words: 1,234  Mode: Markdown  ● Unsaved
```

### 6. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+S | Save |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| Ctrl+B | Bold |
| Ctrl+I | Italic |
| Ctrl+K | Insert Link |
| Ctrl+Shift+P | Toggle Preview |
| Ctrl+P | Publish |

## Integration with uCode2 Surface

The editor component mounts inside the `editor` tab of uCode2Surface.vue via the ReactRenderer bridge:

```vue
<template>
  <div class="editor-view">
    <ReactRenderer
      component="Editor"
      :props="{
        value: editorContent,
        mode: 'markdown',
        showPreview: true,
        onSave: handleSave,
        onPublish: handlePublish
      }"
    />
  </div>
</template>
```

## Styling

- Dark theme by default (matching uCode2 surface)
- CSS variables for theming:
  ```css
  --editor-bg: #0f172a;
  --editor-text: #e2e8f0;
  --editor-toolbar-bg: #1e293b;
  --editor-border: #334155;
  --editor-accent: #60a5fa;
  --editor-line-numbers: #475569;
  ```
- Font: system monospace stack (`'SF Mono', 'Fira Code', 'SourceCodePro', monospace`)

## Implementation Priority

1. **Phase 1** — Basic textarea with toolbar and mode switching
2. **Phase 2** — Markdown syntax highlighting and preview pane
3. **Phase 3** — Code syntax highlighting and language support
4. **Phase 4** — Undo/redo, keyboard shortcuts, status bar
5. **Phase 5** — Publish integration with uCode2 workflow

## File Structure

```
udoui/
  components/
    Editor/
      index.tsx
      Toolbar.tsx
      EditorArea.tsx
      Preview.tsx
      StatusBar.tsx
  types/
    editor.ts
  hooks/
    useEditor.ts
    useKeyboard.ts
  specs/
    react-editor-component.md    ← This file
```
