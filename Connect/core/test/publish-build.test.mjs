import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildStaticSite } from "../dist/lib/publish-build.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("buildStaticSite writes .site with index and build.json", async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "udo-site-"));
  await fs.mkdir(path.join(tmp, "content"), { recursive: true });
  await fs.writeFile(path.join(tmp, "content", "hello.md"), "---\ntitle: Hi\n---\n# Hello\n");
  const r = await buildStaticSite(tmp);
  assert.equal(r.pages, 1);
  assert.ok(await fs.pathExists(path.join(r.outDir, "index.html")));
  assert.ok(await fs.pathExists(path.join(r.outDir, "hello.html")));
  assert.ok(await fs.pathExists(r.buildJsonPath));
  const meta = JSON.parse(await fs.readFile(r.buildJsonPath, "utf8"));
  assert.equal(meta.pages, 1);
});

test("relativePathToAssets via build output links css", async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "udo-site-"));
  await fs.mkdir(path.join(tmp, "content", "a"), { recursive: true });
  await fs.writeFile(path.join(tmp, "content", "a", "b.md"), "# nested\n");
  const r = await buildStaticSite(tmp);
  const nested = await fs.readFile(path.join(r.outDir, "a", "b.html"), "utf8");
  assert.match(nested, /href="\.\.\/assets\/theme\.css"/);
});
