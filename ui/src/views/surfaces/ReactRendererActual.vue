<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// React Renderer State
const renderer = ref({
  activeSurface: 'vibe' as string,
  navigationHistory: ['vibe'] as string[],
  currentIndex: 0 as number,
  surfaces: [
    { 
      id: 'vibe', 
      name: 'Vibe TUI', 
      description: 'Interactive terminal interface',
      component: 'VibeSurface',
      path: '/surface/vibe'
    },
    { 
      id: 'vault', 
      name: 'Vault Browser', 
      description: 'Knowledge vault management',
      component: 'VaultSurface', 
      path: '/surface/vault'
    },
    { 
      id: 'github', 
      name: 'GitHub Sync', 
      description: 'Repository integration',
      component: 'GitHubSurface',
      path: '/surface/github'
    },
    { 
      id: 'wordpress', 
      name: 'WordPress Adaptor', 
      description: 'Content management',
      component: 'WordPressSurface',
      path: '/surface/wordpress'
    },
    { 
      id: 'usxd', 
      name: 'USXD Renderer', 
      description: 'Universal Surface Design',
      component: 'USXDSurface',
      path: '/surface/usxd'
    },
    { 
      id: 'workflow', 
      name: 'Workflow Engine', 
      description: 'Automation workflows',
      component: 'WorkflowSurface',
      path: '/surface/workflow'
    }
  ]
})

// Navigation functions
function navigateTo(surfaceId: string) {
  const newHistory = [...renderer.value.navigationHistory.slice(0, renderer.value.currentIndex + 1), surfaceId]
  renderer.value.navigationHistory = newHistory
  renderer.value.currentIndex = newHistory.length - 1
  renderer.value.activeSurface = surfaceId
}

function goBack() {
  if (renderer.value.currentIndex > 0) {
    const newIndex = renderer.value.currentIndex - 1
    renderer.value.currentIndex = newIndex
    renderer.value.activeSurface = renderer.value.navigationHistory[newIndex]
  }
}

function goForward() {
  if (renderer.value.currentIndex < renderer.value.navigationHistory.length - 1) {
    const newIndex = renderer.value.currentIndex + 1
    renderer.value.currentIndex = newIndex
    renderer.value.activeSurface = renderer.value.navigationHistory[newIndex]
  }
}

function refresh() {
  // Refresh the current surface by reloading the component
  renderer.value.activeSurface = renderer.value.navigationHistory[renderer.value.currentIndex]
}

// Surface components (React-style components implemented in Vue)
const surfaceComponents: Record<string, any> = {
  VibeSurface: {
    template: `
      <div class="surface-content">
        <h2>🎮 Vibe TUI</h2>
        <p>Interactive terminal interface for uDosConnect</p>
        <div class="terminal-mock">
          <pre>
$ udo status
✅ System: Online
🔋 Battery: 87%
📡 Network: Connected

$ udo vibe
🎵 Now playing: Chill Lofi Beats
          </pre>
        </div>
      </div>
    `
  },
  VaultSurface: {
    template: `
      <div class="surface-content">
        <h2>🗄️ Vault Browser</h2>
        <p>Browse and manage your knowledge vault</p>
        <div class="vault-mock">
          <div class="vault-item">📁 Projects/</div>
          <div class="vault-item">📄 README.md</div>
          <div class="vault-item">📊 analytics.json</div>
          <div class="vault-item">🔧 config.yaml</div>
        </div>
      </div>
    `
  },
  GitHubSurface: {
    template: `
      <div class="surface-content">
        <h2>🐙 GitHub Sync</h2>
        <p>GitHub repository integration</p>
        <div class="github-mock">
          <pre>
📥 Pulling latest changes...
✅ Updated 3 repositories
🚀 Ready to deploy
          </pre>
        </div>
      </div>
    `
  },
  WordPressSurface: {
    template: `
      <div class="surface-content">
        <h2>🌐 WordPress Adaptor</h2>
        <p>WordPress content management</p>
        <div class="wordpress-mock">
          <pre>
📝 Latest Posts:
- "Getting Started with uDosConnect"
- "Advanced Workflow Automation"
- "React Renderer Tutorial"
          </pre>
        </div>
      </div>
    `
  },
  USXDSurface: {
    template: `
      <div class="surface-content">
        <h2>🎨 USXD Renderer</h2>
        <p>Universal Surface Experience Design</p>
        <div class="usxd-mock">
          <pre>
🖼️  Rendering USXD components...
✨ Dynamic surface composition
🎯 Adaptive layout engine
          </pre>
        </div>
      </div>
    `
  },
  WorkflowSurface: {
    template: `
      <div class="surface-content">
        <h2>⚙️ Workflow Engine</h2>
        <p>Automate your workflows</p>
        <div class="workflow-mock">
          <pre>
🔄 Active Workflows:
1. Daily Backup → ✅ Completed
2. Content Sync → 🔄 Running
3. Analytics Report → ⏳ Pending
          </pre>
        </div>
      </div>
    `
  }
}

// Get the active surface component
const activeSurfaceComponent = computed(() => {
  const surface = renderer.value.surfaces.find(s => s.id === renderer.value.activeSurface)
  return surface ? surfaceComponents[surface.component] : surfaceComponents.VibeSurface
})

// Lifecycle
onMounted(() => {
  // Set default surface
  if (renderer.value.surfaces.length > 0) {
    navigateTo(renderer.value.surfaces[0].id)
  }
})

onUnmounted(() => {
  // Cleanup
})
</script>

<template>
  <div class="react-renderer">
    <!-- Header -->
    <header class="renderer-header">
      <div class="header-left">
        <h1 class="renderer-title">🚀 React Renderer</h1>
        <div class="breadcrumb">
          <span v-for="(surfaceId, index) in renderer.navigationHistory.slice(0, renderer.currentIndex + 1)" :key="index">
            <span v-if="index > 0"> > </span>
            <button 
              @click="navigateTo(surfaceId)"
              class="breadcrumb-item"
            >
              {{ renderer.surfaces.find(s => s.id === surfaceId)?.name || surfaceId }}
            </button>
          </span>
        </div>
      </div>
      <div class="header-right">
        <div class="renderer-controls">
          <button 
            @click="goBack" 
            :disabled="renderer.currentIndex <= 0" 
            class="control-btn"
            title="Go back"
          >
            ←
          </button>
          <button 
            @click="goForward"
            :disabled="renderer.currentIndex >= renderer.navigationHistory.length - 1" 
            class="control-btn"
            title="Go forward"
          >
            →
          </button>
          <button 
            @click="refresh" 
            class="control-btn"
            title="Refresh"
          >
            🔄
          </button>
        </div>
      </div>
    </header>

    <!-- Main content area -->
    <main class="renderer-main">
      <div class="surface-container">
        <component :is="activeSurfaceComponent" />
      </div>
    </main>

    <!-- Surface navigation sidebar -->
    <aside class="surface-sidebar">
      <h3 class="sidebar-title">📱 Surfaces</h3>
      <div class="surface-list">
        <button
          v-for="surface in renderer.surfaces" 
          :key="surface.id" 
          @click="navigateTo(surface.id)" 
          :class="['surface-btn', { active: renderer.activeSurface === surface.id }]"
          :title="surface.description"
        >
          {{ surface.name }}
        </button>
      </div>
    </aside>

    <!-- Status bar -->
    <footer class="renderer-status">
      <div class="status-left">
        <span class="status-item">✅ Connected</span>
        <span class="status-item">🔋 87%</span>
        <span class="status-item">📡 Online</span>
      </div>
      <div class="status-right">
        <span class="status-item">React Renderer v1.0</span>
        <span class="status-item">uDosConnect Core</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.react-renderer {
  min-height: 100vh;
  padding: 1rem;
  background: #0a0a0a;
  color: #e2e8f0;
  font-family: 'Monaspace', 'SF Mono', monospace;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    "header header"
    "main sidebar"
    "status status";
  gap: 0;
}

.renderer-header {
  grid-area: header;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #1a1a1a;
  border-bottom: 1px solid #334155;
  height: 80px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.renderer-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #60a5fa;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb {
  font-size: 0.8rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb-item {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  font-size: 0.8rem;
}

.breadcrumb-item:hover {
  background-color: #2a2a2a;
  color: #e2e8f0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.renderer-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2a2a2a;
  border: 1px solid #334155;
  border-radius: 0.25rem;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.control-btn:hover:not(:disabled) {
  background-color: #334155;
  border-color: #475569;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.renderer-main {
  grid-area: main;
  padding: 1rem;
  overflow-y: auto;
  background-color: #0a0a0a;
}

.surface-container {
  height: 100%;
  width: 100%;
  min-height: 400px;
}

.surface-content {
  background-color: #1a1a1a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.surface-content h2 {
  color: #60a5fa;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.surface-content p {
  color: #94a3b8;
  font-size: 0.9rem;
}

.terminal-mock, .vault-mock, .github-mock, .wordpress-mock, .usxd-mock, .workflow-mock {
  background-color: #1e1e1e;
  border: 1px solid #334155;
  border-radius: 0.3rem;
  padding: 1rem;
  font-family: monospace;
  font-size: 0.9rem;
  color: #e2e8f0;
  flex-grow: 1;
  overflow-y: auto;
}

.terminal-mock pre, .github-mock pre, .wordpress-mock pre, .usxd-mock pre, .workflow-mock pre {
  white-space: pre-wrap;
  margin: 0;
}

.vault-mock {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: #2a2a2a;
  border: 1px solid #334155;
  border-radius: 0.3rem;
  padding: 1rem;
  flex-grow: 1;
}

.vault-item {
  padding: 0.5rem;
  background-color: #1a1a1a;
  border-radius: 0.25rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.vault-item:hover {
  background-color: #334155;
}

.surface-sidebar {
  grid-area: sidebar;
  width: 200px;
  background-color: #1a1a1a;
  border-left: 1px solid #334155;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}

.sidebar-title {
  color: #94a3b8;
  font-size: 0.9rem;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.surface-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.surface-btn {
  padding: 0.5rem;
  background-color: #2a2a2a;
  border: 1px solid #334155;
  border-radius: 0.25rem;
  color: #e2e8f0;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.surface-btn:hover {
  background-color: #334155;
  border-color: #475569;
}

.surface-btn.active {
  background-color: #60a5fa;
  border-color: #3b82f6;
  color: white;
  font-weight: 500;
}

.renderer-status {
  grid-area: status;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #2a2a2a;
  border-top: 1px solid #334155;
  font-size: 0.8rem;
  color: #94a3b8;
}

.status-left, .status-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .react-renderer {
    grid-template-areas:
      "header header"
      "main main"
      "sidebar sidebar"
      "status status";
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto auto;
  }
  
  .surface-sidebar {
    width: 100%;
    border-left: none;
    border-top: 1px solid #334155;
    flex-direction: row;
    overflow-x: auto;
  }
  
  .surface-list {
    flex-direction: row;
  }
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>