/**
 * GridViewer Component
 * 
 * A complete grid viewing and interaction component that connects to Python core.
 * This component displays grids from the ThinUI bridge and allows interaction.
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import ASCIIGrid, { SimpleGrid, ansiToHex } from './ASCIIGrid';
import { GridGlobalStyles, GRID_THEMES } from './Grid.css';

// Viewer container
const ViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background-color: ${props => props.theme.bg};
  border-radius: 8px;
  max-width: 100%;
  overflow: hidden;
`;

// Toolbar
const Toolbar = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  padding: 8px;
  background-color: ${props => props.theme.cellBg};
  border-radius: 4px;
`;

// Button
const Button = styled.button`
  padding: 6px 12px;
  background-color: ${props => props.theme.border};
  color: ${props => props.theme.fg};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Select
const Select = styled.select`
  padding: 6px 12px;
  background-color: ${props => props.theme.cellBg};
  color: ${props => props.theme.fg};
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
`;

// Status bar
const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background-color: ${props => props.theme.cellBg};
  border-radius: 4px;
  font-size: 12px;
  color: ${props => props.theme.secondary || props.theme.fg};
`;

// Preview area
const PreviewArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: ${props => props.theme.cellBg};
  padding: 12px;
  border-radius: 4px;
`;

/**
 * Sample grid data for testing
 */
const SAMPLE_GRIDS = {
  simple: {
    title: 'Simple Grid',
    rows: 3,
    cols: 3,
    cells: [
      [{ char: 'A' }, { char: 'B' }, { char: 'C' }],
      [{ char: 'D' }, { char: 'E' }, { char: 'F' }],
      [{ char: 'G' }, { char: 'H' }, { char: 'I' }],
    ],
    components: [],
  },
  box: {
    title: 'Box Drawing Test',
    rows: 5,
    cols: 9,
    cells: [
      [{ char: '┌', metadata: { type: 'TL' } }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '┐', metadata: { type: 'TR' } }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }],
      [{ char: '│' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: '│' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }],
      [{ char: '├' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '┤' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }],
      [{ char: '│' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: '│' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }],
      [{ char: '└', metadata: { type: 'BL' } }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '┘', metadata: { type: 'BR' } }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }],
    ],
    components: [],
  },
  colored: {
    title: 'Colored Grid',
    rows: 4,
    cols: 8,
    cells: [
      [
        { char: 'R', fgColor: '#FF0000' },
        { char: 'E', fgColor: '#FF0000' },
        { char: 'D', fgColor: '#FF0000' },
        { char: ' ', fgColor: '#FF0000' },
        { char: 'G', fgColor: '#00FF00' },
        { char: 'R', fgColor: '#00FF00' },
        { char: 'E', fgColor: '#00FF00' },
        { char: 'E', fgColor: '#00FF00' },
      ],
      [
        { char: 'N', fgColor: '#00FFFF' },
        { char: 'Y', fgColor: '#00FFFF' },
        { char: 'L', fgColor: '#00FFFF' },
        { char: 'O', fgColor: '#00FFFF' },
        { char: 'N', fgColor: '#00FFFF' },
        { char: 'E', fgColor: '#00FFFF' },
        { char: ' ', fgColor: '#00FFFF' },
        { char: ' ', fgColor: '#00FFFF' },
      ],
      [
        { char: ' ', bgColor: '#0000FF', fgColor: '#FFFFFF' },
        { char: 'B', bgColor: '#0000FF', fgColor: '#FFFFFF' },
        { char: 'L', bgColor: '#0000FF', fgColor: '#FFFFFF' },
        { char: 'U', bgColor: '#0000FF', fgColor: '#FFFFFF' },
        { char: 'E', bgColor: '#0000FF', fgColor: '#FFFFFF' },
        { char: ' ', bgColor: '#0000FF', fgColor: '#FFFFFF' },
        { char: ' ', bgColor: '#0000FF', fgColor: '#FFFFFF' },
        { char: ' ', bgColor: '#0000FF', fgColor: '#FFFFFF' },
      ],
      [
        { char: ' ', fgColor: '#FF00FF' },
        { char: 'M', fgColor: '#FF00FF' },
        { char: 'A', fgColor: '#FF00FF' },
        { char: 'G', fgColor: '#FF00FF' },
        { char: 'E', fgColor: '#FF00FF' },
        { char: 'N', fgColor: '#FF00FF' },
        { char: 'T', fgColor: '#FF00FF' },
        { char: 'A', fgColor: '#FF00FF' },
      ],
    ],
    components: [],
  },
  form: {
    title: 'Form Layout',
    rows: 7,
    cols: 20,
    cells: [
      [{ char: '┌' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '┐' }],
      [{ char: '│' }, { char: ' ' }, { char: ' ' }, { char: 'N' }, { char: 'a' }, { char: 'm' }, { char: 'e' }, { char: ':' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: '│' }],
      [{ char: '├' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '┤' }],
      [{ char: '│' }, { char: ' ' }, { char: ' ' }, { char: 'E' }, { char: 'm' }, { char: 'a' }, { char: 'i' }, { char: 'l' }, { char: ':' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: '│' }],
      [{ char: '├' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '┤' }],
      [{ char: '│' }, { char: ' ' }, { char: ' ' }, { char: 'S' }, { char: 'u' }, { char: 'b' }, { char: 'm' }, { char: 'i' }, { char: 't' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: ' ' }, { char: '│' }],
      [{ char: '└' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '─' }, { char: '┘' }],
    ],
    components: [],
  },
};

/**
 * GridViewer Component
 * 
 * @param {Object} props
 * @param {Object} props.gridData - Initial grid data to display
 * @param {string} props.theme - Initial theme
 * @param {boolean} props.editable - Allow editing
 * @param {Function} props.onGridChange - Called when grid changes
 */
const GridViewer = ({
  gridData = SAMPLE_GRIDS.box,
  theme: 'dark',
  editable = true,
  onGridChange,
  ...props
}) => {
  const [currentGrid, setCurrentGrid] = useState(gridData);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [cellSize, setCellSize] = useState(20);
  const [fontSize, setFontSize] = useState('14px');
  const [selectedSample, setSelectedSample] = useState('box');
  const [status, setStatus] = useState('Ready');

  const themes = GRID_THEMES;
  const themeKeys = Object.keys(themes);

  // Handle grid data from Python core
  const handlePythonData = useCallback((data) => {
    if (!data) return null;
    
    // If it's a string, try to parse it
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse grid data:', e);
        return null;
      }
    }
    
    // If it already has the right structure, use it
    if (data.cells && data.rows !== undefined && data.cols !== undefined) {
      return data;
    }
    
    return null;
  }, []);

  // Load sample grid
  const loadSample = useCallback((sampleName) => {
    const sample = SAMPLE_GRIDS[sampleName];
    if (sample) {
      setCurrentGrid(sample);
      setSelectedSample(sampleName);
      setStatus(`Loaded sample: ${sample.title}`);
    }
  }, []);

  // Handle cell click
  const handleCellClick = useCallback((cellData) => {
    if (!editable) return;
    
    setStatus(`Clicked cell at (${cellData.row}, ${cellData.col}): '${cellData.char}'`);
    
    // Could implement cell editing here
  }, [editable]);

  // Change theme
  const changeTheme = useCallback((themeName) => {
    setCurrentTheme(themeName);
    setStatus(`Theme changed to: ${themeName}`);
  }, []);

  // Export current grid as JSON
  const exportGrid = useCallback(() => {
    const json = JSON.stringify(currentGrid, null, 2);
    // Copy to clipboard
    navigator.clipboard.writeText(json);
    setStatus('Grid copied to clipboard');
  }, [currentGrid]);

  // Render grid from Python thinui_bridge
  const renderFromPython = useCallback(() => {
    // This would be called when receiving data from Python
    // For now, we'll use sample data
    const pythonData = {
      cells: [
        [{ char: 'H' }, { char: 'e' }, { char: 'l' }, { char: 'l' }, { char: 'o' }],
        [{ char: 'W' }, { char: 'o' }, { char: 'r' }, { char: 'l' }, { char: 'd' }],
      ],
      rows: 2,
      cols: 5,
      title: 'From Python',
      components: [],
    };
    
    setCurrentGrid(pythonData);
    setStatus('Rendered from Python thinui_bridge');
  }, []);

  return (
    <ViewerContainer theme={themes[currentTheme] || themes.dark}>
      <GridGlobalStyles />
      
      <Toolbar theme={themes[currentTheme] || themes.dark}>
        <Select
          value={selectedSample}
          onChange={(e) => loadSample(e.target.value)}
          theme={themes[currentTheme] || themes.dark}
        >
          {Object.keys(SAMPLE_GRIDS).map(name => (
            <option key={name} value={name}>
              {SAMPLE_GRIDS[name].title}
            </option>
          ))}
        </Select>
        
        <Select
          value={currentTheme}
          onChange={(e) => changeTheme(e.target.value)}
          theme={themes[currentTheme] || themes.dark}
        >
          {themeKeys.map(name => (
            <option key={name} value={name}>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </option>
          ))}
        </Select>
        
        <Select
          value={cellSize}
          onChange={(e) => setCellSize(parseInt(e.target.value))}
          theme={themes[currentTheme] || themes.dark}
        >
          <option value={12}>Tiny (12px)</option>
          <option value={16}>Small (16px)</option>
          <option value={20}>Medium (20px)</option>
          <option value={24}>Large (24px)</option>
          <option value={32}>Huge (32px)</option>
        </Select>
        
        <Button onClick={exportGrid} theme={themes[currentTheme] || themes.dark}>
          Export JSON
        </Button>
        
        <Button onClick={renderFromPython} theme={themes[currentTheme] || themes.dark}>
          Simulate Python Data
        </Button>
      </Toolbar>
      
      <PreviewArea theme={themes[currentTheme] || themes.dark}>
        <SimpleGrid
          gridData={currentGrid}
          theme={currentTheme}
          cellSize={cellSize}
          fontSize={fontSize}
          onCellClick={handleCellClick}
        />
      </PreviewArea>
      
      <StatusBar theme={themes[currentTheme] || themes.dark}>
        <span>{status}</span>
        <span>
          {currentGrid.rows}x{currentGrid.cols} cells | 
          {currentGrid.title || 'Untitled'}
        </span>
      </StatusBar>
    </ViewerContainer>
  );
};

export default GridViewer;
export { SAMPLE_GRIDS, GRID_THEMES, ViewerContainer, Toolbar, Button, Select, StatusBar, PreviewArea };
