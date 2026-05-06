import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import yaml from "yaml";

export type GitHubConfig = {
  token?: string;
  username?: string;
  default_repo?: string;
};

export function githubConfigPath(): string {
  return path.join(os.homedir(), ".config", "udos", "github.yaml");
}

export async function readGitHubConfig(): Promise<GitHubConfig> {
  const file = githubConfigPath();
  if (!(await fs.pathExists(file))) return {};
  const raw = await fs.readFile(file, "utf8");
  const cfg = yaml.parse(raw) as Record<string, string>;
  return {
    token: cfg["token"] || process.env.GITHUB_TOKEN,
    username: cfg["username"],
    default_repo: cfg["default_repo"],
  };
}

export async function writeGitHubConfig(cfg: GitHubConfig): Promise<void> {
  const file = githubConfigPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, yaml.stringify(cfg), "utf8");
}
