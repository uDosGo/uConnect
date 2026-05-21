<template>
  <div class="vault-panel" data-panel="vault">
    <!-- Sidebar: File Tree -->
    <aside class="vault-sidebar">
      <div class="vault-sidebar-header">
        <span class="material-symbol vault-sidebar-icon">folder</span>
        <span class="vault-sidebar-title">Vault</span>
      </div>
      <div class="vault-tree">
        <div
          v-for="(entry, idx) in vaultEntries"
          :key="idx"
          class="vault-tree-item"
          :class="{ 'vault-tree-item--active': selectedEntry === idx }"
          @click="selectEntry(idx)"
        >
          <span class="material-symbol vault-tree-icon">
            {{ entry.type === 'dir' ? 'folder' : 'description' }}
          </span>
          <span class="vault-tree-name">{{ entry.name }}</span>
        </div>
      </div>
    </aside>

    <!-- Main: Document Viewer -->
    <main class="vault-main">
      <div v-if="selectedEntry === null" class="vault-empty">
        <span class="material-symbol vault-empty-icon">folder_open</span>
        <p class="vault-empty-text">Select a document from the vault to view its contents.</p>
      </div>

      <div v-else class="vault-doc">
        <div class="vault-doc-header">
          <h2 class="vault-doc-title">{{ currentDoc?.name }}</h2>
          <div class="vault-doc-meta">
            <span class="vault-doc-size">{{ currentDoc?.size }}</span>
            <span class="vault-doc-date">{{ currentDoc?.date }}</span>
          </div>
        </div>
        <div class="vault-doc-content">
          <pre class="vault-doc-text">{{ currentDoc?.content }}</pre>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface VaultEntry {
  name: string
  type: 'file' | 'dir'
  size?: string
  date?: string
  content?: string
}

const vaultEntries = ref<VaultEntry[]>([
  { name: 'README.md', type: 'file', size: '1.2 KB', date: '2026-05-20', content: '# gridui Surface\n\n## Overview\ngridui is a USX-powered surface that provides a teletext-style interface for the uDos ecosystem.\n\n## Panels\n- **Terminal**: C64 BASIC terminal with command history\n- **Teledesk**: Ceefax teletext page browser\n- **Dashboard**: System stats and task management\n- **Vault**: Document viewer\n- **Maps**: USX grid layer renderer\n\n## Usage\nNavigate between panels using the navigation rail on the left.\nToggle the chat panel using the chat button in the header.' },
  { name: 'USX_SPEC.md', type: 'file', size: '4.5 KB', date: '2026-05-19', content: '# USX Specification v1.0\n\n## Overview\nUSX (Universal Surface eXchange) is a format for describing grid-based surfaces.\n\n## Grid Format\n- 40 columns × 24 rows (standard teletext)\n- Each cell: 1 character + optional color\n- Layers: up to 6 stacked layers\n\n## Color System\n- 16 standard ANSI colors\n- Per-cell foreground and background\n- Palette switching (C64, Teletext, NES, Modern)' },
  { name: 'MCP_BRIDGE.md', type: 'file', size: '2.1 KB', date: '2026-05-18', content: '# MCP Bridge\n\n## Connection\nConnects gridui to the MCP (Model Context Protocol) server.\n\n## Tools\n- `vault_read`: Read vault documents\n- `vault_write`: Write to vault\n- `surface_nav`: Navigate between surfaces\n- `grid_render`: Render USX grids\n\n## Status\nBridge is active and connected.' },
  { name: 'docs/', type: 'dir' },
  { name: 'surfaces/', type: 'dir' },
  { name: 'CHANGELOG.md', type: 'file', size: '0.8 KB', date: '2026-05-17', content: '# Changelog\n\n## v1.0.0 (2026-05-20)\n- Initial release of gridui surface\n- Terminal panel with C64 BASIC emulation\n- Teledesk panel with Ceefax teletext\n- Dashboard panel with system stats\n- Vault panel with document viewer\n- Maps panel with USX grid layers\n- Chat panel with AI assistant' },
  { name: 'CONFIG.yaml', type: 'file', size: '0.5 KB', date: '2026-05-16', content: '# gridui Configuration\nsurface:\n  name: gridui\n  version: 1.0.0\n  format: usx\n  panels:\n    - terminal\n    - teledesk\n    - dashboard\n    - vault\n    - maps\n  theme:\n    default: dark\n    palette: modern' },
])

const selectedEntry = ref<number | null>(null)

const currentDoc = computed(() => {
  if (selectedEntry.value === null) return null
  return vaultEntries.value[selectedEntry.value]
})

function selectEntry(idx: number) {
  const entry = vaultEntries.value[idx]
  if (entry.type === 'file') {
    selectedEntry.value = idx
  }
}
</script>

<style scoped>
.vault-panel {
  display: flex;
  width: 100%;
  height: 100%;
  background: var(--gridui-bg);
  color: var(--gridui-text);
  font-family: 'Monaspace Krypton', 'JetBrains Mono', monospace;
  overflow: hidden;
}

/* ─── Sidebar ───────────────────────────────────────────────────── */
.vault-sidebar {
  width: 240px;
  min-width: 240px;
  border-right: 1px solid var(--gridui-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.vault-sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--gridui-border);
  flex-shrink: 0;
}

.vault-sidebar-icon {
  color: var(--gridui-accent);
  font-size: 20px;
}

.vault-sidebar-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--gridui-text);
}

.vault-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.vault-tree-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: var(--md-sys-shape-corner-extra-small);
  cursor: pointer;
  transition: background 0.15s;
  font-size: 13px;
}

.vault-tree-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.vault-tree-item--active {
  background: rgba(255, 255, 255, 0.1);
  color: var(--gridui-accent);
}

.vault-tree-icon {
  font-size: 18px;
  color: var(--gridui-text-muted);
  flex-shrink: 0;
}

.vault-tree-item--active .vault-tree-icon {
  color: var(--gridui-accent);
}

.vault-tree-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ─── Main ──────────────────────────────────────────────────────── */
.vault-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.vault-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
}

.vault-empty-icon {
  font-size: 48px;
  color: var(--gridui-text-subtle);
}

.vault-empty-text {
  font-size: 13px;
  color: var(--gridui-text-muted);
  text-align: center;
  max-width: 280px;
  line-height: 1.5;
}

.vault-doc {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.vault-doc-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--gridui-border);
  flex-shrink: 0;
}

.vault-doc-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--gridui-text);
  margin-bottom: 4px;
}

.vault-doc-meta {
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: var(--gridui-text-subtle);
}

.vault-doc-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.vault-doc-text {
  font-family: 'Monaspace Krypton', 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--gridui-text);
  white-space: pre-wrap;
  word-break: break-word;
}

.vault-tree::-webkit-scrollbar,
.vault-doc-content::-webkit-scrollbar {
  width: 4px;
}

.vault-tree::-webkit-scrollbar-track,
.vault-doc-content::-webkit-scrollbar-track {
  background: transparent;
}

.vault-tree::-webkit-scrollbar-thumb,
.vault-doc-content::-webkit-scrollbar-thumb {
  background: var(--gridui-border);
  border-radius: 2px;
}
</style>
