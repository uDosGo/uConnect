#!/usr/bin/env node
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const cli = path.join(root, "..", "dist", "cli.js");
if (!existsSync(cli)) {
  console.error("Build @udos/core first: cd core && npm install && npm run build");
  process.exit(1);
}
const { main } = await import(cli);
await main(process.argv);
