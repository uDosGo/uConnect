import type { GridMode, GridOptions, ParsedGrid } from "./types.js";

const GRID_FENCE = /^```grid\s*([^\n]*)\n([\s\S]*?)```/m;

function parseHeader(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /(\w+)=("([^"]*)"|'([^']*)'|(\S+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(header)) !== null) {
    const key = m[1]!;
    const val = (m[3] ?? m[4] ?? m[5] ?? "").trim();
    out[key] = val;
  }
  return out;
}

function parseSize(s: string | undefined, fallbackW: number, fallbackH: number): { w: number; h: number } {
  if (!s) return { w: fallbackW, h: fallbackH };
  const m = /^(\d+)x(\d+)$/i.exec(s.trim());
  if (!m) return { w: fallbackW, h: fallbackH };
  return { w: parseInt(m[1]!, 10), h: parseInt(m[2]!, 10) };
}

function normalizeMode(s: string | undefined): GridMode {
  if (s === "mono" || s === "wireframe") return s;
  return "teletext";
}

/** Parse `[x,y]char` tokens into a dense grid */
function parseCoordinateBody(body: string, width: number, height: number): string[][] {
  const grid: string[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => " ")
  );
  const tokenRe = /\[(\d+),(\d+)\]([^\s])/gu;
  let m: RegExpExecArray | null;
  while ((m = tokenRe.exec(body)) !== null) {
    const x = parseInt(m[1]!, 10);
    const y = parseInt(m[2]!, 10);
    const ch = m[3]!;
    if (x >= 0 && x < width && y >= 0 && y < height) {
      grid[y]![x] = ch;
    }
  }
  return grid;
}

function parseCompactBody(body: string): { rows: string[][]; width: number; height: number } {
  const lines = body.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const height = lines.length;
  let width = 0;
  for (const line of lines) {
    const len = [...line].length;
    if (len > width) width = len;
  }
  const rows: string[][] = [];
  for (const line of lines) {
    const chars = [...line];
    while (chars.length < width) chars.push(" ");
    rows.push(chars.slice(0, width));
  }
  return { rows, width, height };
}

/**
 * Extract first ```grid ... ``` block from markdown, or treat entire string as grid body (compact).
 */
export function parseGridMarkdown(source: string): ParsedGrid {
  const match = GRID_FENCE.exec(source);
  if (!match) {
    const compact = parseCompactBody(source.trim());
    const { w, h } = parseSize(undefined, compact.width, compact.height);
    return {
      options: {
        width: w,
        height: h,
        mode: "teletext",
        compact: true,
        showCoords: false,
        editable: true,
      },
      rows: compact.rows,
    };
  }

  const headerRest = match[1]!.trim();
  const body = match[2]!.trimEnd();
  const attrs = parseHeader(headerRest);
  const compact = attrs["compact"] === "true" || /\bcompact\b/i.test(headerRest);

  if (compact) {
    const parsed = parseCompactBody(body);
    const { w, h } = parseSize(attrs["size"], parsed.width, parsed.height);
    return {
      options: {
        width: w,
        height: h,
        mode: normalizeMode(attrs["mode"]),
        compact: true,
        showCoords: attrs["show_coords"] === "true",
        editable: attrs["editable"] !== "false",
      },
      rows: padGrid(parsed.rows, w, h),
    };
  }

  const { w, h } = parseSize(attrs["size"], 12, 12);
  const rows = parseCoordinateBody(body, w, h);
  return {
    options: {
      width: w,
      height: h,
      mode: normalizeMode(attrs["mode"]),
      compact: false,
      showCoords: attrs["show_coords"] === "true",
      editable: attrs["editable"] !== "false",
    },
    rows,
  };
}

function padGrid(rows: string[][], w: number, h: number): string[][] {
  const out: string[][] = [];
  for (let y = 0; y < h; y++) {
    const row = rows[y] ?? Array.from({ length: w }, () => " ");
    const copy = [...row];
    while (copy.length < w) copy.push(" ");
    out.push(copy.slice(0, w));
  }
  return out;
}

export function validateGridDimensions(g: ParsedGrid): string | null {
  const { width, height } = g.options;
  if (g.rows.length !== height) return `Expected ${height} rows, got ${g.rows.length}`;
  for (let y = 0; y < height; y++) {
    if ((g.rows[y]?.length ?? 0) !== width) return `Row ${y}: expected width ${width}`;
  }
  return null;
}
