import { useEffect, useState } from 'react';
import './styles.css';
import DocView from './views/DocView';
import Reader from './views/Reader';
import TaskView from './views/TaskView';

const SURFACES = [
  { id: 'taskview', label: 'TaskView',    type: 'Cardview',   desc: 'Notionish task board', icon: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z' },
  { id: 'docview',  label: 'DocView',     type: 'Editor',   desc: 'Typo-style Markdown', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
  { id: 'reader',   label: 'Reader',      type: 'Prose',    desc: 'Distraction-free read', icon: 'M4 6h16M4 12h16M4 18h12' },
];

// Prevent nesting: if we're inside an iframe, render nothing (avoids shell-in-shell)
function isInsideIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function App() {
  const [currentSurface, setCurrentSurface] = useState('taskview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);

  // If we're inside an iframe, render a blank surface to prevent nesting
  if (isInsideIframe()) {
    return null;
  }

  useEffect(() => {
    try {
      const { invoke } = window.__TAURI__?.tauri || {};
      if (invoke) {
        invoke('get_system_info').then(setSystemInfo);
      }
    } catch {}
    if (!systemInfo) {
      setSystemInfo({ version: '0.1.0', surface: currentSurface, vault_path: '~/Code/Vault', mcp_socket: '~/.local/share/udos/mcp/core.sock' });
    }
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  const surface = SURFACES.find(s => s.id === currentSurface) || SURFACES[0];

  const surfaceIcons = Object.fromEntries(SURFACES.map(s => [s.id, s.icon]));

  return (
    <div className="shell-layout">
      {/* Overlay backdrop */}
      <div className={`gw-sidebar-overlay${sidebarOpen ? ' open' : ''}`} onClick={closeSidebar} />

      {/* Floating Sidebar (right) */}
      <aside className={`gw-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <svg className="sidebar-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M20 12v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2"/>
            <path d="M4 8h16v4H4z"/>
            <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <path d="M12 8v10"/>
            <path d="M8 13h8"/>
          </svg>
          <span className="sidebar-title">Wrapper</span>
          <button className="sidebar-close-btn" onClick={closeSidebar} title="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="sidebar-menu">
          {SURFACES.map(s => (
            <button
              key={s.id}
              className={`sidebar-item${currentSurface === s.id ? ' active' : ''}`}
              onClick={() => { setCurrentSurface(s.id); closeSidebar(); }}
            >
              <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={surfaceIcons[s.id] || 'M12 2L2 7l10 5 10-5-10-5z'}/>
              </svg>
              <div>
                <div className="sidebar-item-label">{s.label}</div>
                <div className="sidebar-item-desc">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <span>{systemInfo ? `v${systemInfo.version}` : ''}</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="gw-content">
        {/* Surface bar — minimal Typo-style */}
        <div className="surface-bar">
          <span className="surface-bar-label">{surface.label}</span>
          <span className="surface-bar-divider">•</span>
          <span className="surface-bar-type">{surface.type}</span>
          <div style={{ flex: 1 }} />
          <span className="surface-bar-socket">{surface.desc}</span>
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} title="Open surfaces">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
        </div>

        {/* Surface frame */}
        <div className="surface-frame">
          <SurfaceFrame surface={currentSurface} />
        </div>
      </main>
    </div>
  );
}

function SurfaceFrame({ surface }) {
  switch (surface) {
    case 'taskview':
      return <TaskView />;
    case 'docview':
      return <DocView />;
    case 'reader':
      return <Reader />;
    default:
      return <div className="surface-loading"><span className="spinner">🎁</span><span>Select a surface</span></div>;
  }
}

export default App;
