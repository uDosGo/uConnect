import path from "node:path";
import fs from "fs-extra";
import { glob } from "glob";
import { parseAllUsxdFromMarkdown } from "./parse-usxd.js";
import { extractGrid } from "./extract-grid.js";
import { renderToHTML } from "./renderer.js";

export type ExportOptions = {
  file?: string;
  dir?: string;
  output: string;
};

export async function exportSurfaces(opts: ExportOptions): Promise<void> {
  const outDir = path.resolve(opts.output);
  await fs.ensureDir(outDir);

  if (opts.file) {
    const abs = path.resolve(opts.file);
    const md = await fs.readFile(abs, "utf8");
    await exportMarkdownFile(md, abs, outDir);
    return;
  }

  const root = path.resolve(opts.dir ?? "./surfaces");
  if (!(await fs.pathExists(root))) {
    console.error(`Directory not found: ${root}`);
    process.exit(1);
  }
  const pattern = path.join(root, "**/*.md").replace(/\\/g, "/");
  const files = await glob(pattern, { nodir: true, absolute: true });
  if (files.length === 0) {
    console.error(`No .md files under ${root}`);
    process.exit(1);
  }
  for (const file of files.sort()) {
    const md = await fs.readFile(file, "utf8");
    await exportMarkdownFile(md, file, outDir);
  }
}

async function exportMarkdownFile(markdown: string, sourcePath: string, outDir: string): Promise<void> {
  const surfaces = parseAllUsxdFromMarkdown(markdown);
  const grid = extractGrid(markdown);
  for (const u of surfaces) {
    const html = await renderToHTML(u, grid, { tailwindCdn: false, liveReload: false });
    const safe = u.name.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "surface";
    const target = path.join(outDir, `${safe}.html`);
    await fs.writeFile(target, html, "utf8");
    console.log(`Wrote ${target} (${sourcePath})`);
  }
}
