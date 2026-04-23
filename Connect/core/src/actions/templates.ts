import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";
import { templatesDir } from "../paths.js";

export async function cmdTemplateList(): Promise<void> {
  const root = templatesDir();
  if (!(await fs.pathExists(root))) {
    console.log(chalk.dim("No templates/ — set UDOS_TEMPLATES_ROOT"));
    return;
  }
  const entries = await fs.readdir(root, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) console.log(`${e.name}/`);
    else if (e.name.endsWith(".md")) console.log(e.name);
  }
}

async function resolveTemplate(name: string): Promise<string | null> {
  const base = templatesDir();
  const candidates = [path.join(base, name), path.join(base, `${name}.md`), path.join(base, "system", `${name}.md`)];
  for (const p of candidates) {
    if (await fs.pathExists(p)) return p;
  }
  return null;
}

export async function cmdTemplateShow(name: string): Promise<void> {
  const resolved = await resolveTemplate(name);
  if (!resolved) {
    console.error(chalk.red("Template not found:", name));
    process.exitCode = 1;
    return;
  }
  console.log(await fs.readFile(resolved, "utf8"));
}

export async function cmdTemplateApply(name: string): Promise<void> {
  const resolved = await resolveTemplate(name);
  if (!resolved) {
    console.error(chalk.red("Template not found:", name));
    process.exitCode = 1;
    return;
  }
  const dest = path.join(process.cwd(), path.basename(resolved));
  await fs.copy(resolved, dest, { overwrite: false });
  console.log(chalk.green(`Copied to ${dest}`));
}
