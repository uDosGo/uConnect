import fs from "fs-extra";
import { glob } from "glob";
import path from "node:path";
import { parseAllUsxdFromMarkdown } from "./parse-usxd.js";
import { extractGrid } from "./extract-grid.js";
import type { SurfaceBundle } from "./types.js";

export type SurfaceIndexEntry = {
  filePath: string;
  markdown: string;
};

/** Build map surface id → source file + full markdown (last file wins on duplicate names). */
export async function buildSurfaceIndex(watchRoot: string): Promise<Map<string, SurfaceIndexEntry>> {
  const abs = path.resolve(watchRoot);
  const pattern = path.join(abs, "**/*.md");
  const files = await glob(pattern.replace(/\\/g, "/"), { nodir: true, absolute: true });
  const map = new Map<string, SurfaceIndexEntry>();
  for (const file of files.sort()) {
    const markdown = await fs.readFile(file, "utf8");
    const surfaces = parseAllUsxdFromMarkdown(markdown);
    for (const u of surfaces) {
      map.set(u.name, { filePath: file, markdown });
    }
  }
  return map;
}

export async function buildSurfaceIndexFromFile(filePath: string): Promise<Map<string, SurfaceIndexEntry>> {
  const abs = path.resolve(filePath);
  const markdown = await fs.readFile(abs, "utf8");
  const map = new Map<string, SurfaceIndexEntry>();
  for (const u of parseAllUsxdFromMarkdown(markdown)) {
    map.set(u.name, { filePath: abs, markdown });
  }
  return map;
}

export function bundleForSurface(surfaceId: string, entry: SurfaceIndexEntry | undefined): SurfaceBundle | null {
  if (!entry) return null;
  const usxds = parseAllUsxdFromMarkdown(entry.markdown);
  const usxd = usxds.find((u) => u.name === surfaceId) ?? usxds[0] ?? null;
  if (!usxd) return null;
  const grid = extractGrid(entry.markdown);
  return { usxd, grid, sourcePath: entry.filePath };
}
