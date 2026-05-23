<template>
  <div
    class="gridui-surface"
    :class="{ 'gridui-dark': store.isDark }"
    :data-palette="store.currentPalette"
    :data-font-style="store.fontStyle"
    :data-panel="store.activePanel"
    :style="{ '--gridui-font-size': store.fontSize + 'px' }"
  >
    <!-- ═══ Top App Bar ═══ -->
    <header class="gridui-header">
      <div class="header-left">
        <!-- Home button — back to UI Hub -->
        <a
          href="http://localhost:5173"
          class="header-btn"
          title="Back to UI Hub"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="material-symbol">home</span>
        </a>
        <span class="material-symbol header-menu-icon" @click="store.toggleNavRail()">menu</span>
        <span class="header-title">gridui</span>
        <span class="header-badge">USX v1.0</span>
      </div>
      <div class="header-center">
        <span class="header-panel-label">{{ store.activePanelMeta?.label }}</span>
        <span class="header-panel-desc">{{ store.activePanelMeta?.description }}</span>
      </div>
      <div class="header-right">
        <!-- ═══ Colour Cycle (single dot) ═══ -->
        <button
          class="header-btn colour-cycle-btn"
          @click="cyclePalette()"
          :title="'Palette: ' + store.currentPalette"
          :style="{ '--swatch-color': currentSwatchColor }"
        >
          <span class="swatch-dot"></span>
        </button>

        <div class="header-divider"></div>

        <!-- ═══ Font Size - / + ═══ -->
        <button class="header-btn" @click="store.decreaseFontSize()" title="Smaller font">
          <span class="material-symbol" style="font-size: 16px">text_decrease</span>
        </button>
        <button class="header-btn" @click="store.increaseFontSize()" title="Larger font">
          <span class="material-symbol" style="font-size: 16px">text_increase</span>
        </button>

        <div class="header-divider"></div>

        <!-- ═══ Font Style Cycle (single icon) ═══ -->
        <button class="header-btn" @click="store.cycleFontStyle()" :title="'Font: ' + store.fontStyle">
          <span class="material-symbol" style="font-size: 18px">{{ fontStyleIcon }}</span>
        </button>

        <div class="header-divider"></div>

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
        <CeefaxSurface v-if="store.activePanel === 'ceefax'" />
        <DashboardPanel v-if="store.activePanel === 'dashboard'" />
        <VaultDocsPanel v-if="store.activePanel === 'vault'" />
        <MapsLayersPanel v-if="store.activePanel === 'maps'" />

      </main>

      <!-- Chat Sheet -->
      <GridUIChatSheet />
    </div>

    <!-- ═══ Snackbar ═══ -->
    <div
      class="m3-snackbar"
      :class="{ 'm3-snackbar--visible': store.activeSnackbar !== null }"
      :style="{ borderLeft: store.activeSnackbar ? `4px solid ${snackbarColor(store.activeSnackbar.type)}` : 'none' }"
    >
      <span>{{ store.activeSnackbar?.message }}</span>
      <button
        v-if="store.activeSnackbar?.action"
        class="m3-snackbar-action"
        @click="store.dismissSnackbar()"
      >{{ store.activeSnackbar?.action }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGridUIStore } from './stores/gridUIStore'
import GridUINavRail from './GridUINavRail.vue'
import GridUIChatSheet from './GridUIChatSheet.vue'
import TerminalPanel from './panels/TerminalPanel.vue'
import TeledeskPanel from './panels/TeledeskPanel.vue'
import CeefaxSurface from './panels/CeefaxSurface.vue'
import DashboardPanel from './panels/DashboardPanel.vue'
import VaultDocsPanel from './panels/VaultDocsPanel.vue'
import MapsLayersPanel from './panels/MapsLayersPanel.vue'


const store = useGridUIStore()

const paletteColors: Record<string, string> = {
  modern: '#D0BCFF',
  c64: '#7B5EA7',
  teletext: '#FFFF00',
  nes: '#7B6BC0',
}

const currentSwatchColor = computed(() => paletteColors[store.currentPalette] || '#D0BCFF')

const fontStyleIcon = computed(() => {
  switch (store.fontStyle) {
    case 'serif': return 'format_italic'
    case 'sans': return 'text_fields'
    case 'mono': return 'code'
  }
})


const paletteOrder = ['modern', 'c64', 'teletext', 'nes'] as const

function cyclePalette() {
  const idx = paletteOrder.indexOf(store.currentPalette as typeof paletteOrder[number])
  const next = paletteOrder[(idx + 1) % paletteOrder.length]
  store.setPalette(next)
}

function snackbarColor(type?: string): string {
  switch (type) {
    case 'success': return '#2A9D8F'
    case 'warning': return '#E9C46A'
    case 'error': return '#E76F51'
    default: return 'var(--usx-color-inverse-primary)'
  }
}
</script>

<style>
@import './styles/teletext-fonts.css';
@import './styles/color-palettes.css';
@import './styles/gridui-usx-theme.css';
/* ─── Local Font Declarations ───────────────────────────────────── */
@font-face {
  font-family: 'IowanOldStyle';
  src: url('/fonts/iowanoldstyle_bold.otf') format('opentype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SF Pro';
  src: url('/fonts/SF-Pro.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Source Code Pro';
  src: url('/fonts/SourceCodePro-VariableFont_wght.ttf') format('truetype');
  font-weight: 400 700;
  font-style: normal;
  font-display: swap;
}


/* ═══════════════════════════════════════════════════════════════════
   gridui — Global Styles (unscoped)
   ═══════════════════════════════════════════════════════════════════ */


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

/* ─── Material Symbols Base ─────────────────────────────────────── */
.material-symbol {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
}

/* ─── Font Style Selectors ──────────────────────────────────────── */
[data-font-style="serif"] {
  --gridui-font-family: 'IowanOldStyle', 'Georgia', 'Times New Roman', serif;
}

[data-font-style="sans"] {
  --gridui-font-family: 'SF Pro', 'Helvetica Neue', 'Arial', sans-serif;
}

[data-font-style="mono"] {
  --gridui-font-family: 'Source Code Pro', 'JetBrains Mono', 'Courier New', monospace;
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
  background: var(--usx-color-background);
  color: var(--usx-color-on-surface);
  font-family: var(--gridui-font-family, 'Monaspace Krypton', 'JetBrains Mono', 'Courier New', monospace);
  font-size: var(--gridui-font-size, 14px);
  overflow: hidden;
}

/* ─── Top App Bar ────────────────────────────────────────────────── */
.gridui-header {
  display: flex;
  align-items: center;
  height: var(--gridui-header-height);
  min-height: var(--gridui-header-height);
  padding: 0 12px;
  background: var(--usx-color-surface);
  border-bottom: 1px solid var(--usx-color-outline-variant);
  gap: 12px;
  z-index: 20;
  font-size: var(--gridui-font-size, 14px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-menu-icon {
  font-size: calc(var(--gridui-font-size, 14px) * 1.4);
  color: var(--usx-color-on-surface-variant);
  cursor: pointer;
  transition: color 0.15s;
}

.header-menu-icon:hover {
  color: var(--usx-color-primary);
}

.header-title {
  font-family: var(--gridui-font-family, 'Monaspace Krypton', 'JetBrains Mono', 'Courier New', monospace);
  font-size: calc(var(--gridui-font-size, 14px) * 1.15);
  font-weight: 700;
  color: var(--usx-color-primary);
  letter-spacing: 0.5px;
}

.header-badge {
  font-size: calc(var(--gridui-font-size, 14px) * 0.7);
  padding: 2px 6px;
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: var(--usx-color-primary-container);
  color: var(--usx-color-on-primary-container);
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
  font-size: calc(var(--gridui-font-size, 14px) * 0.95);
  font-weight: 600;
  color: var(--usx-color-on-surface);
}

.header-panel-desc {
  font-size: calc(var(--gridui-font-size, 14px) * 0.8);
  color: var(--usx-color-on-surface-variant);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-divider {
  width: 1px;
  height: calc(var(--gridui-font-size, 14px) * 1.4);
  background: var(--usx-color-outline-variant);
}

/* ─── Colour Cycle Dot ──────────────────────────────────────────── */
.colour-cycle-btn {
  position: relative;
}

.swatch-dot {
  display: block;
  width: calc(var(--gridui-font-size, 14px) * 1);
  height: calc(var(--gridui-font-size, 14px) * 1);
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--swatch-color);
  border: 2px solid var(--usx-color-outline-variant);
  transition: transform 0.15s;
}

.colour-cycle-btn:hover .swatch-dot {
  transform: scale(1.2);
}

/* ─── Header Buttons ────────────────────────────────────────────── */
.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--gridui-font-size, 14px) * 2.3);
  height: calc(var(--gridui-font-size, 14px) * 2.3);
  border: none;
  background: transparent;
  color: var(--usx-color-on-surface-variant);
  cursor: pointer;
  border-radius: var(--md-sys-shape-corner-full);
  transition: background 0.15s, color 0.15s;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--usx-color-on-surface);
}

.header-btn .material-symbol {
  font-size: calc(var(--gridui-font-size, 14px) * 1.4);
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
  background: var(--usx-color-background);
}

</style>
