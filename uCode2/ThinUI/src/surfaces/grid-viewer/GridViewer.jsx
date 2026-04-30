import { useCallback, useEffect, useState } from 'react';

const API_BASE = 'http://127.0.0.1:8001/api/thinui';

const EXAMPLE_GRIDS = {
  'box-simple': `┌─────┐
│  A  │
└─────┘`,
  'grid-3x3': `┌───┬───┬───┐
│ 1 │ 2 │ 3 │
├───┼───┼───┤
│ 4 │ 5 │ 6 │
├───┼───┼───┤
│ 7 │ 8 │ 9 │
└───┴───┴───┘`,
  'teletext-header': `╔══════════════════╗
║  uDos Teletext   ║
║  Page 101        ║
╚══════════════════╝`,
};

function GridViewer() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [inputText, setInputText] = useState(EXAMPLE_GRIDS['grid-3x3']);
  const [gridData, setGridData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeExample, setActiveExample] = useState('grid-3x3');
  const [renderMode, setRenderMode] = useState('html'); // html | raw | text

  // Check API health
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(r => r.json())
      .then(data => {
        setApiStatus(data.status === 'ok' ? 'online' : 'error');
      })
      .catch(() => setApiStatus('offline'));
  }, []);

  // Parse grid via API
  const parseGrid = useCallback(async (text) => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, title: 'Grid Viewer' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Parse failed');
      }
      const data = await res.json();
      setGridData(data);
    } catch (e) {
      setError(e.message);
      setGridData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load example
  const loadExample = (key) => {
    setActiveExample(key);
    setInputText(EXAMPLE_GRIDS[key]);
    parseGrid(EXAMPLE_GRIDS[key]);
  };

  // Initial parse
  useEffect(() => {
    parseGrid(EXAMPLE_GRIDS['grid-3x3']);
  }, []);

  const cellStyle = (cell) => ({
    display: 'inline-block',
    width: 28,
    height: 28,
    lineHeight: '28px',
    textAlign: 'center',
    fontFamily: "'Courier New', monospace",
    fontSize: 14,
    color: cell.fgColor ? cssColor(cell.fgColor) : '#c0c0d0',
    background: cell.bgColor ? cssColor(cell.bgColor) : 'transparent',
  });

  const styles = {
    container: {
      display: 'flex', height: '100%',
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: '#e0e0f0', background: '#1a1a2e',
    },
    sidebar: {
      width: 260, padding: 16,
      borderRight: '1px solid #0f3460',
      display: 'flex', flexDirection: 'column', gap: 12,
      overflowY: 'auto', background: '#16213e',
    },
    main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    editor: {
      flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
    },
    textarea: {
      flex: 1, width: '100%', minHeight: 160,
      background: '#0d1b2a', color: '#e0e0f0', border: '1px solid #0f3460',
      borderRadius: 6, padding: 12, fontFamily: "'Courier New', monospace", fontSize: 13,
      resize: 'vertical',
    },
    label: { fontSize: 12, color: '#808090', textTransform: 'uppercase', letterSpacing: 1 },
    btn: {
      padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer',
      fontSize: 13, fontWeight: 600,
    },
    gridContainer: {
      flex: 1, padding: 20, overflow: 'auto',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    },
    gridBox: {
      background: '#0d1b2a', border: '1px solid #0f3460',
      borderRadius: 8, padding: 16,
      display: 'inline-block',
    },
    cellRow: { display: 'flex', lineHeight: 1 },
    rawCell: {
      display: 'inline-block', width: 22, height: 22, lineHeight: '22px',
      textAlign: 'center', fontFamily: "'Courier New', monospace", fontSize: 13,
      color: '#c0c0d0',
    },
    statusDot: {
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      marginRight: 6,
    },
  };

  const statusColor = apiStatus === 'online' ? '#4caf50'
    : apiStatus === 'offline' ? '#f44336' : '#ff9800';

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div>
          <span style={{ ...styles.statusDot, background: statusColor }} />
          <span style={{ fontSize: 12 }}>API: {apiStatus}</span>
          {apiStatus === 'offline' && (
            <div style={{ fontSize: 11, color: '#f44336', marginTop: 4 }}>
              Start: <code>python3 -m core_py.thinui.api</code>
            </div>
          )}
        </div>

        <div>
          <div style={styles.label}>Examples</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
            {Object.keys(EXAMPLE_GRIDS).map(key => (
              <button key={key} onClick={() => loadExample(key)}
                style={{
                  ...styles.btn, textAlign: 'left',
                  background: activeExample === key ? '#0f3460' : 'transparent',
                  color: activeExample === key ? '#e94560' : '#a0a0b0',
                }}>
                {key.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={styles.label}>Render Mode</div>
          <select value={renderMode} onChange={e => setRenderMode(e.target.value)}
            style={{
              width: '100%', marginTop: 6, padding: '6px 8px',
              background: '#0d1b2a', color: '#e0e0f0', border: '1px solid #0f3460',
              borderRadius: 4, fontSize: 12,
            }}>
            <option value="html">HTML Grid</option>
            <option value="raw">Raw Cells</option>
            <option value="text">Plain Text</option>
          </select>
        </div>

        {gridData && (
          <div style={{ fontSize: 11, color: '#606070' }}>
            <div>Size: {gridData.rows}×{gridData.cols}</div>
            <div>Format: {gridData.format}</div>
            {gridData.components?.length > 0 && (
              <div>Components: {gridData.components.length}</div>
            )}
          </div>
        )}
      </div>

      {/* Main */}
      <div style={styles.main}>
        {/* Editor */}
        <div style={styles.editor}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={styles.label}>ASCII Grid Input</span>
            <div style={{ flex: 1 }} />
            <button onClick={() => parseGrid(inputText)}
              style={{ ...styles.btn, background: '#e94560', color: '#fff' }}
              disabled={loading}>
              {loading ? '🔃 Parsing...' : '▶ Parse'}
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            style={styles.textarea}
            placeholder="Paste ASCII grid text here..."
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            margin: '0 16px 16px', padding: '8px 12px',
            background: '#3e0000', border: '1px solid #f44336',
            borderRadius: 6, fontSize: 13, color: '#ff8a80',
          }}>
            ❌ {error}
          </div>
        )}

        {/* Grid Render */}
        <div style={styles.gridContainer}>
          {gridData && renderMode === 'html' && (
            <div style={styles.gridBox}>
              {gridData.cells.map((row, ri) => (
                <div key={ri} style={styles.cellRow}>
                  {row.map((cell, ci) => (
                    <span key={ci} style={cellStyle(cell)}>{cell.char}</span>
                  ))}
                </div>
              ))}
              <div style={{ marginTop: 8, textAlign: 'center', fontSize: 11, color: '#606070' }}>
                {gridData.rows}×{gridData.cols} grid · {gridData.format} format
              </div>
            </div>
          )}

          {gridData && renderMode === 'raw' && (
            <div style={{ ...styles.gridBox, maxHeight: '100%', overflow: 'auto' }}>
              <pre style={{ fontSize: 11, color: '#a0a0b0', margin: 0 }}>
                {JSON.stringify(gridData, null, 2)}
              </pre>
            </div>
          )}

          {gridData && renderMode === 'text' && (
            <div style={{ ...styles.gridBox }}>
              {gridData.cells.map((row, ri) => (
                <div key={ri} style={styles.cellRow}>
                  {row.map((cell, ci) => (
                    <span key={ci} style={styles.rawCell}>{cell.char}</span>
                  ))}
                </div>
              ))}
            </div>
          )}

          {!gridData && !loading && (
            <div style={{ color: '#606070', fontSize: 14 }}>
              {error ? 'Fix the error above' : 'Enter grid text and click Parse'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cssColor(ansiColor) {
  const map = {
    'black': '#000', 'red': '#f44336', 'green': '#4caf50',
    'yellow': '#ffeb3b', 'blue': '#2196f3', 'magenta': '#e91e63',
    'cyan': '#00bcd4', 'white': '#fff', 'default': '#c0c0d0',
  };
  return map[ansiColor?.toLowerCase()] || ansiColor || '#c0c0d0';
}

function LoadingSurface({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#606070' }}>
      Loading {label}...
    </div>
  );
}

export default GridViewer;
