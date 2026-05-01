/**
 * uCode3 SVG Utility — vector format for all image & grid data
 *
 * All images and grid content in uCode3 are stored as SVG path data.
 * This module provides converters between grid data and SVG format.
 */
import { TELETEXT_BLOCKS } from './manifest';

// ── Grid → SVG document (uCode3 vector format) ──
export function gridToUcodeSVG(grid, { cellSize = 24, font = 'Teletext50' } = {}) {
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
      cells += `<text x="${x * cellSize + cellSize / 2}" y="${y * cellSize + cellSize * 0.75}"
        text-anchor="middle" font-family="${font},monospace"
        font-size="${cellSize * 0.8}" fill="currentColor">${escXml(char)}</text>`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"
  data-ucode3="grid" data-font="${font}" data-cols="${cols}" data-rows="${rows}">
  <rect width="${w}" height="${h}" fill="#111"/>
  <g fill="#eee" font-family="${font},monospace">${cells}</g>
</svg>`;
}

// ── SVG → Grid parser ──
export function svgToGrid(svgString) {
  const lines = [];
  const textContents = svgString.match(/<text[^>]*>([^<]+)<\/text>/g) || [];
  // Simplified parser: extract text content and positions
  const cells = textContents.map(t => {
    const match = t.match(/x="([\d.]+)".*y="([\d.]+)".*>([^<]+)</);
    if (!match) return null;
    const x = Math.round(parseFloat(match[1]) / 24);
    const y = Math.round((parseFloat(match[2]) - 18) / 24);
    const char = match[3];
    return { x, y, char, slot: char.charCodeAt(0) };
  }).filter(Boolean);

  const cols = 40;
  const rows = 25;
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ slot: 32, char: ' ', emoji: null }))
  );

  for (const cell of cells) {
    if (cell.y < rows && cell.x < cols) {
      grid[cell.y][cell.x] = { slot: cell.slot, char: cell.char, emoji: null };
    }
  }
  return grid;
}

// ── SVG sprite generation ──
export function teletextBlockSVG(slot, size = 24) {
  const char = TELETEXT_BLOCKS[slot] || '?';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"
    data-ucode3="glyph" data-slot="${slot}">
    <text x="${size / 2}" y="${size * 0.75}" text-anchor="middle"
      font-family="Teletext50,monospace" font-size="${size * 0.8}"
      fill="currentColor">${escXml(char)}</text>
  </svg>`;
}

function escXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
