<template>
  <div class="bedstead-surface min-h-screen">
    <!-- Surface Header -->
    <div class="surface-header">
      <h1><span class="surface-icon">🏠</span> Bedstead Modern <span class="badge-ucode2">uCode2</span></h1>
      <p class="surface-tagline">Modern uCode2 dashboard with card-based layouts, Flowbite-style components, and smooth interactions.</p>
    </div>

    <!-- Top Navigation Bar -->
    <div class="top-nav">
      <div class="nav-left">
        <span class="nav-logo">🏠 Bedstead</span>
        <span class="nav-link active">Dashboard</span>
        <span class="nav-link">Vault</span>
        <span class="nav-link">Surfaces</span>
        <span class="nav-link">Settings</span>
      </div>
      <div class="nav-right">
        <button class="icon-btn">🔔</button>
        <button class="icon-btn">⚙️</button>
        <span class="avatar">👤</span>
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="dashboard-grid">
      <!-- Welcome Card -->
      <div class="card welcome-card">
        <div class="card-content">
          <h2>Welcome back!</h2>
          <p>You have <strong>3 pending tasks</strong> and <strong>2 unread notifications</strong>.</p>
          <div class="welcome-stats">
            <div class="stat">
              <span class="stat-value">42</span>
              <span class="stat-label">Files</span>
            </div>
            <div class="stat">
              <span class="stat-value">12</span>
              <span class="stat-label">Workflows</span>
            </div>
            <div class="stat">
              <span class="stat-value">8</span>
              <span class="stat-label">Tools</span>
            </div>
            <div class="stat">
              <span class="stat-value">5</span>
              <span class="stat-label">Surfaces</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card actions-card">
        <div class="card-header">
          <h3>Quick Actions</h3>
        </div>
        <div class="card-content">
          <button v-for="action in quickActions" :key="action.label" class="action-btn" @click="handleAction(action)">
            <span class="action-icon">{{ action.icon }}</span>
            <span class="action-label">{{ action.label }}</span>
          </button>
        </div>
      </div>

      <!-- Activity Feed -->
      <div class="card activity-card">
        <div class="card-header">
          <h3>Recent Activity</h3>
          <span class="badge badge-live">Live</span>
        </div>
        <div class="card-content">
          <div v-for="item in activities" :key="item.title" class="activity-item">
            <div class="activity-dot" :style="{ backgroundColor: item.color }"></div>
            <div class="activity-info">
              <strong>{{ item.title }}</strong>
              <p>{{ item.description }}</p>
            </div>
            <span class="activity-time">{{ item.time }}</span>
          </div>
        </div>
      </div>

      <!-- System Status -->
      <div class="card status-card">
        <div class="card-header">
          <h3>System Status</h3>
        </div>
        <div class="card-content">
          <div v-for="service in services" :key="service.name" class="service-item">
            <div class="service-info">
              <span class="service-name">{{ service.name }}</span>
              <span class="service-status" :class="service.status">
                {{ service.status === 'up' ? '● Online' : service.status === 'degraded' ? '● Degraded' : '● Offline' }}
              </span>
            </div>
            <div class="service-bar">
              <div class="service-bar-fill" :style="{ width: service.uptime + '%', backgroundColor: service.status === 'up' ? '#4caf50' : service.status === 'degraded' ? '#ff9800' : '#f44336' }"></div>
            </div>
            <span class="service-uptime">{{ service.uptime }}% uptime</span>
          </div>
        </div>
      </div>

      <!-- Recent Files -->
      <div class="card files-card">
        <div class="card-header">
          <h3>Recent Files</h3>
          <button class="text-btn">View All →</button>
        </div>
        <div class="card-content">
          <div v-for="file in recentFiles" :key="file.name" class="file-item">
            <span class="file-icon">{{ file.icon }}</span>
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-date">{{ file.date }}</span>
            </div>
            <span class="file-size">{{ file.size }}</span>
          </div>
        </div>
      </div>

      <!-- Tips Card -->
      <div class="card tips-card">
        <div class="card-header">
          <h3>💡 Tips & Tricks</h3>
        </div>
        <div class="card-content">
          <p>{{ currentTip }}</p>
          <button class="text-btn" @click="nextTip">Show another tip →</button>
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

function handleAction(action: { icon: string; label: string; action: string }) {
  alert(`🚀 Action: ${action.label}\n\nThis would trigger the ${action.action} action.`)
}
</script>

<style scoped>
.bedstead-surface {
  background: #f5f5f5;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.surface-header {
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e0e0e0;
}

.surface-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.badge-ucode2 {
  font-size: 0.6rem;
  background: #667eea;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.surface-tagline {
  color: #666;
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

/* Top Navigation */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-logo {
  font-weight: 700;
  font-size: 1rem;
  color: #667eea;
}

.nav-link {
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  padding: 0.25rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}

.nav-link:hover {
  color: #333;
}

.nav-link.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
  transition: background 0.15s;
}

.icon-btn:hover {
  background: #f0f0f0;
}

.avatar {
  font-size: 1.25rem;
  cursor: pointer;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.card-content {
  padding: 1.25rem;
}

/* Welcome Card */
.welcome-card {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
}

.welcome-card h2 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem;
}

.welcome-card p {
  opacity: 0.9;
  margin: 0 0 1rem;
}

.welcome-stats {
  display: flex;
  gap: 2rem;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* Actions Card */
.actions-card {
  grid-column: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #333;
  transition: background 0.15s;
}

.action-btn:hover {
  background: #f5f5f5;
}

.action-icon {
  font-size: 1.25rem;
}

/* Activity Card */
.activity-card {
  grid-column: 2;
}

.badge-live {
  background: #4caf50;
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.activity-info {
  flex: 1;
}

.activity-info strong {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 2px;
}

.activity-info p {
  margin: 0;
  font-size: 0.8rem;
  color: #666;
}

.activity-time {
  font-size: 0.75rem;
  color: #999;
  white-space: nowrap;
}

/* Status Card */
.status-card {
  grid-column: 1;
}

.service-item {
  margin-bottom: 1rem;
}

.service-item:last-child {
  margin-bottom: 0;
}

.service-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.35rem;
}

.service-name {
  font-size: 0.85rem;
  font-weight: 500;
}

.service-status {
  font-size: 0.75rem;
}

.service-status.up {
  color: #4caf50;
}

.service-status.degraded {
  color: #ff9800;
}

.service-status.down {
  color: #f44336;
}

.service-bar {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  margin-bottom: 0.25rem;
}

.service-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s;
}

.service-uptime {
  font-size: 0.7rem;
  color: #999;
}

/* Files Card */
.files-card {
  grid-column: 2;
}

.text-btn {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
}

.text-btn:hover {
  text-decoration: underline;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.file-item:last-child {
  border-bottom: none;
}

.file-icon {
  font-size: 1.25rem;
}

.file-info {
  flex: 1;
}

.file-name {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
}

.file-date {
  font-size: 0.75rem;
  color: #999;
}

.file-size {
  font-size: 0.75rem;
  color: #999;
}

/* Tips Card */
.tips-card {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.tips-card p {
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 0.75rem;
  color: #444;
}
</style>
