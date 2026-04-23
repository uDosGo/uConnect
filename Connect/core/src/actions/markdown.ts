import fs from "fs-extra";
import chalk from "chalk";
import { marked } from "marked";
import { getVaultRoot, resolveInVault } from "../paths.js";

export async function cmdMdFormat(file: string): Promise<void> {
  const root = getVaultRoot();
  const abs = resolveInVault(root, file);
  let text = await fs.readFile(abs, "utf8");
  const html = await marked.parse(text);
  const normalized = text.trim() + "\n";
  await fs.writeFile(abs, normalized, "utf8");
  console.log(chalk.green(`Formatted (normalize): ${file}`));
  console.log(chalk.dim(`(parsed ${html.length} chars HTML — VA1 does not rewrite MD AST yet)`));
}

export async function cmdMdLint(file: string): Promise<void> {
  const root = getVaultRoot();
  const abs = resolveInVault(root, file);
  const text = await fs.readFile(abs, "utf8");
  try {
    await marked.parse(text);
    console.log(chalk.green(`OK: ${file}`));
  } catch (e) {
    console.error(chalk.red("Parse error:"), e);
    process.exitCode = 1;
  }
}

export async function cmdMdToc(file: string): Promise<void> {
  const root = getVaultRoot();
  const abs = resolveInVault(root, file);
  const text = await fs.readFile(abs, "utf8");
  const lines = text.split("\n");
  const toc: string[] = [];
  for (const line of lines) {
    const m = /^(#{1,6})\s+(.+)$/.exec(line);
    if (m) {
      const depth = m[1].length - 1;
      const title = m[2].trim();
      toc.push(`${"  ".repeat(depth)}- ${title}`);
    }
  }
  console.log(toc.join("\n") || chalk.dim("(no headings)"));
}
