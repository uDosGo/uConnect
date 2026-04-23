import { parseGridMarkdown } from "@udos/obf-grid";
import type { ParsedGrid } from "@udos/obf-grid";
import { firstGridFenceAsMarkdown } from "./markdown-fences.js";

export function extractGrid(markdown: string): ParsedGrid | null {
  const fenceMd = firstGridFenceAsMarkdown(markdown) ?? markdown;
  try {
    const g = parseGridMarkdown(fenceMd);
    const { width, height } = g.options;
    if (width <= 0 || height <= 0) return null;
    if (g.rows.length === 0) return null;
    return g;
  } catch {
    return null;
  }
}
