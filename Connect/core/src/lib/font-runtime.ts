import fs from "fs-extra";
import path from "node:path";
import os from "node:os";
import { udosConnectRoot } from "../paths.js";

export type FontManifest = {
  version: number;
  cdnBaseDefault: string;
  bundles: Record<
    string,
    {
      description?: string;
      files: Array<{ id: string; filename: string; path: string }>;
    }
  >;
};

export type ActiveFontConfig = {
  id: string;
  filename: string;
  cachePath: string;
  cssFamily: string;
  appliedAt: string;
};

export function cdnBase(): string {
  return (process.env.UDOS_CDN_BASE ?? "https://cdn.udo.space").replace(/\/$/, "");
}

export function manifestPath(): string {
  return path.join(udosConnectRoot(), "cdn", "fonts", "manifest.json");
}

export function fontCacheDir(): string {
  return path.join(os.homedir(), ".cache", "udos", "fonts");
}

export function fontConfigDir(): string {
  return path.join(os.homedir(), ".config", "udos", "fonts");
}

export function activeFontConfigPath(): string {
  return path.join(fontConfigDir(), "active.json");
}

export async function loadManifest(): Promise<FontManifest | null> {
  const p = manifestPath();
  if (!(await fs.pathExists(p))) return null;
  return JSON.parse(await fs.readFile(p, "utf8")) as FontManifest;
}

export function seedPathFor(filename: string): string {
  return path.join(udosConnectRoot(), "cdn", "fonts", "seed", filename);
}

async function copyOrFetch(
  url: string,
  dest: string,
  seedLocal: string
): Promise<void> {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  if (await fs.pathExists(seedLocal)) {
    await fs.copy(seedLocal, dest, { overwrite: true });
    return;
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
}

export async function installBundle(bundleName: string): Promise<string[]> {
  const m = await loadManifest();
  if (!m) throw new Error(`Missing manifest: ${manifestPath()}`);
  const bundle = m.bundles[bundleName];
  if (!bundle) {
    throw new Error(`Unknown bundle "${bundleName}" (see cdn/fonts/manifest.json)`);
  }
  const base = cdnBase();
  const out: string[] = [];
  const cache = fontCacheDir();
  for (const f of bundle.files) {
    const url = base + f.path;
    const dest = path.join(cache, f.filename);
    await copyOrFetch(url, dest, seedPathFor(f.filename));
    out.push(dest);
  }
  return out;
}

export async function listCachedFonts(): Promise<string[]> {
  const cache = fontCacheDir();
  if (!(await fs.pathExists(cache))) return [];
  const names = await fs.readdir(cache);
  return names.filter((n) => /\.(woff2|ttf|otf)$/i.test(n)).sort();
}

export async function resolveFontFileById(fontId: string): Promise<string | null> {
  const m = await loadManifest();
  if (!m) return null;
  for (const b of Object.values(m.bundles)) {
    for (const f of b.files) {
      if (f.id === fontId || f.filename === fontId) {
        const p = path.join(fontCacheDir(), f.filename);
        if (await fs.pathExists(p)) return p;
      }
    }
  }
  const cache = fontCacheDir();
  const guess = path.join(cache, fontId);
  if (await fs.pathExists(guess)) return guess;
  const guessW = path.join(cache, `${fontId}.woff2`);
  if (await fs.pathExists(guessW)) return guessW;
  return null;
}

export async function activateFont(fontId: string): Promise<ActiveFontConfig> {
  const resolved = await resolveFontFileById(fontId);
  if (!resolved) {
    throw new Error(
      `Font "${fontId}" not in cache — run: udo font install retro (or place file in ~/.cache/udos/fonts/)`
    );
  }
  const m = await loadManifest();
  let id = fontId;
  let filename = path.basename(resolved);
  if (m) {
    for (const b of Object.values(m.bundles)) {
      for (const f of b.files) {
        if (f.filename === filename || f.id === fontId) {
          id = f.id;
          filename = f.filename;
          break;
        }
      }
    }
  }
  const cssFamily = `UdosFont_${id.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  const cfg: ActiveFontConfig = {
    id,
    filename,
    cachePath: resolved,
    cssFamily,
    appliedAt: new Date().toISOString(),
  };
  await fs.mkdir(fontConfigDir(), { recursive: true });
  await fs.writeFile(activeFontConfigPath(), JSON.stringify(cfg, null, 2), "utf8");
  return cfg;
}

export async function readActiveFontConfig(): Promise<ActiveFontConfig | null> {
  const p = activeFontConfigPath();
  if (!(await fs.pathExists(p))) return null;
  return JSON.parse(await fs.readFile(p, "utf8")) as ActiveFontConfig;
}

export async function clearActiveFont(): Promise<void> {
  const p = activeFontConfigPath();
  if (await fs.pathExists(p)) await fs.remove(p);
}
