import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import chalk from "chalk";
import fs from "fs-extra";
import path from "node:path";
import { getVaultRoot, templatesDir } from "../paths.js";

const steps: { title: string; body: string }[] = [
  {
    title: "Welcome",
    body: `uDos is a markdown-first vault. Your notes live under ${chalk.cyan("~/vault")} by default (override with UDOS_VAULT).`,
  },
  {
    title: "Create your vault",
    body: `Run ${chalk.green("udo init")} once. That creates folders like content/, system/, and spool/.`,
  },
  {
    title: "First note",
    body: `Add a file under ${chalk.cyan("content/")}, for example ${chalk.green("content/hello.md")}. Open it with ${chalk.green("udo open content/hello.md")}.`,
  },
  {
    title: "Templates",
    body: `List templates: ${chalk.green("udo template list")}. Apply one: ${chalk.green("udo template apply <name>")}. Templates ship from ${chalk.dim(templatesDir())}.`,
  },
  {
    title: "Health",
    body: `Run ${chalk.green("udo doctor")} anytime. ${chalk.green("udo help")} lists every command.`,
  },
];

async function pauseIfTty(): Promise<void> {
  if (!input.isTTY) return;
  const rl = readline.createInterface({ input, output });
  await rl.question(chalk.dim("(press Enter) "));
  rl.close();
}

export async function cmdTour(): Promise<void> {
  console.log(chalk.bold("uDos — quick tour\n"));
  for (const s of steps) {
    console.log(chalk.bold(s.title));
    console.log(s.body + "\n");
    await pauseIfTty();
  }
  const vault = getVaultRoot();
  const hasVault = await fs.pathExists(vault);
  if (!hasVault) {
    console.log(chalk.yellow("Next: run `udo init` to create your vault."));
  } else {
    console.log(chalk.green(`Vault found: ${path.resolve(vault)}`));
  }
}
