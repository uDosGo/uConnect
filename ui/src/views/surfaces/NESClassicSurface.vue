<template>
  <div class="nes-dashboard">
    <!-- ═══ HEADER ═══ -->
    <section class="nes-container with-title is-rounded" style="margin-bottom: 24px">
      <p class="title">🎮 uCode NES Dashboard</p>
      <div class="header-controls">
        <i class="nes-icon heart is-small"></i>
        <i class="nes-icon star is-small"></i>
        <i class="nes-icon like is-small"></i>
        <button class="nes-btn is-primary" @click="refreshData" style="margin-left: auto">
          🔄 REFRESH
        </button>
      </div>
    </section>

    <!-- ═══ STATS GRID ═══ -->
    <div v-if="showStats" class="stats-grid">
      <div class="nes-container with-title is-centered">
        <p class="title">⚡ CPU</p>
        <p class="stat-value">{{ stats.cpu }}%</p>
        <progress
          class="nes-progress"
          :class="progressClass(stats.cpu)"
          :value="stats.cpu"
          max="100"
        ></progress>
      </div>
      <div class="nes-container with-title is-centered">
        <p class="title">💾 MEMORY</p>
        <p class="stat-value">{{ stats.memory }}%</p>
        <progress
          class="nes-progress"
          :class="progressClass(stats.memory)"
          :value="stats.memory"
          max="100"
        ></progress>
      </div>
      <div class="nes-container with-title is-centered">
        <p class="title">💿 DISK</p>
        <p class="stat-value">{{ stats.disk }}%</p>
        <progress
          class="nes-progress"
          :class="progressClass(stats.disk)"
          :value="stats.disk"
          max="100"
        ></progress>
      </div>
      <div class="nes-container with-title is-centered">
        <p class="title">⏱️ UPTIME</p>
        <p class="stat-value" style="font-size: 1rem">{{ stats.uptime }}</p>
        <i class="nes-icon trophy is-small"></i>
      </div>
    </div>

    <!-- ═══ TASKS + ACTIVITY ROW ═══ -->
    <div class="dashboard-row">
      <!-- Tasks Panel -->
      <div v-if="showTasks" class="nes-container with-title" style="flex: 1">
        <p class="title">📋 TASKS</p>
        <div class="nes-list is-disc">
          <div v-for="task in tasks" :key="task.id" class="task-item">
            <label>
              <input
                type="checkbox"
                class="nes-checkbox"
                :checked="task.completed"
                @change="toggleTask(task.id)"
              />
              <span :class="{ completed: task.completed }">{{ task.title }}</span>
            </label>
            <a href="#" class="nes-badge is-splited" :class="priorityBadge[task.priority]">
              <span class="is-dark">!</span>
              <span>{{ task.priority.toUpperCase() }}</span>
            </a>
          </div>
        </div>
        <button class="nes-btn is-primary" style="margin-top: 16px; width: 100%" @click="dialogOpen = true">
          + ADD TASK
        </button>
      </div>

      <!-- Activity Feed -->
      <div v-if="showActivity" class="nes-container with-title" style="flex: 1">
        <p class="title">📰 ACTIVITY</p>
        <div class="message-list">
          <div v-for="(item, idx) in activity" :key="idx" class="message -left">
            <i class="nes-bcrikko"></i>
            <div class="nes-balloon from-left">
              <p>
                <strong>{{ item.date }}</strong><br />
                {{ item.title }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ FOOTER ═══ -->
    <div class="dashboard-footer">
      <div class="nes-container is-dark is-rounded">
        <div class="footer-content">
          <a href="#" class="nes-badge is-splited">
            <span class="is-dark">NES.css</span>
            <span class="is-primary">v2.3</span>
          </a>
          <a href="#" class="nes-badge is-splited">
            <span class="is-dark">PIXELS</span>
            <span class="is-success">8-BIT</span>
          </a>
          <a href="#" class="nes-badge is-splited">
            <span class="is-dark">RETRO</span>
            <span class="is-warning">MODE</span>
          </a>
          <div class="nes-pointer nes-balloon from-right" style="margin-left: auto">
            <i class="nes-icon heart"></i> POWERED BY NES.css
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ ADD TASK DIALOG ═══ -->
    <dialog v-if="dialogOpen" class="nes-dialog is-rounded" open style="position: fixed; z-index: 1000">
      <form method="dialog">
        <p class="title">➕ ADD NEW TASK</p>
        <div class="nes-field">
          <label for="task_title">Task Title</label>
          <input type="text" id="task_title" class="nes-input" v-model="newTaskTitle" placeholder="Enter task..." />
        </div>
        <div class="nes-field">
          <label>Priority</label>
          <div class="nes-select">
            <select v-model="newTaskPriority">
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <menu class="dialog-menu">
          <button class="nes-btn" @click="dialogOpen = false">Cancel</button>
          <button class="nes-btn is-primary" @click="addTask">Confirm</button>
        </menu>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Import NES.css framework — scoped to this surface only
import 'nes.css/css/nes.min.css'

// ─── LENS Variables (USX Schema) ───────────────────────────────
const showStats = ref(true)
const showTasks = ref(true)
const showActivity = ref(true)

// ─── Data ───────────────────────────────────────────────────────
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
  { title: 'NES.css v2.3 released!', date: '2026-05-15' },
  { title: 'New pixel art assets available', date: '2026-05-14' },
  { title: 'Community showcase: Retro dashboards', date: '2026-05-13' },
  { title: 'uCode v1.2 deployment complete', date: '2026-05-12' },
  { title: 'MCP Bridge connected to Snackbar', date: '2026-05-11' },
])

// ─── Dialog State ───────────────────────────────────────────────
const dialogOpen = ref(false)
const newTaskTitle = ref('')
const newTaskPriority = ref<'low' | 'medium' | 'high'>('medium')

// ─── Helpers ────────────────────────────────────────────────────
const priorityBadge: Record<string, string> = {
  low: 'is-success',
  medium: 'is-warning',
  high: 'is-error',
}

function progressClass(val: number): string {
  if (val > 80) return 'is-error'
  if (val > 60) return 'is-warning'
  return 'is-primary'
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

// ─── Polling ────────────────────────────────────────────────────
let pollInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  pollInterval = setInterval(refreshData, 30000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   NES Dashboard — USX LENS + SKIN Architecture
   Framework: NES.css (imported globally via main.ts)
   ═══════════════════════════════════════════════════════════════ */

/* ─── Root ────────────────────────────────────────────────────── */
.nes-dashboard {
  background: #212529;
  min-height: 100%;
  padding: 24px;
  font-family: 'Press Start 2P', 'PressStart2P', 'Courier New', monospace;
  image-rendering: pixelated;
  overflow-y: auto;
  color: #fff;
}

/* ─── Header Controls ─────────────────────────────────────────── */
.header-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

/* ─── Stats Grid ──────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin: 16px 0;
  font-family: 'PressStart2P', monospace;
}

/* ─── Dashboard Row ───────────────────────────────────────────── */
.dashboard-row {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

/* ─── Task Items ──────────────────────────────────────────────── */
.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px;
  border-bottom: 1px solid #ccc;
}

.task-item .completed {
  text-decoration: line-through;
  opacity: 0.6;
}

/* ─── Message List ────────────────────────────────────────────── */
.message-list {
  max-height: 300px;
  overflow-y: auto;
}

.message {
  margin-bottom: 16px;
}

/* ─── Footer ──────────────────────────────────────────────────── */
.dashboard-footer {
  margin-top: 24px;
}

.footer-content {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

/* ─── Dialog Menu ─────────────────────────────────────────────── */
.dialog-menu {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}

/* ─── Responsive ──────────────────────────────────────────────── */
@media (max-width: 768px) {
  .nes-dashboard {
    padding: 12px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-row {
    flex-direction: column;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .footer-content {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
