/* ═══════════════════════════════════════════════════════════════════
   ToolBuilderSurface — Build and register custom tools
   ═══════════════════════════════════════════════════════════════════ */
import React, { useState } from 'react'
import { Icon } from '@usx/styles/react/icon'

interface Tool {
  id: number
  name: string
  description: string
  schema: string
  active: boolean
}

const INITIAL_TOOLS: Tool[] = [
  { id: 1, name: 'search_vault', description: 'Search the vault for documents', schema: '{ "query": "string" }', active: true },
  { id: 2, name: 'get_tasks', description: 'Get current tasks', schema: '{ "filter": "string" }', active: true },
  { id: 3, name: 'exec_command', description: 'Execute a shell command', schema: '{ "cmd": "string" }', active: false },
  { id: 4, name: 'read_file', description: 'Read file contents', schema: '{ "path": "string" }', active: true },
]

const ToolBuilderSurface: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>(INITIAL_TOOLS)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', schema: '{}', active: true })

  const toggleTool = (id: number) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t))
  }

  const deleteTool = (id: number) => {
    if (confirm('Delete this tool?')) {
      setTools(prev => prev.filter(t => t.id !== id))
    }
  }

  const createTool = () => {
    if (!form.name.trim()) return
    const newTool: Tool = {
      id: Date.now(),
      name: form.name.trim(),
      description: form.description.trim(),
      schema: form.schema.trim(),
      active: form.active,
    }
    setTools(prev => [...prev, newTool])
    setShowForm(false)
    setForm({ name: '', description: '', schema: '{}', active: true })
  }

  return (
    <div className="toolbuilder-surface">
      <div className="surface-header">
        <div className="header-left">
          <Icon name="build" size={24} className="header-icon" />
          <div>
            <h1>Tool Builder</h1>
            <p className="surface-tagline">Build and register custom tools for your workspace.</p>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-primary btn-sm" onClick={() => setShowForm(true)}>
            <Icon name="add" size={16} />
            New Tool
          </button>
        </div>
      </div>

      {/* Tool Grid */}
      <div className="toolbuilder-grid">
        {tools.map(tool => (
          <div key={tool.id} className="toolbuilder-card">
            <div className="toolbuilder-card-header">
              <Icon name="extension" size={20} />
              <div className="toolbuilder-card-name">{tool.name}</div>
              <label className="toolbuilder-toggle">
                <input type="checkbox" checked={tool.active} onChange={() => toggleTool(tool.id)} />
                <span className="toolbuilder-toggle-slider" />
              </label>
            </div>
            <div className="toolbuilder-card-desc">{tool.description}</div>
            <div className="toolbuilder-card-schema">
              <code>{tool.schema}</code>
            </div>
            <div className="toolbuilder-card-actions">
              <button className="btn-icon btn-sm" onClick={() => deleteTool(tool.id)} title="Delete tool">
                <Icon name="delete" size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>New Tool</h3>
              <button className="btn-icon btn-sm" onClick={() => setShowForm(false)}><Icon name="close" size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label>Name</label>
                <input type="text" className="modal-input" value={form.name}
                       onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                       placeholder="tool_name" autoFocus />
              </div>
              <div className="modal-field">
                <label>Description</label>
                <input type="text" className="modal-input" value={form.description}
                       onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                       placeholder="What does this tool do?" />
              </div>
              <div className="modal-field">
                <label>Schema (JSON)</label>
                <textarea className="modal-textarea" value={form.schema}
                          onChange={e => setForm(prev => ({ ...prev, schema: e.target.value }))}
                          rows={4} />
              </div>
              <div className="modal-field">
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.active}
                         onChange={e => setForm(prev => ({ ...prev, active: e.target.checked }))} />
                  Active on creation
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={createTool} disabled={!form.name.trim()}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ToolBuilderSurface
