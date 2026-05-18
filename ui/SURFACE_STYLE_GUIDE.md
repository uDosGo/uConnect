# uDosConnect Surface Style Guide

Based on **uCode2** design patterns - the reference implementation for all surfaces.

## Philosophy

Surfaces should be:
- **Clean & Minimal**: Flat design, subtle shadows, clear hierarchy
- **Consistent**: Use standardized components, icons, and patterns
- **Semantic**: Use SVG icons from Flowbite/Feather, not emojis
- **Accessible**: Proper contrast, readable typography, clear states
- **Themed**: Support light and dark modes via CSS custom properties

---

## Design System

### Colors (CSS Custom Properties)

All surfaces should define these CSS variables:

```css
/* Light Mode */
.surface-name {
  --background: #ffffff;
  --text-primary: #1a1a2e;
  --text-secondary: #6b6b6b;
  --text-tertiary: #b0b0b0;
  --border-color: #e9e9e7;
  --surface-background: #f7f6f3;
  --surface-hover: #e9e9e7;
  --primary-color: #2e7d64;
  --primary-hover: #236b54;
  --code-background: #1e1e1e;
  --info-background: #e3f2fd;
  --info-color: #1565c0;
  --success-background: #e8f5e9;
  --success-color: #2e7d64;
  --danger-background: #fce4e4;
  --danger-color: #eb5757;
  --danger-border: #eb5757;
  --warning-background: #fff3e0;
  --warning-color: #f57c00;
}

/* Dark Mode */
.ucode3-dark .surface-name {
  --background: #1a1a2e;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0c0;
  --text-tertiary: #6b6b8a;
  --border-color: #2a2a4a;
  --surface-background: #16213e;
  --surface-hover: #2a2a4a;
  --primary-color: #2e7d64;
  --primary-hover: #236b54;
  --code-background: #1e1e1e;
  --info-background: #1a2a3e;
  --info-color: #7db0e0;
  --success-background: #1a3a2e;
  --success-color: #7dcea0;
  --danger-background: #3a1a1a;
  --danger-color: #eb5757;
  --danger-border: #eb5757;
  --warning-background: #3a2a1a;
  --warning-color: #f57c00;
}
```

### Typography

```css
/* Headers */
h1 { font-size: 1.75rem; font-weight: 600; margin: 0 0 1rem; }
h2 { font-size: 1.5rem; font-weight: 600; margin: 0 0 0.875rem; }
h3 { font-size: 1.25rem; font-weight: 600; margin: 0 0 0.75rem; }
h4 { font-size: 1.125rem; font-weight: 600; margin: 0 0 0.5rem; }

/* Body */
body { 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-primary);
}

/* Small text */
.text-sm { font-size: 0.875rem; }
.text-xs { font-size: 0.75rem; }

/* Text colors */
.text-secondary { color: var(--text-secondary); }
.text-tertiary { color: var(--text-tertiary); }
```

---

## Icon Usage

### Import the SurfaceIcons Component

```vue
<script setup lang="ts">
import SurfaceIcon from '@/components/SurfaceIcons.vue'
</script>
```

### Using Icons

```vue
<!-- Basic icon -->
<SurfaceIcon name="folder" />

<!-- Custom size -->
<SurfaceIcon name="file" :size="16" />

<!-- With class -->
<SurfaceIcon name="plus" class="text-primary" />
```

### Common Icon Mappings

| Purpose | Icon Name | Use Case |
|---------|-----------|----------|
| Files | `file`, `file-text`, `folder` | File browsers, lists |
| Actions | `plus`, `edit`, `trash`, `save` | Buttons, toolbars |
| Navigation | `chevron-left`, `arrow-right` | Back buttons, links |
| Status | `check`, `x`, `alert-circle`, `info` | Alerts, badges |
| Media | `image`, `video`, `music` | Content types |
| Tech | `code`, `terminal`, `github` | Dev tools |
| Search | `search`, `filter`, `sliders` | Search bars, filters |

**Never use emoji icons (🔧, 📁, ✅, etc.) - always use SVG icons.**

---

## Component Patterns

### 1. Surface Header

```vue
<template>
  <div class="surface-header">
    <div class="header-left">
      <SurfaceIcon name="folder" class="header-icon" />
      <h1>Surface Title</h1>
    </div>
    <div class="header-right">
      <button class="btn-secondary">
        <SurfaceIcon name="settings" :size="16" />
        Settings
      </button>
    </div>
  </div>
</template>

<style scoped>
.surface-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  color: var(--primary-color);
}

.header-right {
  display: flex;
  gap: 0.5rem;
}
</style>
```

### 2. Button Styles

```vue
<style scoped>
/* Primary button */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

/* Secondary button */
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--surface-background);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
}

/* Icon-only button */
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
}

/* Small button */
.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.8125rem;
}
</style>
```

### 3. Card/Panel Pattern

```vue
<template>
  <div class="card">
    <div class="card-header">
      <h3>Card Title</h3>
      <button class="btn-icon">
        <SurfaceIcon name="more-horizontal" :size="16" />
      </button>
    </div>
    <div class="card-body">
      <!-- Content here -->
    </div>
    <div class="card-footer">
      <button class="btn-secondary btn-sm">Cancel</button>
      <button class="btn-primary btn-sm">Save</button>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.card-body {
  padding: 1rem;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  background: var(--background);
}
</style>
```

### 4. Table/List Pattern

```vue
<template>
  <div class="table-container">
    <div class="table-header">
      <span class="th">Name</span>
      <span class="th">Type</span>
      <span class="th">Date</span>
      <span class="th">Actions</span>
    </div>
    <div v-for="item in items" :key="item.id" class="table-row">
      <span class="td">
        <SurfaceIcon name="file" :size="16" />
        {{ item.name }}
      </span>
      <span class="td">{{ item.type }}</span>
      <span class="td">{{ item.date }}</span>
      <span class="td actions">
        <button class="btn-icon btn-sm">
          <SurfaceIcon name="edit" :size="14" />
        </button>
        <button class="btn-icon btn-sm">
          <SurfaceIcon name="trash" :size="14" />
        </button>
      </span>
    </div>
  </div>
</template>

<style scoped>
.table-container {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 120px;
  padding: 0.75rem 1rem;
  background: var(--surface-background);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 120px;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s;
}

.table-row:hover {
  background: var(--surface-hover);
}

.table-row:last-child {
  border-bottom: none;
}

.td {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.td.actions {
  justify-content: flex-end;
  gap: 0.25rem;
}
</style>
```

### 5. Empty State Pattern

```vue
<template>
  <div class="empty-state">
    <div class="empty-icon">
      <SurfaceIcon name="folder" :size="48" />
    </div>
    <h3>No Items Found</h3>
    <p>Get started by creating your first item.</p>
    <button class="btn-primary">
      <SurfaceIcon name="plus" :size="16" />
      Create Item
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  margin-bottom: 1.5rem;
  color: var(--text-tertiary);
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.empty-state p {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}
</style>
```

### 6. Loading State Pattern

```vue
<template>
  <div class="loading-state">
    <div class="spinner"></div>
    <p>Loading...</p>
  </div>
</template>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

### 7. Alert/Message Pattern

```vue
<template>
  <div class="alert" :class="type">
    <SurfaceIcon :name="icon" :size="18" />
    <div class="alert-content">
      <h4 v-if="title">{{ title }}</h4>
      <p>{{ message }}</p>
    </div>
    <button class="btn-icon btn-sm" @click="$emit('close')">
      <SurfaceIcon name="x" :size="14" />
    </button>
  </div>
</template>

<style scoped>
.alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid;
}

.alert-info {
  background: var(--info-background);
  border-color: var(--info-color);
  color: var(--info-color);
}

.alert-success {
  background: var(--success-background);
  border-color: var(--success-color);
  color: var(--success-color);
}

.alert-danger {
  background: var(--danger-background);
  border-color: var(--danger-color);
  color: var(--danger-color);
}

.alert-content {
  flex: 1;
}

.alert-content h4 {
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.alert-content p {
  margin: 0;
  font-size: 0.875rem;
}
</style>
```

---

## Layout Patterns

### Standard Surface Container

```vue
<template>
  <div class="surface-container">
    <!-- Header -->
    <div class="surface-header">...</div>
    
    <!-- Main content area -->
    <div class="surface-main">
      <!-- Content here -->
    </div>
    
    <!-- Optional footer/actions -->
    <div class="surface-footer">...</div>
  </div>
</template>

<style scoped>
.surface-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--background);
}

.surface-main {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.surface-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  background: var(--surface-background);
}
</style>
```

### Grid Layout

```vue
<style scoped>
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}
</style>
```

---

## Accessibility Guidelines

1. **Color Contrast**: Ensure text has at least 4.5:1 contrast ratio
2. **Focus States**: All interactive elements should have visible focus states
3. **Keyboard Navigation**: Support Tab, Enter, Escape keys
4. **ARIA Labels**: Use proper ARIA attributes for screen readers
5. **Alt Text**: Provide meaningful descriptions for icons

```vue
<!-- Good: Accessible button -->
<button 
  class="btn-primary" 
  :aria-label="`Delete ${item.name}`"
  @click="handleDelete(item)"
>
  <SurfaceIcon name="trash" :size="16" aria-hidden="true" />
  Delete
</button>
```

---

## Migration Checklist

When updating a surface to match uCode2 patterns:

- [ ] Replace all emoji icons with `<SurfaceIcon>` components
- [ ] Add CSS custom properties for theming
- [ ] Update button styles to use `.btn-primary`, `.btn-secondary`, etc.
- [ ] Ensure proper header structure with icons
- [ ] Use consistent card/panel patterns
- [ ] Add proper loading and empty states
- [ ] Test light and dark modes
- [ ] Verify keyboard navigation
- [ ] Check mobile responsiveness

---

## Quick Reference

### Common Button Combinations

```vue
<!-- Primary action -->
<button class="btn-primary">
  <SurfaceIcon name="plus" :size="16" />
  New Item
</button>

<!-- Secondary action -->
<button class="btn-secondary btn-sm">
  <SurfaceIcon name="refresh" :size="14" />
  Refresh
</button>

<!-- Icon only -->
<button class="btn-icon" title="Edit">
  <SurfaceIcon name="edit" :size="16" />
</button>

<!-- Danger action -->
<button class="btn-secondary" style="color: var(--danger-color); border-color: var(--danger-color);">
  <SurfaceIcon name="trash" :size="16" />
  Delete
</button>
```

### Common Icon + Text Patterns

```vue
<!-- File item -->
<div class="file-item">
  <SurfaceIcon name="file-text" :size="18" />
  <span>Document.md</span>
</div>

<!-- Status indicator -->
<div class="status-badge success">
  <SurfaceIcon name="check-circle" :size="14" />
  <span>Connected</span>
</div>

<!-- Breadcrumb -->
<div class="breadcrumb">
  <SurfaceIcon name="folder" :size="14" />
  <span>Projects</span>
  <SurfaceIcon name="chevron-right" :size="14" />
  <span>Website</span>
</div>
```

---

## Resources

- **Icon Component**: `/src/components/SurfaceIcons.vue`
- **Reference Surface**: `/src/views/surfaces/uCode2Surface.vue`
- **Color Palette**: Based on neutral grays with green primary (#2e7d64)
- **Icon Set**: Flowbite/Feather icons (80+ icons available)

For questions or additions to this guide, update this document and notify the team.