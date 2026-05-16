<template>
  <div class="github-surface min-h-screen">
    <!-- Surface Header -->
    <div class="surface-header">
      <h1><span class="surface-icon">🎨</span> GitHub Theme</h1>
      <p class="surface-tagline">GitHub-inspired dark theme with cyan accents for code and documentation.</p>
    </div>

    <!-- Status Bar -->
    <div class="status-bar">
      <span class="status-item">📊 Repo: uDosGo/Connect</span>
      <span class="status-item">🌿 main</span>
      <span class="status-item">🔄 Synced</span>
      <span class="status-item">📅 Updated today</span>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Left Panel - File Browser -->
      <div class="panel file-browser">
        <div class="panel-header">
          <h3>📁 Files</h3>
          <button class="icon-btn">+</button>
        </div>
        <div class="file-tree">
          <div v-for="file in files" :key="file.name" class="file-item" :class="{ active: file.active }">
            <span class="file-icon">{{ file.icon }}</span>
            <span class="file-name">{{ file.name }}</span>
            <span class="file-meta">{{ file.size }}</span>
          </div>
        </div>
      </div>

      <!-- Center Panel - Code/Content View -->
      <div class="panel code-view">
        <div class="panel-header">
          <div class="tabs">
            <span v-for="tab in tabs" :key="tab" class="tab" :class="{ active: tab === activeTab }" @click="activeTab = tab">
              {{ tab }}
            </span>
          </div>
          <div class="panel-actions">
            <button class="icon-btn">✏️</button>
            <button class="icon-btn">📋</button>
          </div>
        </div>
        <div class="code-content">
          <div class="code-line" v-for="(line, i) in codeLines" :key="i">
            <span class="line-number">{{ i + 1 }}</span>
            <span class="line-content" v-html="highlightCode(line)"></span>
          </div>
        </div>
      </div>

      <!-- Right Panel - Details -->
      <div class="panel details-panel">
        <div class="panel-header">
          <h3>📋 Details</h3>
        </div>
        <div class="details-content">
          <div class="detail-section">
            <h4>README.md</h4>
            <p class="detail-text">uDos Connect - Shared infrastructure for the uDos ecosystem. This project provides the core services, UI components, and tooling for building and managing uDos applications.</p>
          </div>
          <div class="detail-section">
            <h4>Recent Activity</h4>
            <div v-for="activity in activities" :key="activity.action" class="activity-item">
              <span class="activity-icon">{{ activity.icon }}</span>
              <div>
                <strong>{{ activity.action }}</strong>
                <p class="activity-meta">{{ activity.detail }}</p>
              </div>
            </div>
          </div>
          <div class="detail-section">
            <h4>Languages</h4>
            <div class="language-bar">
              <div v-for="lang in languages" :key="lang.name" class="language-item" :style="{ width: lang.percent + '%', backgroundColor: lang.color }">
                {{ lang.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('README.md')

const files = [
  { name: 'README.md', icon: '📄', size: '2.4 KB', active: true },
  { name: 'package.json', icon: '📦', size: '1.1 KB', active: false },
  { name: 'src/', icon: '📁', size: '-', active: false },
  { name: 'vite.config.ts', icon: '⚙️', size: '0.3 KB', active: false },
  { name: 'docs/', icon: '📁', size: '-', active: false },
  { name: 'tsconfig.json', icon: '⚙️', size: '0.5 KB', active: false },
]

const tabs = ['README.md', 'package.json', 'vite.config.ts']

const codeLines = [
  '# uDos Connect',
  '',
  'Shared infrastructure for the uDos ecosystem.',
  'This project provides core services, UI components,',
  'and tooling for building uDos applications.',
  '',
  '## Features',
  '',
  '- 🎮 **Surface Manager** - Multi-surface UI framework',
  '- 📁 **Vault** - File management and sync',
  '- 🔌 **MCP Bridge** - Tool integration',
  '- 🌐 **GitHub Sync** - Repository management',
  '- 📖 **USXD Renderer** - Universal document format',
  '- ⚙️ **Workflow Engine** - Automation',
  '',
  '## Quick Start',
  '',
  '```bash',
  'npm install',
  'npm run dev',
  '```',
]

const activities = [
  { icon: '📝', action: 'Updated README.md', detail: '2 hours ago' },
  { icon: '🔀', action: 'Merged PR #42', detail: '5 hours ago' },
  { icon: '✅', action: 'Build passed', detail: '1 day ago' },
  { icon: '📦', action: 'Published v1.1.0', detail: '2 days ago' },
]

const languages = [
  { name: 'TypeScript', percent: 55, color: '#3178c6' },
  { name: 'Vue', percent: 25, color: '#4fc08d' },
  { name: 'CSS', percent: 12, color: '#563d7c' },
  { name: 'Other', percent: 8, color: '#6e7681' },
]

function highlightCode(line: string): string {
  if (line.startsWith('# ')) {
    return `<span style="color: #58a6ff">${line}</span>`
  }
  if (line.startsWith('- ')) {
    return `<span style="color: #8b949e">${line}</span>`
  }
  if (line.startsWith('```')) {
    return `<span style="color: #6e7681">${line}</span>`
  }
  if (line.includes('**')) {
    return line.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #c9d1d9">$1</strong>')
  }
  return line
}
</script>

<style scoped>
.github-surface {
  background: #0d1117;
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.surface-header {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #21262d;
}

.surface-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #58a6ff;
  margin: 0;
}

.surface-tagline {
  color: #8b949e;
  font-size: 0.85rem;
  margin: 0.25rem 0 0;
}

.status-bar {
  display: flex;
  gap: 1.5rem;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid #21262d;
  font-size: 0.85rem;
  color: #8b949e;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 220px 1fr 280px;
  gap: 1rem;
}

.panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #161b22;
  border-bottom: 1px solid #21262d;
}

.panel-header h3 {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #c9d1d9;
}

.icon-btn {
  background: none;
  border: none;
  color: #8b949e;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 0.85rem;
}

.icon-btn:hover {
  color: #c9d1d9;
}

/* File Browser */
.file-tree {
  padding: 0.25rem 0;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  cursor: pointer;
  font-size: 0.85rem;
}

.file-item:hover {
  background: #1c2128;
}

.file-item.active {
  background: #1f2937;
  color: #58a6ff;
}

.file-icon {
  font-size: 0.9rem;
}

.file-name {
  flex: 1;
}

.file-meta {
  color: #6e7681;
  font-size: 0.75rem;
}

/* Code View */
.tabs {
  display: flex;
  gap: 0;
}

.tab {
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  color: #8b949e;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tab.active {
  color: #c9d1d9;
  border-bottom-color: #f78166;
}

.code-content {
  padding: 0.75rem;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  overflow-x: auto;
}

.code-line {
  display: flex;
  gap: 1rem;
}

.line-number {
  color: #6e7681;
  user-select: none;
  min-width: 2rem;
  text-align: right;
}

.line-content {
  color: #c9d1d9;
  white-space: pre;
}

/* Details Panel */
.details-content {
  padding: 0.75rem;
}

.detail-section {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #21262d;
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.detail-section h4 {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #8b949e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-text {
  font-size: 0.85rem;
  color: #c9d1d9;
  line-height: 1.5;
  margin: 0;
}

.activity-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.activity-item:last-child {
  margin-bottom: 0;
}

.activity-icon {
  font-size: 0.9rem;
}

.activity-meta {
  color: #6e7681;
  font-size: 0.75rem;
  margin: 0;
}

.language-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.language-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0;
}
</style>
