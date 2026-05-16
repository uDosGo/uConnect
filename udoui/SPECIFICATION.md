# UDOUI Specification

## Universal Document Oriented User Interface for uCode1 + uCode2

---

## Part 1: Core Philosophy

**UDOUI is a browser-based GUI layer that extends USX principles to the web.** It shares the same DNA: Liquid templates, ASCII→grid layout, prose rendering, mono theme, and Flowbite icons—but optimized for DOM-based interfaces rather than document surfaces.

| Aspect | USX (Document) | UDOUI (Interface) |
|--------|----------------|-------------------|
| **Primary output** | Terminal, desktop viewer | Browser (Chrome, Safari, Electron) |
| **Layout engine** | ASCII grid → CSS Grid | CSS Grid + Flexbox native |
| **Interaction** | Keyboard-first | Mouse + keyboard + touch |
| **State** | Static document + form answers | Live reactive components |
| **Target** | uDOS CLI, USXD viewer | uCode1, uCode2 web UI |

---

## Part 2: UDOUI JSON Schema

The UDOUI schema is defined in `schema/v1.json` and provides a complete JSON Schema (Draft 2020-12) for describing browser-based user interfaces.

### Schema Structure

```json
{
  "$schema": "https://udoui.dev/schema/v1",
  "version": "1.0.0",
  "meta": { ... },
  "variables": { ... },
  "layout": { ... },
  "components": [ ... ],
  "theming": { ... },
  "interactions": { ... }
}
```

### Key Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `version` | string | ✓ | Schema version (semver) |
| `meta` | object | ✓ | Interface metadata (id, title, description, target) |
| `variables` | object | | Liquid template variables with types and defaults |
| `layout` | object | | Grid/flex/stack layout definition |
| `components` | array | ✓ | Array of UI components to render |
| `theming` | object | | Theme configuration (mono, dark mode, overrides) |
| `interactions` | object | | Keyboard shortcuts and gesture bindings |

---

## Part 3: UDOUI Component Library

### 3.1 Navbar Component

Top navigation bar with logo, title, breadcrumbs, actions, and user menu.

```json
{
  "type": "navbar",
  "content": {
    "logo": "🔷",
    "title": "{{ workspace_name }}",
    "breadcrumbs": ["Home", "Projects", "{{ current_project }}"],
    "actions": [
      { "icon": "search", "action": "search.open", "tooltip": "Search (Ctrl+K)" },
      { "icon": "settings", "action": "settings.open", "tooltip": "Settings" },
      { "icon": "notifications", "badge": 3, "action": "notifications.show" }
    ],
    "user_menu": {
      "avatar": "{{ $user.avatar }}",
      "name": "{{ $user.name }}",
      "email": "{{ $user.email }}",
      "items": [
        { "label": "Profile", "action": "profile.show" },
        { "label": "Preferences", "action": "prefs.show" },
        { "label": "Sign Out", "action": "auth.signout" }
      ]
    }
  }
}
```

### 3.2 Sidebar Menu Component

Collapsible navigation sidebar with nested items, icons, badges, and dividers.

```json
{
  "type": "menu",
  "position": "left",
  "collapsible": true,
  "items": [
    {
      "id": "dashboard",
      "label": "Dashboard",
      "icon": "dashboard",
      "route": "/",
      "active": true
    },
    {
      "id": "files",
      "label": "Files",
      "icon": "folder",
      "route": "/files",
      "children": [
        { "label": "Documents", "route": "/files/docs" },
        { "label": "Code", "route": "/files/code" },
        { "label": "Assets", "route": "/files/assets" }
      ]
    },
    {
      "id": "tasks",
      "label": "Tasks",
      "icon": "checklist",
      "route": "/tasks",
      "badge": "{{ pending_tasks_count }}"
    },
    {
      "type": "divider"
    },
    {
      "id": "settings",
      "label": "Settings",
      "icon": "settings",
      "route": "/settings"
    }
  ]
}
```

### 3.3 Prose Content Component

Markdown/HTML content renderer with full USX formatting support.

```json
{
  "type": "prose",
  "content": "# Welcome to uCode {{ $user.first_name }}\n\n## Getting Started\n\nYour workspace `{{ workspace_name }}` is ready.\n\n- **Files:** {{ file_count }} documents\n- **Tasks:** {{ pending_tasks }} pending\n- **Last sync:** {{ last_sync | date: 'relative' }}\n\n```javascript\nconsole.log('Hello, uCode!');\n```\n\n> Prose content supports full USX formatting including code blocks, lists, and tables.",
  "format": "markdown",
  "max_width": "70ch",
  "dropcap": true
}
```

### 3.4 Card Component

Versatile card container with header, content, footer, and multiple visual variants.

```json
{
  "type": "card",
  "title": "Project Stats",
  "icon": "chart",
  "variant": "outline",
  "content": {
    "type": "stats_grid",
    "columns": 3,
    "items": [
      { "label": "Files", "value": "{{ file_count }}", "trend": "+{{ new_files }}" },
      { "label": "Lines of Code", "value": "{{ loc }}", "trend": "+{{ loc_growth }}" },
      { "label": "Tasks", "value": "{{ pending_tasks }}", "trend": "{{ completed_tasks }} done" }
    ]
  },
  "footer": {
    "text": "Last updated: {{ last_updated | date: 'relative' }}",
    "action": { "label": "Refresh", "action": "stats.refresh" }
  }
}
```

### 3.5 Data Table Component

Sortable, filterable, searchable, paginated data table.

```json
{
  "type": "table",
  "columns": [
    { "field": "name", "label": "Name", "sortable": true },
    { "field": "type", "label": "Type", "filterable": true },
    { "field": "size", "label": "Size", "sortable": true, "align": "right" },
    { "field": "modified", "label": "Modified", "sortable": true }
  ],
  "data": "{{ files | from_storage }}",
  "searchable": true,
  "paginated": true,
  "rows_per_page": 25,
  "on_row_click": "file.open"
}
```

### 3.6 Terminal Component

Embedded terminal emulator with shell integration.

```json
{
  "type": "terminal",
  "height": "300px",
  "shell": "bash",
  "font_family": "var(--udoui-font-mono)",
  "font_size": "14px",
  "theme": "{{ theme == 'dark' ? 'dark' : 'light' }}",
  "commands": [
    { "command": "ls -la", "when": "ready" },
    { "command": "echo 'Welcome to uCode'", "when": "ready" }
  ],
  "features": {
    "history": true,
    "copy_paste": true,
    "resizable": true
  }
}
```

### 3.7 Form Component (Typeform-Style)

Multi-step wizard-style form with intro, input, choice, scale, and confirm steps.

```json
{
  "type": "story_form",
  "title": "Project Setup",
  "steps": [
    {
      "id": "step1",
      "type": "intro",
      "title": "Welcome!",
      "description": "Let's set up your project in {{ total_steps }} steps."
    },
    {
      "id": "step2",
      "type": "input",
      "label": "Project Name",
      "variable": "project_name",
      "placeholder": "my-awesome-project",
      "required": true
    },
    {
      "id": "step3",
      "type": "choice",
      "label": "Template",
      "variable": "template",
      "options": [
        { "value": "blank", "label": "Blank", "icon": "empty" },
        { "value": "react", "label": "React", "icon": "react" },
        { "value": "node", "label": "Node.js", "icon": "node" }
      ]
    },
    {
      "id": "step4",
      "type": "scale",
      "label": "Experience Level",
      "variable": "experience",
      "min": 1,
      "max": 5,
      "labels": { "1": "Beginner", "5": "Expert" }
    },
    {
      "id": "step5",
      "type": "confirm",
      "title": "Ready to create {{ project_name }}?",
      "confirm_label": "Create Workspace",
      "variable": "confirmed"
    }
  ],
  "storage": {
    "save_to": "localStorage",
    "key": "project_setup_{{ session_id }}"
  }
}
```

### 3.8 Chart Component

Simple line/bar chart component for data visualization.

```json
{
  "type": "chart",
  "title": "Weekly Activity",
  "type": "line",
  "data": {
    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
    "datasets": [
      {
        "label": "Commits",
        "data": "{{ weekly_commits }}",
        "color": "var(--udoui-primary)"
      },
      {
        "label": "Tasks",
        "data": "{{ weekly_tasks }}",
        "color": "var(--udoui-secondary)"
      }
    ]
  },
  "height": "200px",
  "tooltips": true
}
```

---

## Part 4: UDOUI CSS Variables (Mono Theme + Flowbite)

The complete CSS variable system is defined in `ui/src/assets/udoui.css`. Key variables:

```css
/* Color System - Mono only */
--udoui-bg: 255 255 255;
--udoui-surface: 248 250 252;
--udoui-text: 15 23 42;
--udoui-text-muted: 100 116 139;
--udoui-border: 226 232 240;
--udoui-primary: 15 23 42;
--udoui-primary-text: 255 255 255;

/* Typography */
--udoui-font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
--udoui-font-heading: 'Inter', system-ui, sans-serif;
--udoui-font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;

/* Spacing scale */
--udoui-spacing-1: 0.25rem;  /* 4px */
--udoui-spacing-2: 0.5rem;   /* 8px */
--udoui-spacing-3: 0.75rem;  /* 12px */
--udoui-spacing-4: 1rem;     /* 16px */
--udoui-spacing-5: 1.25rem;  /* 20px */
--udoui-spacing-6: 1.5rem;   /* 24px */
--udoui-spacing-8: 2rem;     /* 32px */
--udoui-spacing-10: 2.5rem;  /* 40px */
--udoui-spacing-12: 3rem;    /* 48px */

/* Border radius */
--udoui-radius-sm: 0.25rem;
--udoui-radius-md: 0.5rem;
--udoui-radius-lg: 0.75rem;
--udoui-radius-xl: 1rem;

/* Shadows (flat, minimal) */
--udoui-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--udoui-shadow-md: 0 1px 3px 0 rgb(0 0 0 / 0.1);
--udoui-shadow-lg: 0 4px 6px -1px rgb(0 0 0 / 0.1);
```

### Dark Mode

```css
.dark {
  --udoui-bg: 10 14 23;
  --udoui-surface: 21 27 41;
  --udoui-text: 241 245 249;
  --udoui-text-muted: 148 163 184;
  --udoui-border: 51 65 85;
  --udoui-primary: 241 245 249;
  --udoui-primary-text: 10 14 23;
}
```

### Font Zoom Support

```css
[data-font-size="small"] { font-size: 14px; }
[data-font-size="medium"] { font-size: 16px; }
[data-font-size="large"] { font-size: 18px; }
[data-font-size="xlarge"] { font-size: 20px; }
```

---

## Part 5: UDOUI React Renderer

The UDOUI React Renderer is a TypeScript/React component that takes a UDOUI schema and renders it as a complete browser interface. It handles:

- **Liquid template resolution** — `{{ variable }}` expressions with filter support
- **Component rendering** — Maps schema component types to React components
- **Layout management** — CSS Grid layout based on schema template
- **Action dispatching** — Routes user interactions to handler functions
- **Theme application** — Applies mono theme with dark mode support

### Renderer API

```tsx
interface UDOUIRendererProps {
  schema: UDOUISchema;
  variables?: Record<string, any>;
  onAction?: (action: string, params: any) => void;
}
```

### Component Mapping

| Schema Type | React Component | Description |
|-------------|-----------------|-------------|
| `navbar` | `UDOUINavbar` | Top navigation bar |
| `menu` | `UDOUISidebar` | Sidebar navigation menu |
| `prose` | `UDOUIProse` | Markdown/HTML content |
| `card` | `UDOUICard` | Card container |
| `table` | `UDOUITable` | Data table |
| `terminal` | `UDOUITerminal` | Terminal emulator |
| `story_form` | `UDOUIStoryForm` | Multi-step form |
| `chart` | `UDOUIChart` | Data chart |
| `status_bar` | `UDOUIStatusBar` | Status bar |
| `list` | `UDOUIList` | Simple list |

---

## Part 6: uCode1 vs uCode2 Targets

### uCode1 (Legacy Browser)

Target configuration: `targets/ucode1.json`

- CSS Grid: ✓
- Flexbox: ✓
- localStorage: ✓
- WebGL: ✗
- Service Workers: ✗
- Bundle: Small (optimized)
- Polyfills: CSS Grid, Flexbox, IntersectionObserver
- Components: All except Chart

### uCode2 (Modern Browser)

Target configuration: `targets/ucode2.json`

- CSS Grid: ✓
- Flexbox: ✓
- localStorage: ✓
- WebGL: ✓
- Service Workers: ✓
- Web Components: ✓
- Bundle: Full
- PWA: Enabled with offline support
- Features: AI chat, voice input, drag & drop, File System API
- Components: All available

---

## Part 7: Complete UDOUI Example

```json
{
  "$schema": "https://udoui.dev/schema/v1",
  "version": "1.0.0",
  "meta": {
    "id": "ucode-workspace",
    "title": "uCode Development Environment",
    "target": "ucode2",
    "responsive": true
  },
  
  "variables": {
    "workspace": "{{ $workspace.name }}",
    "user": "{{ $user.name }}",
    "theme": "{{ $prefs.theme | default: 'light' }}"
  },
  
  "layout": {
    "type": "grid",
    "columns": 12,
    "template": {
      "header": "1 / 13",
      "sidebar": "1 / 4",
      "main": "4 / 10",
      "right": "10 / 13",
      "footer": "1 / 13"
    }
  },
  
  "components": [
    {
      "id": "header",
      "type": "navbar",
      "content": {
        "title": "{{ workspace }}",
        "actions": [
          { "icon": "search", "action": "search.toggle" },
          { "icon": "settings", "action": "settings.open" }
        ]
      }
    },
    {
      "id": "sidebar",
      "type": "menu",
      "items": [
        { "label": "Dashboard", "icon": "dashboard", "route": "/" },
        { "label": "Editor", "icon": "code", "route": "/editor" },
        { "label": "Terminal", "icon": "terminal", "route": "/terminal" }
      ]
    },
    {
      "id": "main",
      "type": "prose",
      "content": "# Welcome back, {{ user }}\n\nYour workspace `{{ workspace }}` is ready.\n\n## Quick Actions\n\n- [Create New File](/editor/new)\n- [Open Recent](/files/recent)\n- [Run Setup](/setup)"
    },
    {
      "id": "right_panel",
      "type": "card",
      "title": "Activity",
      "content": {
        "type": "list",
        "items": "{{ recent_activity }}"
      }
    },
    {
      "id": "footer",
      "type": "status_bar",
      "content": "Connected • {{ user }} • {{ workspace }}"
    }
  ],
  
  "theming": {
    "mono": true,
    "flowbite_icons": true,
    "dark_mode_supported": true
  }
}
```

---

## Summary

| Feature | Specification |
|---------|---------------|
| **Same Liquid engine** | `{{ variables }}`, `{{ $globals }}`, filters |
| **Same CSS variables** | Light/dark, font zoom, spacing |
| **Same mono theme** | No hardcoded colors, Flowbite icons |
| **Browser-optimized** | CSS Grid, Flexbox, native web APIs |
| **Dual target** | uCode1 (legacy) + uCode2 (modern) |
| **Component library** | Navbar, Sidebar, Prose, Card, Table, Terminal, Form, Chart |

The schema is fully compatible with USX while adding UI-specific components for browser-based interfaces in uCode1 and uCode2.
