<template>
  <div
    class="gridui-surface"
    :class="{ 'gridui-dark': store.isDark }"
    :data-palette="store.currentPalette"
    :data-panel="store.activePanel"
  >
    <!-- ═══ Top App Bar ═══ -->
    <header class="gridui-header">
      <div class="header-left">
        <span class="material-symbol header-menu-icon" @click="store.toggleNavRail()">menu</span>
        <span class="header-title">gridui</span>
        <span class="header-badge">USX v1.0</span>
      </div>
      <div class="header-center">
        <span class="header-panel-label">{{ store.activePanelMeta?.label }}</span>
        <span class="header-panel-desc">{{ store.activePanelMeta?.description }}</span>
      </div>
      <div class="header-right">
        <!-- Palette Selector -->
        <select class="header-select" v-model="store.currentPalette" @change="store.setPalette($event.target.value)">
          <option value="modern">Modern</option>
          <option value="c64">C64</option>
          <option value="teletext">Teletext</option>
          <option value="nes">NES</option>
        </select>
        <!-- Chat Toggle -->
        <button class="header-btn" @click="store.toggleChat()" title="Toggle Chat">
          <span class="material-symbol">chat</span>
        </button>
        <!-- Theme Toggle -->
        <button class="header-btn" @click="store.toggleTheme()" title="Toggle Theme">
          <span class="material-symbol">{{ store.isDark ? 'dark_mode' : 'light_mode' }}</span>
        </button>
      </div>
    </header>

    <!-- ═══ Body: Nav Rail + Panel + Chat ═══ -->
    <div class="gridui-body">
      <!-- Navigation Rail -->
      <GridUINavRail />

      <!-- Main Panel Area -->
      <main class="gridui-main">
        <TerminalPanel v-if="store.activePanel === 'terminal'" />
        <TeledeskPanel v-if="store.activePanel === 'teledesk'" />
        <DashboardPanel v-if="store.activePanel === 'dashboard'" />
        <VaultDocsPanel v-if="store.activePanel === 'vault'" />
        <MapsLayersPanel v-if="store.activePanel === 'maps'" />
      </main>

      <!-- Chat Sheet -->
      <GridUIChatSheet />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGridUIStore } from './stores/gridUIStore'
import GridUINavRail from './GridUINavRail.vue'
import GridUIChatSheet from './GridUIChatSheet.vue'
import TerminalPanel from './panels/TerminalPanel.vue'
import TeledeskPanel from './panels/TeledeskPanel.vue'
import DashboardPanel from './panels/DashboardPanel.vue'
import VaultDocsPanel from './panels/VaultDocsPanel.vue'
import MapsLayersPanel from './panels/MapsLayersPanel.vue'

const store = useGridUIStore()
</script>

<style>
/* ═══════════════════════════════════════════════════════════════════
   gridui — Global Styles (unscoped)
   ═══════════════════════════════════════════════════════════════════ */

@import './styles/gridui-usx-theme.css';
@import './styles/teletext-fonts.css';
@import './styles/color-palettes.css';

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100%;
}
</style>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════
   gridui — Surface Shell (scoped)
   ═══════════════════════════════════════════════════════════════════ */

.gridui-surface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--gridui-bg);
  color: var(--gridui-text);
  font-family: 'Monaspace Krypton', 'JetBrains Mono', 'Courier New', monospace;
  overflow: hidden;
}

/* ─── Top App Bar ────────────────────────────────────────────────── */
.gridui-header {
  display: flex;
  align-items: center;
  height: var(--gridui-header-height);
  min-height: var(--gridui-header-height);
  padding: 0 12px;
  background: var(--gridui-surface);
  border-bottom: 1px solid var(--gridui-border);
  gap: 12px;
  z-index: 20;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-menu-icon {
  font-size: 20px;
  color: var(--gridui-text-muted);
  cursor: pointer;
  transition: color 0.15s;
}

.header-menu-icon:hover {
  color: var(--gridui-accent);
}

.header-title {
  font-family: 'Monaspace Argon', 'Inter', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--gridui-accent);
  letter-spacing: 0.5px;
}

.header-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  font-weight: 600;
  letter-spacing: 0.3px;
}

.header-center {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.header-panel-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--gridui-text);
}

.header-panel-desc {
  font-size: 11px;
  color: var(--gridui-text-muted);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-select {
  padding: 4px 8px;
  border: 1px solid var(--gridui-border);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: var(--gridui-bg);
  color: var(--gridui-text);
  font-family: 'Monaspace Krypton', 'JetBrains Mono', monospace;
  font-size: 11px;
  outline: none;
  cursor: pointer;
}

.header-select:focus {
  border-color: var(--gridui-accent);
}

.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--gridui-text-muted);
  cursor: pointer;
  border-radius: var(--md-sys-shape-corner-full);
  transition: background 0.15s, color 0.15s;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--gridui-text);
}

.header-btn .material-symbol {
  font-size: 20px;
}

/* ─── Body ───────────────────────────────────────────────────────── */
.gridui-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ─── Main Panel Area ───────────────────────────────────────────── */
.gridui-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gridui-bg);
}
</style>
