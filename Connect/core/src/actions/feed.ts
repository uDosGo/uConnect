import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";
import { glob } from "glob";
import { parse as parseYaml } from "yaml";
import { getVaultRoot } from "../paths.js";

function feedsDir(vault: string): string {
  return path.join(vault, "feeds");
}

type FeedEntry = {
  name: string;
  watch?: string;
  event?: string;
  action?: string;
  enabled?: boolean;
};

function feedsConfigPath(vault: string): string {
  return path.join(vault, ".local", "feeds.yaml");
}

async function loadFeedConfig(vault: string): Promise<FeedEntry[] | null> {
  const cfg = feedsConfigPath(vault);
  if (!(await fs.pathExists(cfg))) return null;
  const raw = await fs.readFile(cfg, "utf8");
  const parsed = parseYaml(raw) as { feeds?: FeedEntry[] } | null;
  if (!parsed?.feeds || !Array.isArray(parsed.feeds)) return [];
  return parsed.feeds.filter((f) => typeof f?.name === "string");
}

export async function cmdFeedList(): Promise<void> {
  const vault = getVaultRoot();
  const config = await loadFeedConfig(vault);
  if (config) {
    config.forEach((f) => console.log(`${f.name}${f.enabled === false ? " (disabled)" : ""}`));
    if (config.length === 0) console.log(chalk.dim("No feeds configured in .local/feeds.yaml"));
    return;
  }
  const d = feedsDir(vault);
  if (!(await fs.pathExists(d))) {
    console.log(chalk.dim("No feeds/ — run udo init"));
    return;
  }
  const files = await glob("*.jsonl", { cwd: d });
  files.sort().forEach((f) => console.log(f.replace(/\.jsonl$/, "")));
}

export async function cmdFeedView(name: string, limit = 20): Promise<void> {
  const vault = getVaultRoot();
  const config = await loadFeedConfig(vault);
  if (config) {
    const feed = config.find((f) => f.name === name);
    if (!feed) {
      console.error(chalk.red("Unknown configured feed:", name));
      process.exitCode = 1;
      return;
    }
    console.log(feed);
    return;
  }
  const file = path.join(feedsDir(vault), `${name}.jsonl`);
  if (!(await fs.pathExists(file))) {
    console.error(chalk.red("Unknown feed:", name));
    process.exitCode = 1;
    return;
  }
  const lines = (await fs.readFile(file, "utf8")).split("\n").filter(Boolean);
  for (let i = 0; i < Math.min(limit, lines.length); i++) {
    console.log(lines[i]);
  }
}

export async function cmdFeedExport(name: string, asJson: boolean): Promise<void> {
  const vault = getVaultRoot();
  const file = path.join(feedsDir(vault), `${name}.jsonl`);
  if (!(await fs.pathExists(file))) {
    console.error(chalk.red("Unknown feed:", name));
    process.exitCode = 1;
    return;
  }
  const lines = (await fs.readFile(file, "utf8")).split("\n").filter(Boolean);
  const items = lines.map((l) => JSON.parse(l));
  if (asJson) console.log(JSON.stringify(items, null, 2));
  else items.forEach((o) => console.log(JSON.stringify(o)));
}

export async function cmdFeedShow(name: string): Promise<void> {
  await cmdFeedView(name, 50);
}

export async function cmdFeedEnable(name: string): Promise<void> {
  const vault = getVaultRoot();
  const config = await loadFeedConfig(vault);
  if (!config) {
    console.log(chalk.yellow("A2 feature — configure .local/feeds.yaml first."));
    return;
  }
  const feed = config.find((f) => f.name === name);
  if (!feed) {
    console.error(chalk.red("Unknown configured feed:", name));
    process.exitCode = 1;
    return;
  }
  console.log(chalk.yellow("A2 feature — feed watchers are not active in VA1."));
  console.log(`Would enable: ${name}`);
}

export async function cmdFeedDisable(name: string): Promise<void> {
  const vault = getVaultRoot();
  const config = await loadFeedConfig(vault);
  if (!config) {
    console.log(chalk.yellow("A2 feature — configure .local/feeds.yaml first."));
    return;
  }
  const feed = config.find((f) => f.name === name);
  if (!feed) {
    console.error(chalk.red("Unknown configured feed:", name));
    process.exitCode = 1;
    return;
  }
  console.log(chalk.yellow("A2 feature — feed watchers are not active in VA1."));
  console.log(`Would disable: ${name}`);
}

export async function cmdFeedTest(name: string, dryRun: boolean): Promise<void> {
  const vault = getVaultRoot();
  const config = await loadFeedConfig(vault);
  if (!config) {
    console.log(chalk.yellow("No .local/feeds.yaml found; feed test unavailable."));
    process.exitCode = 1;
    return;
  }
  const feed = config.find((f) => f.name === name);
  if (!feed) {
    console.error(chalk.red("Unknown configured feed:", name));
    process.exitCode = 1;
    return;
  }
  console.log({
    mode: dryRun ? "dry-run" : "test",
    feed: name,
    watch: feed.watch ?? null,
    event: feed.event ?? null,
    action: feed.action ?? null,
    enabled: feed.enabled ?? true,
    note: "VA1 executes no watchers; this is an inspection stub.",
  });
}
