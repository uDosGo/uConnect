<template>
  <div class="devmode-surface">
    <!-- Surface Header -->
    <div class="surface-header">
      <div class="header-left">
        <SurfaceIcon name="code" class="header-icon" :size="24" />
        <div>
          <h1>Dev Mode</h1>
          <p class="surface-tagline">Developer tools and utilities for uDOS.</p>
          <p class="surface-definition">
            <strong>What's Dev Mode?</strong> A special interface for developers to access advanced tools,
            debug information, and system utilities. Perfect for troubleshooting and development tasks.
          </p>
        </div>
      </div>
      <div class="header-right">
        <button class="btn-secondary btn-sm" @click="refreshTools">
          <SurfaceIcon name="refresh" :size="16" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Info Banner -->
    <div class="info-banner">
      <SurfaceIcon name="info" :size="18" />
      <div>
        <strong>Developer Mode</strong>
        Advanced tools and utilities for system administration and development.
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading developer tools...</p>
      <p class="helper-text">This usually takes a few seconds.</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <SurfaceIcon name="alert-circle" :size="48" />
      </div>
      <h3>Couldn't load developer tools</h3>
      <p>{{ error }}</p>
      <p class="helper-text">
        Try:
        <br>
        • Refreshing the page
        <br>
        • Checking your internet connection
        <br>
        • Making sure uDOS services are running
      </p>
      <div class="error-actions">
        <button @click="retryLoad" class="btn-primary">
          <SurfaceIcon name="refresh" :size="16" />
          Try Again
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="tools.length === 0" class="empty-state">
      <div class="empty-icon">
        <SurfaceIcon name="code" :size="48" />
      </div>
      <h3>No developer tools found</h3>
      <p>Your developer toolkit appears to be empty.</p>
      <p class="helper-text">
        <SurfaceIcon name="info" :size="14" />
        Tools are loaded from connected services
      </p>
    </div>

    <!-- Main Content -->
    <div v-else class="tool-container">
      <div class="tool-grid">
        <div
          v-for="tool in tools"
          :key="tool.id"
          class="tool-card"
          @click="useTool(tool)"
        >
          <div class="tool-header">
            <SurfaceIcon :name="tool.icon" :size="20" class="tool-icon" />
            <h3 class="tool-name">{{ tool.name }}</h3>
            <span class="tool-type">{{ tool.type }}</span>
          </div>

          <div class="tool-meta">
            <span class="tool-category">{{ tool.category }}</span>
            <span class="tool-version">v{{ tool.version }}</span>
          </div>

          <div class="tool-description" v-if="tool.description">
            {{ tool.description }}
          </div>

          <div class="tool-actions">
            <button class="btn-primary" @click.stop="useTool(tool)">
              <SurfaceIcon name="play" :size="14" />
              Use
            </button>
          </div>
        </div>
      </div>

      <!-- Tool Statistics -->
      <div class="tool-stats">
        <span>{{ tools.length }} tools</span>
        <span>{{ activeTools }} active</span>
        <span>{{ toolCategories }} categories</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import SurfaceIcon from '@/components/SurfaceIcons.vue'

export default {
  name: 'DevModeSurface',
  components: {
    SurfaceIcon
  },
  setup() {
    // State
    const isLoading = ref(false)
    const error = ref(null)
    const tools = ref([])

    // Computed
    const activeTools = computed(() => tools.value.filter(t => t.active).length)
    const toolCategories = computed(() => [...new Set(tools.value.map(t => t.category))].length)

    // Methods
    const loadTools = async () => {
      isLoading.value = true
      error.value = null
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))

        // Mock data
        tools.value = [
          {
            id: 1,
            name: 'System Monitor',
            description: 'Monitor system resources and performance',
            type: 'monitor',
            category: 'system',
            version: '2.0.0',
            icon: 'cpu',
            active: true
          },
          {
            id: 2,
            name: 'Log Viewer',
            description: 'View and filter system logs',
            type: 'viewer',
            category: 'logs',
            version: '1.5.0',
            icon: 'file-text',
            active: true
          },
          {
            id: 3,
            name: 'Terminal',
            description: 'Access command line interface',
            type: 'terminal',
            category: 'shell',
            version: '3.2.0',
            icon: 'terminal',
            active: true
          },
          {
            id: 4,
            name: 'Debug Console',
            description: 'Debug and inspect running processes',
            type: 'debugger',
            category: 'development',
            version: '1.8.0',
            icon: 'bug',
            active: true
          },
          {
            id: 5,
            name: 'Config Editor',
            description: 'Edit configuration files',
            type: 'editor',
            category: 'configuration',
            version: '2.1.0',
            icon: 'settings',
            active: true
          },
          {
            id: 6,
            name: 'Service Manager',
            description: 'Start, stop, and manage services',
            type: 'manager',
            category: 'system',
            version: '1.9.0',
            icon: 'server',
            active: true
          }
        ]
      } catch (err) {
        error.value = err.message || 'Failed to load tools'
      } finally {
        isLoading.value = false
      }
    }

    const useTool = (tool) => {
      alert(`Using tool: ${tool.name}`)
    }

    const refreshTools = () => {
      loadTools()
    }

    const retryLoad = () => {
      error.value = null
      loadTools()
    }

    // Load on mount
    onMounted(() => {
      loadTools()
    })

    return {
      isLoading,
      error,
      tools,
      activeTools,
      toolCategories,
      loadTools,
      useTool,
      refreshTools,
      retryLoad
    }
  }
}
</script>

<style>
/* ─── DevModeSurface uses USX global tokens from @usx/tokens ───── */
/* No local CSS custom properties needed — all colors come from USX */
</style>

<style scoped>
.devmode-surface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--background);
  color: var(--text-primary);
}

/* Header */
.surface-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  color: var(--primary-color);
}

.surface-header h1 {
  margin: 0;
  font-size: var(--wf-font-xl);
  font-weight: 600;
}

.surface-tagline {
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.surface-definition {
  color: var(--text-tertiary);
  font-size: var(--wf-font-sm);
  margin: 0;
}

.header-right {
  display: flex;
  gap: 0.5rem;
}

/* Info Banner */
.info-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--info-background);
  border-radius: 8px;
  margin: 1rem;
  color: var(--info-color);
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--wf-spacing-2);
  padding: var(--wf-spacing-2) var(--wf-spacing-4);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: var(--wf-font-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: var(--wf-spacing-2);
  padding: var(--wf-spacing-2) var(--wf-spacing-4);
  background: var(--surface-background);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: var(--wf-font-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.8125rem;
  height: auto;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 4rem 2rem;
  text-align: center;
}

.error-icon {
  margin-bottom: 1.5rem;
  color: var(--danger-color);
}

.error-state h3 {
  margin-bottom: 0.5rem;
}

.error-state p {
  margin-bottom: 1.5rem;
}

.error-actions {
  display: flex;
  gap: 0.5rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  margin-bottom: 1.5rem;
  color: var(--text-tertiary);
}

.empty-state h3 {
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
}

/* Tool Container */
.tool-container {
  flex: 1;
  overflow-y: auto;
}

/* Tool Grid */
.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.tool-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-card:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tool-icon {
  color: var(--primary-color);
}

.tool-name {
  flex: 1;
  margin: 0;
  font-size: var(--wf-font-md);
  font-weight: 500;
}

.tool-type {
  padding: var(--wf-spacing-1) var(--wf-spacing-3);
  background: var(--surface-hover);
  border-radius: 12px;
  font-size: var(--wf-font-xs);
  color: var(--text-secondary);
}

.tool-meta {
  display: flex;
  gap: var(--wf-spacing-2);
  font-size: var(--wf-font-xs);
  color: var(--text-tertiary);
}

.tool-category {
  font-weight: 500;
}

.tool-version {
  margin-left: auto;
}

.tool-description {
  font-size: var(--wf-font-sm);
  color: var(--text-secondary);
  line-height: 1.4;
}

.tool-actions {
  display: flex;
  gap: 0.5rem;
}

/* Tool Statistics */
.tool-stats {
  display: flex;
  justify-content: center;
  gap: var(--wf-spacing-6);
  padding: var(--wf-spacing-4);
  font-size: var(--wf-font-sm);
  color: var(--text-secondary);
  border-top: 1px solid var(--border-color);
}
</style>