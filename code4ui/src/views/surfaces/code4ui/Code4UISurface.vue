<template>
  <div
    class="code4ui-surface"
    :class="{ 'code4ui-dark': store.isDark }"
    :data-font-style="store.fontStyle"
    :data-palette="store.currentPalette"
    :style="{ '--code4ui-font-size': store.fontSize + 'px' }"
  >
    <!-- Import theme -->
    <link rel="stylesheet" href="./styles/code4ui-theme.css" />

    <!-- Surface Header (USX Toolbar Style) -->
    <header class="surface-header">
      <div class="header-left">
        <button class="header-btn" @click="store.toggleSidebar" title="Toggle sidebar">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <h1 class="header-title">code4ui</h1>
        <span class="header-badge">Wireframe</span>
      </div>
      <div class="header-center">
        <div class="header-breadcrumb">
          <span class="breadcrumb-item">Bedstead</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-item breadcrumb-current">{{ activeTabLabel }}</span>
        </div>
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
          <span class="material-symbols-outlined">text_decrease</span>
        </button>
        <button class="header-btn" @click="store.increaseFontSize()" title="Larger font">
          <span class="material-symbols-outlined">text_increase</span>
        </button>

        <div class="header-divider"></div>

        <!-- ═══ Font Style Cycle (single icon) ═══ -->
        <button class="header-btn" @click="store.cycleFontStyle()" :title="'Font: ' + store.fontStyle">
          <span class="material-symbols-outlined">{{ fontStyleIcon }}</span>
        </button>

        <div class="header-divider"></div>

        <!-- Chat Toggle -->
        <button class="header-btn" @click="store.toggleChat" :title="store.chatOpen ? 'Close chat' : 'Open chat'">
          <span class="material-symbols-outlined">chat</span>
        </button>
        <!-- Theme Toggle -->
        <button class="header-btn" @click="store.toggleTheme" :title="store.isDark ? 'Light mode' : 'Dark mode'">
          <span class="material-symbols-outlined">{{ store.isDark ? 'dark_mode' : 'light_mode' }}</span>
        </button>
      </div>
    </header>

    <!-- Workspace Layout -->
    <div class="workspace-layout">
      <!-- Nav Rail Sidebar -->
      <Code4UINavRail
        :activeTab="activeTab"
        :tabs="sidebarTabs"
        @tab-change="onTabChange"
      />

      <!-- Main Content Area -->
      <main class="wf-main">
        <!-- Dashboard Tab -->
        <template v-if="activeTab === 'dashboard'">
          <div class="wf-grid">
            <!-- Welcome Card -->
            <div class="wf-card welcome-card">
              <div class="wf-card-content">
                <h2 class="wf-heading">Welcome back!</h2>
                <p class="wf-text">You have <strong>3 pending tasks</strong> and <strong>2 unread notifications</strong>.</p>
                <div class="wf-stats-row">
                  <div class="wf-stat">
                    <span class="wf-stat-value">42</span>
                    <span class="wf-stat-label">Files</span>
                  </div>
                  <div class="wf-stat">
                    <span class="wf-stat-value">12</span>
                    <span class="wf-stat-label">Workflows</span>
                  </div>
                  <div class="wf-stat">
                    <span class="wf-stat-value">8</span>
                    <span class="wf-stat-label">Tools</span>
                  </div>
                  <div class="wf-stat">
                    <span class="wf-stat-value">5</span>
                    <span class="wf-stat-label">Surfaces</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="wf-card actions-card">
              <div class="wf-card-header">
                <h3>Quick Actions</h3>
              </div>
              <div class="wf-card-content">
                <div v-for="action in quickActions" :key="action.label" class="wf-action-row">
                  <span class="material-symbols-outlined wf-action-icon">{{ action.icon }}</span>
                  <span class="wf-action-label">{{ action.label }}</span>
                </div>
              </div>
            </div>

            <!-- Activity Feed -->
            <div class="wf-card activity-card">
              <div class="wf-card-header">
                <h3>Recent Activity</h3>
                <span class="wf-badge">Live</span>
              </div>
              <div class="wf-card-content">
                <div v-for="item in activities" :key="item.title" class="wf-activity-row">
                  <div class="wf-activity-dot"></div>
                  <div class="wf-activity-info">
                    <strong>{{ item.title }}</strong>
                    <p>{{ item.description }}</p>
                  </div>
                  <span class="wf-activity-time">{{ item.time }}</span>
                </div>
              </div>
            </div>

            <!-- System Status -->
            <div class="wf-card status-card">
              <div class="wf-card-header">
                <h3>System Status</h3>
              </div>
              <div class="wf-card-content">
                <div v-for="service in services" :key="service.name" class="wf-service-row">
                  <div class="wf-service-info">
                    <span class="wf-service-name">{{ service.name }}</span>
                    <span class="wf-service-status" :class="service.status">
                      {{ service.status === 'up' ? '● Online' : service.status === 'degraded' ? '● Degraded' : '● Offline' }}
                    </span>
                  </div>
                  <div class="wf-bar">
                    <div class="wf-bar-fill" :style="{ width: service.uptime + '%' }"></div>
                  </div>
                  <span class="wf-service-uptime">{{ service.uptime }}% uptime</span>
                </div>
              </div>
            </div>

            <!-- Recent Files -->
            <div class="wf-card files-card">
              <div class="wf-card-header">
                <h3>Recent Files</h3>
                <span class="wf-text-link">View All →</span>
              </div>
              <div class="wf-card-content">
                <div v-for="file in recentFiles" :key="file.name" class="wf-file-row">
                  <span class="material-symbols-outlined wf-file-icon">{{ file.icon }}</span>
                  <div class="wf-file-info">
                    <span class="wf-file-name">{{ file.name }}</span>
                    <span class="wf-file-date">{{ file.date }}</span>
                  </div>
                  <span class="wf-file-size">{{ file.size }}</span>
                </div>
              </div>
            </div>

            <!-- Tips Card -->
            <div class="wf-card tips-card">
              <div class="wf-card-header">
                <h3><span class="material-symbols-outlined" style="font-size: 14px; vertical-align: middle; margin-right: 4px;">lightbulb</span> Tips & Tricks</h3>
              </div>
              <div class="wf-card-content">
                <p class="wf-text">{{ currentTip }}</p>
                <span class="wf-text-link" @click="nextTip">Show another tip →</span>
              </div>
            </div>
          </div>
        </template>

        <!-- Vault Tab -->
        <template v-else-if="activeTab === 'vault'">
          <div class="panel-placeholder">
            <span class="material-symbols-outlined panel-icon">lock</span>
            <h3>Vault</h3>
            <p>Vault management panel — coming soon.</p>
          </div>
        </template>

        <!-- Surfaces Tab -->
        <template v-else-if="activeTab === 'surfaces'">
          <div class="panel-placeholder">
            <span class="material-symbols-outlined panel-icon">dashboard_customize</span>
            <h3>Surfaces</h3>
            <p>Surface management panel — coming soon.</p>
          </div>
        </template>

        <!-- Settings Tab -->
        <template v-else-if="activeTab === 'settings'">
          <div class="panel-placeholder">
            <span class="material-symbols-outlined panel-icon">settings</span>
            <h3>Settings</h3>
            <p>Settings panel — coming soon.</p>
          </div>
        </template>
      </main>

      <!-- Right Chat Panel -->
      <Code4UIChatSheet />
    </div>

    <!-- Snackbar -->
    <div v-if="store.snackbar" class="m3-snackbar" :class="`m3-snackbar--${store.snackbar.type}`">
      <span>{{ store.snackbar.message }}</span>
      <button v-if="store.snackbar.action" class="m3-snackbar-action" @click="store.dismissSnackbar">
        {{ store.snackbar.action }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCode4UIStore } from './stores/code4UIStore'
import Code4UINavRail from './Code4UINavRail.vue'
import Code4UIChatSheet from './Code4UIChatSheet.vue'

const store = useCode4UIStore()

// ─── Palette & Font Helpers ─────────────────────────────────────
const paletteColors: Record<string, string> = {
  wireframe: '#cccccc',
  blueprint: '#1565C0',
  terminal: '#00C853',
  paper: '#8D6E63',
}

const currentSwatchColor = computed(() => paletteColors[store.currentPalette] || '#cccccc')

const fontStyleIcon = computed(() => {
  switch (store.fontStyle) {
    case 'serif': return 'format_italic'
    case 'sans': return 'text_fields'
    case 'mono': return 'code'
  }
})

const paletteOrder = ['wireframe', 'blueprint', 'terminal', 'paper'] as const

function cyclePalette() {
  const idx = paletteOrder.indexOf(store.currentPalette as typeof paletteOrder[number])
  const next = paletteOrder[(idx + 1) % paletteOrder.length]
  store.setPalette(next)
}

// ─── Sidebar Tabs ───────────────────────────────────────────────
const sidebarTabs = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'vault', icon: 'lock', label: 'Vault' },
  { id: 'surfaces', icon: 'dashboard_customize', label: 'Surfaces' },
  { id: 'settings', icon: 'settings', label: 'Settings' },
]

const activeTab = ref('dashboard')

const activeTabLabel = computed(() => {
  return sidebarTabs.find(t => t.id === activeTab.value)?.label || 'Dashboard'
})

function onTabChange(tabId: string) {
  activeTab.value = tabId
}

// ─── Wireframe Data ─────────────────────────────────────────────
const quickActions = [
  { icon: 'description', label: 'New Document' },
  { icon: 'upload_file', label: 'Upload File' },
  { icon: 'sync', label: 'Sync Vault' },
  { icon: 'search', label: 'Search' },
  { icon: 'settings', label: 'Settings' },
  { icon: 'dashboard', label: 'Dashboard' },
]

const activities = [
  { title: 'File uploaded', description: 'README.md was added to vault', time: '2m ago' },
  { title: 'Workflow completed', description: 'Backup workflow finished successfully', time: '15m ago' },
  { title: 'Sync completed', description: 'Vault synced with GitHub', time: '1h ago' },
  { title: 'New version', description: 'uDos v1.1.0 is now available', time: '2h ago' },
  { title: 'System update', description: 'MCP bridge reconnected', time: '3h ago' },
]

const services = [
  { name: 'Vault Service', status: 'up', uptime: 99.9 },
  { name: 'MCP Bridge', status: 'up', uptime: 99.8 },
  { name: 'GitHub Sync', status: 'up', uptime: 99.5 },
  { name: 'USXD Renderer', status: 'degraded', uptime: 95.2 },
  { name: 'Workflow Engine', status: 'up', uptime: 99.7 },
]

const recentFiles = [
  { name: 'README.md', icon: 'description', size: '2.4 KB', date: '2 hours ago' },
  { name: 'config.yaml', icon: 'settings', size: '1.2 KB', date: '5 hours ago' },
  { name: 'notes.txt', icon: 'sticky_note_2', size: '0.8 KB', date: '1 day ago' },
  { name: 'workflow.json', icon: 'account_tree', size: '3.1 KB', date: '2 days ago' },
]

const tips = [
  'Use keyboard shortcut Ctrl+K to quickly search across all surfaces.',
  'You can drag and drop files directly into the Vault surface.',
  'Enable dark mode in Settings for reduced eye strain.',
  'Use the MCP Bridge to connect external tools and services.',
  'Workflows can be automated with the visual editor.',
  'Press ? to see all available keyboard shortcuts.',
]

const currentTip = ref(tips[0])

function nextTip() {
  const currentIndex = tips.indexOf(currentTip.value)
  currentTip.value = tips[(currentIndex + 1) % tips.length]
}
</script>

<style>
/* ─── Import Theme ────────────────────────────────────────────── */
@import url('./styles/code4ui-theme.css');

/* ─── Base Layout ────────────────────────────────────────────── */
.code4ui-surface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--usx-color-background);
  color: var(--usx-color-on-surface);
  font-family: var(--code4ui-font-family);
  font-size: var(--code4ui-font-size);
}

/* ─── Surface Header (USX Toolbar Style) ─────────────────────── */
.surface-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--code4ui-header-height);
  padding: 0 12px;
  border-bottom: 1px dashed var(--usx-color-outline);
  flex-shrink: 0;
  background: var(--usx-color-surface);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px dashed var(--usx-color-outline);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: transparent;
  color: var(--usx-color-on-surface-variant);
  cursor: pointer;
  transition: all 0.15s;
}

.header-btn .material-symbols-outlined {
  font-size: calc(var(--code4ui-font-size) * 1.2);
}

.header-btn:hover {
  background: var(--usx-color-surface-variant);
  color: var(--usx-color-on-surface);
}

.header-title {
  font-size: calc(var(--code4ui-font-size) * 1.1);
  font-weight: 600;
  color: var(--usx-color-on-surface);
  margin: 0;
}

.header-badge {
  font-size: calc(var(--code4ui-font-size) * 0.7);
  padding: 2px 6px;
  border: 1px dashed var(--usx-color-outline);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: var(--usx-color-primary-container);
  color: var(--usx-color-on-primary-container);
  font-weight: 500;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0 16px;
}

.header-breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: calc(var(--code4ui-font-size) * 0.8);
  color: var(--usx-color-on-surface-variant);
}

.breadcrumb-item {
  padding: 2px 6px;
  border-radius: var(--md-sys-shape-corner-extra-small);
  cursor: default;
}

.breadcrumb-current {
  color: var(--usx-color-on-surface);
  font-weight: 500;
}

.breadcrumb-sep {
  color: var(--usx-color-outline);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-divider {
  width: 1px;
  height: calc(var(--code4ui-font-size) * 1.4);
  background: var(--usx-color-outline);
}

/* ─── Colour Cycle Dot ──────────────────────────────────────────── */
.colour-cycle-btn {
  position: relative;
}

.swatch-dot {
  display: block;
  width: calc(var(--code4ui-font-size) * 1);
  height: calc(var(--code4ui-font-size) * 1);
  border-radius: var(--md-sys-shape-corner-full);
  background: var(--swatch-color);
  border: 2px solid var(--usx-color-outline);
  transition: transform 0.15s;
}

.colour-cycle-btn:hover .swatch-dot {
  transform: scale(1.2);
}

/* ─── Workspace Layout ───────────────────────────────────────── */
.workspace-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ─── Main Content ────────────────────────────────────────────── */
.wf-main {
  flex: 1;
  overflow-y: auto;
  background: var(--usx-color-background);
  padding: 1.5rem;
}

/* ─── Wireframe Grid ──────────────────────────────────────────── */
.wf-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.wf-card {
  border: 2px dashed var(--usx-color-outline);
  overflow: hidden;
  background: var(--usx-color-surface);
}

.wf-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px dashed var(--usx-color-outline);
}

.wf-card-header h3 {
  margin: 0;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--usx-color-on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.wf-card-content {
  padding: 1rem;
}

/* Welcome Card */
.welcome-card {
  grid-column: 1 / -1;
}

.wf-heading {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0 0 0.5rem;
  color: var(--usx-color-on-surface);
}

.wf-text {
  font-size: 0.8rem;
  color: var(--usx-color-on-surface-variant);
  margin: 0 0 1rem;
}

.wf-stats-row {
  display: flex;
  gap: 2rem;
}

.wf-stat {
  text-align: center;
}

.wf-stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--usx-color-on-surface);
}

.wf-stat-label {
  font-size: 0.7rem;
  color: var(--usx-color-on-surface-variant);
}

/* Actions Card */
.actions-card {
  grid-column: 1;
}

.wf-action-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px dashed var(--usx-color-outline-variant);
  cursor: pointer;
}

.wf-action-row:last-child {
  border-bottom: none;
}

.wf-action-row:hover {
  background: var(--usx-color-surface-variant);
}

.wf-action-icon {
  font-size: 1rem;
}

.wf-action-label {
  font-size: 0.8rem;
  color: var(--usx-color-on-surface-variant);
}

/* Activity Card */
.activity-card {
  grid-column: 2;
}

.wf-badge {
  border: 1px dashed #4caf50;
  color: #4caf50;
  padding: 1px 6px;
  font-size: 0.65rem;
}

.wf-activity-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px dashed var(--usx-color-outline-variant);
}

.wf-activity-row:last-child {
  border-bottom: none;
}

.wf-activity-dot {
  width: 6px;
  height: 6px;
  border: 1px dashed var(--usx-color-on-surface-variant);
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}

.wf-activity-info {
  flex: 1;
}

.wf-activity-info strong {
  display: block;
  font-size: 0.75rem;
  margin-bottom: 1px;
  color: var(--usx-color-on-surface);
}

.wf-activity-info p {
  margin: 0;
  font-size: 0.7rem;
  color: var(--usx-color-on-surface-variant);
}

.wf-activity-time {
  font-size: 0.65rem;
  color: var(--usx-color-outline);
  white-space: nowrap;
}

/* Status Card */
.status-card {
  grid-column: 1;
}

.wf-service-row {
  margin-bottom: 0.75rem;
}

.wf-service-row:last-child {
  margin-bottom: 0;
}

.wf-service-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.wf-service-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--usx-color-on-surface);
}

.wf-service-status {
  font-size: 0.65rem;
}

.wf-service-status.up {
  color: #4caf50;
}

.wf-service-status.degraded {
  color: #ff9800;
}

.wf-service-status.down {
  color: #f44336;
}

.wf-bar {
  height: 4px;
  border: 1px dashed var(--usx-color-outline);
  margin-bottom: 0.15rem;
}

.wf-bar-fill {
  height: 100%;
  background: var(--usx-color-outline);
}

.wf-service-uptime {
  font-size: 0.6rem;
  color: var(--usx-color-outline);
}

/* Files Card */
.files-card {
  grid-column: 2;
}

.wf-text-link {
  font-size: 0.7rem;
  color: var(--usx-color-primary);
  cursor: pointer;
  border-bottom: 1px dashed var(--usx-color-primary);
}

.wf-file-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0;
  border-bottom: 1px dashed var(--usx-color-outline-variant);
}

.wf-file-row:last-child {
  border-bottom: none;
}

.wf-file-icon {
  font-size: 1rem;
}

.wf-file-info {
  flex: 1;
}

.wf-file-name {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--usx-color-on-surface);
}

.wf-file-date {
  font-size: 0.65rem;
  color: var(--usx-color-outline);
}

.wf-file-size {
  font-size: 0.65rem;
  color: var(--usx-color-outline);
}

/* Tips Card */
.tips-card {
  grid-column: 1 / -1;
}

.tips-card .wf-text {
  margin-bottom: 0.75rem;
}

/* ─── Panel Placeholder ────────────────────────────────────────── */
.panel-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: var(--usx-color-on-surface-variant);
  padding: 48px;
  text-align: center;
}

.panel-icon {
  font-size: 48px !important;
}

.panel-placeholder h3 {
  font-size: calc(var(--code4ui-font-size) * 1.3);
  font-weight: 600;
  color: var(--usx-color-on-surface);
  margin: 0;
}

.panel-placeholder p {
  font-size: calc(var(--code4ui-font-size) * 0.9);
  max-width: 400px;
  line-height: 1.5;
}

/* ─── Font Style Selectors ──────────────────────────────────────── */
[data-font-style="serif"] {
  --code4ui-font-family: 'Georgia', 'Times New Roman', serif;
}

[data-font-style="sans"] {
  --code4ui-font-family: 'Helvetica Neue', 'Arial', sans-serif;
}

[data-font-style="mono"] {
  --code4ui-font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
}

/* ─── Colour Palette Selectors (Light) ──────────────────────────── */
[data-palette="wireframe"] {
  --usx-color-primary: #333333;
  --usx-color-primary-container: #f0f0f0;
  --usx-color-on-primary-container: #1a1a1a;
  --usx-color-surface-variant: #f5f5f5;
  --usx-color-outline: #cccccc;
}

[data-palette="blueprint"] {
  --usx-color-primary: #1565C0;
  --usx-color-primary-container: #d1e4ff;
  --usx-color-on-primary-container: #001d36;
  --usx-color-surface-variant: #e8f0fe;
  --usx-color-outline: #90caf9;
}

[data-palette="terminal"] {
  --usx-color-primary: #00C853;
  --usx-color-primary-container: #b9f6ca;
  --usx-color-on-primary-container: #003300;
  --usx-color-surface-variant: #e8f5e9;
  --usx-color-outline: #81c784;
}

[data-palette="paper"] {
  --usx-color-primary: #8D6E63;
  --usx-color-primary-container: #efebe9;
  --usx-color-on-primary-container: #3e2723;
  --usx-color-surface-variant: #faf0e6;
  --usx-color-outline: #bcaaa4;
}

/* ─── Colour Palette Selectors (Dark) ───────────────────────────── */
.code4ui-dark[data-palette="wireframe"] {
  --usx-color-primary: #e0e0e0;
  --usx-color-primary-container: #333333;
  --usx-color-on-primary-container: #e0e0e0;
  --usx-color-surface-variant: #2a2a2a;
  --usx-color-outline: #444444;
}

.code4ui-dark[data-palette="blueprint"] {
  --usx-color-primary: #90caf9;
  --usx-color-primary-container: #0d47a1;
  --usx-color-on-primary-container: #bbdefb;
  --usx-color-surface-variant: #1a2744;
  --usx-color-outline: #3f51b5;
}

.code4ui-dark[data-palette="terminal"] {
  --usx-color-primary: #69f0ae;
  --usx-color-primary-container: #1b5e20;
  --usx-color-on-primary-container: #a5d6a7;
  --usx-color-surface-variant: #1a2e1a;
  --usx-color-outline: #388e3c;
}

.code4ui-dark[data-palette="paper"] {
  --usx-color-primary: #bcaaa4;
  --usx-color-primary-container: #4e342e;
  --usx-color-on-primary-container: #d7ccc8;
  --usx-color-surface-variant: #2a1f1a;
  --usx-color-outline: #6d4c41;
}

/* ─── Scrollbar ────────────────────────────────────────────────── */
.wf-main::-webkit-scrollbar {
  width: 6px;
}

.wf-main::-webkit-scrollbar-track {
  background: transparent;
}

.wf-main::-webkit-scrollbar-thumb {
  background: var(--usx-color-outline);
  border-radius: 3px;
}

.wf-main::-webkit-scrollbar-thumb:hover {
  background: var(--usx-color-on-surface-variant);
}
</style>
