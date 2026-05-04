import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";
import { PNG } from "pngjs";
import {
  parseGridMarkdown,
  renderAscii,
  renderTerminal,
  validateGridDimensions,
  type GridMode,
} from "@udos/obf-grid";

type ParsedLayer = {
  name: string;
  source: string;
  grid: ReturnType<typeof parseGridMarkdown>;
};

const GRID_BLOCK_RE = /```grid\s*([^\n]*)\n([\s\S]*?)```/gm;

async function readGridFile(file: string): Promise<string> {
  const abs = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
  if (!(await fs.pathExists(abs))) {
    throw new Error(`Not found: ${abs}`);
  }
  return fs.readFile(abs, "utf8");
}

async function writeGridFile(file: string, content: string): Promise<void> {
  const abs = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, content, "utf8");
}

function layerNameFromHeader(header: string, index: number): string {
  const m = /\blayer=(?:"([^"]+)"|'([^']+)'|(\S+))/i.exec(header);
  return (m?.[1] ?? m?.[2] ?? m?.[3] ?? (index === 0 ? "base" : `layer-${index}`)).trim();
}

function parseLayers(source: string): ParsedLayer[] {
  const out: ParsedLayer[] = [];
  let m: RegExpExecArray | null;
  while ((m = GRID_BLOCK_RE.exec(source)) !== null) {
    const header = m[1] ?? "";
    const body = m[2] ?? "";
    const fence = `\`\`\`grid ${header}\n${body}\n\`\`\``;
    out.push({
      name: layerNameFromHeader(header, out.length),
      source: fence,
      grid: parseGridMarkdown(fence),
    });
  }
  if (out.length > 0) return out;
  // Standalone .grid content: treat entire file as one compact layer.
  return [{ name: "base", source, grid: parseGridMarkdown(source) }];
}

function ensureLayerIndex(layers: ParsedLayer[], idx: number): ParsedLayer {
  const layer = layers[idx];
  if (!layer) throw new Error(`Layer index out of range: ${idx}`);
  return layer;
}

function cloneRows(rows: string[][]): string[][] {
  return rows.map((r) => [...r]);
}

function toCompactFence(name: string, grid: ReturnType<typeof parseGridMarkdown>): string {
  const body = grid.rows.map((r) => r.join("")).join("\n");
  return (
    "```grid " +
    `size="${grid.options.width}x${grid.options.height}" ` +
    `mode="${grid.options.mode}" compact layer="${name}"\n` +
    body +
    "\n```"
  );
}

function serializeLayers(layers: ParsedLayer[]): string {
  if (layers.length === 1 && layers[0]?.name === "base") {
    return toCompactFence("base", layers[0].grid) + "\n";
  }
  return (
    "# OBF Grid Layers\n\n" +
    layers.map((l) => `## Layer: ${l.name}\n\n${toCompactFence(l.name, l.grid)}`).join("\n\n") +
    "\n"
  );
}

function rotate90(rows: string[][]): string[][] {
  const h = rows.length;
  const w = rows[0]?.length ?? 0;
  const out: string[][] = Array.from({ length: w }, () => Array.from({ length: h }, () => " "));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      out[x]![h - 1 - y] = rows[y]![x]!;
    }
  }
  return out;
}

function colorFor(mode: GridMode, ch: string): [number, number, number, number] {
  const palette =
    mode === "mono"
      ? {
          "█": [0, 0, 0, 255],
          "▓": [48, 48, 48, 255],
          "▒": [102, 102, 102, 255],
          "░": [180, 180, 180, 255],
          "□": [0, 0, 0, 255],
          "■": [0, 0, 0, 255],
          " ": [255, 255, 255, 255],
        }
      : mode === "wireframe"
        ? {
            "█": [0, 0, 0, 255],
            "▓": [80, 80, 80, 255],
            "▒": [140, 140, 140, 255],
            "░": [220, 220, 220, 255],
            "□": [10, 10, 10, 255],
            "■": [10, 10, 10, 255],
            " ": [255, 255, 255, 255],
          }
        : {
            "█": [0, 255, 0, 255],
            "▓": [0, 120, 0, 255],
            "▒": [0, 170, 0, 255],
            "░": [0, 220, 0, 255],
            "□": [0, 255, 0, 255],
            "■": [0, 255, 0, 255],
            " ": [0, 0, 0, 255],
          };
  const c = palette[ch as keyof typeof palette] ?? palette["░"];
  return c as [number, number, number, number];
}

function svgColor(mode: GridMode, ch: string): string {
  const [r, g, b] = colorFor(mode, ch);
  return `rgb(${r} ${g} ${b})`;
}

function gridToSvg(grid: ReturnType<typeof parseGridMarkdown>): string {
  const cell = 24;
  const w = grid.options.width * cell;
  const h = grid.options.height * cell;
  const rects: string[] = [];
  for (let y = 0; y < grid.options.height; y++) {
    for (let x = 0; x < grid.options.width; x++) {
      const ch = grid.rows[y]?.[x] ?? " ";
      rects.push(
        `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${svgColor(grid.options.mode, ch)}"/>`
      );
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
${rects.join("\n")}
</svg>
`;
}

function gridToPng(grid: ReturnType<typeof parseGridMarkdown>): Buffer {
  const cell = 24;
  const width = grid.options.width * cell;
  const height = grid.options.height * cell;
  const png = new PNG({ width, height });
  for (let y = 0; y < grid.options.height; y++) {
    for (let x = 0; x < grid.options.width; x++) {
      const ch = grid.rows[y]?.[x] ?? " ";
      const [r, g, b, a] = colorFor(grid.options.mode, ch);
      for (let py = 0; py < cell; py++) {
        for (let px = 0; px < cell; px++) {
          const ox = x * cell + px;
          const oy = y * cell + py;
          const idx = (oy * width + ox) * 4;
          png.data[idx] = r;
          png.data[idx + 1] = g;
          png.data[idx + 2] = b;
          png.data[idx + 3] = a;
        }
      }
    }
  }
  return PNG.sync.write(png);
}

export async function cmdGridRender(file: string, mode?: GridMode): Promise<void> {
  const raw = await readGridFile(file);
  const layers = parseLayers(raw);
  const grid = layers[0]!.grid;
  const err = validateGridDimensions(grid);
  if (err) console.log(chalk.yellow("Warning:"), err);
  console.log(renderTerminal(grid, mode));
}

export async function cmdGridExport(
  file: string,
  format: string,
  outFile?: string
): Promise<void> {
  const raw = await readGridFile(file);
  const layers = parseLayers(raw);
  const grid = layers[0]!.grid;
  const fmt = (format || "ascii").toLowerCase();

  if (fmt === "ascii" || fmt === "txt") {
    const text = renderAscii(grid);
    if (outFile) {
      await fs.writeFile(path.resolve(outFile), text, "utf8");
      console.log(chalk.green(`Wrote ${outFile}`));
    } else {
      console.log(text);
    }
    return;
  }

  if (fmt === "obf") {
    const body = grid.rows.map((r) => r.join("")).join("\n");
    const fence =
      "```grid " +
      `size="${grid.options.width}x${grid.options.height}" ` +
      `mode="${grid.options.mode}" compact\n` +
      body +
      "\n```\n";
    if (outFile) {
      await fs.writeFile(path.resolve(outFile), fence, "utf8");
      console.log(chalk.green(`Wrote ${outFile}`));
    } else {
      console.log(fence);
    }
    return;
  }

  if (fmt === "svg") {
    const svg = gridToSvg(grid);
    if (outFile) {
      await fs.writeFile(path.resolve(outFile), svg, "utf8");
      console.log(chalk.green(`Wrote ${outFile}`));
    } else {
      console.log(svg);
    }
    return;
  }

  if (fmt === "png") {
    const png = gridToPng(grid);
    if (outFile) {
      await fs.writeFile(path.resolve(outFile), png);
      console.log(chalk.green(`Wrote ${outFile}`));
    } else {
      console.log(chalk.yellow("PNG export requires -o, --output <path>"));
      process.exitCode = 1;
    }
    return;
  }

  console.log(chalk.red(`Unknown format: ${format}`));
  process.exitCode = 1;
}

export async function cmdGridValidate(file: string): Promise<void> {
  const raw = await readGridFile(file);
  const layers = parseLayers(raw);
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i]!;
    const err = validateGridDimensions(layer.grid);
    if (err) {
      console.log(chalk.red(`Invalid layer ${i} (${layer.name}):`), err);
      process.exitCode = 1;
      return;
    }
  }
  const g = layers[0]!.grid;
  console.log(chalk.green("OK"), `${layers.length} layer(s)`, `${g.options.width}×${g.options.height}`, g.options.mode);
}

const MINIMAL_GRID = `# OBF Grid

\`\`\`grid size="12x6" mode="teletext" compact
████████████
█░░░░░░░░░░█
█░░▒▒░░░░░░█
█░░▒▒░░░░░░█
█░░░░░░░░░░█
████████████
\`\`\`
`;

export async function cmdGridEdit(file: string): Promise<void> {
  const abs = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
  if (!(await fs.pathExists(abs))) {
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, MINIMAL_GRID, "utf8");
    console.log(chalk.dim(`Created ${abs}`));
  }
  const editor = process.env.EDITOR || "nano";
  console.log(
    chalk.cyan("OBF Grid — edit in your editor"),
    chalk.dim("(h/j/k/l TUI planned — see docs/specs/obf-grid-spec.md)")
  );
  const { spawn } = await import("node:child_process");
  await new Promise<void>((resolve, reject) => {
    const c = spawn(editor, [abs], { stdio: "inherit", shell: true });
    c.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`editor ${code}`))));
  });
}

export async function cmdGridResize(file: string, size: string): Promise<void> {
  const m = /^(\d+)x(\d+)$/i.exec(size.trim());
  if (!m) throw new Error(`Invalid --size value: ${size} (expected WxH)`);
  const newW = parseInt(m[1]!, 10);
  const newH = parseInt(m[2]!, 10);
  const raw = await readGridFile(file);
  const layers = parseLayers(raw);
  for (const layer of layers) {
    const rows = layer.grid.rows;
    const next: string[][] = [];
    for (let y = 0; y < newH; y++) {
      const row = [...(rows[y] ?? [])];
      while (row.length < newW) row.push(" ");
      next.push(row.slice(0, newW));
    }
    layer.grid.rows = next;
    layer.grid.options.width = newW;
    layer.grid.options.height = newH;
    layer.grid.options.compact = true;
  }
  await writeGridFile(file, serializeLayers(layers));
  console.log(chalk.green(`Resized ${file} → ${newW}x${newH}`));
}

export async function cmdGridRotate(file: string, degrees: string): Promise<void> {
  const deg = Number(degrees);
  if (![90, 180, 270].includes(deg)) {
    throw new Error(`Invalid --degrees: ${degrees} (use 90 | 180 | 270)`);
  }
  const turns = deg / 90;
  const raw = await readGridFile(file);
  const layers = parseLayers(raw);
  for (const layer of layers) {
    let rows = cloneRows(layer.grid.rows);
    for (let i = 0; i < turns; i++) rows = rotate90(rows);
    layer.grid.rows = rows;
    layer.grid.options.width = rows[0]?.length ?? 0;
    layer.grid.options.height = rows.length;
    layer.grid.options.compact = true;
  }
  await writeGridFile(file, serializeLayers(layers));
  console.log(chalk.green(`Rotated ${file} by ${deg}°`));
}

export async function cmdGridFlip(file: string, horizontal: boolean): Promise<void> {
  const raw = await readGridFile(file);
  const layers = parseLayers(raw);
  for (const layer of layers) {
    const rows = cloneRows(layer.grid.rows);
    layer.grid.rows = horizontal ? rows.map((r) => [...r].reverse()) : [...rows].reverse();
    layer.grid.options.compact = true;
  }
  await writeGridFile(file, serializeLayers(layers));
  console.log(chalk.green(`Flipped ${file} (${horizontal ? "horizontal" : "vertical"})`));
}

export async function cmdGridLayerAdd(file: string, name: string): Promise<void> {
  const raw = await readGridFile(file);
  const layers = parseLayers(raw);
  const base = layers[0]!.grid;
  const rows = Array.from({ length: base.options.height }, () =>
    Array.from({ length: base.options.width }, () => " ")
  );
  layers.push({
    name,
    source: "",
    grid: {
      options: { ...base.options, compact: true },
      rows,
    },
  });
  await writeGridFile(file, serializeLayers(layers));
  console.log(chalk.green(`Added layer "${name}"`));
}

export async function cmdGridLayerList(file: string): Promise<void> {
  const raw = await readGridFile(file);
  const layers = parseLayers(raw);
  layers.forEach((l, i) => {
    console.log(`${i}\t${l.name}\t${l.grid.options.width}x${l.grid.options.height}\t${l.grid.options.mode}`);
  });
}

export async function cmdGridLayerShow(file: string, layerIndex: number, mode?: GridMode): Promise<void> {
  const raw = await readGridFile(file);
  const layers = parseLayers(raw);
  const layer = ensureLayerIndex(layers, layerIndex);
  console.log(renderTerminal(layer.grid, mode));
}

export async function cmdGridLayerMerge(file: string, layersArg: string): Promise<void> {
  const raw = await readGridFile(file);
  const parsed = parseLayers(raw);
  const ids = layersArg
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  if (ids.length === 0) throw new Error("No valid layer indices in --layers");
  const selected = ids.map((id) => ensureLayerIndex(parsed, id));
  const base = selected[0]!.grid;
  const out = cloneRows(base.rows);
  for (let i = 1; i < selected.length; i++) {
    const rows = selected[i]!.grid.rows;
    for (let y = 0; y < out.length; y++) {
      for (let x = 0; x < out[y]!.length; x++) {
        const ch = rows[y]?.[x] ?? " ";
        if (ch !== " ") out[y]![x] = ch;
      }
    }
  }
  const merged: ParsedLayer = {
    name: `merged-${ids.join("-")}`,
    source: "",
    grid: {
      options: { ...base.options, compact: true },
      rows: out,
    },
  };
  await writeGridFile(file, serializeLayers([merged]));
  console.log(chalk.green(`Merged layers ${ids.join(",")} → ${file}`));
}
