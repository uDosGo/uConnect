/**
 * Surface management
 */
import type { GridCell, GridSurface, RenderOptions } from "./types.js";
export declare function createSurface(width: number, height: number, depth?: number): GridSurface;
export declare function addLayer(surface: GridSurface, layerId: string): GridSurface;
export declare function addCell(surface: GridSurface, layerId: string, cell: GridCell): GridSurface;
export declare function renderSurface(surface: GridSurface, options?: RenderOptions): string;
