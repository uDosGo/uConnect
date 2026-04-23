import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import fs from "fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const udoBin = path.join(repoRoot, "core", "bin", "udo.mjs");

function runUdo(args, env = {}) {
  const res = spawnSync(process.execPath, [udoBin, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
  const out = `${res.stdout ?? ""}\n${res.stderr ?? ""}`;
  const noAnsi = out.replace(/\x1b\[[0-9;]*m/g, "");
  return { code: res.status ?? 0, output: noAnsi };
}

test("vault init subcommand is exposed", () => {
  const vault = runUdo(["vault", "--help"]);
  assert.equal(vault.code, 0);
  assert.match(vault.output, /udo vault/);
  assert.match(vault.output, /init/);
});

test("github and pr command groups are exposed", () => {
  const gh = runUdo(["github", "--help"]);
  assert.equal(gh.code, 0);
  assert.match(gh.output, /udo github/);

  const pr = runUdo(["pr", "--help"]);
  assert.equal(pr.code, 0);
  assert.match(pr.output, /udo pr/);
});

test("wp command emits setup guidance when not configured", () => {
  const wp = runUdo(["wp", "sync"]);
  assert.equal(wp.code, 0);
  assert.match(wp.output.toLowerCase(), /setup required/);
  assert.match(wp.output.toLowerCase(), /udo wp setup/);
  assert.match(wp.output.toLowerCase(), /configure wordpress connection/);
});

test("collab docs route uses wp stub path", () => {
  const submit = runUdo(["submit", "docs/guide.md"]);
  assert.equal(submit.code, 0);
  assert.match(submit.output.toLowerCase(), /wordpress draft submission/);
});

test("obf render supports html format", () => {
  const out = runUdo(["obf", "render", "docs/specs/obf-ui-blocks.md", "--format", "html"]);
  assert.equal(out.code, 0);
  assert.match(out.output, /obf-card/);
  assert.match(out.output, /obf-tabs/);
  assert.match(out.output, /obf-accordion/);
  assert.match(out.output, /obf-grid/);
});

test("usxd render supports teletext, mono, wireframe modes", () => {
  const file = "tools/usxd-express/surfaces/demo.md";
  for (const mode of ["teletext", "mono", "wireframe"]) {
    const out = runUdo(["usxd", "render", file, "--mode", mode]);
    assert.equal(out.code, 0, `mode ${mode} should succeed`);
    assert.match(out.output, /SURFACE teletext-console/);
  }
});

test("gui command group is exposed", () => {
  const gui = runUdo(["gui", "--help"]);
  assert.equal(gui.code, 0);
  assert.match(gui.output, /udo gui/);
  assert.match(gui.output, /demos/);
  assert.match(gui.output, /index/);
  assert.match(gui.output, /status/);
  assert.match(gui.output, /stop/);
});

test("app command group is exposed", () => {
  const app = runUdo(["app", "--help"]);
  assert.equal(app.code, 0);
  assert.match(app.output, /\budo app\b/);
  assert.match(app.output, /\blaunch\b/);
});

test("app launch documents execute and runtime", () => {
  const launch = runUdo(["app", "launch", "--help"]);
  assert.equal(launch.code, 0);
  assert.match(launch.output, /--execute/);
  assert.match(launch.output, /--runtime/);
});

test("adaptor validate accepts baseline yaml", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "udo-adaptor-"));
  const file = path.join(dir, "adaptor.yaml");
  await fs.writeFile(
    file,
    `name: demo-adaptor
version: 1
runtime:
  type: node
  port: 3000
integration:
  variables: []
`,
    "utf8"
  );
  const out = runUdo(["adaptor", "validate", file]);
  assert.equal(out.code, 0, out.output);
  assert.match(out.output, /Adaptor config valid\./);
});

test("trash command lifecycle works with index", async () => {
  const vault = await fs.mkdtemp(path.join(os.tmpdir(), "udo-trash-"));
  await fs.mkdir(path.join(vault, "content"), { recursive: true });
  await fs.writeFile(path.join(vault, "content", "note.md"), "hello\n", "utf8");

  const move = runUdo(["trash", "move", "content/note.md"], { UDOS_VAULT: vault });
  assert.equal(move.code, 0);
  assert.match(move.output, /Moved to trash:/);

  const stats = runUdo(["compost", "index", "stats"], { UDOS_VAULT: vault });
  assert.equal(stats.code, 0);
  assert.match(stats.output, /total/i);

  const list = runUdo(["trash", "list"], { UDOS_VAULT: vault });
  assert.equal(list.code, 0);
  const firstId = list.output.split(/\s+/).find((v) => v.includes("-"));
  assert.ok(firstId, "expected trash id");

  const restore = runUdo(["trash", "restore", firstId], { UDOS_VAULT: vault });
  assert.equal(restore.code, 0);
  assert.match(restore.output, /Restored to:/);
});
