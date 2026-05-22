<template>
  <nav
    class="gridui-nav-rail"
    :class="{ 'gridui-nav-rail--collapsed': store.navRailCollapsed }"
    :data-palette="store.currentPalette"
  >
    <!-- Logo / Collapse Toggle -->
    <div class="nav-rail-header" @click="store.toggleNavRail()">
      <span class="material-symbol nav-rail-icon" :class="{ 'nav-rail-icon--active': true }">
        {{ store.navRailCollapsed ? 'menu_open' : 'menu' }}
      </span>
      <span v-if="!store.navRailCollapsed" class="nav-rail-title">gridui</span>
    </div>

    <!-- Navigation Items -->
    <div class="nav-rail-items">
      <button
        v-for="panel in PANELS"
        :key="panel.id"
        class="nav-rail-item"
        :class="{ 'nav-rail-item--active': store.activePanel === panel.id }"
        @click="store.setActivePanel(panel.id)"
        :title="panel.description"
      >
        <span class="material-symbol nav-rail-item-icon">{{ panel.icon }}</span>
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
        <span class="material-symbol nav-rail-item-icon">chat</span>
        <span v-if="!store.navRailCollapsed" class="nav-rail-item-label">Chat</span>
      </button>

      <!-- Theme Toggle -->
      <button
        class="nav-rail-item"
        @click="store.toggleTheme()"
        title="Toggle Theme"
      >
        <span class="material-symbol nav-rail-item-icon">
          {{ store.isDark ? 'dark_mode' : 'light_mode' }}
        </span>
        <span v-if="!store.navRailCollapsed" class="nav-rail-item-label">Theme</span>
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
  background: var(--gridui-nav-rail-bg);
  border-right: 1px solid var(--gridui-border);
  overflow: hidden;
  transition: width 0.2s ease, min-width 0.2s ease;
  z-index: 10;
}

.gridui-nav-rail--collapsed {
  width: var(--gridui-nav-rail-collapsed-width);
  min-width: var(--gridui-nav-rail-collapsed-width);
}

/* ─── Header ────────────────────────────────────────────────────── */
.nav-rail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  cursor: pointer;
  border-bottom: 1px solid var(--gridui-border);
  user-select: none;
}

.nav-rail-title {
  font-family: 'Monaspace Krypton', 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: var(--gridui-accent);
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.nav-rail-icon {
  color: var(--gridui-text-muted);
  transition: color 0.15s;
}

.nav-rail-header:hover .nav-rail-icon {
  color: var(--gridui-accent);
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
  color: var(--gridui-text-muted);
  cursor: pointer;
  border-radius: var(--md-sys-shape-corner-large);
  transition: background 0.15s, color 0.15s;
  text-decoration: none;
  position: relative;
}

.nav-rail-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--gridui-text);
}

.nav-rail-item--active {
  color: var(--gridui-accent);
  background: rgba(255, 255, 255, 0.06);
}

.nav-rail-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: var(--gridui-accent);
  border-radius: 0 3px 3px 0;
}

.nav-rail-item-icon {
  font-size: 24px;
}

.nav-rail-item-label {
  font-family: 'Monaspace Krypton', 'JetBrains Mono', monospace;
  font-size: 11px;
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
  border-top: 1px solid var(--gridui-border);
}
</style>
