<template>
  <aside class="code3ui-nav-rail" :class="{ collapsed: store.sidebarCollapsed }">
    <!-- Top Actions -->
    <div class="nav-rail-top">
      <button class="nav-rail-btn" @click="store.toggleSidebar" title="Toggle sidebar">
        <span class="material-symbols-outlined">menu</span>
      </button>
    </div>

    <!-- Tab Navigation -->
    <div class="nav-rail-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="nav-rail-tab"
        :class="{ active: activeTab === tab.id }"
        @click="$emit('tab-change', tab.id)"
        :title="tab.label"
      >
        <span class="material-symbols-outlined nav-rail-tab-icon">{{ tab.icon }}</span>
        <span class="nav-rail-tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Bottom Actions -->
    <div class="nav-rail-bottom">
      <button class="nav-rail-btn" @click="store.toggleChat" :title="store.chatOpen ? 'Close chat' : 'Open chat'">
        <span class="material-symbols-outlined">chat</span>
      </button>
      <button class="nav-rail-btn" @click="store.toggleTheme" :title="store.isDark ? 'Light mode' : 'Dark mode'">
        <span class="material-symbols-outlined">{{ store.isDark ? 'light_mode' : 'dark_mode' }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useCode3UIStore } from './stores/code3UIStore'

defineProps<{
  activeTab: string
  tabs: { id: string; icon: string; label: string }[]
}>()

defineEmits<{
  'tab-change': [tabId: string]
}>()

const store = useCode3UIStore()
</script>

<style scoped>
.code3ui-nav-rail {
  width: var(--code3ui-sidebar-width);
  min-width: var(--code3ui-sidebar-width);
  background: var(--usx-color-surface-variant);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--usx-color-outline);
  transition: width 0.2s, min-width 0.2s;
  overflow: hidden;
  font-size: var(--code3ui-font-size);
}

.code3ui-nav-rail.collapsed {
  width: var(--code3ui-sidebar-collapsed-width);
  min-width: var(--code3ui-sidebar-collapsed-width);
}

.nav-rail-top {
  padding: 8px;
  border-bottom: 1px solid var(--usx-color-outline);
  display: flex;
  justify-content: center;
}

.nav-rail-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: transparent;
  color: var(--usx-color-on-surface-variant);
  cursor: pointer;
  transition: all 0.15s;
}

.nav-rail-btn:hover {
  background: var(--usx-color-surface-container);
  color: var(--usx-color-on-surface);
}

.nav-rail-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
  overflow-y: auto;
}

.nav-rail-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: none;
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: transparent;
  color: var(--usx-color-on-surface-variant);
  cursor: pointer;
  font-size: calc(var(--code3ui-font-size) * 0.85);
  font-family: inherit;
  text-align: left;
  transition: all 0.1s;
  white-space: nowrap;
}

.nav-rail-tab:hover {
  background: var(--usx-color-surface-container);
  color: var(--usx-color-on-surface);
}

.nav-rail-tab.active {
  background: var(--usx-color-surface-container-high);
  color: var(--usx-color-on-surface);
  font-weight: 500;
}

.nav-rail-tab-icon {
  font-size: calc(var(--code3ui-font-size) * 1.1);
  flex-shrink: 0;
}

.nav-rail-tab-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapsed .nav-rail-tab-label,
.collapsed .nav-rail-top {
  display: none;
}

.collapsed .nav-rail-tab {
  justify-content: center;
  padding: 8px;
}

.nav-rail-bottom {
  padding: 8px;
  border-top: 1px solid var(--usx-color-outline);
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}
</style>
