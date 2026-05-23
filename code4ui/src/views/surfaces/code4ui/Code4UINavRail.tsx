/* ═══════════════════════════════════════════════════════════════════
   code4ui NavRail — Wireframe Surface Sidebar
   ═══════════════════════════════════════════════════════════════════ */

import React from 'react'
import { useCode4UIStore } from './stores/code4UIStore'

interface NavTab {
  id: string
  icon: string
  label: string
}

interface Code4UINavRailProps {
  activeTab: string
  tabs: NavTab[]
  onTabChange: (tabId: string) => void
}

export default function Code4UINavRail({ activeTab, tabs, onTabChange }: Code4UINavRailProps) {
  const store = useCode4UIStore()

  return (
    <aside className={`code4ui-nav-rail ${store.sidebarCollapsed ? 'collapsed' : ''}`}>
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
        <a
          href="http://localhost:5173"
          className="nav-rail-btn"
          title="Back to UI Hub"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="material-symbols-outlined">home</span>
        </a>
        <button className="nav-rail-btn" onClick={store.toggleChat} title={store.chatOpen ? 'Close chat' : 'Open chat'}>
          <span className="material-symbols-outlined">chat</span>
        </button>
        <button className="nav-rail-btn" onClick={store.toggleTheme} title={store.isDark ? 'Light mode' : 'Dark mode'}>
          <span className="material-symbols-outlined">{store.isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </div>
    </aside>
  )
}
