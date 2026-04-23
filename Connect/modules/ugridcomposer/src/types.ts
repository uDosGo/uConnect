/**
 * uGridComposer types
 */

export type GridCell = {
  x: number;
  y: number;
  z: number;
  char?: string;
  fg?: string;
  bg?: string;
};

export type GridLayer = {
  id: string;
  cells: GridCell[];
};

export type GridSurface = {
  width: number;
  height: number;
  depth: number;
  layers: GridLayer[];
};

export type RenderMode = "ascii" | "ansi" | "html";

export type RenderOptions = {
  mode?: RenderMode;
  palette?: string[];
};
