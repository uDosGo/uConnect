import { spawnSync } from "node:child_process";
import path from "node:path";
import chalk from "chalk";
import { udosConnectRoot } from "../paths.js";

function uosModuleDir(): string {
  return path.join(udosConnectRoot(), "modules", "uos");
}

function ensureGo(): void {
  const r = spawnSync("go", ["version"], { encoding: "utf8" });
  if (r.status !== 0) {
    console.error(chalk.red("go not found in PATH — install Go (1.22+) to use `udo app`."));
    process.exit(1);
  }
}

function runUos(args: string[]): void {
  ensureGo();
  const cwd = uosModuleDir();
  const r = spawnSync("go", ["run", "./cmd/uos", ...args], {
    cwd,
    stdio: "inherit",
    shell: false,
  });
  if (r.status !== 0 && r.status !== null) {
    process.exit(r.status);
  }
}

export async function cmdAppList(): Promise<void> {
  runUos(["apps", "list"]);
}

export async function cmdAppLaunch(
  app: string,
  passthrough: string[],
  opts: { execute: boolean; runtime?: string }
): Promise<void> {
  const args = ["launch", app];
  if (opts.runtime) {
    args.push("--runtime", opts.runtime);
  }
  args.push(opts.execute ? "--execute" : "--dry-run");
  if (passthrough.length > 0) {
    args.push("--", ...passthrough);
  }
  runUos(args);
}
