/**
 * Surface management
 */

import type { GridCell, GridLayer, GridSurface, RenderMode, RenderOptions } from "./types.js";
import chalk from "chalk";
import { ASCII_CHARS, ASCII_PALLETES, getCharForDensity } from "./ascii.js";

// Create a new surface
export function createSurface(width: number, height: number, depth: number = 1): GridSurface {
  return {
    width,
    height,
    depth,
    layers: [{ id: "base", cells: [] }],
  };
}

// Add a layer to a surface
export function addLayer(surface: GridSurface, layerId: string): GridSurface {
  surface.layers.push({ id: layerId, cells: [] });
  return surface;
}

// Add a cell to a layer
export function addCell(
  surface: GridSurface,
  layerId: string,
  cell: GridCell
): GridSurface {
  const layer = surface.layers.find((l) => l.id === layerId);
  if (layer) {
    layer.cells.push(cell);
  }
  return surface;
}

// Render a surface
function renderAscii(surface: GridSurface, palette: readonly string[] = ASCII_PALLETES.shades): string {
  let output = "";
  for (let y = 0; y < surface.height; y++) {
    for (let x = 0; x < surface.width; x++) {
      const cell = surface.layers[0].cells.find((c) => c.x === x && c.y === y);
      const density = cell?.z ? cell.z / (surface.depth || 1) : 0;
      output += cell?.char || getCharForDensity(density, palette);
    }
    output += "\n";
  }
  return output;
}

function renderAnsi(surface: GridSurface): string {
  let output = "";
  for (let y = 0; y < surface.height; y++) {
    for (let x = 0; x < surface.width; x++) {
      const cell = surface.layers[0].cells.find((c) => c.x === x && c.y === y);
      if (cell) {
        const colored = cell.fg ? chalk.hex(cell.fg)(cell.char || " ") : cell.char || " ";
        output += colored;
      } else {
        output += " ";
      }
    }
    output += "\n";
  }
  return output;
}

function renderHtml(surface: GridSurface): string {
  let html = "<pre style='font-family: monospace;'>\n";
  for (let y = 0; y < surface.height; y++) {
    for (let x = 0; x < surface.width; x++) {
      const cell = surface.layers[0].cells.find((c) => c.x === x && c.y === y);
      if (cell) {
        const style = cell.fg ? `color: ${cell.fg};` : "";
        html += `<span style="${style}">${cell.char || "&nbsp;"}</span>`;
      } else {
        html += "&nbsp;";
      }
    }
    html += "<br>\n";
  }
  html += "</pre>\n";
  return html;
}

export function renderSurface(surface: GridSurface, options: RenderOptions = {}): string {
  const { mode = "ascii" } = options;
  switch (mode) {
    case "ascii":
      return renderAscii(surface);
    case "ansi":
      return renderAnsi(surface);
    case "html":
      return renderHtml(surface);
    default:
      return renderAscii(surface);
  }
}
