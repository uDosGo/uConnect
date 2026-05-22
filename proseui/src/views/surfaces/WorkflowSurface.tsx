/* ═══════════════════════════════════════════════════════════════════
   WorkflowSurface — Create and manage automated workflows
   Ported from Vue WorkflowSurface.vue
   ═══════════════════════════════════════════════════════════════════ */
import React, { useState, useMemo, useEffect } from 'react'
import { Icon } from '@usx/styles/react/icon'

interface Workflow {
  id: number
  name: string
  description: string
  triggers: string[]
  active: boolean
  runCount: number
  updatedAt: string
}

const MOCK_WORKFLOWS: Workflow[] = [
  { id: 1, name: 'Daily Backup', description: 'Automatically backup all documents at 2 AM', triggers: ['time', 'schedule'], active: true, runCount: 42, updatedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 2, name: 'Git Sync', description: 'Sync GitHub repos every hour', triggers: ['time', 'github'], active: true, runCount: 128, updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 3, name: 'Document Processing', description: 'Process uploaded documents and extract metadata', triggers: ['file-upload', 'vault'], active: false, runCount: 7, updatedAt: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: 4, name: 'Chat Summarization', description: 'Summarize long conversations automatically', triggers: ['message', 'vibe'], active: true, runCount: 234, updatedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
]

const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  const now = Date.now()
  const diff = now - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

const WorkflowSurface: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredWorkflows = useMemo(() => {
    if (!searchQuery) return workflows
    const query = searchQuery.toLowerCase()
    return workflows.filter(w =>
      w.name.toLowerCase().includes(query) ||
      (w.description && w.description.toLowerCase().includes(query))
    )
  }, [workflows, searchQuery])

  const activeWorkflows = useMemo(() => workflows.filter(w => w.active).length, [workflows])
  const totalRuns = useMemo(() => workflows.reduce((sum, w) => sum + (w.runCount || 0), 0), [workflows])

  const loadWorkflows = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setWorkflows(MOCK_WORKFLOWS)
    } catch (err: any) {
      setError(err.message || 'Failed to load workflows')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadWorkflows() }, [])

  const createNewWorkflow = () => alert('Workflow creation interface coming soon!')
  const openWorkflow = (wf: Workflow) => alert(`Opening workflow: ${wf.name}`)
  const toggleWorkflow = (wf: Workflow) => {
    setWorkflows(prev => prev.map(w => w.id === wf.id ? { ...w, active: !w.active } : w))
    alert(`Workflow ${wf.active ? 'deactivated' : 'activated'}`)
  }
  const editWorkflow = (wf: Workflow) => alert(`Editing workflow: ${wf.name}`)
  const deleteWorkflow = (wf: Workflow) => {
    if (confirm(`Delete workflow "${wf.name}"?`)) {
      setWorkflows(prev => prev.filter(w => w.id !== wf.id))
      alert('Workflow deleted')
    }
  }
  const refreshWorkflows = () => loadWorkflows()
  const retryLoad = () => loadWorkflows()

  return (
    <div className="workflow-surface">
      {/* Surface Header */}
      <div className="surface-header">
        <div className="header-left">
          <Icon name="account_tree" size={24} className="header-icon" />
          <div>
            <h1>Workflow Manager</h1>
            <p className="surface-tagline">Create and manage automated workflows for your tasks.</p>
            <p className="surface-definition">
              <strong>What's a Workflow?</strong> A sequence of automated tasks that run based on triggers.
              Save time by automating repetitive processes and keeping your work flowing smoothly.
            </p>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-secondary btn-sm" onClick={refreshWorkflows}>
            <Icon name="refresh" size={16} />
            Refresh
          </button>
          <button className="btn-primary btn-sm" onClick={createNewWorkflow}>
            <Icon name="add" size={16} />
            New Workflow
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading workflows...</p>
          <p className="helper-text">This usually takes a few seconds.</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="error-state">
          <div className="error-icon">
            <Icon name="error" size={48} />
          </div>
          <h3>Couldn't load workflows</h3>
          <p>{error}</p>
          <p className="helper-text">
            Try:
            <br />
            • Refreshing the page
            <br />
            • Checking your internet connection
            <br />
            • Making sure uDOS services are running
          </p>
          <div className="error-actions">
            <button onClick={retryLoad} className="btn-primary">
              <Icon name="refresh" size={16} />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && workflows.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="account_tree" size={48} />
          </div>
          <h3>No workflows yet</h3>
          <p>Create your first automated workflow!</p>
          <button className="btn-primary" onClick={createNewWorkflow}>
            <Icon name="add" size={16} />
            Create Workflow
          </button>
          <p className="helper-text">
            <Icon name="info" size={14} />
            Workflows help automate repetitive tasks
          </p>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !error && workflows.length > 0 && (
        <div className="workflow-container">
          <div className="workflow-controls">
            <div className="workflow-search">
              <Icon name="search" size={16} className="search-icon" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search workflows..." className="search-input" />
              {searchQuery && (
                <button className="btn-icon btn-sm" onClick={() => setSearchQuery('')}>
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
            <button className="btn-secondary" onClick={refreshWorkflows}>
              <Icon name="refresh" size={16} />
              Refresh
            </button>
          </div>

          <div className="workflow-grid">
            {filteredWorkflows.map(wf => (
              <div key={wf.id} className="workflow-card" onClick={() => openWorkflow(wf)}>
                <div className="workflow-header">
                  <Icon name="account_tree" size={20} className="workflow-icon" />
                  <h3 className="workflow-name">{wf.name}</h3>
                  <span className={`workflow-status ${wf.active ? 'active' : 'inactive'}`}>
                    {wf.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="workflow-meta">
                  <span className="workflow-trigger">
                    <Icon name="bolt" size={14} />
                    {wf.triggers.join(', ')}
                  </span>
                  <span className="workflow-updated">Updated {formatRelativeTime(wf.updatedAt)}</span>
                </div>
                {wf.description && <div className="workflow-description">{wf.description}</div>}
                <div className="workflow-actions">
                  <button className="btn-icon btn-sm" onClick={e => { e.stopPropagation(); toggleWorkflow(wf) }} title={wf.active ? 'Deactivate workflow' : 'Activate workflow'}>
                    <Icon name={wf.active ? 'pause' : 'play_arrow'} size={14} />
                  </button>
                  <button className="btn-icon btn-sm" onClick={e => { e.stopPropagation(); editWorkflow(wf) }} title="Edit workflow">
                    <Icon name="edit" size={14} />
                  </button>
                  <button className="btn-icon btn-sm" onClick={e => { e.stopPropagation(); deleteWorkflow(wf) }} title="Delete workflow">
                    <Icon name="delete" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="workflow-stats">
            <span>{filteredWorkflows.length} workflows</span>
            <span>{activeWorkflows} active</span>
            <span>{totalRuns} total runs</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkflowSurface
