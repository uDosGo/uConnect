/**
 * ASCIIGrid Component
 * 
 * Renders ASCII grid data from the Python uCode1 core in ThinUI.
 * Supports box drawing characters, colors, and component highlighting.
 */

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

// Grid container
const GridContainer = styled.div`
  display: inline-grid;
  grid-template-columns: repeat(${props => props.cols}, 1fr);
  gap: 0;
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  font-size: ${props => props.fontSize || '14px'};
  line-height: 1.2;
  background-color: ${props => props.bgColor || '#1e1e1e'};
  color: ${props => props.fgColor || '#ffffff'};
  padding: ${props => props.padding || '4px'};
  border-radius: ${props => props.borderRadius || '0'};
  overflow: auto;
  max-width: 100%;
`;

// Individual grid cell
const GridCell = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1;
  min-width: ${props => props.cellSize || '16px'};
  min-height: ${props => props.cellSize || '16px'};
  background-color: ${props => props.bgColor || 'transparent'};
  color: ${props => props.fgColor || 'inherit'};
  font-weight: ${props => props.bold ? 'bold' : 'normal'};
  text-decoration: ${props => props.underline ? 'underline' : 'none'};
  border: ${props => props.border || 'none'};
  cursor: ${props => props.onClick ? 'pointer' : 'default'};
  user-select: none;
  transition: all 0.1s ease;
  
  &:hover {
    background-color: ${props => props.hoverBg || 'rgba(255,255,255,0.1)'};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

// Box drawing character styling
const BoxChar = styled.span`
  display: inline-block;
  width: 100%;
  height: 100%;
  line-height: 1;
  text-align: center;
  font-size: 1.2em;
`;

// Component overlay for highlighting
const ComponentOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid ${props => props.color || '#00ff00'};
  border-radius: 2px;
  pointer-events: none;
  opacity: 0.3;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.5;
  }
`;

/**
 * Box drawing character to Unicode mapping
 * Maps ASCII box drawing chars to their Unicode equivalents for better rendering
 */
const BOX_DRAWING_MAP = {
  // Single line
  '+': '┼',
  '-': '─',
  '|': '│',
  '=': '═',
  
  // Corners
  'a': '┌', 'b': '┐', 'c': '└', 'd': '┘',
  
  // T-junctions
  'e': '├', 'f': '┤', 'g': '┬', 'h': '┴',
  
  // Double line
  '#': '╋',
  '_': '─',
  
  // Already Unicode
  '┌': '┌', '┐': '┐', '└': '└', '┘': '┘',
  '├': '├', '┤': '┤', '┬': '┬', '┴': '┴',
  '┼': '┼',
  '─': '─', '│': '│', '━': '━', '┃': '┃',
  '═': '═', '║': '║',
  '╒': '╒', '╓': '╓', '╔': '╔',
  '╕': '╕', '╖': '╖', '╗': '╗',
  '╘': '╘', '╙': '╙', '╚': '╚',
  '╛': '╛', '╝': '╝',
  '╞': '╞', '╟': '╟', '╠': '╠',
  '╡': '╡', '╢': '╢', '╣': '╣',
  '╤': '╤', '╥': '╥', '╦': '╦',
  '╧': '╧', '╨': '╨', '╩': '╩',
  '╪': '╪', '╫': '╫', '╬': '╬',
  '╭': '╭', '╮': '╮', '╯': '╯', '╰': '╰',
};

/**
 * ANSI color code to CSS color mapping (256-color mode)
 */
const ANSI_COLORS = {
  // Standard colors (0-15)
  0: '#000000', 1: '#800000', 2: '#008000', 3: '#808000',
  4: '#000080', 5: '#800080', 6: '#008080', 7: '#C0C0C0',
  8: '#808080', 9: '#FF0000', 10: '#00FF00', 11: '#FFFF00',
  12: '#0000FF', 13: '#FF00FF', 14: '#00FFFF', 15: '#FFFFFF',
  
  // 256-color mode (16-255) - calculated on demand
};

/**
 * Convert ANSI color code to CSS hex color
 * @param {number} code - ANSI color code (0-255)
 * @returns {string} - CSS hex color
 */
function ansiToHex(code) {
  if (code < 0 || code > 255) return '#000000';
  
  // Standard colors
  if (code <= 15) {
    return ANSI_COLORS[code] || '#000000';
  }
  
  // 256-color mode
  if (code >= 16 && code <= 231) {
    // 6x6x6 color cube
    const r = ((code - 16) / 36) | 0;
    const g = ((code - 16) % 36 / 6) | 0;
    const b = (code - 16) % 6;
    const rVal = Math.round((r / 5) * 255);
    const gVal = Math.round((g / 5) * 255);
    const bVal = Math.round((b / 5) * 255);
    return `rgb(${rVal},${gVal},${bVal})`;
  }
  
  // Grayscale
  if (code >= 232 && code <= 255) {
    const val = Math.round(((code - 232) / 23) * 255);
    return `rgb(${val},${val},${val})`;
  }
  
  return '#000000';
}

/**
 * Convert CSS color to hex (for validation and consistency)
 * @param {string} color - CSS color value
 * @returns {string} - Hex color or original
 */
function colorToHex(color) {
  if (!color) return null;
  if (color.startsWith('#')) return color;
  if (color.startsWith('rgb')) {
    // Simple RGB parsing (doesn't handle all cases)
    const match = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }
  }
  return color;
}

/**
 * ASCIIGrid Component
 * 
 * @param {Object} props
 * @param {Array} props.cells - 2D array of cell data
 * @param {number} props.rows - Number of rows
 * @param {number} props.cols - Number of columns
 * @param {string} props.title - Optional title for the grid
 * @param {Object} props.components - Component definitions
 * @param {Object} props.layout - Layout information
 * @param {string} props.theme - Theme (light/dark/custom)
 * @param {number} props.cellSize - Size of each cell in pixels
 * @param {number} props.fontSize - Font size
 * @param {Function} props.onCellClick - Click handler for cells
 * @param {Function} props.onComponentClick - Click handler for components
 */
const ASCIIGrid = ({
  cells = [],
  rows = 0,
  cols = 0,
  title,
  components = {},
  layout = {},
  theme = 'dark',
  cellSize = 20,
  fontSize = '14px',
  onCellClick,
  onComponentClick,
  ...props
}) => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const gridRef = useRef(null);

  // Theme colors
  const themes = {
    dark: {
      bg: '#1e1e1e',
      fg: '#ffffff',
      cellBg: '#252525',
      border: '#444444',
    },
    light: {
      bg: '#ffffff',
      fg: '#000000',
      cellBg: '#f5f5f5',
      border: '#dddddd',
    },
    retro: {
      bg: '#0a0a2a',
      fg: '#00ff41',
      cellBg: '#1a1a3a',
      border: '#008800',
    },
  };

  const themeColors = themes[theme] || themes.dark;

  // Handle cell click
  const handleCellClick = (row, col, e) => {
    e.stopPropagation();
    
    if (onCellClick) {
      onCellClick({ row, col, char: getCellChar(row, col) });
    }
    
    // Toggle selection
    setSelectedCells(prev => {
      const key = `${row},${col}`;
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return Array.from(newSet);
    });
  };

  // Get character for a cell
  const getCellChar = (row, col) => {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return ' ';
    const cell = cells[row]?.[col];
    if (!cell) return ' ';
    
    let char = cell.char || cell.text || ' ';
    
    // Map ASCII box drawing to Unicode
    if (BOX_DRAWING_MAP[char]) {
      char = BOX_DRAWING_MAP[char];
    }
    
    return char;
  };

  // Get style for a cell
  const getCellStyle = (row, col) => {
    const cell = cells[row]?.[col] || {};
    const isSelected = selectedCells.includes(`${row},${col}`);
    const isHovered = hoveredCell === `${row},${col}`;
    const componentId = cell.componentId || getComponentAt(row, col);
    const component = components[componentId];
    
    return {
      bold: cell.bold || component?.bold || false,
      underline: cell.underline || component?.underline || false,
      fgColor: cell.fgColor || getComponentColor(componentId, 'fg') || themeColors.fg,
      bgColor: cell.bgColor || getComponentColor(componentId, 'bg') || (isSelected ? '#ffff00' : themeColors.cellBg),
      border: cell.border || getComponentBorder(componentId),
      cellSize: `${cellSize}px`,
      fontSize: fontSize,
      hoverBg: isHovered ? 'rgba(255,255,255,0.2)' : undefined,
    };
  };

  // Get component at position
  const getComponentAt = (row, col) => {
    for (const [id, comp] of Object.entries(components || {})) {
      if (comp.cells) {
        const cellKey = `${row},${col}`;
        if (comp.cells.includes(cellKey) || comp.cells.some(c => c.row === row && c.col === col)) {
          return id;
        }
      }
    }
    return null;
  };

  // Get component color
  const getComponentColor = (componentId, type) => {
    if (!componentId || !components[componentId]) return null;
    const comp = components[componentId];
    return comp[`${type}Color`] || null;
  };

  // Get component border
  const getComponentBorder = (componentId) => {
    if (!componentId || !components[componentId]) return 'none';
    const comp = components[componentId];
    if (comp.borderStyle === 'solid') return '1px solid';
    if (comp.borderStyle === 'dashed') return '1px dashed';
    if (comp.borderStyle === 'dotted') return '1px dotted';
    return 'none';
  };

  // Render the grid
  const renderGrid = () => {
    const gridCells = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const char = getCellChar(row, col);
        const style = getCellStyle(row, col);
        const componentId = getComponentAt(row, col);
        
        gridCells.push(
          <GridCell
            key={`cell-${row}-${col}`}
            {...style}
            onClick={(e) => handleCellClick(row, col, e)}
            onMouseEnter={() => setHoveredCell(`${row},${col}`)}
            onMouseLeave={() => setHoveredCell(null)}
            data-row={row}
            data-col={col}
            data-component={componentId || ''}
          >
            <BoxChar>{char !== ' ' ? char : '\u00A0'}</BoxChar>
            {componentId && onComponentClick && (
              <ComponentOverlay
                color={getComponentColor(componentId, 'border') || '#00ff00'}
              />
            )}
          </GridCell>
        );
      }
    }
    
    return gridCells;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {title && (
        <div style={{ 
          fontSize: '16px', 
          fontWeight: 'bold',
          color: themeColors.fg,
          textAlign: 'center'
        }}>
          {title}
        </div>
      )}
      <GridContainer
        ref={gridRef}
        rows={rows}
        cols={cols}
        fontSize={fontSize}
        bgColor={themeColors.bg}
        fgColor={themeColors.fg}
      >
        {renderGrid()}
      </GridContainer>
    </div>
  );
};

/**
 * Thinner wrapper for simple usage
 */
export const SimpleGrid = ({
  gridData,
  theme = 'dark',
  cellSize = 16,
  fontSize = '12px',
  ...props
}) => {
  if (!gridData) return null;
  
  return (
    <ASCIIGrid
      cells={gridData.cells}
      rows={gridData.rows}
      cols={gridData.cols}
      title={gridData.title}
      components={gridData.components}
      layout={gridData.layout}
      theme={theme}
      cellSize={cellSize}
      fontSize={fontSize}
      {...props}
    />
  );
};

export default ASCIIGrid;

export { GridContainer, GridCell, BoxChar, ComponentOverlay, ansiToHex, colorToHex, BOX_DRAWING_MAP };
