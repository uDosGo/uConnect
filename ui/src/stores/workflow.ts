import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api.prod'

export const useWorkflowStore = defineStore('workflow', () => {
  const workflows = ref<api.UDOWorkflow[]>([])
  const tasks = ref<api.UDOTask[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const activeWorkflows = computed(() => workflows.value.filter(w => w.status === 'active'))
  const recentTasks = computed(() => tasks.value.slice(0, 10))

  async function loadWorkflows() {
    isLoading.value = true
    error.value = null
    try {
      workflows.value = await api.listWorkflows()
    } catch (err: any) {
      error.value = err.message || 'Failed to load workflows'
      workflows.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function loadTasks() {
    isLoading.value = true
    error.value = null
    try {
      tasks.value = await api.listTasks()
    } catch (err: any) {
      error.value = err.message || 'Failed to load tasks'
      tasks.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function runWorkflow(id: string) {
    try {
      await api.runWorkflow(id)
      await loadWorkflows()
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to run workflow'
      return false
    }
  }

  async function disableWorkflow(id: string) {
    try {
      await api.disableWorkflow(id)
      await loadWorkflows()
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to disable workflow'
      return false
    }
  }

  async function cancelTask(id: string) {
    try {
      await api.cancelTask(id)
      await loadTasks()
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to cancel task'
      return false
    }
  }

  async function retryTask(id: string) {
    try {
      await api.retryTask(id)
      await loadTasks()
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to retry task'
      return false
    }
  }

  async function createWorkflow(params: { name: string; description?: string; trigger?: string; schedule?: string; steps?: any[] }) {
    isLoading.value = true
    error.value = null
    try {
      const result = await api.createWorkflow(params.name, params.description || '')
      await loadWorkflows()
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to create workflow'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function saveWorkflow(workflow: any) {
    isLoading.value = true
    error.value = null
    try {
      await api.disableWorkflow(workflow.id)
      await loadWorkflows()
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to save workflow'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function stopWorkflow(id: string) {
    try {
      await api.disableWorkflow(id)
      await loadWorkflows()
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to stop workflow'
      return false
    }
  }

  return {
    workflows,
    tasks,
    isLoading,
    error,
    activeWorkflows,
    recentTasks,
    loadWorkflows,
    loadTasks,
    runWorkflow,
    disableWorkflow,
    cancelTask,
    retryTask,
    createWorkflow,
    saveWorkflow,
    stopWorkflow,
  }
})
