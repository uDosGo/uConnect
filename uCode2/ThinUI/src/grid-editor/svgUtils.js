/**
 * SVG Utility Core — uCode3 vector foundation
 *
 * Converts grid cell data to SVG paths and vice versa.
 * Supports teletext block characters, glyph outlines, and ASCII→SVG.
 */

import { TELETEXT_BLOCKS } from './manifest';

/* ── Grid cell → SVG path ── */
export function cellToSVG(slot, size = 24) {
  const char = TELETEXT_BLOCKS[slot] || String.fromCharCode(slot >= 32 ? slot : 32);
  // Encode as SVG foreignObject with the character rendered in teletext font
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="transparent"/>
    <text x="${size/2}" y="${size*0.75}" text-anchor="middle"
      font-family="Teletext50, monospace" font-size="${size*0.8}"
      fill="currentColor">${escapeXml(char)}</text>
  </svg>`;
}

/* ── Full grid 40×25 → SVG document ── */
export function gridToSVG(grid, cellSize = 24, font = 'Teletext50') {
  const cols = grid[0]?.length || 40;
  const rows = grid.length || 25;
  const w = cols * cellSize;
  const h = rows * cellSize;

  let cells = '';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = grid[y][x];
      const char = cell?.emoji || TELETEXT_BLOCKS[cell?.slot] || cell?.char || ' ';
      if (char === ' ') continue;
      cells += `<text x="${x * cellSize + cellSize/2}" y="${y * cellSize + cellSize*0.75}"
        text-anchor="middle" font-family="${font}, monospace"
        font-size="${cellSize*0.8}" fill="currentColor">${escapeXml(char)}</text>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="#111"/>
    ${cells}
  </svg>`;
}

/* ── Teletext block glyph → SVG path data (for uCode3 vector storage) ── */
export function blockGlyphPath(slot) {
  const paths = {
    22: 'M0,0 L24,0 L24,24 L0,24 Z',                    // █ full block
    23: 'M0,12 L24,12 L24,24 L0,24 Z',                  // ▄ lower half
    24: 'M0,0 L24,0 L24,12 L0,12 Z',                    // ▀ upper half
    25: 'M0,0 L12,0 L12,24 L0,24 Z',                    // ▌ left half
    26: 'M12,0 L24,0 L24,24 L12,24 Z',                  // ▐ right half
    27: 'M0,0 L8,0 L8,8 L0,8 Z M8,8 L16,8 L16,16 L8,16 Z M16,16 L24,16 L24,24 L16,24 Z', // ░ quarter
    28: 'M0,0 L6,0 L6,6 L0,6 Z M12,0 L18,0 L18,6 L12,6 Z M6,6 L12,6 L12,12 L6,12 Z ...', // ▒ mid
    29: 'M0,0 L3,0 L3,3 L0,3 Z M6,0 L9,0...',           // ▓ dark
  };
  return paths[slot] || null;
}

/* ── ASCII art → grid data ── */
export function asciiToGrid(text) {
  const lines = text.split('\n').filter(l => l.length > 0);
  const grid = [];
  for (const line of lines) {
    const row = [];
    for (const ch of line) {
      const slot = ch.charCodeAt(0);
      const emoji = slot < 32 ? TELETEXT_BLOCKS[slot] : null;
      row.push({ slot, char: ch, emoji });
    }
    grid.push(row);
  }
  return grid;
}

/* ── Teletext sweep effect timing (BBC BASIC style) ── */
export function teletextSweepDuration(rowCount) {
  // Each row takes ~50ms to render (analogue teletext feel)
  return rowCount * 50;
}

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
