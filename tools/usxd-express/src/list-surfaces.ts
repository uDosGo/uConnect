import path from "node:path";
import fs from "fs-extra";
import { glob } from "glob";
import { parseAllUsxdFromMarkdown } from "./parse-usxd.js";

export async function listSurfaces(dir?: string): Promise<void> {
  const root = path.resolve(dir ?? process.cwd());
  const pattern = path.join(root, "**/*.md").replace(/\\/g, "/");
  const files = await glob(pattern, { nodir: true, absolute: true });
  const seen = new Set<string>();
  for (const file of files.sort()) {
    const md = await fs.readFile(file, "utf8");
    for (const u of parseAllUsxdFromMarkdown(md)) {
      if (seen.has(u.name)) continue;
      seen.add(u.name);
      console.log(`${u.name}\t${file}`);
    }
  }
  if (seen.size === 0) {
    console.log("(no surfaces found)");
  }
}
