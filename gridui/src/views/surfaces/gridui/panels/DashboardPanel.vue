<template>
  <div class="dashboard-panel" data-panel="dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h2 class="dashboard-title m3-title-large">📊 gridui Dashboard</h2>
      <button class="m3-btn m3-btn--tonal" @click="refreshData">
        <span class="material-symbol" style="font-size: 16px">refresh</span>
        REFRESH
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="m3-card m3-card--elevated stat-card">
        <div class="stat-label">⚡ CPU</div>
        <div class="stat-value">{{ stats.cpu }}%</div>
        <div class="m3-linear-progress">
          <div class="m3-linear-progress-bar" :style="{ width: stats.cpu + '%', background: barColor(stats.cpu) }"></div>
        </div>
      </div>
      <div class="m3-card m3-card--elevated stat-card">
        <div class="stat-label">💾 MEMORY</div>
        <div class="stat-value">{{ stats.memory }}%</div>
        <div class="m3-linear-progress">
          <div class="m3-linear-progress-bar" :style="{ width: stats.memory + '%', background: barColor(stats.memory) }"></div>
        </div>
      </div>
      <div class="m3-card m3-card--elevated stat-card">
        <div class="stat-label">💿 DISK</div>
        <div class="stat-value">{{ stats.disk }}%</div>
        <div class="m3-linear-progress">
          <div class="m3-linear-progress-bar" :style="{ width: stats.disk + '%', background: barColor(stats.disk) }"></div>
        </div>
      </div>
      <div class="m3-card m3-card--elevated stat-card">
        <div class="stat-label">⏱️ UPTIME</div>
        <div class="stat-value" style="font-size: 1rem">{{ stats.uptime }}</div>
        <div class="m3-linear-progress">
          <div class="m3-linear-progress-bar" style="width: 100%; background: var(--usx-color-primary)"></div>
        </div>
      </div>
    </div>

    <!-- Tasks + Activity Row -->
    <div class="dashboard-row">
      <!-- Tasks -->
      <div class="m3-card m3-card--filled dashboard-section">
        <h3 class="section-title m3-title-small">📋 TASKS</h3>
        <div class="task-list">
          <div v-for="task in tasks" :key="task.id" class="task-item">
            <label class="m3-switch task-checkbox">
              <input type="checkbox" :checked="task.completed" @change="toggleTask(task.id)" />
              <div class="m3-switch-track">
                <div class="m3-switch-thumb"></div>
              </div>
              <span :class="{ 'task-completed': task.completed }">{{ task.title }}</span>
            </label>
            <span class="m3-chip" :class="`m3-chip--${task.priority === 'high' ? 'active' : ''}`">{{ task.priority }}</span>
          </div>
        </div>
        <button class="dashboard-add-btn" @click="dialogOpen = true">+ ADD TASK</button>
      </div>

      <!-- Activity -->
      <div class="m3-card m3-card--filled dashboard-section">
        <h3 class="section-title m3-title-small">📰 ACTIVITY</h3>
        <div class="activity-list">
          <div v-for="(item, idx) in activity" :key="idx" class="activity-item">
            <span class="activity-date">{{ item.date }}</span>
            <span class="activity-title">{{ item.title }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Task Dialog (M3 Dialog) -->
    <div v-if="dialogOpen" class="m3-dialog-overlay" @click.self="dialogOpen = false">
      <div class="m3-dialog">
        <h3 class="m3-dialog-title">➕ ADD NEW TASK</h3>
        <div class="m3-text-field" style="margin-bottom: 12px">
          <label class="m3-text-field-label">Task Title</label>
          <input v-model="newTaskTitle" type="text" placeholder="Enter task..." class="m3-text-field-input" />
        </div>
        <div class="m3-text-field" style="margin-bottom: 12px">
          <label class="m3-text-field-label">Priority</label>
          <select v-model="newTaskPriority" class="m3-select" style="width: 100%">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div class="m3-dialog-actions">
          <button class="m3-btn m3-btn--text" @click="dialogOpen = false">Cancel</button>
          <button class="m3-btn m3-btn--filled" @click="addTask">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGridUIStore } from '../stores/gridUIStore'

const store = useGridUIStore()

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
  store.showSnackbar({ message: `Task "${newTaskTitle.value.trim()}" added`, type: 'success', action: 'OK' })
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
  store.showSnackbar({ message: 'Dashboard data refreshed', type: 'info', action: 'OK' })
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
  background: var(--usx-color-background);
  color: var(--usx-color-on-surface);
  font-family: 'Monaspace Krypton', 'JetBrains Mono', monospace;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.dashboard-title {
  color: var(--usx-color-on-surface);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 16px;
}

.stat-label {
  font-size: 12px;
  color: var(--usx-color-on-surface-variant);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--usx-color-on-surface);
  margin-bottom: 8px;
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
}

.section-title {
  color: var(--usx-color-on-surface);
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
  border-bottom: 1px solid var(--usx-color-outline-variant);
}

.task-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--usx-color-on-surface);
}

.task-completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.dashboard-add-btn {
  width: 100%;
  padding: 8px;
  border: 1px dashed var(--usx-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: transparent;
  color: var(--usx-color-on-surface-variant);
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  transition: border-color 0.15s, color 0.15s;
}

.dashboard-add-btn:hover {
  border-color: var(--usx-color-primary);
  color: var(--usx-color-primary);
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
  border-bottom: 1px solid var(--usx-color-outline-variant);
}

.activity-date {
  color: var(--usx-color-on-surface-variant);
  white-space: nowrap;
  min-width: 80px;
}

.activity-title {
  color: var(--usx-color-on-surface);
}

.dashboard-panel::-webkit-scrollbar {
  width: 6px;
}

.dashboard-panel::-webkit-scrollbar-track {
  background: var(--usx-color-background);
}

.dashboard-panel::-webkit-scrollbar-thumb {
  background: var(--usx-color-outline-variant);
  border-radius: 3px;
}

</style>
