import fs from "fs-extra";
import path from "node:path";
import { spawnSync } from "node:child_process";
import chalk from "chalk";
import { getVaultRoot } from "../paths.js";
import { readGitHubConfig, writeGitHubConfig } from "../lib/github-config.js";

function run(cmd: string, args: string[], cwd?: string): string {
  const r = spawnSync(cmd, args, {
    cwd,
    shell: process.platform === "win32",
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (r.status !== 0) throw new Error((r.stderr || r.stdout || `${cmd} failed`).trim());
  return (r.stdout || "").trim();
}

function hasGitRepo(dir: string): boolean {
  return fs.existsSync(path.join(dir, ".git"));
}

function resolveRepoDir(): string {
  const vault = getVaultRoot();
  return hasGitRepo(vault) ? vault : process.cwd();
}

export async function cmdGitHubConfigure(username?: string, repo?: string): Promise<void> {
  const cfg = await readGitHubConfig();
  await writeGitHubConfig({
    ...cfg,
    username: username ?? cfg.username,
    default_repo: repo ?? cfg.default_repo,
    token: cfg.token ?? process.env.GITHUB_TOKEN,
  });
  console.log(chalk.green("Saved GitHub config"), { username: username ?? cfg.username, repo: repo ?? cfg.default_repo });
}

export async function cmdGitHubClone(repo: string, dir?: string): Promise<void> {
  const outDir = dir ? path.resolve(dir) : getVaultRoot();
  await fs.mkdir(path.dirname(outDir), { recursive: true });
  const url = repo.includes("://") ? repo : `https://github.com/${repo}.git`;
  run("git", ["clone", url, outDir]);
  console.log(chalk.green(`Cloned ${repo} -> ${outDir}`));
}

export async function cmdGitHubStatus(): Promise<void> {
  const d = resolveRepoDir();
  console.log(run("git", ["status", "-sb"], d));
}

export async function cmdGitHubPull(): Promise<void> {
  const d = resolveRepoDir();
  console.log(run("git", ["pull", "--rebase"], d));
}

export async function cmdGitHubPush(message?: string): Promise<void> {
  const d = resolveRepoDir();
  run("git", ["add", "-A"], d);
  try {
    run("git", ["commit", "-m", message ?? "uDos sync"], d);
  } catch {
    // no changes
  }
  console.log(run("git", ["push"], d));
}

export async function cmdGitHubSync(message?: string): Promise<void> {
  await cmdGitHubPull();
  await cmdGitHubPush(message);
}

export async function cmdGitHubFork(repo?: string): Promise<void> {
  const cfg = await readGitHubConfig();
  const target = repo ?? cfg.default_repo;
  if (!target) {
    console.error(chalk.red("No repo specified. Use udo github fork <owner/repo> or configure default_repo."));
    process.exitCode = 1;
    return;
  }
  console.log(run("gh", ["repo", "fork", target, "--clone=false"]));
}

export async function cmdIssueCreate(title: string, body?: string): Promise<void> {
  const args = ["issue", "create", "--title", title];
  if (body) args.push("--body", body);
  else args.push("--body", "");
  console.log(run("gh", args, resolveRepoDir()));
}

export async function cmdIssueList(limit = 20): Promise<void> {
  console.log(run("gh", ["issue", "list", "--limit", String(limit)], resolveRepoDir()));
}

export async function cmdPrCreate(title?: string, body?: string, base?: string): Promise<void> {
  const args = ["pr", "create"];
  if (title) args.push("--title", title);
  if (body) args.push("--body", body);
  if (base) args.push("--base", base);
  if (!title && !body) args.push("--fill");
  console.log(run("gh", args, resolveRepoDir()));
}

export async function cmdPrList(limit = 20): Promise<void> {
  console.log(run("gh", ["pr", "list", "--limit", String(limit)], resolveRepoDir()));
}

export async function cmdPrCheckout(id: string): Promise<void> {
  console.log(run("gh", ["pr", "checkout", id], resolveRepoDir()));
}

export async function cmdPrApprove(id: string): Promise<void> {
  console.log(run("gh", ["pr", "review", id, "--approve"], resolveRepoDir()));
}

export async function cmdPrReview(id: string, body?: string): Promise<void> {
  const args = ["pr", "review", id, "--comment"];
  if (body) args.push("--body", body);
  else args.push("--body", "");
  console.log(run("gh", args, resolveRepoDir()));
}

export async function cmdPrMerge(id: string): Promise<void> {
  console.log(run("gh", ["pr", "merge", id, "--squash", "--auto"], resolveRepoDir()));
}

export async function cmdGitHubRelease(tag: string, notes?: string): Promise<void> {
  const args = ["release", "create", tag];
  if (notes) args.push("--notes", notes);
  else args.push("--generate-notes");
  console.log(run("gh", args, resolveRepoDir()));
}
