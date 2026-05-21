<template>
  <nav
    class="gridui-nav-rail"
    :class="{ 'gridui-nav-rail--collapsed': store.navRailCollapsed }"
    :data-palette="store.currentPalette"
  >
    <!-- Logo / Collapse Toggle -->
    <div class="nav-rail-header">
      <span class="material-symbols-outlined nav-rail-icon">
        grid_view
      </span>
    </div>


    <!-- Navigation Items -->
    <div class="nav-rail-items">
      <button
        v-for="panel in PANELS"
        :key="panel.id"
        class="nav-rail-item m3-state-layer"
        :class="{ 'nav-rail-item--active': store.activePanel === panel.id }"
        @click="store.setActivePanel(panel.id)"
        :title="panel.description"
      >
        <span class="material-symbols-outlined nav-rail-item-icon">{{ panel.icon }}</span>
        <span v-if="!store.navRailCollapsed" class="nav-rail-item-label">{{ panel.label }}</span>
      </button>

    </div>

    <!-- Bottom Actions -->
    <div class="nav-rail-footer">
      <!-- Chat Toggle -->
      <button
        class="nav-rail-item"
        :class="{ 'nav-rail-item--active': store.chatVisible }"
        @click="store.toggleChat()"
        title="Toggle Chat"
      >
        <span class="material-symbols-outlined nav-rail-item-icon">chat</span>
        <span v-if="!store.navRailCollapsed" class="nav-rail-item-label">Chat</span>
      </button>
    </div>

  </nav>
</template>

<script setup lang="ts">
import { useGridUIStore, PANELS } from './stores/gridUIStore'

const store = useGridUIStore()
</script>

<style scoped>
/* ─── Navigation Rail ───────────────────────────────────────────── */
.gridui-nav-rail {
  display: flex;
  flex-direction: column;
  width: var(--gridui-nav-rail-width);
  min-width: var(--gridui-nav-rail-width);
  background: var(--usx-color-surface-container-low);
  border-right: 1px solid var(--usx-color-outline-variant);
  overflow: hidden;
  transition: width 0.2s ease, min-width 0.2s ease;
  z-index: 10;
  font-size: var(--gridui-font-size, 14px);
  font-family: var(--gridui-font-family, 'Monaspace Krypton', 'JetBrains Mono', 'Courier New', monospace);
}

.gridui-nav-rail--collapsed {
  width: var(--gridui-nav-rail-collapsed-width);
  min-width: var(--gridui-nav-rail-collapsed-width);
}

/* ─── Header ────────────────────────────────────────────────────── */
.nav-rail-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  border-bottom: 1px solid var(--usx-color-outline-variant);
  user-select: none;
}

.nav-rail-icon {
  color: var(--usx-color-primary);
  font-size: calc(var(--gridui-font-size, 14px) * 2);
}


/* ─── Items ─────────────────────────────────────────────────────── */
.nav-rail-items {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 4px;
  overflow-y: auto;
}

.nav-rail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border: none;
  background: transparent;
  color: var(--usx-color-on-surface-variant);
  cursor: pointer;
  border-radius: var(--md-sys-shape-corner-large);
  transition: background 0.15s, color 0.15s;
  text-decoration: none;
  position: relative;
}

.nav-rail-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--usx-color-on-surface);
}

.nav-rail-item--active {
  color: var(--usx-color-primary);
  background: rgba(255, 255, 255, 0.06);
}

.nav-rail-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: calc(var(--gridui-font-size, 14px) * 1.7);
  background: var(--usx-color-primary);
  border-radius: 0 3px 3px 0;
}

.nav-rail-item-icon {
  font-size: calc(var(--gridui-font-size, 14px) * 1.7);
}

.nav-rail-item-label {
  font-family: var(--gridui-font-family, 'Monaspace Krypton', 'JetBrains Mono', 'Courier New', monospace);
  font-size: calc(var(--gridui-font-size, 14px) * 0.8);
  white-space: nowrap;
  text-align: center;
  line-height: 1.2;
}


/* ─── Footer ────────────────────────────────────────────────────── */
.nav-rail-footer {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 4px;
  border-top: 1px solid var(--usx-color-outline-variant);
}

</style>
