import { useEffect, useState } from 'react';

const SURFACES = [
  { id: 'notionish',   label: 'Notionish',    type: 'editor',   desc: 'Rich text / database editor' },
  { id: 'milkdown',    label: 'Milkdown',     type: 'editor',   desc: 'Markdown editor' },
  { id: 'bbcbasic',    label: 'BBC BASIC',    type: 'terminal', desc: 'C64-style terminal' },
  { id: 'nesdash',     label: 'NES Dashboard',type: 'dashboard',desc: 'Retro NES.css dashboard' },
  { id: 'ceefax',      label: 'Ceefax',       type: 'teletext', desc: 'Teletext page viewer' },
  { id: 'retro',       label: 'Retro',        type: 'mix',      desc: 'Retro mixed surface' },
];

function App() {
  const [currentSurface, setCurrentSurface] = useState('notionish');
  const [systemInfo, setSystemInfo] = useState(null);

  useEffect(() => {
    // Try Tauri API, fall back to static info
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

  const surface = SURFACES.find(s => s.id === currentSurface) || SURFACES[0];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <nav style={{
        width: 220, background: '#16213e', padding: '12px',
        display: 'flex', flexDirection: 'column', gap: '4px',
        borderRight: '1px solid #0f3460', overflowY: 'auto'
      }}>
        <h2 style={{ color: '#e94560', fontSize: 14, margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: 1 }}>
          ⚡ ThinUI
        </h2>
        {SURFACES.map(s => (
          <button key={s.id} onClick={() => setCurrentSurface(s.id)}
            style={{
              padding: '10px 12px', border: 'none', borderRadius: 6, cursor: 'pointer',
              textAlign: 'left', fontSize: 13,
              background: currentSurface === s.id ? '#0f3460' : 'transparent',
              color: currentSurface === s.id ? '#e94560' : '#a0a0b0',
              fontWeight: currentSurface === s.id ? 600 : 400,
            }}
            onMouseEnter={e => e.target.style.background = '#1a1a3e'}
            onMouseLeave={e => e.target.style.background = currentSurface === s.id ? '#0f3460' : 'transparent'}
          >
            <div style={{ fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: '#707080' }}>{s.desc}</div>
          </button>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #0f3460', fontSize: 11, color: '#505060' }}>
          {systemInfo && (
            <>
              <div>v{systemInfo.version}</div>
              <div>Socket: {systemInfo.mcp_socket}</div>
            </>
          )}
        </div>
      </nav>

      {/* Surface Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Surface toolbar */}
        <div style={{
          padding: '8px 16px', background: '#16213e',
          borderBottom: '1px solid #0f3460',
          display: 'flex', alignItems: 'center', gap: 12, fontSize: 13
        }}>
          <span style={{ color: '#e94560', fontWeight: 600 }}>{surface.label}</span>
          <span style={{ color: '#606070' }}>•</span>
          <span style={{ color: '#808090' }}>{surface.type}</span>
          <div style={{ flex: 1 }} />
          <span style={{ color: '#505060', fontSize: 11 }}>{systemInfo?.mcp_socket || ''}</span>
        </div>

        {/* Surface iframe / content area */}
        <div style={{ flex: 1, overflow: 'auto', background: '#1a1a2e' }}>
          <SurfaceFrame surface={currentSurface} />
        </div>
      </main>
    </div>
  );
}

function SurfaceFrame({ surface }) {
  const base = import.meta.env.BASE_URL || '/';

  switch (surface) {
    case 'notionish':
      return <iframe src={`${base}notionish/`} style={{ width: '100%', height: '100%', border: 'none' }} title="Notionish" />;
    case 'milkdown':
      return <iframe src={`${base}milkdown/`} style={{ width: '100%', height: '100%', border: 'none' }} title="Milkdown" />;
    case 'bbcbasic':
      return <IframePreview path="themes/bbcbasic/index.html" label="BBC BASIC Terminal" />;
    case 'nesdash':
      return <IframePreview path="themes/nesdash/index.html" label="NES Dashboard" />;
    case 'ceefax':
      return (
        <div style={{ padding: 20, fontFamily: 'monospace' }}>
          <h3 style={{ color: '#e94560' }}>Ceefax Teletext</h3>
          <pre style={{ background: '#000', color: '#0ff', padding: 16, borderRadius: 8, fontSize: 14, lineHeight: 1.3 }}>
{`┌──────────────────────────────────────────┐
│  uDos Ceefax  PAGE 101                    │
│                                          │
│  Welcome to uCode2 Teletext              │
│                                          │
│  1. System Dashboard                     │
│  2. Vault Notes                          │
│  3. Snack Runner                         │
│  4. Spatial Map                          │
│  5. Settings                             │
│                                          │
│  ─────────────────────────────────────  │
│  SELECT PAGE: [101] NEWS: OK             │
└──────────────────────────────────────────┘`}
          </pre>
        </div>
      );
    case 'retro':
      return <IframePreview path="themes/retro/index.html" label="Retro Surface" />;
    default:
      return <div style={{ padding: 40, textAlign: 'center', color: '#606070' }}>Select a surface</div>;
  }
}

function IframePreview({ path, label }) {
  // Serve from uCode1/themes via Vite proxy or absolute path
  // In dev mode, Vite proxies /ucef1/ to ../uCode1 (configure in vite.config.js)
  const themeUrl = `/ucef1/themes/${path}`;
  const [loadError, setLoadError] = useState(false);

  return loadError ? (
    <div style={{ padding: 20, fontFamily: 'monospace', color: '#e94560' }}>
      <h4 style={{ margin: '0 0 8px 0' }}>{label}</h4>
      <p>Theme not loaded. Ensure themes are served (run from uCode1 directory or configure Vite proxy).</p>
      <p style={{ fontSize: 12, color: '#808090' }}>Expected at: <code>{themeUrl}</code></p>
    </div>
  ) : (
    <iframe
      src={themeUrl}
      style={{ width: '100%', height: '100%', border: 'none' }}
      title={label}
      onError={() => setLoadError(true)}
    />
  );
}

export default App;
