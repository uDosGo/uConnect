import fs from "fs-extra";
import path from "node:path";
import { spawn } from "node:child_process";
import { glob } from "glob";
import chalk from "chalk";
import { getVaultRoot, resolveInVault, seedDir, templatesDir } from "../paths.js";
import { moveToCompost, restoreFromCompost, ensureCompost } from "../compost.js";

/** Create VA1 vault tree + workspace skeleton (`@toybox`, `@sandbox`, `.local/`). */
export async function initVaultTree(root: string): Promise<void> {
  const dirs = [
    "content",
    "system",
    "system/usxd",
    "spool",
    "feeds",
    ".compost",
    "ucode",
    "@toybox",
    "@toybox/experiments/markdown-runtime",
    "@toybox/experiments/foam",
    "@toybox/experiments/docker/test-stacks",
    "@toybox/scratch",
    "@sandbox",
    ".local/cache",
    ".local/indexes",
    ".local/logs",
    ".local/lib",
    ".local/bin",
  ];
  for (const d of dirs) {
    await fs.mkdir(path.join(root, d), { recursive: true });
  }

  const toySeed = path.join(seedDir(), "toybox");
  const toyDest = path.join(root, "@toybox");
  if (await fs.pathExists(toySeed)) {
    await fs.copy(toySeed, toyDest, { overwrite: false, errorOnExist: false });
  }

  const stateDb = path.join(root, ".local", "state.db");
  if (!(await fs.pathExists(stateDb))) {
    await fs.writeFile(stateDb, "", "utf8");
  }

  const gitignore = path.join(root, ".gitignore");
  if (!(await fs.pathExists(gitignore))) {
    await fs.writeFile(gitignore, [".local/", ".compost/", ""].join("\n"), "utf8").catch(() => {});
  }

  const seedConfig = path.join(seedDir(), "config.md");
  const destConfig = path.join(root, "content", "config.md");
  if (await fs.pathExists(seedConfig)) {
    await fs.copy(seedConfig, destConfig, { overwrite: false });
  } else {
    await fs.writeFile(destConfig, "# Vault config\n\nEdit me.\n", { flag: "wx" }).catch(() => {});
  }
}

export async function cmdInit(): Promise<void> {
  const root = getVaultRoot();
  await fs.mkdir(root, { recursive: true });
  await initVaultTree(root);
  console.log(chalk.green(`Vault ready: ${root}`));
  console.log(chalk.dim(`Templates catalog: ${templatesDir()}`));
}

/** Same layout as `udo init`; optional path overrides vault root for this run. */
export async function cmdVaultInit(vaultPath?: string): Promise<void> {
  const root = vaultPath && vaultPath.length > 0 ? path.resolve(vaultPath) : getVaultRoot();
  await fs.mkdir(root, { recursive: true });
  await initVaultTree(root);
  console.log(chalk.green(`Vault ready: ${root}`));
  console.log(chalk.dim(`Templates catalog: ${templatesDir()}`));
}

export async function cmdList(): Promise<void> {
  const root = getVaultRoot();
  if (!(await fs.pathExists(root))) {
    console.error(chalk.red("No vault — run: udo init"));
    process.exitCode = 1;
    return;
  }
  const files = await glob("**/*", {
    cwd: root,
    nodir: true,
    ignore: ["**/node_modules/**"],
    dot: true,
  });
  files.sort();
  for (const f of files) console.log(f);
}

export async function cmdOpen(file: string): Promise<void> {
  const root = getVaultRoot();
  const abs = resolveInVault(root, file);
  if (!(await fs.pathExists(abs))) {
    console.error(chalk.red("Not found:", file));
    process.exitCode = 1;
    return;
  }
  const editor = process.env.EDITOR || "nano";
  await new Promise<void>((resolve, reject) => {
    const c = spawn(editor, [abs], { stdio: "inherit", shell: true });
    c.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`editor ${code}`))));
  });
}

export async function cmdEdit(file: string): Promise<void> {
  console.log(chalk.yellow("VA1: use `udo open <file>` with $EDITOR, or run your editor directly."));
  await cmdOpen(file);
}

export async function cmdDelete(file: string): Promise<void> {
  const root = getVaultRoot();
  const t = await import("./trash.js");
  await t.ensureTrashStorage(root);
  const id = await t.trashMove(root, file, "deleted").catch(async () => moveToCompost(root, file));
  console.log(chalk.green(`Moved to .compost: ${id}`));
}

export async function cmdRestore(id: string): Promise<void> {
  const root = getVaultRoot();
  const t = await import("./trash.js");
  await t.ensureTrashStorage(root);
  await ensureCompost(root);
  const dest = await t.trashRestore(root, id).catch(async () => restoreFromCompost(root, id));
  console.log(chalk.green(`Restored to: ${dest}`));
}

export async function cmdSearch(query: string): Promise<void> {
  const root = getVaultRoot();
  const files = await glob("**/*.{md,mdx,txt}", { cwd: root, nodir: true, dot: true });
  const q = query.toLowerCase();
  let hits = 0;
  for (const rel of files) {
    const abs = path.join(root, rel);
    const text = await fs.readFile(abs, "utf8").catch(() => "");
    if (text.toLowerCase().includes(q)) {
      console.log(rel);
      hits++;
    }
  }
  if (hits === 0) console.log(chalk.dim("No matches."));
}
