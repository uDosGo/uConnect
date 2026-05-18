# Surface Component Style Guide

This document outlines the standardized style and structure for all surface components in the uDosGo Connect UI.

## Overview

All surface components follow a consistent pattern with:
- Standardized header structure
- Loading, error, and empty states
- Grid-based content layout
- Responsive design
- Dark mode support
- CSS custom properties for theming

## Standard Structure

### 1. Template Structure

```vue
<template>
  <div class="surface-name">
    <!-- Surface Header -->
    <div class="surface-header">
      <div class="header-left">
        <SurfaceIcon name="icon-name" class="header-icon" :size="24" />
        <div>
          <h1>Surface Title</h1>
          <p class="surface-tagline">Brief description</p>
          <p class="surface-definition">
            <strong>What's this?</strong> Detailed explanation of the surface's purpose
          </p>
        </div>
      </div>
      <div class="header-right">
        <!-- Action buttons -->
      </div>
    </div>

    <!-- Info Banner (optional) -->
    <div class="info-banner">
      <SurfaceIcon name="info" :size="18" />
      <div>
        <strong>Title</strong>
        Description text
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading...</p>
      <p class="helper-text">This usually takes a few seconds.</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <SurfaceIcon name="alert-circle" :size="48" />
      </div>
      <h3>Couldn't load content</h3>
      <p>{{ error }}</p>
      <p class="helper-text">
        Try:
        <br>
        • Refreshing the page
        <br>
        • Checking your internet connection
        <br>
        • Making sure uDOS services are running
      </p>
      <div class="error-actions">
        <button @click="retryLoad" class="btn-primary">
          <SurfaceIcon name="refresh" :size="16" />
          Try Again
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="items.length === 0" class="empty-state">
      <div class="empty-icon">
        <SurfaceIcon name="icon-name" :size="48" />
      </div>
      <h3>{{ searchQuery ? 'No items found' : 'No items yet' }}</h3>
      <p>{{ searchQuery ? 'Try a different search term' : 'Create your first item' }}</p>
      <button v-if="!searchQuery" class="btn-primary" @click="createNew">
        <SurfaceIcon name="plus" :size="16" />
        New Item
      </button>
      <p v-if="!searchQuery" class="helper-text">
        <SurfaceIcon name="info" :size="14" />
        Additional helpful text
      </p>
    </div>

    <!-- Main Content -->
    <div v-else class="main-container">
      <!-- Controls -->
      <div class="action-bar">
        <div class="search-container" v-if="hasSearch">
          <SurfaceIcon name="search" :size="16" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            @input="filterItems"
            class="search-input"
          >
          <button v-if="searchQuery" class="btn-icon btn-sm" @click="clearSearch">
            <SurfaceIcon name="x" :size="14" />
          </button>
        </div>
        <button class="btn-secondary" @click="refreshItems">
          <SurfaceIcon name="refresh" :size="16" />
          Refresh
        </button>
        <button class="btn-primary" @click="createNew" v-if="hasCreate">
          <SurfaceIcon name="plus" :size="16" />
          New
        </button>
      </div>

      <!-- Grid -->
      <div class="item-grid">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="item-card"
          @click="openItem(item)"
        >
          <div class="item-header">
            <SurfaceIcon :name="item.icon || 'default-icon'" :size="20" class="item-icon" />
            <h3 class="item-name">{{ item.name }}</h3>
            <span class="item-type">{{ item.type }}</span>
          </div>

          <div class="item-meta">
            <span class="item-category">{{ item.category }}</span>
            <span class="item-version" v-if="item.version">v{{ item.version }}</span>
            <span class="item-size" v-if="item.size">{{ formatSize(item.size) }}</span>
            <span class="item-updated" v-if="item.updatedAt">Updated {{ formatTime(item.updatedAt) }}</span>
          </div>

          <div class="item-description" v-if="item.description">
            {{ item.description }}
          </div>

          <div class="item-actions">
            <button
              class="btn-icon btn-sm"
              @click.stop="action1(item)"
              :title="action1Title"
            >
              <SurfaceIcon name="icon1" :size="14" />
            </button>
            <button
              class="btn-icon btn-sm"
              @click.stop="action2(item)"
              :title="action2Title"
            >
              <SurfaceIcon name="icon2" :size="14" />
            </button>
            <button
              class="btn-icon btn-sm"
              @click.stop="action3(item)"
              :title="action3Title"
            >
              <SurfaceIcon name="icon3" :size="14" />
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="item-stats">
        <span>{{ filteredItems.length }} items</span>
        <span>{{ activeItems }} active</span>
        <span>{{ totalSize }} total</span>
        <span>{{ itemCategories }} categories</span>
      </div>
    </div>
  </div>
</template>
```

### 2. Script Structure

```javascript
<script>
import { ref, computed, onMounted } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import SurfaceIcon from '@/components/SurfaceIcons.vue'

export default {
  name: 'SurfaceName',
  components: {
    SurfaceIcon
  },
  setup() {
    // State
    const isLoading = ref(false)
    const error = ref(null)
    const items = ref([])
    const searchQuery = ref('')

    // Computed
    const activeItems = computed(() => items.value.filter(i => i.active).length)
    const itemCategories = computed(() => [...new Set(items.value.map(i => i.category))].length)
    const filteredItems = computed(() => {
      if (!searchQuery.value) return items.value
      const query = searchQuery.value.toLowerCase()
      return items.value.filter(item =>
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query)
      )
    })

    // Methods
    const loadItems = async () => {
      isLoading.value = true
      error.value = null
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        // Mock data
        items.value = [...]
      } catch (err) {
        error.value = err.message || 'Failed to load'
      } finally {
        isLoading.value = false
      }
    }

    const createNew = () => { alert('Create new') }
    const openItem = (item) => { alert(`Open ${item.name}`) }
    const action1 = (item) => { alert(`Action 1 on ${item.name}`) }
    const action2 = (item) => { alert(`Action 2 on ${item.name}`) }
    const action3 = (item) => { alert(`Action 3 on ${item.name}`) }
    const refreshItems = () => { loadItems() }
    const retryLoad = () => { error.value = null; loadItems() }
    const clearSearch = () => { searchQuery.value = '' }
    const filterItems = () => { /* Handled by computed */ }
    const formatSize = (bytes) => { /* Format bytes to KB/MB */ }
    const formatTime = (dateString) => { /* Format relative time */ }

    // Lifecycle
    onMounted(() => { loadItems() })

    return {
      isLoading, error, items, searchQuery, filteredItems,
      activeItems, itemCategories,
      loadItems, createNew, openItem, action1, action2, action3,
      refreshItems, retryLoad, clearSearch, filterItems,
      formatSize, formatTime
    }
  }
}
</script>
```

### 3. CSS Custom Properties

All surfaces use the following CSS custom properties for consistent theming:

```css
/* Light mode */
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
  --danger-color: #eb5757;
  --success-color: #2e7d64;
  --warning-color: #f57c00;
  --info-color: #1565c0;
}

/* Dark mode */
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
  --danger-color: #eb5757;
  --success-color: #7dcea0;
  --warning-color: #f57c00;
  --info-color: #7db0e0;
}
```

### 4. Scoped Styles Structure

```css
<style scoped>
.surface-name {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--background);
  color: var(--text-primary);
}

/* Header */
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

.surface-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.surface-tagline {
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.surface-definition {
  color: var(--text-tertiary);
  font-size: 0.9rem;
  margin: 0;
}

.header-right {
  display: flex;
  gap: 0.5rem;
}

/* Info Banner */
.info-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--info-background);
  border-radius: 8px;
  margin: 1rem;
  color: var(--info-color);
}

/* Buttons */
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
  color: var(--text-secondary);
}

.btn-icon:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
  color: var(--text-primary);
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.8125rem;
  height: auto;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
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

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 4rem 2rem;
  text-align: center;
}

.error-icon {
  margin-bottom: 1.5rem;
  color: var(--danger-color);
}

.error-state h3 {
  margin-bottom: 0.5rem;
}

.error-state p {
  margin-bottom: 1.5rem;
}

.error-actions {
  display: flex;
  gap: 0.5rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  margin-bottom: 1.5rem;
  color: var(--text-tertiary);
}

.empty-state h3 {
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
}

/* Grid */
.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.item-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.item-card:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.item-icon {
  color: var(--primary-color);
}

.item-name {
  flex: 1;
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.item-type {
  padding: 0.25rem 0.75rem;
  background: var(--surface-hover);
  border-radius: 12px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.item-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  flex-wrap: wrap;
}

.item-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.item-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.item-card:hover .item-actions {
  opacity: 1;
}

/* Statistics */
.item-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-color);
}
</style>
```

## Surface-Specific Components

### VaultSurface.vue
- **Purpose**: Display and manage Vault content
- **Key Features**: File tree navigation, content preview, search functionality
- **Icon**: `folder` or `database`

### WorkflowSurface.vue
- **Purpose**: Display and manage workflows
- **Key Features**: Workflow cards, status indicators, execution controls
- **Icon**: `workflow` or `git-branch`

### ToolRegistrySurface.vue
- **Purpose**: Discover and manage available tools
- **Key Features**: Tool cards, filtering, usage statistics
- **Icon**: `tool` or `wrench`

### USXDSurface.vue
- **Purpose**: View and edit universal documents
- **Key Features**: Document grid, import/export, version tracking
- **Icon**: `file-text` or `file`

### GitHubSurface.vue
- **Purpose**: Connect to GitHub repositories
- **Key Features**: Repository list, issue management, PR tracking
- **Icon**: `github` or `git-fork`

### WordPressSurface.vue
- **Purpose**: Connect to WordPress sites
- **Key Features**: Site management, post editing, publishing controls
- **Icon**: `wordpress` or `globe`

### DevModeSurface.vue
- **Purpose**: Access developer tools and utilities
- **Key Features**: System monitoring, debugging, configuration editing
- **Icon**: `code` or `terminal`

### StoryWizard.vue
- **Purpose**: Create interactive stories and narratives
- **Key Features**: Story cards, branching paths, publishing workflow
- **Icon**: `book-open` or `book`

### VibeTUI.vue
- **Purpose**: Terminal user interface for uDOS
- **Key Features**: Command input, output display, session management
- **Icon**: `terminal` or `command`

## Implementation Checklist

When creating a new surface component, verify:

- [ ] Component follows the standard template structure
- [ ] All three states (loading, error, empty) are implemented
- [ ] Search functionality is included if applicable
- [ ] Action buttons are properly styled
- [ ] CSS custom properties are defined for both light and dark modes
- [ ] Scoped styles are properly organized
- [ ] Computed properties for statistics are implemented
- [ ] All methods follow the naming convention
- [ ] Component is registered in the appropriate parent component

## Notes

- All surfaces should use the `SurfaceIcon` component for consistent icon rendering
- Use `v-if`/`v-else-if`/`v-else` for state management
- Always include helper text in error and empty states
- Use CSS transitions for hover effects
- Keep the grid layout consistent (minmax(280px, 1fr))
- Ensure all interactive elements have proper titles for accessibility