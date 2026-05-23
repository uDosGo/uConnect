/* ═══════════════════════════════════════════════════════════════════
   code4ui — Wireframe Surface (React)
   A wireframe-style dashboard with dashed borders and monospace font.
   Uses shared @usx/react components for SurfaceHeader, NavRail,
   ChatSheet, and Snackbar.
   ═══════════════════════════════════════════════════════════════════ */

import React, { useState, useCallback } from 'react'
import { useCode4UIStore } from './views/surfaces/code4ui/stores/code4UIStore'
import Code4UINavRail from './views/surfaces/code4ui/Code4UINavRail'
import Code4UIChatSheet from './views/surfaces/code4ui/Code4UIChatSheet'
import './views/surfaces/code4ui/styles/code4ui-theme.css'

// ─── Palette Colors ──────────────────────────────────────────────
const paletteColors: Record<string, string> = {
  wireframe: '#cccccc',
  blueprint: '#1565C0',
  terminal: '#00C853',
  paper: '#8D6E63',
}

const paletteOrder = ['wireframe', 'blueprint', 'terminal', 'paper'] as const

// ─── Sidebar Tabs ────────────────────────────────────────────────
const sidebarTabs = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'vault', icon: 'lock', label: 'Vault' },
  { id: 'surfaces', icon: 'dashboard_customize', label: 'Surfaces' },
  { id: 'settings', icon: 'settings', label: 'Settings' },
]

// ─── Wireframe Data ──────────────────────────────────────────────
const quickActions = [
  { icon: 'description', label: 'New Document' },
  { icon: 'upload_file', label: 'Upload File' },
  { icon: 'sync', label: 'Sync Vault' },
  { icon: 'search', label: 'Search' },
  { icon: 'settings', label: 'Settings' },
  { icon: 'dashboard', label: 'Dashboard' },
]

const activities = [
  { title: 'File uploaded', description: 'README.md was added to vault', time: '2m ago' },
  { title: 'Workflow completed', description: 'Backup workflow finished successfully', time: '15m ago' },
  { title: 'Sync completed', description: 'Vault synced with GitHub', time: '1h ago' },
  { title: 'New version', description: 'uDos v1.1.0 is now available', time: '2h ago' },
  { title: 'System update', description: 'MCP bridge reconnected', time: '3h ago' },
]

const services = [
  { name: 'Vault Service', status: 'up' as const, uptime: 99.9 },
  { name: 'MCP Bridge', status: 'up' as const, uptime: 99.8 },
  { name: 'GitHub Sync', status: 'up' as const, uptime: 99.5 },
  { name: 'USXD Renderer', status: 'degraded' as const, uptime: 95.2 },
  { name: 'Workflow Engine', status: 'up' as const, uptime: 99.7 },
]

const recentFiles = [
  { name: 'README.md', icon: 'description', size: '2.4 KB', date: '2 hours ago' },
  { name: 'config.yaml', icon: 'settings', size: '1.2 KB', date: '5 hours ago' },
  { name: 'notes.txt', icon: 'sticky_note_2', size: '0.8 KB', date: '1 day ago' },
  { name: 'workflow.json', icon: 'account_tree', size: '3.1 KB', date: '2 days ago' },
]

const tips = [
  'Use keyboard shortcut Ctrl+K to quickly search across all surfaces.',
  'You can drag and drop files directly into the Vault surface.',
  'Enable dark mode in Settings for reduced eye strain.',
  'Use the MCP Bridge to connect external tools and services.',
  'Workflows can be automated with the visual editor.',
  'Press ? to see all available keyboard shortcuts.',
]

// ─── Dashboard Tab ───────────────────────────────────────────────
function DashboardTab() {
  const [currentTip, setCurrentTip] = useState(tips[0])

  const nextTip = useCallback(() => {
    const currentIndex = tips.indexOf(currentTip)
    setCurrentTip(tips[(currentIndex + 1) % tips.length])
  }, [currentTip])

  return (
    <div className="wf-grid">
      {/* Welcome Card */}
      <div className="wf-card welcome-card">
        <div className="wf-card-content">
          <h2 className="wf-heading">Welcome back!</h2>
          <p className="wf-text">You have <strong>3 pending tasks</strong> and <strong>2 unread notifications</strong>.</p>
          <div className="wf-stats-row">
            <div className="wf-stat">
              <span className="wf-stat-value">42</span>
              <span className="wf-stat-label">Files</span>
            </div>
            <div className="wf-stat">
              <span className="wf-stat-value">12</span>
              <span className="wf-stat-label">Workflows</span>
            </div>
            <div className="wf-stat">
              <span className="wf-stat-value">8</span>
              <span className="wf-stat-label">Tools</span>
            </div>
            <div className="wf-stat">
              <span className="wf-stat-value">5</span>
              <span className="wf-stat-label">Surfaces</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="wf-card actions-card">
        <div className="wf-card-header">
          <h3>Quick Actions</h3>
        </div>
        <div className="wf-card-content">
          {quickActions.map(action => (
            <div key={action.label} className="wf-action-row">
              <span className="material-symbols-outlined wf-action-icon">{action.icon}</span>
              <span className="wf-action-label">{action.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="wf-card activity-card">
        <div className="wf-card-header">
          <h3>Recent Activity</h3>
          <span className="wf-badge">Live</span>
        </div>
        <div className="wf-card-content">
          {activities.map(item => (
            <div key={item.title} className="wf-activity-row">
              <div className="wf-activity-dot"></div>
              <div className="wf-activity-info">
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
              <span className="wf-activity-time">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="wf-card status-card">
        <div className="wf-card-header">
          <h3>System Status</h3>
        </div>
        <div className="wf-card-content">
          {services.map(service => (
            <div key={service.name} className="wf-service-row">
              <div className="wf-service-info">
                <span className="wf-service-name">{service.name}</span>
                <span className={`wf-service-status ${service.status}`}>
                  {service.status === 'up' ? '● Online' : service.status === 'degraded' ? '● Degraded' : '● Offline'}
                </span>
              </div>
              <div className="wf-bar">
                <div className="wf-bar-fill" style={{ width: `${service.uptime}%` }}></div>
              </div>
              <span className="wf-service-uptime">{service.uptime}% uptime</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Files */}
      <div className="wf-card files-card">
        <div className="wf-card-header">
          <h3>Recent Files</h3>
          <span className="wf-text-link">View All →</span>
        </div>
        <div className="wf-card-content">
          {recentFiles.map(file => (
            <div key={file.name} className="wf-file-row">
              <span className="material-symbols-outlined wf-file-icon">{file.icon}</span>
              <div className="wf-file-info">
                <span className="wf-file-name">{file.name}</span>
                <span className="wf-file-date">{file.date}</span>
              </div>
              <span className="wf-file-size">{file.size}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips Card */}
      <div className="wf-card tips-card">
        <div className="wf-card-header">
          <h3>
            <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>lightbulb</span>
            Tips & Tricks
          </h3>
        </div>
        <div className="wf-card-content">
          <p className="wf-text">{currentTip}</p>
          <span className="wf-text-link" onClick={nextTip} style={{ cursor: 'pointer' }}>Show another tip →</span>
        </div>
      </div>
    </div>
  )
}

// ─── Settings Panel ──────────────────────────────────────────────
function SettingsPanel() {
  const store = useCode4UIStore()

  const fontStyleIcon = (() => {
    switch (store.fontStyle) {
      case 'serif': return 'format_italic'
      case 'sans': return 'text_fields'
      case 'mono': return 'code'
    }
  })()

  const currentSwatchColor = paletteColors[store.currentPalette] || '#cccccc'

  return (
    <div className="wf-grid">
      {/* Appearance */}
      <div className="wf-card">
        <div className="wf-card-header"><h3>Appearance</h3></div>
        <div className="wf-card-content" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Theme */}
          <div className="wf-action-row" onClick={store.toggleTheme} style={{ cursor: 'pointer' }}>
            <span className="material-symbols-outlined wf-action-icon">{store.isDark ? 'dark_mode' : 'light_mode'}</span>
            <span className="wf-action-label">{store.isDark ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          {/* Palette */}
          <div className="wf-action-row" onClick={store.cyclePalette} style={{ cursor: 'pointer' }}>
            <span className="swatch-dot" style={{ '--swatch-color': currentSwatchColor } as React.CSSProperties}></span>
            <span className="wf-action-label">Palette: {store.currentPalette}</span>
          </div>
        </div>
      </div>

      {/* Font */}
      <div className="wf-card">
        <div className="wf-card-header"><h3>Font</h3></div>
        <div className="wf-card-content" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Font Style */}
          <div className="wf-action-row" onClick={store.cycleFontStyle} style={{ cursor: 'pointer' }}>
            <span className="material-symbols-outlined wf-action-icon">{fontStyleIcon}</span>
            <span className="wf-action-label">Style: {store.fontStyle}</span>
          </div>
          {/* Font Size */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="header-btn" onClick={store.decreaseFontSize} title="Smaller font">
              <span className="material-symbols-outlined">text_decrease</span>
            </button>
            <span className="wf-action-label">{store.fontSize}px</span>
            <button className="header-btn" onClick={store.increaseFontSize} title="Larger font">
              <span className="material-symbols-outlined">text_increase</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="wf-card">
        <div className="wf-card-header"><h3>Chat</h3></div>
        <div className="wf-card-content">
          <div className="wf-action-row" onClick={store.toggleChat} style={{ cursor: 'pointer' }}>
            <span className="material-symbols-outlined wf-action-icon">chat</span>
            <span className="wf-action-label">{store.chatOpen ? 'Close Chat Panel' : 'Open Chat Panel'}</span>
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
  const store = useCode4UIStore()
  const [activeTab, setActiveTab] = useState('dashboard')

  const activeTabLabel = sidebarTabs.find(t => t.id === activeTab)?.label || 'Dashboard'

  const fontStyleIcon = (() => {
    switch (store.fontStyle) {
      case 'serif': return 'format_italic'
      case 'sans': return 'text_fields'
      case 'mono': return 'code'
    }
  })()

  const currentSwatchColor = paletteColors[store.currentPalette] || '#cccccc'

  return (
    <div
      className={`code4ui-surface ${store.isDark ? 'code4ui-dark' : ''}`}
      data-font-style={store.fontStyle}
      data-palette={store.currentPalette}
      style={{ '--code4ui-font-size': `${store.fontSize}px` } as React.CSSProperties}
    >
      {/* Surface Header — minimal: home + breadcrumb only */}
      <header className="surface-header">
        <div className="header-left">
          <a
            href="http://localhost:5173"
            className="header-btn"
            title="Back to UI Hub"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="material-symbols-outlined">home</span>
          </a>
        </div>
        <div className="header-center">
          <div className="header-breadcrumb">
            <span className="breadcrumb-item">Bedstead</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-item breadcrumb-current">{activeTabLabel}</span>
          </div>
        </div>
        <div className="header-right">
        </div>
      </header>

      {/* Workspace Layout */}
      <div className="workspace-layout">
        <Code4UINavRail
          activeTab={activeTab}
          tabs={sidebarTabs}
          onTabChange={setActiveTab}
        />

        {/* Main Content Area */}
        <main className="wf-main">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'vault' && (
            <PlaceholderPanel icon="lock" title="Vault" description="Vault management panel — coming soon." />
          )}
          {activeTab === 'surfaces' && (
            <PlaceholderPanel icon="dashboard_customize" title="Surfaces" description="Surface management panel — coming soon." />
          )}
          {activeTab === 'settings' && (
            <SettingsPanel />
          )}
        </main>

        <Code4UIChatSheet />
      </div>

      {/* Snackbar */}
      {store.snackbar && (
        <div className={`m3-snackbar m3-snackbar--${store.snackbar.type}`}>
          <span>{store.snackbar.message}</span>
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
