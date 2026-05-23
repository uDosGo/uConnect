/* ═══════════════════════════════════════════════════════════════════
   @usx/react/surface — SurfaceNavRail
   Shared nav rail sidebar for all USX surfaces.
   Provides: collapse toggle, tab navigation, bottom actions (chat, theme)
   ═══════════════════════════════════════════════════════════════════ */
import React from 'react'
import { Icon } from './Icon'

export interface NavTab {
  id: string
  icon: string
  label: string
}

export interface SurfaceNavRailProps {
  collapsed: boolean
  onToggleCollapse: () => void
  activeTab: string
  tabs: NavTab[]
  onTabChange: (tabId: string) => void
  chatOpen: boolean
  onToggleChat: () => void
  isDark: boolean
  onToggleTheme: () => void
}

export const SurfaceNavRail: React.FC<SurfaceNavRailProps> = ({
  collapsed,
  onToggleCollapse,
  activeTab,
  tabs,
  onTabChange,
  chatOpen,
  onToggleChat,
  isDark,
  onToggleTheme,
}) => {
  return (
    <aside className={`usx-nav-rail ${collapsed ? 'collapsed' : ''}`}>
      {/* Top Actions */}
      <div className="nav-rail-top">
        <button className="nav-rail-btn" onClick={onToggleCollapse} title="Toggle sidebar">
          <Icon name="menu" size={20} />
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
            <Icon name={tab.icon} size={20} className="nav-rail-tab-icon" />
            <span className="nav-rail-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="nav-rail-bottom">
        <button className="nav-rail-btn" onClick={onToggleChat} title={chatOpen ? 'Close chat' : 'Open chat'}>
          <Icon name="chat" size={20} />
        </button>
        <button className="nav-rail-btn" onClick={onToggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}>
          <Icon name={isDark ? 'light_mode' : 'dark_mode'} size={20} />
        </button>
      </div>
    </aside>
  )
}
