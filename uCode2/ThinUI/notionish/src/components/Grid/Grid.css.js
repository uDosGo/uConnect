/**
 * Grid CSS Styles
 * 
 * Injected global styles for better grid rendering
 * Uses CSS-in-JS approach with styled-components
 */

import { createGlobalStyle } from 'styled-components';

/**
 * Global styles for monospace font and grid rendering
 */
export const GridGlobalStyles = createGlobalStyle`
  /* Import a nice monospace font for grid rendering */
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
  
  /* Fallback for local development without internet */
  @font-face {
    font-family: 'GridFont';
    src: local('Courier New'),
         local('Monaco'),
         local('Menlo'),
         local('Consolas'),
         local('JetBrains Mono'),
         monospace;
    font-weight: 400;
  }
  
  @font-face {
    font-family: 'GridFont';
    src: local('Courier New Bold'),
         local('Monaco Bold'),
         local('Menlo Bold'),
         local('Consolas Bold'),
         local('JetBrains Mono Bold'),
         monospace;
    font-weight: 700;
  }
  
  /* Box drawing character support */
  @font-face {
    font-family: 'BoxDrawing';
    src: local('DejaVu Sans Mono'),
         local('Liberation Mono'),
         local('Courier New'),
         monospace;
  }
  
  /* Ensure box drawing characters render properly */
  .ascii-grid-box-drawing {
    font-feature-settings: "_zero", "ss01";
    -webkit-font-feature-settings: "zero", "ss01";
    -moz-font-feature-settings: "zero", "ss01";
    -ms-font-feature-settings: "zero", "ss01";
    font-variant: tabular-nums;
    -webkit-font-variant: tabular-nums;
    -moz-font-variant: tabular-nums;
    -ms-font-variant: tabular-nums;
  }
  
  /* Special handling for full-width characters */
  .ascii-grid-fullwidth {
    font-stretch: condensed;
    -webkit-font-stretch: condensed;
    -moz-font-stretch: condensed;
  }
  
  /* Smooth transitions for grid interactions */
  .ascii-grid-cell {
    transition-property: background-color, color, border-color;
    transition-duration: 0.15s;
    transition-timing-function: ease-in-out;
  }
  
  .ascii-grid-cell:hover {
    transform: translateY(-1px);
  }
  
  .ascii-grid-cell:active {
    transform: translateY(0);
  }
  
  /* Focus styles for accessible grids */
  .ascii-grid-cell:focus {
    outline: 2px solid #00aaff;
    outline-offset: -2px;
  }
  
  /* Selection highlighting */
  .ascii-grid-cell-selected {
    box-shadow: inset 0 0 0 1px #ffff00;
  }
  
  /* Component overlay styles */
  .ascii-grid-component-overlay {
    pointer-events: none;
    z-index: 10;
  }
  
  .ascii-grid-component-overlay:hover {
    opacity: 0.6 !important;
  }
  
  /* Theme-specific styles */
  .ascii-grid-theme-dark {
    --grid-bg: #1e1e1e;
    --grid-fg: #ffffff;
    --grid-cell-bg: #252525;
    --grid-border: #444444;
  }
  
  .ascii-grid-theme-light {
    --grid-bg: #ffffff;
    --grid-fg: #000000;
    --grid-cell-bg: #f5f5f5;
    --grid-border: #dddddd;
  }
  
  .ascii-grid-theme-retro {
    --grid-bg: #0a0a2a;
    --grid-fg: #00ff41;
    --grid-cell-bg: #1a1a3a;
    --grid-border: #008800;
  }
`;

/**
 * Keyframes for grid animations
 */
export const GridAnimations = {
  pulse: `
    @keyframes grid-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `,
  fadeIn: `
    @keyframes grid-fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
  slideIn: `
    @keyframes grid-slide-in {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
  `,
};

/**
 * Predefined theme configurations for grids
 */
export const GRID_THEMES = {
  dark: {
    bg: '#1e1e1e',
    fg: '#ffffff',
    cellBg: '#252525',
    border: '#444444',
    hover: 'rgba(255,255,255,0.1)',
    select: '#ffff00',
  },
  light: {
    bg: '#ffffff',
    fg: '#000000',
    cellBg: '#f5f5f5',
    border: '#dddddd',
    hover: 'rgba(0,0,0,0.05)',
    select: '#0000ff',
  },
  retro: {
    bg: '#0a0a2a',
    fg: '#00ff41',
    cellBg: '#1a1a3a',
    border: '#008800',
    hover: 'rgba(0,255,65,0.1)',
    select: '#00ff00',
  },
  matrix: {
    bg: '#000000',
    fg: '#00ff00',
    cellBg: '#0a0a0a',
    border: '#004400',
    hover: 'rgba(0,255,0,0.1)',
    select: '#00ff00',
  },
  terminal: {
    bg: '#121212',
    fg: '#e0e0e0',
    cellBg: '#1e1e1e',
    border: '#333333',
    hover: 'rgba(224,224,224,0.1)',
    select: '#4444ff',
  },
};

/**
 * Predefined color schemes for grid components
 */
export const GRID_COLOR_SCHEMES = {
  default: {
    primary: '#00aaff',
    secondary: '#00ffaa',
    success: '#00ff00',
    warning: '#ffff00',
    error: '#ff0000',
    info: '#00aaff',
  },
  pastel: {
    primary: '#88c0d0',
    secondary: '#81a1c1',
    success: '#a3be8c',
    warning: '#ebcb8b',
    error: '#bf616a',
    info: '#5e81ac',
  },
  vibrant: {
    primary: '#00ffff',
    secondary: '#ff00ff',
    success: '#00ff00',
    warning: '#ffff00',
    error: '#ff0000',
    info: '#00aaff',
  },
};

export default GridGlobalStyles;
