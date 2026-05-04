import type { ParsedGrid } from "@udos/obf-grid";

export type UsxdStyle = Record<string, string>;

export type UsxdRegions = Record<string, string>;

export type UsxdControl = { keys: string; action: string };

export type ParsedUsxd = {
  name: string;
  version?: string;
  style: UsxdStyle;
  regions: UsxdRegions;
  controls: UsxdControl[];
};

export type SurfaceBundle = {
  usxd: ParsedUsxd;
  grid: ParsedGrid | null;
  sourcePath: string;
};
