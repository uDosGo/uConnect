<template>
  <div class="dashboard-panel" data-panel="dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h2 class="dashboard-title">📊 gridui Dashboard</h2>
      <button class="dashboard-refresh-btn" @click="refreshData">🔄 REFRESH</button>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">⚡ CPU</div>
        <div class="stat-value">{{ stats.cpu }}%</div>
        <div class="stat-bar">
          <div class="stat-bar-fill" :style="{ width: stats.cpu + '%', background: barColor(stats.cpu) }"></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">💾 MEMORY</div>
        <div class="stat-value">{{ stats.memory }}%</div>
        <div class="stat-bar">
          <div class="stat-bar-fill" :style="{ width: stats.memory + '%', background: barColor(stats.memory) }"></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">💿 DISK</div>
        <div class="stat-value">{{ stats.disk }}%</div>
        <div class="stat-bar">
          <div class="stat-bar-fill" :style="{ width: stats.disk + '%', background: barColor(stats.disk) }"></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">⏱️ UPTIME</div>
        <div class="stat-value" style="font-size: 1rem">{{ stats.uptime }}</div>
        <div class="stat-bar">
          <div class="stat-bar-fill" style="width: 100%; background: var(--gridui-accent)"></div>
        </div>
      </div>
    </div>

    <!-- Tasks + Activity Row -->
    <div class="dashboard-row">
      <!-- Tasks -->
      <div class="dashboard-section">
        <h3 class="section-title">📋 TASKS</h3>
        <div class="task-list">
          <div v-for="task in tasks" :key="task.id" class="task-item">
            <label class="task-checkbox">
              <input type="checkbox" :checked="task.completed" @change="toggleTask(task.id)" />
              <span :class="{ 'task-completed': task.completed }">{{ task.title }}</span>
            </label>
            <span class="task-priority" :class="`task-priority--${task.priority}`">{{ task.priority }}</span>
          </div>
        </div>
        <button class="dashboard-add-btn" @click="dialogOpen = true">+ ADD TASK</button>
      </div>

      <!-- Activity -->
      <div class="dashboard-section">
        <h3 class="section-title">📰 ACTIVITY</h3>
        <div class="activity-list">
          <div v-for="(item, idx) in activity" :key="idx" class="activity-item">
            <span class="activity-date">{{ item.date }}</span>
            <span class="activity-title">{{ item.title }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Task Dialog -->
    <div v-if="dialogOpen" class="dialog-overlay" @click.self="dialogOpen = false">
      <div class="dialog">
        <h3 class="dialog-title">➕ ADD NEW TASK</h3>
        <div class="dialog-field">
          <label>Task Title</label>
          <input v-model="newTaskTitle" type="text" placeholder="Enter task..." class="dialog-input" />
        </div>
        <div class="dialog-field">
          <label>Priority</label>
          <select v-model="newTaskPriority" class="dialog-select">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div class="dialog-actions">
          <button class="dialog-btn dialog-btn--cancel" @click="dialogOpen = false">Cancel</button>
          <button class="dialog-btn dialog-btn--confirm" @click="addTask">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Stats {
  cpu: number
  memory: number
  disk: number
  uptime: string
}

interface Task {
  id: number
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
}

interface ActivityItem {
  title: string
  date: string
}

const stats = ref<Stats>({
  cpu: 45,
  memory: 62,
  disk: 38,
  uptime: '3d 14h 22m',
})

const tasks = ref<Task[]>([
  { id: 1, title: 'Complete project documentation', completed: false, priority: 'high' },
  { id: 2, title: 'Review pull requests', completed: false, priority: 'medium' },
  { id: 3, title: 'Update dependencies', completed: true, priority: 'low' },
  { id: 4, title: 'Fix login bug', completed: false, priority: 'high' },
  { id: 5, title: 'Write unit tests', completed: false, priority: 'medium' },
])

const activity = ref<ActivityItem[]>([
  { title: 'gridui v1.0 released!', date: '2026-05-20' },
  { title: 'New USX grid renderer available', date: '2026-05-19' },
  { title: 'Community showcase: Retro dashboards', date: '2026-05-18' },
  { title: 'uCode v1.2 deployment complete', date: '2026-05-17' },
  { title: 'MCP Bridge connected to gridui', date: '2026-05-16' },
])

const dialogOpen = ref(false)
const newTaskTitle = ref('')
const newTaskPriority = ref<'low' | 'medium' | 'high'>('medium')

function barColor(val: number): string {
  if (val > 80) return '#E76F51'
  if (val > 60) return '#E9C46A'
  return '#2A9D8F'
}

function toggleTask(id: number) {
  const task = tasks.value.find(t => t.id === id)
  if (task) task.completed = !task.completed
}

function addTask() {
  if (!newTaskTitle.value.trim()) return
  tasks.value.push({
    id: Date.now(),
    title: newTaskTitle.value.trim(),
    completed: false,
    priority: newTaskPriority.value,
  })
  newTaskTitle.value = ''
  newTaskPriority.value = 'medium'
  dialogOpen.value = false
}

function refreshData() {
  stats.value = {
    cpu: Math.floor(Math.random() * 100),
    memory: Math.floor(Math.random() * 100),
    disk: Math.floor(Math.random() * 100),
    uptime: stats.value.uptime,
  }
}

let pollInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  pollInterval = setInterval(refreshData, 30000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<style scoped>
.dashboard-panel {
  width: 100%;
  height: 100%;
  padding: 24px;
  overflow-y: auto;
  background: var(--gridui-bg);
  color: var(--gridui-text);
  font-family: 'Monaspace Krypton', 'JetBrains Mono', monospace;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.dashboard-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--gridui-text);
}

.dashboard-refresh-btn {
  padding: 8px 16px;
  border: 1px solid var(--gridui-border);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: var(--gridui-surface);
  color: var(--gridui-text);
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  transition: background 0.15s;
}

.dashboard-refresh-btn:hover {
  background: var(--gridui-surface-elevated);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 16px;
  background: var(--gridui-surface);
  border: 1px solid var(--gridui-border);
  border-radius: var(--md-sys-shape-corner-small);
}

.stat-label {
  font-size: 12px;
  color: var(--gridui-text-muted);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--gridui-text);
  margin-bottom: 8px;
}

.stat-bar {
  height: 6px;
  background: var(--gridui-border);
  border-radius: 3px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.dashboard-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.dashboard-section {
  flex: 1;
  min-width: 280px;
  padding: 16px;
  background: var(--gridui-surface);
  border: 1px solid var(--gridui-border);
  border-radius: var(--md-sys-shape-corner-small);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--gridui-text);
  margin-bottom: 12px;
}

.task-list {
  margin-bottom: 12px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--gridui-border);
}

.task-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--gridui-text);
}

.task-checkbox input[type="checkbox"] {
  accent-color: var(--gridui-accent);
}

.task-completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.task-priority {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: var(--md-sys-shape-corner-extra-small);
  text-transform: uppercase;
  font-weight: 600;
}

.task-priority--low { background: #2A9D8F; color: #fff; }
.task-priority--medium { background: #E9C46A; color: #000; }
.task-priority--high { background: #E76F51; color: #fff; }

.dashboard-add-btn {
  width: 100%;
  padding: 8px;
  border: 1px dashed var(--gridui-border);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: transparent;
  color: var(--gridui-text-muted);
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  transition: border-color 0.15s, color 0.15s;
}

.dashboard-add-btn:hover {
  border-color: var(--gridui-accent);
  color: var(--gridui-accent);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-item {
  display: flex;
  gap: 8px;
  font-size: 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--gridui-border);
}

.activity-date {
  color: var(--gridui-text-subtle);
  white-space: nowrap;
  min-width: 80px;
}

.activity-title {
  color: var(--gridui-text);
}

.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: var(--gridui-surface);
  border: 1px solid var(--gridui-border);
  border-radius: var(--md-sys-shape-corner-medium);
  padding: 24px;
  width: 360px;
  max-width: 90vw;
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--gridui-text);
  margin-bottom: 16px;
}

.dialog-field {
  margin-bottom: 12px;
}

.dialog-field label {
  display: block;
  font-size: 12px;
  color: var(--gridui-text-muted);
  margin-bottom: 4px;
}

.dialog-input,
.dialog-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--gridui-border);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: var(--gridui-bg);
  color: var(--gridui-text);
  font-family: inherit;
  font-size: 13px;
  outline: none;
}

.dialog-input:focus,
.dialog-select:focus {
  border-color: var(--gridui-accent);
}

.dialog-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}

.dialog-btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--md-sys-shape-corner-extra-small);
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  transition: opacity 0.15s;
}

.dialog-btn--cancel {
  background: var(--gridui-border);
  color: var(--gridui-text);
}

.dialog-btn--confirm {
  background: var(--gridui-accent);
  color: var(--gridui-bg);
}

.dialog-btn:hover { opacity: 0.9; }

.dashboard-panel::-webkit-scrollbar {
  width: 6px;
}

.dashboard-panel::-webkit-scrollbar-track {
  background: var(--gridui-bg);
}

.dashboard-panel::-webkit-scrollbar-thumb {
  background: var(--gridui-border);
  border-radius: 3px;
}
</style>
