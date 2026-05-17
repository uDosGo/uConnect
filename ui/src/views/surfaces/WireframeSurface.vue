<template>
  <div class="wireframe-surface min-h-screen">
    <!-- Surface Header -->
    <div class="surface-header">
      <h1><span class="surface-icon">📐</span> Wireframe <span class="badge-ucode4">uCode4</span></h1>
      <p class="surface-tagline">Wireframe theme scaffold for uCode4 — console-style layout with dashed borders, flat icons, monospace font.</p>
    </div>

    <!-- Top Navigation Bar (Wireframe) -->
    <div class="wf-nav">
      <div class="wf-nav-left">
        <span class="wf-logo">🏠 Bedstead</span>
        <span class="wf-nav-link active">Dashboard</span>
        <span class="wf-nav-link">Vault</span>
        <span class="wf-nav-link">Surfaces</span>
        <span class="wf-nav-link">Settings</span>
      </div>
      <div class="wf-nav-right">
        <span class="wf-icon">🔔</span>
        <span class="wf-icon">⚙️</span>
        <span class="wf-avatar">👤</span>
      </div>
    </div>

    <!-- Dashboard Grid (Wireframe) -->
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
            <span class="wf-action-icon">{{ action.icon }}</span>
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
            <span class="wf-file-icon">{{ file.icon }}</span>
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
          <h3>💡 Tips & Tricks</h3>
        </div>
        <div class="wf-card-content">
          <p class="wf-text">{{ currentTip }}</p>
          <span class="wf-text-link" @click="nextTip">Show another tip →</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const quickActions = [
  { icon: '📝', label: 'New Document', action: 'document' },
  { icon: '📤', label: 'Upload File', action: 'upload' },
  { icon: '🔄', label: 'Sync Vault', action: 'sync' },
  { icon: '🔍', label: 'Search', action: 'search' },
  { icon: '⚙️', label: 'Settings', action: 'settings' },
  { icon: '📊', label: 'Dashboard', action: 'dashboard' },
]

const activities = [
  { title: 'File uploaded', description: 'README.md was added to vault', time: '2m ago', color: '#4caf50' },
  { title: 'Workflow completed', description: 'Backup workflow finished successfully', time: '15m ago', color: '#2196f3' },
  { title: 'Sync completed', description: 'Vault synced with GitHub', time: '1h ago', color: '#4caf50' },
  { title: 'New version', description: 'uDos v1.1.0 is now available', time: '2h ago', color: '#ff9800' },
  { title: 'System update', description: 'MCP bridge reconnected', time: '3h ago', color: '#2196f3' },
]

const services = [
  { name: 'Vault Service', status: 'up', uptime: 99.9 },
  { name: 'MCP Bridge', status: 'up', uptime: 99.8 },
  { name: 'GitHub Sync', status: 'up', uptime: 99.5 },
  { name: 'USXD Renderer', status: 'degraded', uptime: 95.2 },
  { name: 'Workflow Engine', status: 'up', uptime: 99.7 },
]

const recentFiles = [
  { name: 'README.md', icon: '📄', size: '2.4 KB', date: '2 hours ago' },
  { name: 'config.yaml', icon: '⚙️', size: '1.2 KB', date: '5 hours ago' },
  { name: 'notes.txt', icon: '📝', size: '0.8 KB', date: '1 day ago' },
  { name: 'workflow.json', icon: '📊', size: '3.1 KB', date: '2 days ago' },
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

<style scoped>
.wireframe-surface {
  background: #fff;
  color: #333;
  font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.surface-header {
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px dashed #ccc;
}

.surface-header h1 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.badge-ucode4 {
  font-size: 0.55rem;
  border: 1px dashed #999;
  color: #999;
  padding: 2px 6px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.surface-tagline {
  color: #999;
  font-size: 0.85rem;
  margin: 0.25rem 0 0;
}

/* Wireframe Navigation */
.wf-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2px dashed #ccc;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1.5rem;
}

.wf-nav-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.wf-logo {
  font-weight: bold;
  font-size: 0.9rem;
  color: #666;
}

.wf-nav-link {
  font-size: 0.8rem;
  color: #999;
  cursor: pointer;
  padding: 0.25rem 0;
  border-bottom: 2px dashed transparent;
}

.wf-nav-link:hover {
  color: #666;
}

.wf-nav-link.active {
  color: #333;
  border-bottom-color: #333;
}

.wf-nav-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.wf-icon {
  font-size: 1rem;
  cursor: pointer;
  border: 1px dashed #ccc;
  padding: 2px 4px;
}

.wf-avatar {
  font-size: 1.1rem;
  cursor: pointer;
  border: 1px dashed #ccc;
  padding: 2px 4px;
}

/* Wireframe Grid */
.wf-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.wf-card {
  border: 2px dashed #ccc;
  overflow: hidden;
}

.wf-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px dashed #e0e0e0;
}

.wf-card-header h3 {
  margin: 0;
  font-size: 0.8rem;
  font-weight: bold;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.wf-card-content {
  padding: 1rem;
}

/* Welcome Card */
.welcome-card {
  grid-column: 1 / -1;
  border-style: dashed;
}

.wf-heading {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0 0 0.5rem;
  color: #333;
}

.wf-text {
  font-size: 0.8rem;
  color: #666;
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
  color: #333;
}

.wf-stat-label {
  font-size: 0.7rem;
  color: #999;
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
  border-bottom: 1px dashed #eee;
  cursor: pointer;
}

.wf-action-row:last-child {
  border-bottom: none;
}

.wf-action-row:hover {
  background: #fafafa;
}

.wf-action-icon {
  font-size: 1rem;
}

.wf-action-label {
  font-size: 0.8rem;
  color: #666;
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
  border-bottom: 1px dashed #eee;
}

.wf-activity-row:last-child {
  border-bottom: none;
}

.wf-activity-dot {
  width: 6px;
  height: 6px;
  border: 1px dashed #999;
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
}

.wf-activity-info p {
  margin: 0;
  font-size: 0.7rem;
  color: #999;
}

.wf-activity-time {
  font-size: 0.65rem;
  color: #bbb;
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
  border: 1px dashed #ccc;
  margin-bottom: 0.15rem;
}

.wf-bar-fill {
  height: 100%;
  background: #ccc;
}

.wf-service-uptime {
  font-size: 0.6rem;
  color: #bbb;
}

/* Files Card */
.files-card {
  grid-column: 2;
}

.wf-text-link {
  font-size: 0.7rem;
  color: #667eea;
  cursor: pointer;
  border-bottom: 1px dashed #667eea;
}

.wf-file-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0;
  border-bottom: 1px dashed #eee;
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
}

.wf-file-date {
  font-size: 0.65rem;
  color: #bbb;
}

.wf-file-size {
  font-size: 0.65rem;
  color: #bbb;
}

/* Tips Card */
.tips-card {
  grid-column: 1 / -1;
}

.tips-card .wf-text {
  margin-bottom: 0.75rem;
}
</style>
