import fs from "fs-extra";
import path from "node:path";

export function compostDir(vaultRoot: string): string {
  return path.join(vaultRoot, ".compost");
}

export async function ensureCompost(vaultRoot: string): Promise<void> {
  await fs.mkdir(compostDir(vaultRoot), { recursive: true });
}

/** Move vault-relative file into .compost with id prefix. Returns compost id. */
export async function moveToCompost(vaultRoot: string, relFile: string): Promise<string> {
  await ensureCompost(vaultRoot);
  const src = path.join(vaultRoot, relFile);
  const id = `${Date.now().toString(36)}-${path.basename(relFile)}`;
  const dest = path.join(compostDir(vaultRoot), id);
  await fs.move(src, dest, { overwrite: false });
  return id;
}

export async function listCompost(vaultRoot: string): Promise<string[]> {
  const d = compostDir(vaultRoot);
  if (!(await fs.pathExists(d))) return [];
  return fs.readdir(d);
}

export async function restoreFromCompost(vaultRoot: string, id: string, destRel?: string): Promise<string> {
  const src = path.join(compostDir(vaultRoot), id);
  if (!(await fs.pathExists(src))) throw new Error(`Unknown compost id: ${id}`);
  const base = destRel ?? id.replace(/^[^-]+-/, "");
  const dest = path.join(vaultRoot, base);
  await fs.ensureDir(path.dirname(dest));
  await fs.move(src, dest, { overwrite: true });
  return base;
}
