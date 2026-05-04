export type GridMode = "teletext" | "mono" | "wireframe";

export type GridOptions = {
  width: number;
  height: number;
  mode: GridMode;
  compact: boolean;
  showCoords: boolean;
  editable: boolean;
};

export type ParsedGrid = {
  options: GridOptions;
  /** Row-major; each cell is one display character (string length 1) */
  rows: string[][];
};
