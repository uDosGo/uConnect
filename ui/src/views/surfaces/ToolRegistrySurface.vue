<template>
  <div class="tool-registry-surface">
    <!-- Surface Header -->
    <div class="surface-header">
      <div class="header-left">
        <SurfaceIcon name="tool" class="header-icon" :size="24" />
        <div>
          <h1>Tool Registry</h1>
          <p class="surface-tagline">Discover and manage available tools in uDOS.</p>
          <p class="surface-definition">
            <strong>What's a Tool?</strong> A specialized function or service that uDOS can use to perform tasks.
            Tools can be anything from file converters to AI models, and they extend uDOS's capabilities.
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

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading tools...</p>
      <p class="helper-text">This usually takes a few seconds.</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <SurfaceIcon name="alert-circle" :size="48" />
      </div>
      <h3>Couldn't load tools</h3>
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
        <SurfaceIcon name="tool" :size="48" />
      </div>
      <h3>No tools found</h3>
      <p>Your tool registry appears to be empty.</p>
      <p class="helper-text">
        <SurfaceIcon name="info" :size="14" />
        Tools are loaded from connected services
      </p>
    </div>

    <!-- Main Content -->
    <div v-else class="tool-container">
      <div class="tool-controls">
        <div class="tool-search">
          <SurfaceIcon name="search" :size="16" class="search-icon" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search tools..."
            @input="filterTools"
            class="search-input"
          >
          <button v-if="searchQuery" class="btn-icon btn-sm" @click="clearSearch">
            <SurfaceIcon name="x" :size="14" />
          </button>
        </div>
        <button class="btn-secondary" @click="refreshTools">
          <SurfaceIcon name="refresh" :size="16" />
          Refresh
        </button>
      </div>

      <div class="tool-grid">
        <div
          v-for="tool in filteredTools"
          :key="tool.id"
          class="tool-card"
        >
          <div class="tool-header">
            <SurfaceIcon name="tool" :size="20" class="tool-icon" />
            <h3 class="tool-name">{{ tool.name }}</h3>
            <span class="tool-type">{{ tool.type }}</span>
          </div>

          <div class="tool-meta">
            <span class="tool-category">
              <SurfaceIcon name="tag" :size="14" />
              {{ tool.category }}
            </span>
            <span class="tool-version">
              v{{ tool.version }}
            </span>
          </div>

          <div class="tool-description" v-if="tool.description">
            {{ tool.description }}
          </div>

          <div class="tool-actions">
            <button
              class="btn-primary"
              @click="useTool(tool)"
              title="Use this tool"
            >
              <SurfaceIcon name="play" :size="14" />
              Use
            </button>
            <button
              class="btn-icon btn-sm"
              @click.stop="viewDetails(tool)"
              title="View tool details"
            >
              <SurfaceIcon name="info" :size="14" />
            </button>
          </div>
        </div>
      </div>

      <!-- Tool Statistics -->
      <div class="tool-stats">
        <span>{{ filteredTools.length }} tools</span>
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
  name: 'ToolRegistrySurface',
  components: {
    SurfaceIcon
  },
  setup() {
    // State
    const isLoading = ref(false)
    const error = ref(null)
    const tools = ref([])
    const searchQuery = ref('')

    // Computed
    const activeTools = computed(() => tools.value.filter(t => t.active).length)
    const toolCategories = computed(() => [...new Set(tools.value.map(t => t.category))].length)

    const filteredTools = computed(() => {
      if (!searchQuery.value) return tools.value

      const query = searchQuery.value.toLowerCase()
      return tools.value.filter(tool =>
        tool.name.toLowerCase().includes(query) ||
        (tool.description && tool.description.toLowerCase().includes(query)) ||
        tool.category.toLowerCase().includes(query)
      )
    })

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
            name: 'File Converter',
            description: 'Convert between different file formats (PDF, DOCX, images)',
            type: 'converter',
            category: 'files',
            version: '1.2.0',
            active: true
          },
          {
            id: 2,
            name: 'Markdown Renderer',
            description: 'Render markdown documents to HTML and preview',
            type: 'renderer',
            category: 'documents',
            version: '2.1.0',
            active: true
          },
          {
            id: 3,
            name: 'GitHub Bridge',
            description: 'Connect to GitHub repositories and manage issues',
            type: 'bridge',
            category: 'version-control',
            version: '1.5.2',
            active: true
          },
          {
            id: 4,
            name: 'AI Assistant',
            description: 'Natural language processing and AI-powered responses',
            type: 'ai',
            category: 'intelligence',
            version: '3.0.1',
            active: true
          },
          {
            id: 5,
            name: 'Workflow Engine',
            description: 'Create and manage automated workflows',
            type: 'engine',
            category: 'automation',
            version: '2.3.0',
            active: false
          },
          {
            id: 6,
            name: 'Document Indexer',
            description: 'Index and search through documents in the Vault',
            type: 'indexer',
            category: 'search',
            version: '1.1.0',
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

    const viewDetails = (tool) => {
      alert(`Tool details for: ${tool.name}\n\nType: ${tool.type}\nCategory: ${tool.category}\nVersion: ${tool.version}`)
    }

    const refreshTools = () => {
      loadTools()
    }

    const retryLoad = () => {
      error.value = null
      loadTools()
    }

    const clearSearch = () => {
      searchQuery.value = ''
    }

    const filterTools = () => {
      // Handled by computed property
    }

    // Load on mount
    onMounted(() => {
      loadTools()
    })

    return {
      isLoading,
      error,
      tools,
      searchQuery,
      filteredTools,
      activeTools,
      toolCategories,
      loadTools,
      useTool,
      viewDetails,
      refreshTools,
      retryLoad,
      clearSearch,
      filterTools
    }
  }
}
</script>

<style>
/* CSS Custom Properties */
.tool-registry-surface {
  --background: #ffffff;
  --text-primary: #1a1a2e;
  --text-secondary: #6b6b6b;
  --text-tertiary: #b0b0b0;
  --border-color: #e9e9e7;
  --surface-background: #f7f6f3;
  --surface-hover: #e9e9e7;
  --primary-color: #2e7d64;
  --primary-hover: #236b54;
  --danger-color: #eb5757;
  --success-color: #2e7d64;
  --warning-color: #f57c00;
  --info-color: #1565c0;
}

.ucode3-dark .tool-registry-surface {
  --background: #1a1a2e;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0c0;
  --text-tertiary: #6b6b8a;
  --border-color: #2a2a4a;
  --surface-background: #16213e;
  --surface-hover: #2a2a4a;
  --primary-color: #2e7d64;
  --primary-hover: #236b54;
  --danger-color: #eb5757;
  --success-color: #7dcea0;
  --warning-color: #f57c00;
  --info-color: #7db0e0;
}
</style>

<style scoped>
.tool-registry-surface {
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
  font-size: 1.5rem;
  font-weight: 600;
}

.surface-tagline {
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.surface-definition {
  color: var(--text-tertiary);
  font-size: 0.9rem;
  margin: 0;
}

.header-right {
  display: flex;
  gap: 0.5rem;
}

/* Controls */
.tool-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--surface-background);
}

.tool-search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--background);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  max-width: 400px;
}

.search-icon {
  color: var(--text-tertiary);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
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
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--surface-background);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
}

.btn-icon:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
  color: var(--text-primary);
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
  font-size: 1rem;
  font-weight: 500;
}

.tool-type {
  padding: 0.25rem 0.75rem;
  background: var(--surface-hover);
  border-radius: 12px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.tool-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.tool-category {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tool-version {
  margin-left: auto;
  font-weight: 500;
}

.tool-description {
  font-size: 0.875rem;
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
  gap: 2rem;
  padding: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-color);
}
</style>