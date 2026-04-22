import fs from "fs-extra";
import path from "node:path";
import { renderTerminal } from "@udos/obf-grid";
import { parseAllUsxdFromMarkdown } from "./parse-usxd.js";
import { extractGrid } from "./extract-grid.js";
import type { GridMode } from "@udos/obf-grid";

export async function renderSurfaceFile(file: string, mode?: GridMode): Promise<void> {
  const abs = path.resolve(file);
  const markdown = await fs.readFile(abs, "utf8");
  const usxds = parseAllUsxdFromMarkdown(markdown);
  if (usxds.length === 0) {
    throw new Error(`No USXD surface found in ${abs}`);
  }
  const usxd = usxds[0]!;
  const grid = extractGrid(markdown);

  console.log(`SURFACE ${usxd.name}${usxd.version ? ` (${usxd.version})` : ""}`);
  if (usxd.regions.header) console.log(usxd.regions.header);
  if (usxd.regions.content) console.log(usxd.regions.content);

  if (grid) {
    console.log(renderTerminal(grid, mode ?? grid.options.mode));
  } else {
    console.log("(no grid block)");
  }

  if (usxd.regions.status) console.log(usxd.regions.status);
  if (usxd.controls.length > 0) {
    const line = usxd.controls.map((c) => `${c.keys}: ${c.action}`).join(" | ");
    console.log(line);
  }
}
