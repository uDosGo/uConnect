import { useState } from 'react';
import { GRID_CONSTANTS, SLOT_CATEGORIES } from './manifest';

// 128-slot sample data: printable characters 32-126 map to ASCII
function buildSlotData() {
  const slots = [];
  for (let i = 0; i < 128; i++) {
    const char = i >= 32 && i <= 126 ? String.fromCharCode(i) : '·';
    const emojis = {
      1: '☺', 2: '☻', 3: '♥', 4: '♦', 5: '♣', 6: '♠',
      65: '🚀', 66: '⭐', 67: '🌀', 68: '📦',
    };
    slots.push({
      slot: i,
      char: char,
      emoji: emojis[i] || null,
      alias: null,
      hex: '0x' + i.toString(16).padStart(2, '0'),
    });
  }
  return slots;
}

const SLOTS = buildSlotData();

function getSlotCategory(slot) {
  return SLOT_CATEGORIES.find(c => slot >= c.start && slot <= c.end) || SLOT_CATEGORIES[0];
}

export default function CellEditor() {
  const [activeFont, setActiveFont] = useState(GRID_CONSTANTS.FONTS[0].id);
  const [selectedSlot, setSelectedSlot] = useState(65); // 'A'
  const [viewMode, setViewMode] = useState('grid'); // grid | catalog
  const [grid, setGrid] = useState(() =>
    Array.from({ length: 25 }, () => Array.from({ length: 40 }, () => ({ slot: 32, char: ' ', emoji: null })))
  );

  const currentFont = GRID_CONSTANTS.FONTS.find(f => f.id === activeFont);

  // Click a cell to paint it with the selected slot
  const paintCell = (y, x) => {
    const slot = SLOTS[selectedSlot];
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      next[y][x] = { slot: selectedSlot, char: slot.char, emoji: slot.emoji };
      return next;
    });
  };

  // Fill entire grid with a character
  const fillGrid = (slot) => {
    const s = SLOTS[slot];
    setGrid(Array.from({ length: 25 }, () =>
      Array.from({ length: 40 }, () => ({ slot, char: s.char, emoji: s.emoji }))
    ));
  };

  // Render the 40×25 editing grid
  const renderGrid = () => (
    <div className="ce-grid" style={{ fontFamily: `var(--font-${activeFont})` }}>
      {grid.map((row, y) => (
        <div key={y} className="ce-row">
          {row.map((cell, x) => (
            <div
              key={x}
              className={`ce-cell${selectedSlot === cell.slot ? ' active' : ''}`}
              onClick={() => paintCell(y, x)}
              title={`(${x},${y}) slot ${cell.slot} ${cell.char}`}
            >
              {cell.emoji || cell.char}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  // Render the 128-slot character catalog
  const renderCatalog = () => (
    <div className="ce-catalog">
      {SLOTS.map(s => {
        const cat = getSlotCategory(s.slot);
        return (
          <div
            key={s.slot}
            className={`ce-slot${selectedSlot === s.slot ? ' active' : ''}`}
            style={{ '--cat-color': cat.color }}
            onClick={() => setSelectedSlot(s.slot)}
            title={`Slot ${s.slot} (${s.hex}): "${s.char}"`}
          >
            <span className="ce-slot-char">{s.emoji || s.char}</span>
            <span className="ce-slot-num">{s.slot}</span>
          </div>
        );
      })}
    </div>
  );

  // Selected slot detail panel
  const selected = SLOTS[selectedSlot] || SLOTS[32];
  const cat = getSlotCategory(selected.slot);
  const fontStyle = { fontFamily: `var(--font-${activeFont})` };

  return (
    <div className="ce-container">
      {/* Toolbar */}
      <div className="ce-toolbar">
        <div className="ce-font-select">
          {GRID_CONSTANTS.FONTS.map(f => (
            <button key={f.id} className={`ce-font-btn${activeFont === f.id ? ' active' : ''}`} onClick={() => setActiveFont(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="ce-view-toggle">
          <button className={`ce-view-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')}>Grid</button>
          <button className={`ce-view-btn${viewMode === 'catalog' ? ' active' : ''}`} onClick={() => setViewMode('catalog')}>Catalog</button>
        </div>
        <span className="ce-font-mode">Mode {currentFont.mode}</span>
        <button className="ce-action-btn" onClick={() => fillGrid(selectedSlot)} title="Fill grid with selected char">Fill</button>
        <button className="ce-action-btn" onClick={() => fillGrid(32)} title="Clear grid">Clear</button>
      </div>

      {/* Main area */}
      <div className="ce-main">
        <div className="ce-canvas">
          {viewMode === 'grid' ? renderGrid() : renderCatalog()}
        </div>

        {/* Slot inspector sidebar */}
        <div className="ce-inspector">
          <div className="ce-inspector-header">Slot Inspector</div>
          <div className="ce-inspector-body">
            <div className="ce-preview" style={fontStyle}>
              <div className="ce-preview-char">{selected.emoji || selected.char}</div>
              <div className="ce-preview-label">{selected.char === ' ' ? 'SPACE' : `"${selected.char}"`}</div>
            </div>
            <div className="ce-info-row"><span>Slot</span><span>{selected.slot}</span></div>
            <div className="ce-info-row"><span>Hex</span><span>{selected.hex}</span></div>
            <div className="ce-info-row"><span>Category</span><span style={{ color: cat.color }}>{cat.label}</span></div>
            <div className="ce-info-row"><span>Emoji</span><span>{selected.emoji || '—'}</span></div>
            <div className="ce-info-row"><span>Alias</span><span>:{selected.char.toLowerCase()}:</span></div>
            <div className="ce-info-row"><span>Font</span><span>{currentFont.label}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
