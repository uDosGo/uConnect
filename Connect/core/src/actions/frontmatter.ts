import fs from "fs-extra";
import matter from "gray-matter";
import chalk from "chalk";
import { getVaultRoot, resolveInVault } from "../paths.js";

export async function cmdFmAdd(file: string, tag?: string): Promise<void> {
  if (!tag) {
    console.error(chalk.red("Use: udo fm add <file> --tag <name>"));
    process.exitCode = 1;
    return;
  }
  const root = getVaultRoot();
  const abs = resolveInVault(root, file);
  const raw = await fs.readFile(abs, "utf8");
  const { data, content } = matter(raw);
  const tags = Array.isArray(data.tags) ? [...data.tags] : data.tags ? [data.tags] : [];
  if (!tags.includes(tag)) tags.push(tag);
  const next = { ...data, tags };
  const out = matter.stringify(content, next);
  await fs.writeFile(abs, out, "utf8");
  console.log(chalk.green(`Tagged ${file} → tags: ${tags.join(", ")}`));
}

export async function cmdFmList(file: string): Promise<void> {
  const root = getVaultRoot();
  const abs = resolveInVault(root, file);
  const raw = await fs.readFile(abs, "utf8");
  const { data } = matter(raw);
  console.log(JSON.stringify(data, null, 2));
}

export async function cmdFmEdit(file: string): Promise<void> {
  console.log(chalk.yellow("VA1: edit frontmatter in your editor — `udo open " + file + "` then save YAML between --- fences."));
}
