/* ═══════════════════════════════════════════════════════════════════
   opsui — Server Operations Surface (React)
   Dark ops dashboard for monitoring uServer services, logs, workflows,
   and system health. Uses shared @usx/react components.
   ═══════════════════════════════════════════════════════════════════ */

import React, { useState } from 'react'
import { useOpsUIStore } from './views/surfaces/opsui/stores/opsUIStore'
import OpsUINavRail from './views/surfaces/opsui/OpsUINavRail'
import OpsUIChatSheet from './views/surfaces/opsui/OpsUIChatSheet'
import SnackMachineTab from './views/surfaces/opsui/SnackMachineTab'
import SnacksTab from './views/surfaces/opsui/SnacksTab'
import './views/surfaces/opsui/styles/opsui-theme.css'

// ─── Palette Colors ──────────────────────────────────────────────
const paletteColors: Record<string, string> = {
  ops: '#58a6ff',
  terminal: '#00C853',
  wireframe: '#cccccc',
  paper: '#8D6E63',
}

const paletteOrder = ['ops', 'terminal', 'wireframe', 'paper'] as const

// ─── Sidebar Tabs ────────────────────────────────────────────────
const sidebarTabs = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'services', icon: 'dns', label: 'Services' },
  { id: 'logs', icon: 'article', label: 'Logs' },
  { id: 'workflows', icon: 'account_tree', label: 'Workflows' },
  { id: 'agents', icon: 'smart_toy', label: 'Agents' },
  { id: 'snackmachine', icon: 'restaurant_menu', label: 'SnackMachine' },
  { id: 'snacks', icon: 'inventory_2', label: 'Snacks' },
  { id: 'settings', icon: 'settings', label: 'Settings' },
]

// ─── Dashboard Tab ───────────────────────────────────────────────
function DashboardTab() {
  const store = useOpsUIStore()

  const upCount = store.services.filter(s => s.status === 'up').length
  const degradedCount = store.services.filter(s => s.status === 'degraded').length
  const downCount = store.services.filter(s => s.status === 'down').length
  const runningWorkflows = store.workflows.filter(w => w.status === 'running').length

  return (
    <div className="ops-grid">
      {/* Welcome Card */}
      <div className="ops-card ops-welcome-card">
        <div className="ops-card-content">
          <h2 className="ops-heading">uServer Operations</h2>
          <p className="ops-text">
            Monitoring {store.services.length} services · {store.workflows.length} workflows · {store.logs.length} log entries
          </p>
          <div className="ops-stats-row">
            <div className="ops-stat">
              <span className="ops-stat-value">{upCount}</span>
              <span className="ops-stat-label">Up</span>
            </div>
            <div className="ops-stat">
              <span className="ops-stat-value">{degradedCount}</span>
              <span className="ops-stat-label">Degraded</span>
            </div>
            <div className="ops-stat">
              <span className="ops-stat-value">{downCount}</span>
              <span className="ops-stat-label">Down</span>
            </div>
            <div className="ops-stat">
              <span className="ops-stat-value">{runningWorkflows}</span>
              <span className="ops-stat-label">Running</span>
            </div>
          </div>
        </div>
      </div>

      {/* Service Status Summary */}
      <div className="ops-card">
        <div className="ops-card-header">
          <h3>Service Status</h3>
          <button className="ops-action-btn" onClick={store.refreshServices}>
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </button>
        </div>
        <div className="ops-card-content">
          {store.services.slice(0, 4).map(svc => (
            <div key={svc.name} className="ops-service-row">
              <div className="ops-service-info">
                <span className="ops-service-name">{svc.name}</span>
                <span className="ops-service-desc">{svc.description}</span>
              </div>
              <div className="ops-service-meta">
                <span className={`ops-service-status ${svc.status}`}>
                  {svc.status === 'up' ? '● Online' : svc.status === 'degraded' ? '● Degraded' : '● Offline'}
                </span>
                {svc.port > 0 && <span className="ops-service-port">:{svc.port}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Logs */}
      <div className="ops-card">
        <div className="ops-card-header">
          <h3>Recent Logs</h3>
          <button className="ops-action-btn" onClick={store.refreshLogs}>
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </button>
        </div>
        <div className="ops-card-content">
          {store.logs.slice(0, 5).map((log, idx) => (
            <div key={idx} className="ops-log-entry">
              <span className="ops-log-time">{log.timestamp.slice(11, 19)}</span>
              <span className="ops-log-service">{log.service}</span>
              <span className={`ops-log-level ${log.level}`}>{log.level}</span>
              <span className="ops-log-message">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Status */}
      <div className="ops-card">
        <div className="ops-card-header">
          <h3>Workflows</h3>
          <button className="ops-action-btn" onClick={store.refreshWorkflows}>
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </button>
        </div>
        <div className="ops-card-content">
          {store.workflows.slice(0, 3).map(wf => (
            <div key={wf.name} className="ops-workflow-row">
              <div className="ops-workflow-info">
                <span className="ops-workflow-name">{wf.name}</span>
                <span className="ops-workflow-schedule">{wf.schedule}</span>
              </div>
              <div className="ops-workflow-meta">
                <span className={`ops-workflow-status ${wf.status}`}>
                  {wf.status.charAt(0).toUpperCase() + wf.status.slice(1)}
                </span>
                <span className="ops-workflow-lastrun">{wf.lastRun}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Services Tab ────────────────────────────────────────────────
function ServicesTab() {
  const store = useOpsUIStore()

  return (
    <div>
      <div className="ops-toolbar">
        <div className="ops-toolbar-left">
          <h2 className="ops-heading">Services</h2>
        </div>
        <div className="ops-toolbar-right">
          <button className="ops-action-btn" onClick={store.refreshServices}>
            <span className="material-symbols-outlined">refresh</span>
            Refresh All
          </button>
        </div>
      </div>

      <div className="ops-grid">
        {store.services.map(svc => (
          <div key={svc.name} className="ops-card">
            <div className="ops-card-header">
              <h3>{svc.name}</h3>
              <span className={`ops-service-status ${svc.status}`}>
                {svc.status === 'up' ? '● Online' : svc.status === 'degraded' ? '● Degraded' : '● Offline'}
              </span>
            </div>
            <div className="ops-card-content">
              <p className="ops-text" style={{ marginBottom: 8 }}>{svc.description}</p>
              <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--ops-text-muted)', marginBottom: 12 }}>
                {svc.port > 0 && <span>Port: <strong style={{ color: 'var(--ops-text)' }}>{svc.port}</strong></span>}
                <span>Type: <strong style={{ color: 'var(--ops-text)' }}>{svc.type}</strong></span>
                <span>Uptime: <strong style={{ color: 'var(--ops-text)' }}>{svc.uptime}%</strong></span>
              </div>
              <div className="ops-service-actions">
                <button
                  className="ops-service-btn restart"
                  onClick={() => store.restartService(svc.name)}
                  title="Restart service"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>restart_alt</span>
                </button>
                <button
                  className="ops-service-btn"
                  onClick={() => store.showSnackbar(`Logs for ${svc.name}`, 'info')}
                  title="View logs"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>article</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Logs Tab ────────────────────────────────────────────────────
function LogsTab() {
  const store = useOpsUIStore()

  const filteredLogs = store.logFilter
    ? store.logs.filter(log =>
        log.service.toLowerCase().includes(store.logFilter.toLowerCase()) ||
        log.message.toLowerCase().includes(store.logFilter.toLowerCase()) ||
        log.level.includes(store.logFilter.toLowerCase())
      )
    : store.logs

  return (
    <div>
      <div className="ops-toolbar">
        <div className="ops-toolbar-left">
          <h2 className="ops-heading">Logs</h2>
        </div>
        <div className="ops-toolbar-right">
          <button className="ops-action-btn" onClick={store.refreshLogs}>
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      <div className="ops-log-filter">
        <input
          type="text"
          placeholder="Filter by service, level, or message..."
          value={store.logFilter}
          onChange={e => store.setLogFilter(e.target.value)}
        />
        {store.logFilter && (
          <button className="ops-action-btn" onClick={() => store.setLogFilter('')}>
            Clear
          </button>
        )}
      </div>

      <div className="ops-card">
        <div className="ops-card-header">
          <h3>Log Entries ({filteredLogs.length})</h3>
        </div>
        <div className="ops-card-content">
          {filteredLogs.length === 0 ? (
            <p className="ops-text" style={{ textAlign: 'center', padding: 20 }}>
              No log entries match your filter.
            </p>
          ) : (
            filteredLogs.map((log, idx) => (
              <div key={idx} className="ops-log-entry">
                <span className="ops-log-time">{log.timestamp}</span>
                <span className="ops-log-service">{log.service}</span>
                <span className={`ops-log-level ${log.level}`}>{log.level}</span>
                <span className="ops-log-message">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Workflows Tab ───────────────────────────────────────────────
function WorkflowsTab() {
  const store = useOpsUIStore()

  return (
    <div>
      <div className="ops-toolbar">
        <div className="ops-toolbar-left">
          <h2 className="ops-heading">Workflows</h2>
        </div>
        <div className="ops-toolbar-right">
          <button className="ops-action-btn" onClick={store.refreshWorkflows}>
            <span className="material-symbols-outlined">refresh</span>
            Refresh All
          </button>
        </div>
      </div>

      <div className="ops-grid">
        {store.workflows.map(wf => (
          <div key={wf.name} className="ops-card">
            <div className="ops-card-header">
              <h3>{wf.name}</h3>
              <span className={`ops-workflow-status ${wf.status}`}>
                {wf.status.charAt(0).toUpperCase() + wf.status.slice(1)}
              </span>
            </div>
            <div className="ops-card-content">
              <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--ops-text-muted)' }}>
                <span>Schedule: <strong style={{ color: 'var(--ops-text)' }}>{wf.schedule}</strong></span>
                <span>Last run: <strong style={{ color: 'var(--ops-text)' }}>{wf.lastRun}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Agents Tab ──────────────────────────────────────────────────
function AgentsTab() {
  const agents = [
    { name: 'code-reviewer', status: 'active' as const, model: 'gpt-4', tasks: 42, uptime: '12h' },
    { name: 'hivemind-orchestrator', status: 'active' as const, model: 'gpt-4', tasks: 128, uptime: '7d' },
    { name: 'feed-watcher', status: 'idle' as const, model: 'gpt-3.5', tasks: 0, uptime: '3d' },
    { name: 'auto-labeler', status: 'active' as const, model: 'gpt-3.5', tasks: 256, uptime: '14d' },
    { name: 'doc-syncer', status: 'idle' as const, model: 'gpt-4', tasks: 18, uptime: '5d' },
  ]

  return (
    <div>
      <div className="ops-toolbar">
        <div className="ops-toolbar-left">
          <h2 className="ops-heading">Agents</h2>
        </div>
      </div>

      <div className="ops-grid">
        {agents.map(agent => (
          <div key={agent.name} className="ops-card">
            <div className="ops-card-header">
              <h3>{agent.name}</h3>
              <span className={`ops-service-status ${agent.status === 'active' ? 'up' : 'degraded'}`}>
                {agent.status === 'active' ? '● Active' : '● Idle'}
              </span>
            </div>
            <div className="ops-card-content">
              <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--ops-text-muted)' }}>
                <span>Model: <strong style={{ color: 'var(--ops-text)' }}>{agent.model}</strong></span>
                <span>Tasks: <strong style={{ color: 'var(--ops-text)' }}>{agent.tasks}</strong></span>
                <span>Uptime: <strong style={{ color: 'var(--ops-text)' }}>{agent.uptime}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Settings Tab ────────────────────────────────────────────────
function SettingsTab() {
  const store = useOpsUIStore()

  return (
    <div>
      <div className="ops-toolbar">
        <div className="ops-toolbar-left">
          <h2 className="ops-heading">Settings</h2>
        </div>
      </div>

      <div className="ops-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {/* Display Settings */}
        <div className="ops-card">
          <div className="ops-card-header">
            <h3>Display</h3>
          </div>
          <div className="ops-card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--ops-text-secondary)' }}>Theme</span>
                <button className="ops-action-btn" onClick={store.toggleTheme}>
                  <span className="material-symbols-outlined">{store.isDark ? 'dark_mode' : 'light_mode'}</span>
                  {store.isDark ? 'Dark' : 'Light'}
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--ops-text-secondary)' }}>Font Size</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="ops-action-btn" onClick={store.decreaseFontSize}>A-</button>
                  <span style={{ fontSize: 12, color: 'var(--ops-text)', padding: '0 8px', alignSelf: 'center' }}>{store.fontSize}px</span>
                  <button className="ops-action-btn" onClick={store.increaseFontSize}>A+</button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--ops-text-secondary)' }}>Font Style</span>
                <button className="ops-action-btn" onClick={store.cycleFontStyle}>
                  <span className="material-symbols-outlined">
                    {store.fontStyle === 'mono' ? 'code' : store.fontStyle === 'sans' ? 'text_fields' : 'format_italic'}
                  </span>
                  {store.fontStyle}
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--ops-text-secondary)' }}>Palette</span>
                <button className="ops-action-btn" onClick={store.cyclePalette}>
                  <span className="swatch-dot" style={{ '--swatch-color': paletteColors[store.currentPalette], display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: paletteColors[store.currentPalette], marginRight: 6 } as React.CSSProperties}></span>
                  {store.currentPalette}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Settings */}
        <div className="ops-card">
          <div className="ops-card-header">
            <h3>Connections</h3>
          </div>
          <div className="ops-card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--ops-text-secondary)' }}>uServer Host</span>
                <span style={{ fontSize: 12, color: 'var(--ops-text)', fontFamily: 'monospace' }}>192.168.20.11</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--ops-text-secondary)' }}>Snackbar Port</span>
                <span style={{ fontSize: 12, color: 'var(--ops-text)', fontFamily: 'monospace' }}>8484</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--ops-text-secondary)' }}>Secret Server</span>
                <span style={{ fontSize: 12, color: 'var(--ops-text)', fontFamily: 'monospace' }}>:30001</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--ops-text-secondary)' }}>Hivemind</span>
                <span style={{ fontSize: 12, color: 'var(--ops-text)', fontFamily: 'monospace' }}>:8485</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Placeholder Panel ───────────────────────────────────────────
function PlaceholderPanel({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="panel-placeholder">
      <span className="material-symbols-outlined panel-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

// ─── Main App ────────────────────────────────────────────────────
export default function App() {
  const store = useOpsUIStore()
  const [activeTab, setActiveTab] = useState('dashboard')

  const activeTabLabel = sidebarTabs.find(t => t.id === activeTab)?.label || 'Dashboard'

  const fontStyleIcon = (() => {
    switch (store.fontStyle) {
      case 'serif': return 'format_italic'
      case 'sans': return 'text_fields'
      case 'mono': return 'code'
    }
  })()

  const currentSwatchColor = paletteColors[store.currentPalette] || '#58a6ff'

  return (
    <div
      className={`opsui-surface ${store.isDark ? 'opsui-dark' : ''}`}
      data-font-style={store.fontStyle}
      data-palette={store.currentPalette}
      style={{ '--opsui-font-size': `${store.fontSize}px` } as React.CSSProperties}
    >
      {/* Surface Header */}
      <header className="surface-header">
        <div className="header-left">
          <button className="header-btn" onClick={store.toggleSidebar} title="Toggle sidebar">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="header-title">opsui</h1>
          <span className="header-badge">Server Ops</span>
        </div>
        <div className="header-center">
          <div className="header-breadcrumb">
            <span className="breadcrumb-item">uServer</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-item breadcrumb-current">{activeTabLabel}</span>
          </div>
        </div>
        <div className="header-right">
          {/* Colour Cycle */}
          <button
            className="header-btn colour-cycle-btn"
            onClick={store.cyclePalette}
            title={`Palette: ${store.currentPalette}`}
          >
            <span className="swatch-dot" style={{ '--swatch-color': currentSwatchColor } as React.CSSProperties}></span>
          </button>

          <div className="header-divider"></div>

          {/* Font Size */}
          <button className="header-btn" onClick={store.decreaseFontSize} title="Smaller font">
            <span className="material-symbols-outlined">text_decrease</span>
          </button>
          <button className="header-btn" onClick={store.increaseFontSize} title="Larger font">
            <span className="material-symbols-outlined">text_increase</span>
          </button>

          <div className="header-divider"></div>

          {/* Font Style */}
          <button className="header-btn" onClick={store.cycleFontStyle} title={`Font: ${store.fontStyle}`}>
            <span className="material-symbols-outlined">{fontStyleIcon}</span>
          </button>

          <div className="header-divider"></div>

          {/* Chat Toggle */}
          <button className="header-btn" onClick={store.toggleChat} title={store.chatOpen ? 'Close chat' : 'Open chat'}>
            <span className="material-symbols-outlined">chat</span>
          </button>
          {/* Theme Toggle */}
          <button className="header-btn" onClick={store.toggleTheme} title={store.isDark ? 'Light mode' : 'Dark mode'}>
            <span className="material-symbols-outlined">{store.isDark ? 'dark_mode' : 'light_mode'}</span>
          </button>
        </div>
      </header>

      {/* Workspace Layout */}
      <div className="workspace-layout">
        <OpsUINavRail
          activeTab={activeTab}
          tabs={sidebarTabs}
          onTabChange={setActiveTab}
        />

        {/* Main Content Area */}
        <main className="ops-main">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'services' && <ServicesTab />}
          {activeTab === 'logs' && <LogsTab />}
          {activeTab === 'workflows' && <WorkflowsTab />}
          {activeTab === 'agents' && <AgentsTab />}
          {activeTab === 'snackmachine' && <SnackMachineTab />}
          {activeTab === 'snacks' && <SnacksTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </main>

        <OpsUIChatSheet />
      </div>

      {/* Snackbar — M3-style with Material Symbols icon */}
      {store.snackbar && (
        <div className={`m3-snackbar m3-snackbar--${store.snackbar.type}`}>
          <span className="m3-snackbar-icon material-symbols-outlined">
            {store.snackbar.type === 'success' ? 'check_circle' :
             store.snackbar.type === 'error' ? 'error' : 'info'}
          </span>
          <span className="m3-snackbar-text">{store.snackbar.message}</span>
          {store.snackbar.action && (
            <button className="m3-snackbar-action" onClick={store.dismissSnackbar}>
              {store.snackbar.action}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
