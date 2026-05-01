import { useState } from 'react';
import { GRID_CONSTANTS } from './manifest';

export default function GridLayerComposer() {
  const [activeFont, setActiveFont] = useState(GRID_CONSTANTS.FONTS[0].id);
  const [canvasSize, setCanvasSize] = useState({ w: 80, h: 40 });
  const [layers, setLayers] = useState([
    { id: 'bg',    label: 'Background',   visible: true, type: 'background' },
    { id: 'blocks', label: 'Teletext Blocks', visible: true, type: 'blocks' },
    { id: 'sprites', label: 'Sprites',      visible: true, type: 'sprites' },
    { id: 'annot', label: 'Annotations',  visible: true, type: 'annotations' },
  ]);
  const [importText, setImportText] = useState('');

  const toggleLayer = (id) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const handleMonodrawImport = () => {
    // Placeholder for Monodraw CLI integration
    // In production: spawn `monodraw export input.monopic --format svg`
    alert('Monodraw import: place a .monopic file in Vault and run:\n  monodraw export <file> --format svg\nThen paste the SVG output below.');
  };

  const currentFont = GRID_CONSTANTS.FONTS.find(f => f.id === activeFont);

  return (
    <div className="lc-container">
      {/* Toolbar */}
      <div className="lc-toolbar">
        <div className="lc-font-row">
          {GRID_CONSTANTS.FONTS.map(f => (
            <button key={f.id} className={`lc-font-btn${activeFont === f.id ? ' active' : ''}`} onClick={() => setActiveFont(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="lc-size">
          <span>{canvasSize.w}×{canvasSize.h}</span>
          <span className="lc-mode">Mode {currentFont.mode}</span>
        </div>
      </div>

      <div className="lc-body">
        {/* Layer panel */}
        <div className="lc-layers">
          <div className="lc-layers-header">Layers</div>
          {layers.map(l => (
            <div key={l.id} className={`lc-layer${l.visible ? ' visible' : ''}`} onClick={() => toggleLayer(l.id)}>
              <span className="lc-layer-eye">{l.visible ? '👁' : '—'}</span>
              <span className="lc-layer-label">{l.label}</span>
              <span className="lc-layer-type">{l.type}</span>
            </div>
          ))}
          <div className="lc-import-section">
            <button className="lc-import-btn" onClick={handleMonodrawImport}>Import Monodraw</button>
            <textarea
              className="lc-import-area"
              placeholder="Paste SVG or ASCII art here for import..."
              value={importText}
              onChange={e => setImportText(e.target.value)}
              rows={4}
            />
            <div className="lc-batch-actions">
              <span className="lc-batch-hint">Image → ASCII → Teletext pipeline:</span>
              <button className="lc-action-btn">Convert to Grid</button>
              <button className="lc-action-btn">Export SVG</button>
              <button className="lc-action-btn">Export USXD</button>
            </div>
          </div>
        </div>

        {/* Canvas preview */}
        <div className="lc-canvas">
          <div className="lc-canvas-label">{canvasSize.w}×{canvasSize.h} canvas · {layers.filter(l => l.visible).length} layers visible</div>
          <div className="lc-grid-preview" style={{ fontFamily: `var(--font-${activeFont})` }}>
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                           Grid Layer Composer                                   │
│                                                                                 │
│   Use the layer panel to toggle visibility. Import Monodraw .monopic files      │
│   or paste SVG/ASCII art. Export to USXD, SVG, or grid format.                  │
│                                                                                 │
│   ╔═══════════════════════════════════════════════════════════════════════════╗  │
│   ║  Layer: Background    [████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] ║  │
│   ║  Layer: Teletext      [░░░░░░░░████████████████░░░░░░░░░░░░░░░░░░░░░░░░] ║  │
│   ║  Layer: Sprites       [░░░░░░░░░░░░░░░░░░░░░░░░████████████░░░░░░░░░░░░] ║  │
│   ║  Layer: Annotations   [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████] ║  │
│   ╚═══════════════════════════════════════════════════════════════════════════╝  │
│                                                                                 │
│   [Press Start 2P] · (C)1985 Nintendo                                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘`}
          </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
