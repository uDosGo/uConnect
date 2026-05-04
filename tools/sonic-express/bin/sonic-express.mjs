#!/usr/bin/env node
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const binDir = path.dirname(fileURLToPath(import.meta.url));
const seRoot = path.join(binDir, "..");
const repoRoot = path.join(seRoot, "..", "..");
const cliJs = path.join(seRoot, "dist", "cli.js");

function npmCmd() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function bootstrap() {
  if (existsSync(cliJs)) return;
  console.error("Bootstrapping uDos workspace (first run)…");
  const npm = npmCmd();
  const lock = path.join(repoRoot, "package-lock.json");
  let r;
  if (existsSync(lock)) {
    r = spawnSync(npm, ["ci", "--silent", "--no-audit", "--no-fund"], {
      cwd: repoRoot,
      stdio: "inherit",
    });
  } else {
    r = spawnSync(npm, ["install", "--silent", "--no-audit", "--no-fund"], {
      cwd: repoRoot,
      stdio: "inherit",
    });
  }
  if (r.status !== 0) process.exit(r.status ?? 1);
  const b = spawnSync(npm, ["run", "build"], { cwd: repoRoot, stdio: "inherit" });
  if (b.status !== 0) process.exit(b.status ?? 1);
}

bootstrap();
const { main } = await import(cliJs);
await main(process.argv);
