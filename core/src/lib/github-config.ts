import fs from "fs-extra";
import os from "node:os";
import path from "node:path";

export type GitHubConfig = {
  token?: string;
  username?: string;
  default_repo?: string;
};

export function githubConfigPath(): string {
  return path.join(os.homedir(), ".config", "udos", "github.yaml");
}

function expandEnv(v: string): string {
  return v.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, k) => process.env[k] ?? "");
}

function parseSimpleYaml(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of source.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const m = /^([A-Za-z0-9_]+)\s*:\s*(.+)$/.exec(t);
    if (!m) continue;
    out[m[1]!] = expandEnv(m[2]!.trim().replace(/^['"]|['"]$/g, ""));
  }
  return out;
}

export async function readGitHubConfig(): Promise<GitHubConfig> {
  const file = githubConfigPath();
  if (!(await fs.pathExists(file))) return {};
  const raw = await fs.readFile(file, "utf8");
  const cfg = parseSimpleYaml(raw);
  return {
    token: cfg["token"] || process.env.GITHUB_TOKEN,
    username: cfg["username"],
    default_repo: cfg["default_repo"],
  };
}

export async function writeGitHubConfig(cfg: GitHubConfig): Promise<void> {
  const file = githubConfigPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const lines = [
    "# uDos GitHub config",
    cfg.token ? `token: "${cfg.token}"` : "",
    cfg.username ? `username: "${cfg.username}"` : "",
    cfg.default_repo ? `default_repo: "${cfg.default_repo}"` : "",
    "",
  ].filter(Boolean);
  await fs.writeFile(file, lines.join("\n"), "utf8");
}
