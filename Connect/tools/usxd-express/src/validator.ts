import path from "node:path";
import fs from "fs-extra";
import { validateGridDimensions } from "@udos/obf-grid";
import { parseAllUsxdFromMarkdown } from "./parse-usxd.js";
import { extractGrid } from "./extract-grid.js";

export async function validateFile(file: string): Promise<number> {
  const abs = path.resolve(file);
  const md = await fs.readFile(abs, "utf8");
  const surfaces = parseAllUsxdFromMarkdown(md);
  if (surfaces.length === 0) {
    console.error(`No \`\`\`usxd\`\`\` surface in ${abs}`);
    return 1;
  }

  for (const s of surfaces) {
    if (!s.name.trim()) {
      console.error("SURFACE missing name=");
      return 1;
    }
    console.log(`OK surface "${s.name}"`);
  }

  const grid = extractGrid(md);
  if (grid) {
    const err = validateGridDimensions(grid);
    if (err) {
      console.error(`Grid: ${err}`);
      return 1;
    }
    console.log(`OK grid ${grid.options.width}×${grid.options.height}`);
  } else {
    console.log("Note: no ```grid``` block (optional).");
  }

  return 0;
}
