/* ═══════════════════════════════════════════════════════════════════
   code3ui — NavRail Sidebar (React)
   ═══════════════════════════════════════════════════════════════════ */
import React from 'react'
import { useCode3UIStore } from './stores/code3UIStore'

interface NavTab {
  id: string
  icon: string
  label: string
}

interface Code3UINavRailProps {
  activeTab: string
  tabs: NavTab[]
  onTabChange: (tabId: string) => void
}

const Code3UINavRail: React.FC<Code3UINavRailProps> = ({ activeTab, tabs, onTabChange }) => {
  const store = useCode3UIStore()

  return (
    <aside className={`code3ui-nav-rail ${store.sidebarCollapsed ? 'collapsed' : ''}`}>
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
          <span className="material-symbols-outlined">{store.isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </div>
    </aside>
  )
}

export default Code3UINavRail
