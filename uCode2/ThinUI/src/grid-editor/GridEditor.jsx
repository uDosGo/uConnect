import { useState } from 'react';
import CellEditor from './CellEditor';
import GridLayerComposer from './GridLayerComposer';

/**
 * Grid Editor — Cell Editor + Grid Layer Composer
 *
 * Two-mode surface for grid-based content creation.
 * Mode: Cell  — Character-level grid editing for 128-slot system
 * Mode: Layer — Multi-layer map/grid composition
 */
export default function GridEditor() {
  const [mode, setMode] = useState('cell'); // cell | layer

  return (
    <div className="grid-editor">
      {/* Mode switcher */}
      <div className="ge-mode-bar">
        <div className="ge-mode-switch">
          <button className={`ge-mode-btn${mode === 'cell' ? ' active' : ''}`} onClick={() => setMode('cell')}>
            Cell Editor
          </button>
          <button className={`ge-mode-btn${mode === 'layer' ? ' active' : ''}`} onClick={() => setMode('layer')}>
            Layer Composer
          </button>
        </div>
        <span className="ge-version">uCode3 Grid v0.1</span>
      </div>

      {/* Mode panels */}
      <div className="ge-body">
        {mode === 'cell' ? <CellEditor /> : <GridLayerComposer />}
      </div>
    </div>
  );
}
