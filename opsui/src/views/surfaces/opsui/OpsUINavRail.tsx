/* ═══════════════════════════════════════════════════════════════════
   opsui NavRail — Server Operations Surface Sidebar
   ═══════════════════════════════════════════════════════════════════ */

import React from 'react'
import { useOpsUIStore } from './stores/opsUIStore'

interface NavTab {
  id: string
  icon: string
  label: string
}

interface OpsUINavRailProps {
  activeTab: string
  tabs: NavTab[]
  onTabChange: (tabId: string) => void
}

export default function OpsUINavRail({ activeTab, tabs, onTabChange }: OpsUINavRailProps) {
  const store = useOpsUIStore()

  return (
    <aside className={`opsui-nav-rail ${store.sidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Top Actions */}
      <div className="nav-rail-top">
        <button className="nav-rail-btn" onClick={store.toggleSidebar} title="Toggle sidebar">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="nav-rail-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-rail-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            title={tab.label}
          >
            <span className="material-symbols-outlined nav-rail-tab-icon">{tab.icon}</span>
            <span className="nav-rail-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="nav-rail-bottom">
        <button className="nav-rail-btn" onClick={store.toggleChat} title={store.chatOpen ? 'Close chat' : 'Open chat'}>
          <span className="material-symbols-outlined">chat</span>
        </button>
        <button className="nav-rail-btn" onClick={store.toggleTheme} title={store.isDark ? 'Light mode' : 'Dark mode'}>
          <span className="material-symbols-outlined">{store.isDark ? 'dark_mode' : 'light_mode'}</span>
        </button>
      </div>
    </aside>
  )
}
