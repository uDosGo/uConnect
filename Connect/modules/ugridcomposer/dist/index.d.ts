/**
 * uGridComposer — ASCII/ANSI grid editor for uDos surfaces
 * Inspired by: https://github.com/andresoviedo/ascii-editor
 */
export type { GridCell, GridLayer, GridSurface, RenderMode, RenderOptions } from "./types.js";
export { createSurface, addLayer, addCell, renderSurface } from "./surface.js";
