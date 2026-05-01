import { useEffect, useState } from 'react';
import './styles.css';
import EditorView from './views/EditorView';
import Reader from './views/Reader';
import TaskView from './views/TaskView';

// ─── Gift Registry ───
const GIFTS = [
  { id: 'lists',   label: 'Lists',   type: 'Cardview', desc: 'Tasks & items',  icon: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z', gift: true },
  { id: 'editor',  label: 'Editor',  type: 'Markdown', desc: 'Write & preview', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8', gift: true },
  { id: 'reader',  label: 'Reader',  type: 'Prose',    desc: 'Distraction-free', icon: 'M4 6h16M4 12h16M4 18h12', gift: true },
  // uCode1 Gifts
  { id: 'terminal',label: 'Terminal',type: 'Mode 1',   desc: 'BBC-style console', icon: 'M4 17V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12M4 17h16M8 21h8M12 17v4', gift: true },
  { id: 'dashboard',label: 'Dashboard',type: 'Mode 2',desc: 'NES-style panels',  icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', gift: true },
  { id: 'teletext',label: 'Teletext',type: 'Mode 3',   desc: 'Ceefax page view', icon: 'M4 4h16v16H4zM4 8h16M8 4v16M12 4v16M16 4v16', gift: true },
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
  const [currentSurface, setCurrentSurface] = useState('lists');
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

  const surface = GIFTS.find(s => s.id === currentSurface) || GIFTS[0];

  const surfaceIcons = Object.fromEntries(GIFTS.map(s => [s.id, s.icon]));

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
          {GIFTS.map(s => (
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
    case 'lists':
      return <TaskView />;
    case 'editor':
      return <EditorView />;
    case 'reader':
      return <Reader />;
    case 'terminal':
      return <TerminalGift />;
    case 'dashboard':
      return <DashboardGift />;
    case 'teletext':
      return <TeletextGift />;
    default:
      return <div className="surface-loading"><span className="spinner">🎁</span><span>Select a Gift</span></div>;
  }
}

/* ─── uCode1 Gifts ─── */

function TerminalGift() {
  return (
    <div className="gift-terminal">
      <pre>{`┌──────────────────────────────────────┐
│  uCode1 Terminal  MODE 1             │
│                                      │
│  BBC BASIC (C)1982 Acorn             │
│                                      │
│  >READY.                             │
│  >10 PRINT "Hello, Gift Wrapper!"    │
│  >20 GOTO 10                         │
│  >RUN                                │
│  Hello, Gift Wrapper!                │
│  Hello, Gift Wrapper!                │
│  Hello, Gift Wrapper!                │
│  BREAK                               │
│  >_                                  │
│                                      │
│  ───────────────────────────────     │
│  [80x24] LINE 24  COL 40             │
└──────────────────────────────────────┘`}</pre>
    </div>
  );
}

function DashboardGift() {
  return (
    <div className="gift-dashboard">
      <div className="dash-grid">
        <div className="dash-tile dash-tile-wide">
          <div className="dash-label">System</div>
          <div className="dash-value">Gift Wrapper v0.1.0</div>
        </div>
        <div className="dash-tile">
          <div className="dash-label">CPU</div>
          <div className="dash-value">42%</div>
        </div>
        <div className="dash-tile">
          <div className="dash-label">MEM</div>
          <div className="dash-value">1.2G</div>
        </div>
        <div className="dash-tile dash-tile-wide">
          <div className="dash-label">Vault</div>
          <div className="dash-value">12 items</div>
        </div>
        <div className="dash-tile">
          <div className="dash-label">Tasks</div>
          <div className="dash-value">7</div>
        </div>
        <div className="dash-tile">
          <div className="dash-label">Docs</div>
          <div className="dash-value">3</div>
        </div>
      </div>
    </div>
  );
}

function TeletextGift() {
  return (
    <div className="gift-teletext">
      <pre>{`┌──────────────────────────────────────────┐
│  uCode1 Ceefax  PAGE 101  MODE 3        │
│                                          │
│           WELCOME TO GIFT WRAPPER        │
│                                          │
│  1.  Lists        — Task manager         │
│  2.  Editor       — Markdown writer      │
│  3.  Reader       — Prose view           │
│  4.  Terminal     — BBC BASIC console    │
│  5.  Dashboard    — System overview      │
│  6.  Vault Browser - File explorer       │
│  7.  Settings     - Preferences          │
│                                          │
│  ─────────────────────────────────────  │
│  SELECT PAGE: [101]  NEWS: OK            │
└──────────────────────────────────────────┘`}</pre>
    </div>
  );
}

export default App;
