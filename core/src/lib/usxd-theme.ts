import fs from "fs-extra";
import path from "node:path";
import { templatesDir, getVendorRoot } from "../paths.js";

export async function usxdTemplatesRoot(): Promise<string> {
  // Check vendor themes first, then fall back to templates
  const vendorThemes = path.join(getVendorRoot(), "themes");
  try {
    if (await fs.pathExists(vendorThemes)) {
      return vendorThemes;
    }
  } catch (e) {
    console.error(`Failed to check vendor themes:`, e);
  }
  return path.join(templatesDir(), "usxd");
}

export async function listUsxdThemeNames(): Promise<string[]> {
  const root = await usxdTemplatesRoot();
  if (!(await fs.pathExists(root))) return [];
  const entries = await fs.readdir(root, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
}

export type ActiveUsxd = { name: string; appliedAt: string };

export function vaultUsxdDir(vaultRoot: string): string {
  return path.join(vaultRoot, "system", "usxd");
}

export function vaultUsxdCurrentDir(vaultRoot: string): string {
  return path.join(vaultUsxdDir(vaultRoot), "current");
}

export function vaultUsxdActivePath(vaultRoot: string): string {
  return path.join(vaultUsxdDir(vaultRoot), "active.json");
}

export async function readActiveUsxd(vaultRoot: string): Promise<ActiveUsxd | null> {
  const p = vaultUsxdActivePath(vaultRoot);
  if (!(await fs.pathExists(p))) return null;
  return JSON.parse(await fs.readFile(p, "utf8")) as ActiveUsxd;
}

/** Copy `templates/usxd/<name>/` → `vault/system/usxd/current/` and write `active.json`. */
export async function applyUsxdTheme(vaultRoot: string, name: string): Promise<void> {
  const src = path.join(await usxdTemplatesRoot(), name);
  if (!(await fs.pathExists(src))) {
    throw new Error(`Unknown USXD theme: ${name} (expected ${src})`);
  }
  const dest = vaultUsxdCurrentDir(vaultRoot);
  await fs.remove(dest).catch(() => {});
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copy(src, dest, { overwrite: true });
  const active: ActiveUsxd = { name, appliedAt: new Date().toISOString() };
  await fs.writeFile(vaultUsxdActivePath(vaultRoot), JSON.stringify(active, null, 2), "utf8");
}

/** Prefer vault theme CSS; fallback to templates/usxd/<name>/theme.css */
export async function resolveThemeCssPath(vaultRoot: string, themeName: string): Promise<string | null> {
  const v = path.join(vaultUsxdCurrentDir(vaultRoot), "theme.css");
  if (await fs.pathExists(v)) return v;
  const t = path.join(await usxdTemplatesRoot(), themeName, "theme.css");
  if (await fs.pathExists(t)) return t;
  return null;
}
