import fs from "fs-extra";
import path from "node:path";
import os from "node:os";
import { constants as FS } from "node:fs";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import chalk from "chalk";
import { parseSemver } from "@udos/shared-utils";
import { getVaultRoot, udosConnectRoot } from "../paths.js";

export async function readPackageVersion(): Promise<string> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const pkgPath = path.join(here, "..", "..", "package.json");
  const alt = path.join(process.cwd(), "package.json");
  for (const p of [pkgPath, alt]) {
    if (await fs.pathExists(p)) {
      const j = JSON.parse(await fs.readFile(p, "utf8"));
      if (j.version) return j.version as string;
    }
  }
  return "0.0.0";
}

export async function cmdVersion(): Promise<void> {
  console.log(`udo ${await readPackageVersion()} (VA1 TypeScript)`);
}

export async function cmdStatus(): Promise<void> {
  const vault = getVaultRoot();
  console.log({
    vault,
    exists: await fs.pathExists(vault),
    cwd: process.cwd(),
    node: process.version,
  });
}

function gitPresent(): boolean {
  try {
    execSync("git --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export async function cmdDoctor(): Promise<void> {
  const vault = getVaultRoot();
  const ok: string[] = [];
  const bad: string[] = [];
  const sem = parseSemver(process.version);
  const nodeMajor = sem?.major ?? 0;
  if (nodeMajor >= 20) ok.push(`Node ${process.version} (>= 20)`);
  else if (nodeMajor >= 18) {
    ok.push(`Node ${process.version} (>= 18; 20+ recommended)`);
  } else bad.push("Node should be >= 18");

  try {
    const nv = execSync("npm --version", { encoding: "utf8" }).trim();
    const nMajor = parseInt(nv.split(".")[0]!, 10);
    if (!Number.isNaN(nMajor) && nMajor >= 9) ok.push(`npm ${nv} (>= 9)`);
    else bad.push(`npm should be >= 9 (found ${nv})`);
  } catch {
    bad.push("npm not found");
  }

  if (gitPresent()) ok.push("git present");
  else console.log(chalk.dim("○ git optional — not in PATH"));

  const coreCli = path.join(udosConnectRoot(), "core", "dist", "cli.js");
  if (await fs.pathExists(coreCli)) ok.push("core built (dist/cli.js)");
  else bad.push("core not built — run launcher or: sonic-express install");

  if (await fs.pathExists(vault)) ok.push("Vault path reachable");
  else bad.push("Vault missing — run udo init");
  try {
    await fs.access(vault, FS.W_OK);
    ok.push("Vault writable");
  } catch {
    bad.push("Vault not writable");
  }
  ok.forEach((m) => console.log(chalk.green("✓"), m));
  bad.forEach((m) => console.log(chalk.red("✗"), m));
  if (bad.length) process.exitCode = 1;
}

export async function cmdCleanup(): Promise<void> {
  const cache = path.join(os.homedir(), ".cache", "udos");
  if (await fs.pathExists(cache)) {
    await fs.remove(cache);
    console.log(chalk.green(`Removed ${cache}`));
  } else console.log(chalk.dim("Nothing to clean."));
}

export async function cmdClean(opts: { logs?: boolean; dryRun?: boolean }): Promise<void> {
  const vault = getVaultRoot();
  const targets = [path.join(vault, ".local", "cache"), path.join(vault, ".local", "tmp")];
  if (opts.logs) targets.push(path.join(vault, ".local", "logs"));
  const existing = [];
  for (const t of targets) {
    if (await fs.pathExists(t)) existing.push(t);
  }
  if (opts.dryRun) {
    console.log({ mode: "dry-run", targets: existing });
    return;
  }
  for (const t of existing) {
    await fs.remove(t);
    await fs.mkdir(t, { recursive: true });
  }
  console.log(chalk.green(`Cleaned ${existing.length} path(s)`));
}

export async function cmdTidy(): Promise<void> {
  const entries = await fs.readdir(process.cwd());
  const sorted = [...entries].sort((a, b) => a.localeCompare(b));
  sorted.forEach((e) => console.log(e));
}

export async function cmdPing(): Promise<void> {
  console.log("ping");
}

export async function cmdPong(): Promise<void> {
  console.log("pong");
}

export async function cmdHealth(quick: boolean): Promise<void> {
  if (quick) {
    const vault = getVaultRoot();
    const ok = await fs.pathExists(vault);
    console.log(ok ? "healthy" : "unhealthy");
    if (!ok) process.exitCode = 1;
    return;
  }
  await cmdDoctor();
}
