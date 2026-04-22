<template>
  <div class="workflow-surface">
    <!-- Surface Header with Definition -->
    <div class="surface-header">
      <h1><span class="surface-icon">⚙️</span> Workflow Engine</h1>
      <p class="surface-tagline">Set up automatic tasks. Let uDOS handle the repetitive work.</p>
      <p class="surface-definition">
        <strong>What's a Workflow?</strong> A sequence of automatic tasks that run without you having to click buttons.
        Set it up once, and uDOS will handle the rest.
      </p>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <span class="spinner">⏳</span>
      <p>Loading workflows…</p>
      <p class="helper-text">This usually takes a few seconds.</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <h3>Couldn't load workflows</h3>
      <p>{{ error.message }}</p>
      <p class="helper-text">
        Try:
        <br>
        • Refreshing the page
        <br>
        • Checking your internet connection
        <br>
        • Making sure the workflow service is running
      </p>
      <button @click="reloadWorkflows" class="primary">
        🔄 Try Again
      </button>
    </div>
    
    <!-- Main Content -->
    <div v-else class="main-content">
      <!-- Workflow List -->
      <div class="workflow-list">
        <div class="list-header">
          <h2>Your Workflows</h2>
          <div class="list-actions">
            <button @click="createNewWorkflow" class="primary">
              ➕ New Workflow
            </button>
            <button @click="showTemplates" class="secondary">
              📚 Templates
            </button>
          </div>
        </div>
        
        <!-- Search Bar -->
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search workflows…" 
            @input="searchWorkflows"
          >
          <button v-if="searchQuery" @click="clearSearch" class="clear-search">
            ✕
          </button>
        </div>
        
        <!-- Empty State -->
        <div v-if="filteredWorkflows.length === 0" class="empty-state">
          <span class="empty-icon">📭</span>
          <h3>No workflows found</h3>
          <p>Create your first automatic workflow</p>
          <button @click="createNewWorkflow" class="primary">
            ➕ New Workflow
          </button>
          <p class="helper-text">
            💡 Workflows can save you hours of manual work
          </p>
        </div>
        
        <!-- Workflow Grid -->
        <div v-else class="workflow-grid">
          <div 
            v-for="workflow in filteredWorkflows" 
            :key="workflow.id" 
            class="workflow-card"
          >
            <div class="workflow-header">
              <h3>{{ workflow.name }}</h3>
              <span class="workflow-status" :class="getStatusClass(workflow.status)">
                {{ workflow.status }}
              </span>
            </div>
            
            <p class="workflow-description">{{ workflow.description || 'No description' }}</p>
            
            <div class="workflow-meta">
              <span class="workflow-trigger">
                🔄 Trigger: {{ workflow.trigger }}
              </span>
              <span class="workflow-steps">
                ⚡ {{ workflow.steps.length }} steps
              </span>
              <span class="workflow-last-run">
                ⏱️ Last run: {{ formatRelativeTime(workflow.lastRun) }}
              </span>
            </div>
            
            <div class="workflow-actions">
              <button @click="editWorkflow(workflow)" class="secondary small">
                ✏️ Edit
              </button>
              <button @click="runWorkflow(workflow)" class="primary small" v-if="workflow.status !== 'running'">
                ▶️ Run
              </button>
              <button @click="stopWorkflow(workflow)" class="danger small" v-else>
                ⏹️ Stop
              </button>
              <button @click="viewLogs(workflow)" class="secondary small">
                📜 Logs
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Workflow Statistics -->
      <div class="workflow-stats">
        <p>
          📊 {{ workflows.length }} workflows • 
          {{ runningWorkflows }} running • 
          {{ completedWorkflows }} completed today
        </p>
      </div>
    </div>
    
    <!-- New Workflow Modal -->
    <div v-if="showNewWorkflowModal" class="modal-overlay">
      <div class="new-workflow-modal">
        <h3>⚡ Create New Workflow</h3>
        
        <div class="form-group">
          <label for="workflow-name">Workflow Name</label>
          <input 
            id="workflow-name" 
            v-model="newWorkflowName" 
            type="text" 
            placeholder="My Automation"
          >
        </div>
        
        <div class="form-group">
          <label for="workflow-description">Description</label>
          <textarea 
            id="workflow-description" 
            v-model="newWorkflowDescription" 
            placeholder="What does this workflow do?"
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="workflow-trigger">Trigger</label>
          <select id="workflow-trigger" v-model="newWorkflowTrigger">
            <option value="manual">Manual (run when I click)</option>
            <option value="schedule">On a schedule</option>
            <option value="file-change">When a file changes</option>
            <option value="webhook">When a webhook is received</option>
          </select>
        </div>
        
        <div class="form-group" v-if="newWorkflowTrigger === 'schedule'">
          <label for="workflow-schedule">Schedule</label>
          <input 
            id="workflow-schedule" 
            v-model="newWorkflowSchedule" 
            type="text" 
            placeholder="e.g., Every day at 9AM"
          >
        </div>
        
        <div class="modal-actions">
          <button @click="createWorkflow" class="primary">
            ✅ Create Workflow
          </button>
          <button @click="showNewWorkflowModal = false" class="secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
    
    <!-- Workflow Editor Modal -->
    <div v-if="editingWorkflow" class="modal-overlay">
      <div class="workflow-editor">
        <div class="editor-header">
          <h2>Editing: {{ editingWorkflow.name }}</h2>
          <div class="editor-actions">
            <button @click="saveWorkflow" class="primary small">
              💾 Save
            </button>
            <button @click="closeEditor" class="secondary small">
              ✕ Close
            </button>
          </div>
        </div>
        
        <div class="editor-content">
          <div class="workflow-info">
            <div class="form-group">
              <label>Name</label>
              <input v-model="editingWorkflow.name" type="text">
            </div>
            
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="editingWorkflow.description" rows="2"></textarea>
            </div>
            
            <div class="form-group">
              <label>Trigger</label>
              <select v-model="editingWorkflow.trigger">
                <option value="manual">Manual</option>
                <option value="schedule">Schedule</option>
                <option value="file-change">File Change</option>
                <option value="webhook">Webhook</option>
              </select>
            </div>
          </div>
          
          <div class="steps-editor">
            <h3>Steps</h3>
            <div class="step-list">
              <div v-for="(step, index) in editingWorkflow.steps" :key="index" class="step-item">
                <div class="step-header">
                  <span class="step-number">{{ index + 1 }}</span>
                  <span class="step-name">{{ step.name }}</span>
                  <button @click="removeStep(index)" class="remove-step">
                    ✕
                  </button>
                </div>
                <p class="step-description">{{ step.description }}</p>
              </div>
            </div>
            
            <button @click="addStep" class="secondary">
              ➕ Add Step
            </button>
          </div>
        </div>
        
        <div class="editor-footer">
          <button @click="testWorkflow" class="secondary">
            🧪 Test Workflow
          </button>
        </div>
      </div>
    </div>
    
    <!-- Workflow Templates Modal -->
    <div v-if="showTemplatesModal" class="modal-overlay">
      <div class="templates-modal">
        <h3>📚 Workflow Templates</h3>
        <p>Start with a pre-built workflow template</p>
        
        <div class="template-grid">
          <div v-for="template in workflowTemplates" :key="template.id" class="template-card">
            <h4>{{ template.name }}</h4>
            <p>{{ template.description }}</p>
            <button @click="useTemplate(template)" class="secondary small">
              Use Template
            </button>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="showTemplatesModal = false" class="secondary">
            Close
          </button>
        </div>
      </div>
    </div>
    
    <!-- Workflow Logs Modal -->
    <div v-if="showLogsModal" class="modal-overlay">
      <div class="logs-modal">
        <div class="logs-header">
          <h3>📜 Workflow Logs: {{ currentWorkflow?.name }}</h3>
          <button @click="showLogsModal = false" class="secondary small">
            ✕ Close
          </button>
        </div>
        
        <div class="logs-content">
          <div v-if="workflowLogs.length === 0" class="no-logs">
            <p>No logs available for this workflow</p>
          </div>
          
          <div v-else class="log-list">
            <div v-for="log in workflowLogs" :key="log.id" class="log-item">
              <span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
              <span class="log-status" :class="log.status">
                {{ log.status }}
              </span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
        
        <div class="logs-actions">
          <button @click="clearLogs" class="danger small">
            🗑️ Clear Logs
          </button>
          <button @click="exportLogs" class="secondary small">
            📥 Export Logs
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'
import { formatDistanceToNow, format } from 'date-fns'

export default {
  name: 'WorkflowSurface',
  setup() {
    const workflowStore = useWorkflowStore()
    
    // State
    const isLoading = ref(false)
    const error = ref(null)
    const searchQuery = ref('')
    const showNewWorkflowModal = ref(false)
    const showTemplatesModal = ref(false)
    const showLogsModal = ref(false)
    const editingWorkflow = ref(null)
    
    // New workflow form
    const newWorkflowName = ref('')
    const newWorkflowDescription = ref('')
    const newWorkflowTrigger = ref('manual')
    const newWorkflowSchedule = ref('')
    
    // Current workflow for logs
    const currentWorkflow = ref(null)
    const workflowLogs = ref([])
    
    // Computed properties
    const workflows = computed(() => workflowStore.workflows)
    const runningWorkflows = computed(() => {
      return workflows.value.filter(w => w.status === 'running').length
    })
    const completedWorkflows = computed(() => {
      return workflows.value.filter(w => w.status === 'completed').length
    })
    
    const filteredWorkflows = computed(() => {
      if (!searchQuery.value) return workflows.value
      
      const query = searchQuery.value.toLowerCase()
      return workflows.value.filter(workflow => 
        workflow.name.toLowerCase().includes(query) ||
        workflow.description.toLowerCase().includes(query)
      )
    })
    
    // Workflow templates
    const workflowTemplates = [
      {
        id: '1',
        name: 'Daily Backup',
        description: 'Back up important files every day at 2AM',
        trigger: 'schedule',
        schedule: '0 2 * * *',
        steps: [
          { name: 'Copy files', description: 'Copy files to backup location' },
          { name: 'Compress', description: 'Create zip archive' },
          { name: 'Upload', description: 'Upload to cloud storage' }
        ]
      },
      {
        id: '2',
        name: 'Content Sync',
        description: 'Sync content between Vault and GitHub',
        trigger: 'manual',
        steps: [
          { name: 'Scan Vault', description: 'Find changed files' },
          { name: 'Update GitHub', description: 'Push changes to repository' }
        ]
      },
      {
        id: '3',
        name: 'Report Generator',
        description: 'Generate weekly reports automatically',
        trigger: 'schedule',
        schedule: '0 9 * * 1', // Every Monday at 9AM
        steps: [
          { name: 'Collect data', description: 'Gather data from sources' },
          { name: 'Generate report', description: 'Create formatted report' },
          { name: 'Email report', description: 'Send to recipients' }
        ]
      }
    ]
    
    // Methods
    const formatRelativeTime = (dateString) => {
      if (!dateString) return 'Never'
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    }
    
    const formatLogTime = (timestamp) => {
      return format(new Date(timestamp), 'HH:mm:ss')
    }
    
    const getStatusClass = (status) => {
      return {
        'running': 'status-running',
        'completed': 'status-completed',
        'failed': 'status-failed',
        'paused': 'status-paused'
      }[status] || 'status-unknown'
    }
    
    const loadWorkflows = async () => {
      isLoading.value = true
      error.value = null
      try {
        await workflowStore.loadWorkflows()
      } catch (err) {
        error.value = { message: err.message || 'Could not load workflows' }
      } finally {
        isLoading.value = false
      }
    }
    
    const reloadWorkflows = loadWorkflows
    
    const createNewWorkflow = () => {
      newWorkflowName.value = ''
      newWorkflowDescription.value = ''
      newWorkflowTrigger.value = 'manual'
      newWorkflowSchedule.value = ''
      showNewWorkflowModal.value = true
    }
    
    const createWorkflow = async () => {
      if (!newWorkflowName.value.trim()) return
      
      isLoading.value = true
      try {
        await workflowStore.createWorkflow({
          name: newWorkflowName.value,
          description: newWorkflowDescription.value,
          trigger: newWorkflowTrigger.value,
          schedule: newWorkflowSchedule.value,
          steps: []
        })
        showNewWorkflowModal.value = false
        await loadWorkflows()
      } catch (err) {
        error.value = { message: err.message || 'Could not create workflow' }
      } finally {
        isLoading.value = false
      }
    }
    
    const editWorkflow = (workflow) => {
      editingWorkflow.value = JSON.parse(JSON.stringify(workflow))
    }
    
    const closeEditor = () => {
      editingWorkflow.value = null
    }
    
    const saveWorkflow = async () => {
      if (!editingWorkflow.value) return
      
      isLoading.value = true
      try {
        await workflowStore.saveWorkflow(editingWorkflow.value)
        closeEditor()
        await loadWorkflows()
      } catch (err) {
        error.value = { message: err.message || 'Could not save workflow' }
      } finally {
        isLoading.value = false
      }
    }
    
    const addStep = () => {
      if (!editingWorkflow.value) return
      
      const stepName = prompt('Step name:', 'New Step')
      if (stepName) {
        editingWorkflow.value.steps.push({
          name: stepName,
          description: 'Describe what this step does'
        })
      }
    }
    
    const removeStep = (index) => {
      if (!editingWorkflow.value || !confirm('Remove this step?')) return
      editingWorkflow.value.steps.splice(index, 1)
    }
    
    const runWorkflow = (workflow) => {
      alert(`Would run workflow: ${workflow.name}`)
    }
    
    const stopWorkflow = (workflow) => {
      alert(`Would stop workflow: ${workflow.name}`)
    }
    
    const viewLogs = (workflow) => {
      currentWorkflow.value = workflow
      // In a real implementation, load logs for this workflow
      workflowLogs.value = [
        { id: '1', timestamp: new Date(), status: 'info', message: 'Workflow started' },
        { id: '2', timestamp: new Date(), status: 'success', message: 'Step 1 completed' },
        { id: '3', timestamp: new Date(), status: 'success', message: 'Step 2 completed' },
        { id: '4', timestamp: new Date(), status: 'success', message: 'Workflow completed successfully' }
      ]
      showLogsModal.value = true
    }
    
    const testWorkflow = () => {
      alert(`Would test workflow: ${editingWorkflow.value?.name}`)
    }
    
    const showTemplates = () => {
      showTemplatesModal.value = true
    }
    
    const useTemplate = (template) => {
      newWorkflowName.value = template.name
      newWorkflowDescription.value = template.description
      newWorkflowTrigger.value = template.trigger
      newWorkflowSchedule.value = template.schedule || ''
      showTemplatesModal.value = false
      showNewWorkflowModal.value = true
    }
    
    const clearLogs = () => {
      workflowLogs.value = []
    }
    
    const exportLogs = () => {
      alert('Would export logs')
    }
    
    const searchWorkflows = () => {
      // Handled by computed property
    }
    
    const clearSearch = () => {
      searchQuery.value = ''
    }
    
    // Load initial data
    loadWorkflows()
    
    return {
      isLoading,
      error,
      searchQuery,
      showNewWorkflowModal,
      showTemplatesModal,
      showLogsModal,
      editingWorkflow,
      currentWorkflow,
      workflowLogs,
      newWorkflowName,
      newWorkflowDescription,
      newWorkflowTrigger,
      newWorkflowSchedule,
      workflows,
      runningWorkflows,
      completedWorkflows,
      filteredWorkflows,
      workflowTemplates,
      formatRelativeTime,
      formatLogTime,
      getStatusClass,
      reloadWorkflows,
      createNewWorkflow,
      createWorkflow,
      editWorkflow,
      closeEditor,
      saveWorkflow,
      addStep,
      removeStep,
      runWorkflow,
      stopWorkflow,
      viewLogs,
      testWorkflow,
      showTemplates,
      useTemplate,
      clearLogs,
      exportLogs,
      searchWorkflows,
      clearSearch
    }
  }
}
</script>

<style scoped>
.workflow-surface {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.surface-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.surface-icon {
  margin-right: 0.5rem;
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

.loading-state, .error-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.spinner, .error-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 1rem;
}

.main-content {
  margin-top: 1rem;
}

.workflow-list {
  margin-bottom: 1rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.list-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.list-actions {
  display: flex;
  gap: 0.5rem;
}

.search-bar {
  position: relative;
  margin-bottom: 1rem;
}

.search-bar input {
  width: 100%;
  padding: 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-tertiary);
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  background: var(--surface-background);
  border-radius: 8px;
}

.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 1rem;
}

.workflow-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.workflow-card {
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s;
}

.workflow-card:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
}

.workflow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.workflow-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.workflow-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.status-running {
  background: var(--info-background);
  color: var(--info-color);
}

.status-completed {
  background: var(--success-background);
  color: var(--success-color);
}

.status-failed {
  background: var(--danger-background);
  color: var(--danger-color);
}

.status-paused {
  background: var(--warning-background);
  color: var(--warning-color);
}

.status-unknown {
  background: var(--surface-background);
  color: var(--text-secondary);
}

.workflow-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.workflow-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-bottom: 0.75rem;
}

.workflow-actions {
  display: flex;
  gap: 0.5rem;
}

.workflow-stats {
  text-align: right;
  color: var(--text-tertiary);
  font-size: 0.85rem;
  padding: 0.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.new-workflow-modal, .templates-modal, .logs-modal {
  background: var(--background);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.workflow-editor {
  background: var(--background);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.editor-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.workflow-info {
  border-right: 1px solid var(--border-color);
  padding-right: 1rem;
}

.steps-editor {
  padding-left: 1rem;
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.step-item {
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.75rem;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.step-number {
  background: var(--primary-color);
  color: white;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.8rem;
}

.step-name {
  font-weight: 600;
}

.remove-step {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-tertiary);
}

.step-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.template-card {
  background: var(--surface-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.logs-content {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 1rem;
  background: white;
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.no-logs {
  text-align: center;
  padding: 2rem;
  color: var(--text-tertiary);
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.log-time {
  color: var(--text-tertiary);
  width: 60px;
}

.log-status {
  width: 80px;
  text-align: center;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.log-status.info {
  background: var(--info-background);
  color: var(--info-color);
}

.log-status.success {
  background: var(--success-background);
  color: var(--success-color);
}

.log-status.error {
  background: var(--danger-background);
  color: var(--danger-color);
}

.logs-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

button.primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

button.secondary {
  background: var(--surface-background);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

button.danger {
  background: var(--danger-background);
  color: var(--danger-color);
  border: 1px solid var(--danger-border);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

button.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
}
</style>