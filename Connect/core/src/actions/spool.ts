import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";
import crypto from "node:crypto";
import { glob } from "glob";
import { parse as parseYaml } from "yaml";
import { getVaultRoot } from "../paths.js";

function spoolRoot(vault: string): string {
  return path.join(vault, "spool");
}

function spoolsConfigPath(vault: string): string {
  return path.join(vault, ".local", "spools.yaml");
}

function spoolStatusPath(vault: string): string {
  return path.join(vault, ".local", "spool-status.json");
}

type SpoolEntry = {
  name: string;
  source: string;
  processor: "condense" | "dedupe-sections" | "summarize" | "dedupe-list-items";
  output?: string;
  enabled?: boolean;
  options?: Record<string, unknown>;
};

async function loadSpoolsConfig(vault: string): Promise<SpoolEntry[] | null> {
  const cfg = spoolsConfigPath(vault);
  if (!(await fs.pathExists(cfg))) return null;
  const raw = await fs.readFile(cfg, "utf8");
  const parsed = parseYaml(raw) as { spools?: SpoolEntry[] } | null;
  if (!parsed?.spools || !Array.isArray(parsed.spools)) return [];
  return parsed.spools.filter((s) => typeof s?.name === "string" && typeof s?.source === "string");
}

function condenseText(content: string, targetRatio = 0.7): string {
  const normalized = content
    .replace(/\b(very|really|quite|basically|simply)\b/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n");
  const maxLen = Math.max(100, Math.floor(content.length * targetRatio));
  return normalized.length > maxLen ? `${normalized.slice(0, maxLen).trim()}\n` : normalized;
}

function dedupeSections(content: string, minBlockLength = 50): string {
  const blocks = content.split(/\n{2,}/);
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const b of blocks) {
    const t = b.trim();
    if (!t) continue;
    if (t.length < minBlockLength) {
      kept.push(b);
      continue;
    }
    const key = crypto.createHash("sha1").update(t).digest("hex");
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push(b);
  }
  return kept.join("\n\n");
}

function summarizeText(content: string, ratio = 0.2): string {
  const paras = content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (paras.length === 0) return content;
  const take = Math.max(1, Math.ceil(paras.length * ratio));
  const out: string[] = [];
  for (let i = 0; i < Math.min(take, paras.length); i++) {
    const p = paras[i]!;
    const firstSentence = p.match(/[^.!?]+[.!?]/)?.[0] ?? p;
    out.push(firstSentence.trim());
  }
  return `${out.join("\n\n")}\n`;
}

function dedupeListItemsJson(content: string, key = "url"): string {
  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return content;
    const seen = new Set<string>();
    const out = parsed.filter((item) => {
      const k = typeof item === "object" && item ? String((item as Record<string, unknown>)[key] ?? "") : "";
      if (!k) return true;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    return `${JSON.stringify(out, null, 2)}\n`;
  } catch {
    return content;
  }
}

async function processOneFile(entry: SpoolEntry, absPath: string): Promise<{ changed: boolean; bytes: number }> {
  const text = await fs.readFile(absPath, "utf8");
  let out = text;
  const opts = entry.options ?? {};
  switch (entry.processor) {
    case "condense":
      out = condenseText(text, Number(opts.target_ratio ?? 0.7));
      break;
    case "dedupe-sections":
      out = dedupeSections(text, Number(opts.min_block_length ?? 50));
      break;
    case "summarize":
      out = summarizeText(text, Number(opts.summary_ratio ?? 0.2));
      break;
    case "dedupe-list-items":
      out = dedupeListItemsJson(text, String(opts.dedupe_key ?? "url"));
      break;
    default:
      return { changed: false, bytes: 0 };
  }
  if (out === text) return { changed: false, bytes: 0 };
  await fs.writeFile(absPath, out, "utf8");
  return { changed: true, bytes: Buffer.byteLength(out, "utf8") };
}

export async function cmdSpoolList(): Promise<void> {
  const vault = getVaultRoot();
  const config = await loadSpoolsConfig(vault);
  if (config) {
    config.forEach((s) => console.log(`${s.name}${s.enabled === false ? " (disabled)" : ""}`));
    if (config.length === 0) console.log(chalk.dim("No spools configured in .local/spools.yaml"));
    return;
  }
  const d = spoolRoot(vault);
  if (!(await fs.pathExists(d))) {
    console.log(chalk.dim("No spool/"));
    return;
  }
  const entries = await fs.readdir(d, { withFileTypes: true });
  for (const e of entries) {
    console.log(e.isDirectory() ? `${e.name}/` : e.name);
  }
}

export async function cmdSpoolInfo(name: string): Promise<void> {
  const vault = getVaultRoot();
  const config = await loadSpoolsConfig(vault);
  if (config) {
    const found = config.find((s) => s.name === name);
    if (!found) {
      console.error(chalk.red("Unknown spool:", name));
      process.exitCode = 1;
      return;
    }
    console.log(found);
    return;
  }
  const p = path.join(spoolRoot(vault), name);
  if (!(await fs.pathExists(p))) {
    console.error(chalk.red("Not found:", name));
    process.exitCode = 1;
    return;
  }
  const st = await fs.stat(p);
  console.log({ path: p, isDirectory: st.isDirectory(), size: st.size, mtime: st.mtime.toISOString() });
}

export async function cmdSpoolExtract(name: string): Promise<void> {
  const vault = getVaultRoot();
  const p = path.join(spoolRoot(vault), name);
  if (!(await fs.pathExists(p))) {
    console.error(chalk.red("Not found:", name));
    process.exitCode = 1;
    return;
  }
  if ((await fs.stat(p)).isDirectory()) {
    const out = path.join(process.cwd(), name);
    await fs.copy(p, out, { overwrite: false });
    console.log(chalk.green(`Copied to ${out}`));
  } else {
    const out = path.join(process.cwd(), path.basename(p));
    await fs.copy(p, out, { overwrite: false });
    console.log(chalk.green(`Copied to ${out}`));
  }
}

export async function cmdSpoolShow(name: string): Promise<void> {
  await cmdSpoolInfo(name);
}

async function runSpoolEntry(
  vault: string,
  entry: SpoolEntry,
  dryRun = false
): Promise<{ matched: number; changed: number; bytes: number }> {
  const matches = await glob(entry.source, { cwd: vault, nodir: true, dot: true });
  let changed = 0;
  let bytes = 0;
  for (const rel of matches) {
    const abs = path.join(vault, rel);
    if (dryRun) {
      changed++;
      continue;
    }
    const res = await processOneFile(entry, abs);
    if (res.changed) {
      changed++;
      bytes += res.bytes;
    }
  }
  return { matched: matches.length, changed, bytes };
}

async function saveSpoolStatus(
  vault: string,
  update: Record<string, { lastRun: string; matched: number; changed: number; bytes: number }>
): Promise<void> {
  const f = spoolStatusPath(vault);
  const current = (await fs.readJSON(f).catch(() => ({}))) as Record<
    string,
    { lastRun: string; matched: number; changed: number; bytes: number }
  >;
  await fs.ensureDir(path.dirname(f));
  await fs.writeJSON(f, { ...current, ...update }, { spaces: 2 });
}

export async function cmdSpoolRun(name: string, dryRun = false): Promise<void> {
  const vault = getVaultRoot();
  const config = await loadSpoolsConfig(vault);
  if (!config) {
    console.log(chalk.yellow("No .local/spools.yaml found; spool run unavailable."));
    process.exitCode = 1;
    return;
  }
  const entry = config.find((s) => s.name === name);
  if (!entry) {
    console.error(chalk.red("Unknown spool:", name));
    process.exitCode = 1;
    return;
  }
  if (entry.enabled === false) {
    console.log(chalk.dim(`Spool ${name} is disabled.`));
    return;
  }
  const res = await runSpoolEntry(vault, entry, dryRun);
  const payload = { spool: name, dryRun, ...res };
  console.log(payload);
  if (!dryRun) {
    await saveSpoolStatus(vault, {
      [name]: { lastRun: new Date().toISOString(), matched: res.matched, changed: res.changed, bytes: res.bytes },
    });
  }
}

export async function cmdSpoolRunAll(dryRun = false): Promise<void> {
  const vault = getVaultRoot();
  const config = await loadSpoolsConfig(vault);
  if (!config) {
    console.log(chalk.yellow("No .local/spools.yaml found; spool run unavailable."));
    process.exitCode = 1;
    return;
  }
  for (const s of config) {
    if (s.enabled === false) continue;
    await cmdSpoolRun(s.name, dryRun);
  }
}

export async function cmdSpoolStatus(): Promise<void> {
  const vault = getVaultRoot();
  const f = spoolStatusPath(vault);
  if (!(await fs.pathExists(f))) {
    console.log(chalk.dim("No spool status yet."));
    return;
  }
  console.log(await fs.readJSON(f));
}
