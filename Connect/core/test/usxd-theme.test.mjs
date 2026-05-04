import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyUsxdTheme, readActiveUsxd } from "../dist/lib/usxd-theme.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoTemplates = path.resolve(__dirname, "..", "..", "templates");

test("applyUsxdTheme copies theme and writes active.json", async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "udo-usxd-"));
  process.env.UDOS_TEMPLATES_ROOT = repoTemplates;
  await applyUsxdTheme(tmp, "default");
  assert.ok(await fs.pathExists(path.join(tmp, "system", "usxd", "current", "theme.css")));
  const active = await readActiveUsxd(tmp);
  assert.equal(active?.name, "default");
  delete process.env.UDOS_TEMPLATES_ROOT;
});
