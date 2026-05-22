<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// API Configuration
const API_BASE_URL = 'http://localhost:5175/api'

// React Renderer State
const renderer = ref({
  activeSurface: 'vibe' as string,
  navigationHistory: ['vibe'] as string[],
  currentIndex: 0 as number,
  loading: false as boolean,
  error: null as string | null,
  surfaces: [
    { 
      id: 'vibe', 
      name: 'Vibe TUI', 
      description: 'Interactive terminal interface',
      component: 'VibeSurface',
      path: '/surface/vibe',
      requiresData: false
    },
    { 
      id: 'vault', 
      name: 'Vault Browser', 
      description: 'Knowledge vault management',
      component: 'VaultSurface', 
      path: '/surface/vault',
      requiresData: true,
      apiEndpoint: '/vault/list'
    },
    { 
      id: 'github', 
      name: 'GitHub Sync', 
      description: 'Repository integration',
      component: 'GitHubSurface',
      path: '/surface/github',
      requiresData: false
    },
    { 
      id: 'wordpress', 
      name: 'WordPress Adaptor', 
      description: 'Content management',
      component: 'WordPressSurface',
      path: '/surface/wordpress',
      requiresData: false
    },
    { 
      id: 'usxd', 
      name: 'USXD Renderer', 
      description: 'Universal Surface Design',
      component: 'USXDSurface',
      path: '/surface/usxd',
      requiresData: false
    },
    { 
      id: 'workflow', 
      name: 'Workflow Engine', 
      description: 'Automation workflows',
      component: 'WorkflowSurface',
      path: '/surface/workflow',
      requiresData: false
    },
    {
      id: 'system',
      name: 'System Status',
      description: 'System health and status',
      component: 'SystemSurface',
      path: '/surface/system',
      requiresData: true,
      apiEndpoint: '/health'
    }
  ]
})

// Data storage for surfaces that need real data
const surfaceData = ref<Record<string, any>>({})

// Navigation functions
function navigateTo(surfaceId: string) {
  const newHistory = [...renderer.value.navigationHistory.slice(0, renderer.value.currentIndex + 1), surfaceId]
  renderer.value.navigationHistory = newHistory
  renderer.value.currentIndex = newHistory.length - 1
  renderer.value.activeSurface = surfaceId
  
  // Load data if needed
  loadSurfaceData(surfaceId)
}

function goBack() {
  if (renderer.value.currentIndex > 0) {
    const newIndex = renderer.value.currentIndex - 1
    renderer.value.currentIndex = newIndex
    renderer.value.activeSurface = renderer.value.navigationHistory[newIndex]
    
    // Load data for the previous surface
    loadSurfaceData(renderer.value.activeSurface)
  }
}

function goForward() {
  if (renderer.value.currentIndex < renderer.value.navigationHistory.length - 1) {
    const newIndex = renderer.value.currentIndex + 1
    renderer.value.currentIndex = newIndex
    renderer.value.activeSurface = renderer.value.navigationHistory[newIndex]
    
    // Load data for the next surface
    loadSurfaceData(renderer.value.activeSurface)
  }
}

function refresh() {
  // Refresh the current surface by reloading data
  loadSurfaceData(renderer.value.activeSurface)
}

// Data loading function
async function loadSurfaceData(surfaceId: string) {
  const surface = renderer.value.surfaces.find(s => s.id === surfaceId)
  
  if (!surface || !surface.requiresData) {
    return
  }
  
  renderer.value.loading = true
  renderer.value.error = null
  
  try {
    const response = await fetch(`${API_BASE_URL}${surface.apiEndpoint}`)
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    
    const data = await response.json()
    surfaceData.value[surfaceId] = data
    
  } catch (error) {
    console.error('Failed to load surface data:', error)
    renderer.value.error = `Failed to load data: ${error instanceof Error ? error.message : String(error)}`
    surfaceData.value[surfaceId] = null
  } finally {
    renderer.value.loading = false
  }
}

// Surface components (React-style components with real data integration)
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

Type 'udo help' for available commands
          </pre>
        </div>
      </div>
    `
  },
  VaultSurface: {
    props: ['vaultItems'],
    template: `
      <div class="surface-content">
        <h2>🗄️ Vault Browser</h2>
        <p>Browse and manage your knowledge vault</p>
        
        <div v-if="renderer.loading" class="loading-indicator">
          🔄 Loading vault contents...
        </div>
        
        <div v-else-if="renderer.error" class="error-message">
          ❌ {{ renderer.error }}
        </div>
        
        <div v-else class="vault-mock">
          <div v-if="vaultItems && vaultItems.length > 0">
            <div v-for="item in vaultItems" :key="item.name" class="vault-item">
              <span class="item-icon">{{ item.type === 'directory' ? '📁' : '📄' }}</span>
              <span class="item-name">{{ item.name }}</span>
              <span class="item-size">{{ formatFileSize(item.size) }}</span>
              <span class="item-date">{{ formatDate(item.modified) }}</span>
            </div>
          </div>
          <div v-else class="empty-state">
            🗄️ Vault is empty or not accessible
          </div>
        </div>
      </div>
    `,
    methods: {
      formatFileSize(bytes: number): string {
        if (bytes === undefined) return ''
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
      },
      formatDate(dateString: string): string {
        if (!dateString) return ''
        try {
          const date = new Date(dateString)
          return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
        } catch {
          return dateString.substring(0, 10)
        }
      }
    }
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

Connected repositories:
- uDosConnect/core
- uDosConnect/ui
- uDosConnect/modules
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

📊 Stats:
- Total Posts: 42
- Pages: 12
- Comments: 187
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

Active USXD Surfaces:
- Dashboard (v1.2)
- Analytics (v1.1)
- Monitoring (v1.0)
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

📊 Workflow Stats:
- Total Workflows: 18
- Completed Today: 12
- Failed: 0
          </pre>
        </div>
      </div>
    `
  },
  SystemSurface: {
    props: ['systemStatus'],
    template: `
      <div class="surface-content">
        <h2>💻 System Status</h2>
        <p>Real-time system health and information</p>
        
        <div v-if="renderer.loading" class="loading-indicator">
          🔄 Loading system status...
        </div>
        
        <div v-else-if="renderer.error" class="error-message">
          ❌ {{ renderer.error }}
        </div>
        
        <div v-else class="system-info">
          <div class="system-card">
            <h3>🌐 API Status</h3>
            <p><strong>Status:</strong> <span class="status-badge" :class="systemStatus?.status === 'healthy' ? 'healthy' : 'unhealthy'">{{ systemStatus?.status || 'unknown' }}</span></p>
            <p><strong>Timestamp:</strong> {{ systemStatus?.timestamp || 'N/A' }}</p>
            <p><strong>API Endpoint:</strong> {{ API_BASE_URL }}</p>
          </div>
          
          <div class="system-card">
            <h3>📊 System Info</h3>
            <p><strong>Renderer Version:</strong> 2.0 (Enhanced)</p>
            <p><strong>Connected Surfaces:</strong> {{ renderer.surfaces.length }}</p>
            <p><strong>Active Surface:</strong> {{ renderer.surfaces.find(s => s.id === renderer.activeSurface)?.name || 'None' }}</p>
          </div>
          
          <div class="system-card">
            <h3>🔧 Performance</h3>
            <p><strong>Navigation History:</strong> {{ renderer.navigationHistory.length }} entries</p>
            <p><strong>Current Position:</strong> {{ renderer.currentIndex + 1 }} of {{ renderer.navigationHistory.length }}</p>
            <p><strong>Data Cache:</strong> {{ Object.keys(surfaceData).length }} surfaces cached</p>
          </div>
        </div>
      </div>
    `
  }
}

// Get the active surface component with data
const activeSurfaceComponent = computed(() => {
  const surface = renderer.value.surfaces.find(s => s.id === renderer.value.activeSurface)
  if (!surface) return surfaceComponents.VibeSurface
  
  const component = surfaceComponents[surface.component]
  
  // Pass data to components that need it
  if (surface.requiresData) {
    return {
      ...component,
      propsData: {
        ...(component.propsData || {}),
        [surface.id === 'vault' ? 'vaultItems' : 'systemStatus']: surfaceData.value[surface.id]
      }
    }
  }
  
  return component
})

// Lifecycle
onMounted(() => {
  // Set default surface and load data
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
        <h1 class="renderer-title">🚀 React Renderer (Enhanced)</h1>
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
        
        <!-- Status indicators -->
        <div class="status-indicators">
          <span v-if="renderer.loading" class="status-indicator loading" title="Loading data">🔄</span>
          <span v-if="renderer.error" class="status-indicator error" title="Error occurred">❌</span>
          <span v-else class="status-indicator success" title="All systems operational">✅</span>
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
          :title="surface.description + (surface.requiresData ? ' • Requires data' : '')"
        >
          {{ surface.name }}
          <span v-if="surface.requiresData" class="data-indicator">🔗</span>
        </button>
      </div>
      
      <div class="sidebar-footer">
        <p class="api-info">API: {{ API_BASE_URL }}</p>
      </div>
    </aside>

    <!-- Status bar -->
    <footer class="renderer-status">
      <div class="status-left">
        <span class="status-item">
          <span v-if="renderer.loading">🔄 Loading</span>
          <span v-else-if="renderer.error">❌ Error</span>
          <span v-else>✅ Connected</span>
        </span>
        <span class="status-item">🔋 87%</span>
        <span class="status-item">📡 Online</span>
      </div>
      <div class="status-right">
        <span class="status-item">React Renderer v2.0</span>
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
  height: 100px;
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

.status-indicators {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.status-indicator {
  font-size: 0.9rem;
}

.status-indicator.loading {
  color: #f59e0b;
  animation: pulse 1s infinite;
}

.status-indicator.error {
  color: #ef4444;
}

.status-indicator.success {
  color: #10b981;
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

.loading-indicator {
  padding: 2rem;
  text-align: center;
  color: #f59e0b;
  font-size: 1.2rem;
  animation: pulse 1s infinite;
}

.error-message {
  padding: 2rem;
  text-align: center;
  color: #ef4444;
  font-size: 1.1rem;
  background-color: #2a1a1a;
  border-radius: 0.5rem;
  border: 1px solid #441111;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #64748b;
  font-size: 1.1rem;
}

.terminal-mock, .github-mock, .wordpress-mock, .usxd-mock, .workflow-mock {
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
  flex-grow: 1;
  overflow-y: auto;
}

.vault-item {
  padding: 0.75rem;
  background-color: #1e1e1e;
  border-radius: 0.25rem;
  font-size: 0.9rem;
  display: grid;
  grid-template-columns: 24px 1fr 80px 120px;
  gap: 1rem;
  align-items: center;
  transition: all 0.2s ease;
  border: 1px solid #334155;
}

.vault-item:hover {
  background-color: #2a2a2a;
  border-color: #475569;
}

.item-icon {
  color: #60a5fa;
  font-size: 1.1rem;
}

.item-name {
  color: #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-size, .item-date {
  color: #94a3b8;
  font-size: 0.8rem;
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex-grow: 1;
}

.system-card {
  background-color: #1e1e1e;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 1rem;
  flex: 1;
  min-height: 120px;
}

.system-card h3 {
  color: #60a5fa;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.system-card p {
  color: #e2e8f0;
  font-size: 0.9rem;
  margin: 0.3rem 0;
}

.status-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.healthy {
  background-color: #10b981;
  color: white;
}

.status-badge.unhealthy {
  background-color: #ef4444;
  color: white;
}

.surface-sidebar {
  grid-area: sidebar;
  width: 220px;
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
  flex-grow: 1;
}

.surface-btn {
  padding: 0.6rem;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.data-indicator {
  color: #10b981;
  font-size: 0.9rem;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #334155;
  font-size: 0.7rem;
  color: #64748b;
}

.api-info {
  word-break: break-all;
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

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>