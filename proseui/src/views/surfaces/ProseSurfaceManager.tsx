/* ═══════════════════════════════════════════════════════════════════
   ProseSurfaceManager — App Shell with Topbar and Outlet
   Uses CSS palette classes from @usx/palettes/base.css for theming.
   ═══════════════════════════════════════════════════════════════════ */

import React, { useEffect, useState, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@usx/styles/react/icon";
import { useProseUIStore } from "../surfaces/proseui/stores/proseUIStore";
import "@usx/styles/palettes";
import "../surfaces/proseui/styles/proseui-theme.css";

const NAV_TABS = [
  { id: 'board', icon: 'view_column', label: 'Board' },
  { id: 'list', icon: 'format_list_bulleted', label: 'List' },
  { id: 'prose', icon: 'article', label: 'Prose' },
  { id: 'editor', icon: 'edit_note', label: 'Editor' },
  { id: 'story', icon: 'menu_book', label: 'Story' },
]

const MORE_TABS = [
  { id: 'vibe', icon: 'school', label: 'Vibe Terminal' },
  { id: 'vault', icon: 'folder_open', label: 'Vault Browser' },
  { id: 'workflow', icon: 'account_tree', label: 'Workflow Manager' },
  { id: 'tools', icon: 'tune', label: 'Tool Builder' },
  { id: 'settings', icon: 'settings', label: 'Settings' },
]

const ProseSurfaceManager: React.FC = () => {
  const store = useProseUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [panelOpen, setPanelOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Derive active tab from current path
  const currentTab = location.pathname.split('/').pop() || 'board'

  // Close panels on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    if (panelOpen || moreOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [panelOpen, moreOpen]);

  // Set document title and sync font size to root <html> so rem units scale
  useEffect(() => {
    document.title = "proseui";
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${store.fontSize}px`;
  }, [store.fontSize]);

  // Build CSS classes: palette class + dark mode + font style
  const shellClasses = [
    'app-shell',
    store.palette.cssClass,
    store.themeMode === 'dark' ? 'usx-dark' : '',
    `font-${store.fontStyle}`,
  ].filter(Boolean).join(' ');

  return (
    <div className={shellClasses}>
      {/* ═══ Topbar ═══ */}
      <header className="proseui-header">
        <div className="proseui-header-left">
          {/* Home button — back to UI Hub */}
          <a
            href="http://localhost:5176"
            className="proseui-header-btn proseui-home-btn"
            title="Back to UI Hub"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="home" size={18} />
          </a>
          <span className="proseui-header-sep" />
          <h1 className="proseui-header-title">proseui</h1>
          <span className="proseui-header-sep" />
          {/* Navigation tabs */}
          <nav className="proseui-header-nav">
            {NAV_TABS.map(tab => (
              <button
                key={tab.id}
                className={`proseui-header-nav-btn ${currentTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  store.setActiveView(tab.id === 'board' ? 'kanban' : tab.id === 'list' ? 'table' : tab.id)
                  navigate(`/surface/${tab.id}`)
                }}
                title={tab.label}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
            {/* More dropdown */}
            <div className="proseui-header-dropdown-wrapper" ref={moreRef}>
              <button
                className={`proseui-header-nav-btn ${moreOpen ? 'active' : ''}`}
                onClick={() => setMoreOpen(prev => !prev)}
                title="More surfaces"
              >
                <Icon name="more" size={16} />
                <span>More</span>
              </button>
              {moreOpen && (
                <div className="proseui-header-dropdown">
                  {MORE_TABS.map(tab => (
                    <button
                      key={tab.id}
                      className={`proseui-header-dropdown-item ${currentTab === tab.id ? 'active' : ''}`}
                      onClick={() => {
                        navigate(`/surface/${tab.id}`)
                        setMoreOpen(false)
                      }}
                    >
                      <Icon name={tab.icon} size={16} />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                  <div className="proseui-header-dropdown-divider" />
                  <a
                    href="http://localhost:5178"
                    className="proseui-header-dropdown-item"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMoreOpen(false)}
                  >
                    <Icon name="dns" size={16} />
                    <span>Server Operations</span>
                  </a>
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="proseui-header-controls">
          {/* M3-style toolbar group for font/size/theme */}
          <div className="proseui-header-toolbar">
            <button
              className="proseui-toolbar-btn"
              onClick={store.decreaseFont}
              title="Decrease font size"
            >
              <Icon name="text_decrease" size={18} />
            </button>
            <button
              className="proseui-toolbar-btn"
              onClick={store.increaseFont}
              title="Increase font size"
            >
              <Icon name="text_increase" size={18} />
            </button>
            <span className="proseui-toolbar-divider" />
            <button
              className="proseui-toolbar-btn"
              onClick={store.cycleFontStyle}
              title="Cycle font style"
            >
              <Icon name="format_size" size={18} />
            </button>
            <span className="proseui-toolbar-divider" />
            <button
              className="proseui-toolbar-btn"
              onClick={store.toggleTheme}
              title="Toggle light/dark"
            >
              <Icon
                name={store.themeMode === "light" ? "dark_mode" : "light_mode"}
                size={18}
              />
            </button>
          </div>

          <span className="proseui-header-sep" />
          {/* Chat panel toggle */}
          <button
            className="proseui-header-btn"
            onClick={store.toggleChat}
            title="Toggle chat panel"
          >
            <Icon name={store.chatOpen ? "chat" : "chat"} size={18} />
          </button>
          <span className="proseui-header-sep" />
          {/* Scheme picker — opens slide-out */}
          <button
            onClick={() => setPanelOpen((prev) => !prev)}
            className="proseui-header-btn proseui-header-btn-round"
            title="Colour schemes"
          >
            <Icon name="palette" size={20} />
          </button>
        </div>
      </header>

      {/* ═══ Slide-out Scheme Picker ═══ */}
      {panelOpen && (
        <div className="proseui-control-panel" ref={panelRef}>
          <div className="proseui-control-panel-header">
            <span className="proseui-control-panel-title">Colour Schemes</span>
            <button
              className="proseui-control-panel-close"
              onClick={() => setPanelOpen(false)}
              title="Close"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
          <div className="proseui-control-panel-body">
            {store.palettes.map((p) => {
              const active = p.id === store.palette.id;
              return (
                <button
                  key={p.id}
                  className={`proseui-scheme-btn ${active ? "active" : ""}`}
                  onClick={() => {
                    store.setPalette(p);
                    setPanelOpen(false);
                  }}
                >
                  <div className="proseui-scheme-swatches">
                    <span
                      className="proseui-scheme-swatch"
                      style={{ background: p.lightBg }}
                    />
                    <span
                      className="proseui-scheme-swatch"
                      style={{ background: p.lightAccent }}
                    />
                    <span
                      className="proseui-scheme-swatch"
                      style={{ background: p.darkBg }}
                    />
                    <span
                      className="proseui-scheme-swatch"
                      style={{ background: p.darkAccent }}
                    />
                  </div>
                  <span className="proseui-scheme-label">{p.label}</span>
                  {active && <Icon name="check" size={14} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Body ═══ */}
      <div className="proseui-body">
        <main className="proseui-main">
          <Outlet />
        </main>

        {/* ═══ Chat Sheet (persistent across all surfaces, hidden on Vibe) ═══ */}
        {store.chatOpen && location.pathname !== '/surface/vibe' && (
          <div className="proseui-chat-sheet">
            <div className="chat-messages">
              {store.chatMessages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.role}`}>
                  <span className="chat-role">{msg.role === 'user' ? 'You' : 'Assistant'}</span>
                  <p>{msg.content}</p>
                </div>
              ))}
            </div>
            <div className="chat-input-row">
              <input
                className="chat-input"
                type="text"
                value={store.chatInput}
                onChange={e => store.setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') store.sendChat() }}
                placeholder="Ask about documents, publishing, or anything..."
              />
              <button className="chat-send-btn" onClick={store.sendChat} title="Send">
                <Icon name="send" size="sm" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProseSurfaceManager;
