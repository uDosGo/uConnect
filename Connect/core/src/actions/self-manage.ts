import { spawnSync } from "node:child_process";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";
import { udosConnectRoot, getVaultRoot } from "../paths.js";

function sonicExpressScript(): string {
  return path.join(udosConnectRoot(), "tools", "sonic-express", "bin", "sonic-express.mjs");
}

export async function cmdUpdate(): Promise<void> {
  const script = sonicExpressScript();
  if (!(await fs.pathExists(script))) {
    console.error(chalk.red("sonic-express not found at"), script);
    process.exitCode = 1;
    return;
  }
  const r = spawnSync(process.execPath, [script, "update"], {
    stdio: "inherit",
    cwd: udosConnectRoot(),
  });
  process.exitCode = r.status === 0 ? 0 : 1;
}

async function confirm(message: string): Promise<boolean> {
  if (!input.isTTY) return false;
  const rl = readline.createInterface({ input, output });
  const a = (await rl.question(message)).trim().toLowerCase();
  rl.close();
  return a === "y" || a === "yes";
}

export async function cmdUninstall(opts: {
  yes?: boolean;
  deleteVault?: boolean;
}): Promise<void> {
  if (!opts.yes) {
    const ok = await confirm(
      chalk.yellow("Remove global `udo` (npm rm -g @udos/core)? [y/N] ")
    );
    if (!ok) {
      console.log(chalk.dim("Cancelled."));
      return;
    }
  }

  const coreDir = path.join(udosConnectRoot(), "core");
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const r = spawnSync(npm, ["rm", "-g", "@udos/core"], {
    stdio: "inherit",
    cwd: coreDir,
    shell: process.platform === "win32",
  });
  if (r.status !== 0) {
    console.log(
      chalk.yellow(
        "Global remove reported an error (maybe `udo` was not linked). Continuing."
      )
    );
  } else {
    console.log(chalk.green("Removed global @udos/core."));
  }

  if (!opts.deleteVault) return;

  const vault = getVaultRoot();
  if (!(await fs.pathExists(vault))) {
    console.log(chalk.dim("No vault to delete."));
    return;
  }

  if (!opts.yes) {
    const ok2 = await confirm(
      chalk.red.bold(`DELETE entire vault at ${vault}? [y/N] `)
    );
    if (!ok2) {
      console.log(chalk.dim("Vault left intact."));
      return;
    }
  }

  await fs.remove(vault);
  console.log(chalk.green(`Removed vault: ${vault}`));
}
