<template>
  <div class="workflow-surface">
    <!-- Surface Header -->
    <div class="surface-header">
      <div class="header-left">
        <SurfaceIcon name="git-branch" class="header-icon" :size="24" />
        <div>
          <h1>Workflow Manager</h1>
          <p class="surface-tagline">Create and manage automated workflows for your tasks.</p>
          <p class="surface-definition">
            <strong>What's a Workflow?</strong> A sequence of automated tasks that run based on triggers.
            Save time by automating repetitive processes and keeping your work flowing smoothly.
          </p>
        </div>
      </div>
      <div class="header-right">
        <button class="btn-secondary btn-sm" @click="refreshWorkflows">
          <SurfaceIcon name="refresh" :size="16" />
          Refresh
        </button>
        <button class="btn-primary btn-sm" @click="createNewWorkflow">
          <SurfaceIcon name="plus" :size="16" />
          New Workflow
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading workflows...</p>
      <p class="helper-text">This usually takes a few seconds.</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <SurfaceIcon name="alert-circle" :size="48" />
      </div>
      <h3>Couldn't load workflows</h3>
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
    <div v-else-if="workflows.length === 0" class="empty-state">
      <div class="empty-icon">
        <SurfaceIcon name="git-branch" :size="48" />
      </div>
      <h3>No workflows yet</h3>
      <p>Create your first automated workflow!</p>
      <button class="btn-primary" @click="createNewWorkflow">
        <SurfaceIcon name="plus" :size="16" />
        Create Workflow
      </button>
      <p class="helper-text">
        <SurfaceIcon name="info" :size="14" />
        Workflows help automate repetitive tasks
      </p>
    </div>

    <!-- Main Content -->
    <div v-else class="workflow-container">
      <div class="workflow-controls">
        <div class="workflow-search">
          <SurfaceIcon name="search" :size="16" class="search-icon" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search workflows..."
            @input="filterWorkflows"
            class="search-input"
          >
          <button v-if="searchQuery" class="btn-icon btn-sm" @click="clearSearch">
            <SurfaceIcon name="x" :size="14" />
          </button>
        </div>
        <button class="btn-secondary" @click="refreshWorkflows">
          <SurfaceIcon name="refresh" :size="16" />
          Refresh
        </button>
      </div>

      <div class="workflow-grid">
        <div
          v-for="workflow in filteredWorkflows"
          :key="workflow.id"
          class="workflow-card"
          @click="openWorkflow(workflow)"
        >
          <div class="workflow-header">
            <SurfaceIcon name="git-branch" :size="20" class="workflow-icon" />
            <h3 class="workflow-name">{{ workflow.name }}</h3>
            <span class="workflow-status" :class="workflow.active ? 'active' : 'inactive'">
              {{ workflow.active ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="workflow-meta">
            <span class="workflow-trigger">
              <SurfaceIcon name="zap" :size="14" />
              {{ workflow.triggers.join(', ') }}
            </span>
            <span class="workflow-updated">
              Updated {{ formatRelativeTime(workflow.updatedAt) }}
            </span>
          </div>

          <div class="workflow-description" v-if="workflow.description">
            {{ workflow.description }}
          </div>

          <div class="workflow-actions">
            <button
              class="btn-icon btn-sm"
              @click.stop="toggleWorkflow(workflow)"
              :title="workflow.active ? 'Deactivate workflow' : 'Activate workflow'"
            >
              <SurfaceIcon :name="workflow.active ? 'pause' : 'play'" :size="14" />
            </button>
            <button
              class="btn-icon btn-sm"
              @click.stop="editWorkflow(workflow)"
              title="Edit workflow"
            >
              <SurfaceIcon name="edit" :size="14" />
            </button>
            <button
              class="btn-icon btn-sm"
              @click.stop="deleteWorkflow(workflow)"
              title="Delete workflow"
            >
              <SurfaceIcon name="trash" :size="14" />
            </button>
          </div>
        </div>
      </div>

      <!-- Workflow Statistics -->
      <div class="workflow-stats">
        <span>{{ filteredWorkflows.length }} workflows</span>
        <span>{{ activeWorkflows }} active</span>
        <span>{{ totalRuns }} total runs</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import SurfaceIcon from '@/components/SurfaceIcons.vue'

export default {
  name: 'WorkflowSurface',
  components: {
    SurfaceIcon
  },
  setup() {
    // State
    const isLoading = ref(false)
    const error = ref(null)
    const workflows = ref([])
    const searchQuery = ref('')
    const activeWorkflows = computed(() => workflows.value.filter(w => w.active).length)
    const totalRuns = computed(() => workflows.value.reduce((sum, w) => sum + (w.runCount || 0), 0))

    // Computed
    const filteredWorkflows = computed(() => {
      if (!searchQuery.value) return workflows.value

      const query = searchQuery.value.toLowerCase()
      return workflows.value.filter(workflow =>
        workflow.name.toLowerCase().includes(query) ||
        (workflow.description && workflow.description.toLowerCase().includes(query))
      )
    })

    // Methods
    const loadWorkflows = async () => {
      isLoading.value = true
      error.value = null
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))

        // Mock data
        workflows.value = [
          {
            id: 1,
            name: 'Daily Backup',
            description: 'Automatically backup all documents at 2 AM',
            triggers: ['time', 'schedule'],
            active: true,
            runCount: 42,
            updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
          },
          {
            id: 2,
            name: 'Git Sync',
            description: 'Sync GitHub repos every hour',
            triggers: ['time', 'github'],
            active: true,
            runCount: 128,
            updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
          },
          {
            id: 3,
            name: 'Document Processing',
            description: 'Process uploaded documents and extract metadata',
            triggers: ['file-upload', 'vault'],
            active: false,
            runCount: 7,
            updatedAt: new Date(Date.now() - 86400000 * 7).toISOString()
          },
          {
            id: 4,
            name: 'Chat Summarization',
            description: 'Summarize long conversations automatically',
            triggers: ['message', 'vibe'],
            active: true,
            runCount: 234,
            updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
          }
        ]
      } catch (err) {
        error.value = err.message || 'Failed to load workflows'
      } finally {
        isLoading.value = false
      }
    }

    const createNewWorkflow = () => {
      alert('Workflow creation interface coming soon!')
    }

    const openWorkflow = (workflow) => {
      alert(`Opening workflow: ${workflow.name}`)
    }

    const toggleWorkflow = (workflow) => {
      workflow.active = !workflow.active
      alert(`Workflow ${workflow.active ? 'activated' : 'deactivated'}`)
    }

    const editWorkflow = (workflow) => {
      alert(`Editing workflow: ${workflow.name}`)
    }

    const deleteWorkflow = (workflow) => {
      if (confirm(`Delete workflow "${workflow.name}"?`)) {
        workflows.value = workflows.value.filter(w => w.id !== workflow.id)
        alert('Workflow deleted')
      }
    }

    const refreshWorkflows = () => {
      loadWorkflows()
    }

    const retryLoad = () => {
      error.value = null
      loadWorkflows()
    }

    const clearSearch = () => {
      searchQuery.value = ''
    }

    const filterWorkflows = () => {
      // Handled by computed property
    }

    const formatRelativeTime = (dateString) => {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    }

    // Load on mount
    onMounted(() => {
      loadWorkflows()
    })

    return {
      isLoading,
      error,
      workflows,
      searchQuery,
      filteredWorkflows,
      activeWorkflows,
      totalRuns,
      loadWorkflows,
      createNewWorkflow,
      openWorkflow,
      toggleWorkflow,
      editWorkflow,
      deleteWorkflow,
      refreshWorkflows,
      retryLoad,
      clearSearch,
      filterWorkflows,
      formatRelativeTime
    }
  }
}
</script>

<style>
/* ─── WorkflowSurface uses USX global tokens from @usx/tokens ──── */
/* No local CSS custom properties needed — all colors come from USX */
</style>

<style scoped>
.workflow-surface {
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
.workflow-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--surface-background);
}

.workflow-search {
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

/* Workflow Container */
.workflow-container {
  flex: 1;
  overflow-y: auto;
}

.workflow-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.workflow-card {
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

.workflow-card:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.workflow-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.workflow-icon {
  color: var(--primary-color);
}

.workflow-name {
  flex: 1;
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.workflow-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.workflow-status.active {
  background: rgba(46, 125, 100, 0.1);
  color: var(--success-color);
}

.workflow-status.inactive {
  background: rgba(176, 176, 176, 0.1);
  color: var(--text-tertiary);
}

.workflow-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.workflow-trigger {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.workflow-updated {
  margin-left: auto;
}

.workflow-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.workflow-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.workflow-card:hover .workflow-actions {
  opacity: 1;
}

/* Workflow Statistics */
.workflow-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-color);
}
</style>