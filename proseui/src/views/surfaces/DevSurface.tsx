/* ═══════════════════════════════════════════════════════════════════
   DevSurface — Developer tools and utilities
   Ported from Vue DevModeSurface.vue
   ═══════════════════════════════════════════════════════════════════ */
import React, { useState, useEffect, useMemo } from 'react'
import { Icon } from '@usx/styles/react/icon'

interface DevTool {
  id: number
  name: string
  description: string
  type: string
  category: string
  version: string
  icon: string
  active: boolean
}

const MOCK_TOOLS: DevTool[] = [
  { id: 1, name: 'System Monitor', description: 'Monitor system resources and performance', type: 'monitor', category: 'system', version: '2.0.0', icon: 'monitor', active: true },
  { id: 2, name: 'Log Viewer', description: 'View and filter system logs', type: 'viewer', category: 'logs', version: '1.5.0', icon: 'description', active: true },
  { id: 3, name: 'Terminal', description: 'Access command line interface', type: 'terminal', category: 'shell', version: '3.2.0', icon: 'terminal', active: true },
  { id: 4, name: 'Debug Console', description: 'Debug and inspect running processes', type: 'debugger', category: 'development', version: '1.8.0', icon: 'bug_report', active: true },
  { id: 5, name: 'Config Editor', description: 'Edit configuration files', type: 'editor', category: 'configuration', version: '2.1.0', icon: 'settings', active: true },
  { id: 6, name: 'Service Manager', description: 'Start, stop, and manage services', type: 'manager', category: 'system', version: '1.9.0', icon: 'dns', active: true },
]

const DevSurface: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tools, setTools] = useState<DevTool[]>([])

  const activeTools = useMemo(() => tools.filter(t => t.active).length, [tools])
  const toolCategories = useMemo(() => new Set(tools.map(t => t.category)).size, [tools])

  const loadTools = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setTools(MOCK_TOOLS)
    } catch (err: any) {
      setError(err.message || 'Failed to load tools')
    } finally {
      setIsLoading(false)
    }
  }

  const useTool = (tool: DevTool) => {
    alert(`Using tool: ${tool.name}`)
  }

  useEffect(() => { loadTools() }, [])

  return (
    <div className="devmode-surface">
      {/* Surface Header */}
      <div className="surface-header">
        <div className="header-left">
          <Icon name="code" size={24} className="header-icon" />
          <div>
            <h1>Dev Mode</h1>
            <p className="surface-tagline">Developer tools and utilities for uDOS.</p>
            <p className="surface-definition">
              <strong>What's Dev Mode?</strong> A special interface for developers to access advanced tools,
              debug information, and system utilities. Perfect for troubleshooting and development tasks.
            </p>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-secondary btn-sm" onClick={loadTools}>
            <Icon name="refresh" size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <Icon name="info" size={18} />
        <div>
          <strong>Developer Mode</strong>
          Advanced tools and utilities for system administration and development.
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading developer tools...</p>
          <p className="helper-text">This usually takes a few seconds.</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="error-state">
          <div className="error-icon">
            <Icon name="error" size={48} />
          </div>
          <h3>Couldn't load developer tools</h3>
          <p>{error}</p>
          <p className="helper-text">
            Try:<br />
            • Refreshing the page<br />
            • Checking your internet connection<br />
            • Making sure uDOS services are running
          </p>
          <div className="error-actions">
            <button onClick={loadTools} className="btn-primary">
              <Icon name="refresh" size={16} />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && tools.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="code" size={48} />
          </div>
          <h3>No developer tools found</h3>
          <p>Your developer toolkit appears to be empty.</p>
          <p className="helper-text">
            <Icon name="info" size={14} />
            Tools are loaded from connected services
          </p>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !error && tools.length > 0 && (
        <div className="tool-container">
          <div className="tool-grid">
            {tools.map(tool => (
              <div key={tool.id} className="tool-card" onClick={() => useTool(tool)}>
                <div className="tool-header">
                  <Icon name={tool.icon} size={20} className="tool-icon" />
                  <h3 className="tool-name">{tool.name}</h3>
                  <span className="tool-type">{tool.type}</span>
                </div>
                <div className="tool-meta">
                  <span className="tool-category">{tool.category}</span>
                  <span className="tool-version">v{tool.version}</span>
                </div>
                {tool.description && (
                  <div className="tool-description">{tool.description}</div>
                )}
                <div className="tool-actions">
                  <button className="btn-primary" onClick={(e) => { e.stopPropagation(); useTool(tool) }}>
                    <Icon name="play_arrow" size={14} />
                    Use
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="tool-stats">
            <span>{tools.length} tools</span>
            <span>{activeTools} active</span>
            <span>{toolCategories} categories</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DevSurface
