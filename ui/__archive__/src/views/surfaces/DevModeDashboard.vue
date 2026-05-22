<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Dev Mode State
const devMode = ref({
  enabled: false,
  surfaces: ['vibe', 'vault', 'github', 'wordpress', 'usxd', 'workflow', 'mcp', 'demos', 'dev', 'browser', 'story', 'tools'],
  activeSurface: 'vibe',
  theme: 'github',
  status: 'idle' as 'idle' | 'loading' | 'active' | 'error'
})

// Surface navigation
function navigateTo(surface: string) {
  devMode.value.activeSurface = surface
  router.push(`/surface/${surface}`)
}

// Toggle Dev Mode
function toggleDevMode() {
  devMode.value.enabled = !devMode.value.enabled
  devMode.value.status = 'loading'
  
  setTimeout(() => {
    devMode.value.status = devMode.value.enabled ? 'active' : 'idle'
  }, 800)
}

// Surface status
const surfaceStatus = computed(() => {
  return devMode.value.surfaces.map(surface => ({
    id: surface,
    name: surface.charAt(0).toUpperCase() + surface.slice(1),
    path: `/surface/${surface}`,
    active: devMode.value.activeSurface === surface
  }))
})

// Initialize
onMounted(() => {
  devMode.value.status = 'active'
})
</script>

<template>
  <div class="dev-mode-dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <h1>🎮 uDosConnect Dev Mode</h1>
      <div class="status-indicator" :class="devMode.status">
        {{ devMode.enabled ? 'ACTIVE' : 'INACTIVE' }}
      </div>
    </header>

    <!-- Surface Grid -->
    <div class="surface-grid">
      <div
        v-for="surface in surfaceStatus"
        :key="surface.id"
        class="surface-card"
        :class="{ active: surface.active }"
        @click="navigateTo(surface.id)"
      >
        <div class="surface-icon">
          {{ surface.name.charAt(0) }}
        </div>
        <div class="surface-name">
          {{ surface.name }}
        </div>
        <div class="surface-path">
          {{ surface.path }}
        </div>
      </div>
    </div>

    <!-- Dev Mode Toggle -->
    <div class="dev-toggle">
      <label class="toggle-switch">
        <input
          type="checkbox"
          v-model="devMode.enabled"
          @change="toggleDevMode"
        >
        <span class="slider round"></span>
      </label>
      <span class="toggle-label">
        {{ devMode.enabled ? 'Dev Mode ON' : 'Dev Mode OFF' }}
      </span>
    </div>

    <!-- Status -->
    <div class="status-panel">
      <div class="status-item">
        <span class="label">Status:</span>
        <span class="value" :class="devMode.status">
          {{ devMode.status.toUpperCase() }}
        </span>
      </div>
      <div class="status-item">
        <span class="label">Active Surface:</span>
        <span class="value">
          {{ devMode.activeSurface }}
        </span>
      </div>
      <div class="status-item">
        <span class="label">Theme:</span>
        <span class="value">
          {{ devMode.theme }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dev-mode-dashboard {
  min-height: 100vh;
  padding: 2rem;
  background: #0a0a0a;
  color: #e2e8f0;
  font-family: 'Monaspace', 'SF Mono', monospace;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #1e293b;
}

.dashboard-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #60a5fa;
}

.status-indicator {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-indicator.idle {
  background: #374151;
  color: #9ca3af;
}

.status-indicator.loading {
  background: #f59e0b;
  color: #000;
}

.status-indicator.active {
  background: #10b981;
  color: #000;
}

.status-indicator.error {
  background: #ef4444;
  color: #fff;
}

.surface-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.surface-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.surface-card:hover {
  background: #334155;
  border-color: #475569;
  transform: translateY(-2px);
}

.surface-card.active {
  background: #475569;
  border-color: #64748b;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.surface-icon {
  width: 2rem;
  height: 2rem;
  background: #374151;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.surface-name {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.surface-path {
  font-size: 0.75rem;
  color: #9ca3af;
}

.dev-toggle {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #374151;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #10b981;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.toggle-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.status-panel {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.status-item .label {
  color: #9ca3af;
}

.status-item .value {
  font-weight: 500;
}

.status-item .value.idle {
  color: #9ca3af;
}

.status-item .value.loading {
  color: #f59e0b;
}

.status-item .value.active {
  color: #10b981;
}

.status-item .value.error {
  color: #ef4444;
}
</style>