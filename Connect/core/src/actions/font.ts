import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";
import {
  activateFont,
  cdnBase,
  installBundle,
  listCachedFonts,
  loadManifest,
  readActiveFontConfig,
  resolveFontFileById,
} from "../lib/font-runtime.js";
import { udosConnectRoot } from "../paths.js";

function specPath(): string {
  return path.join(udosConnectRoot(), "docs", "specs", "font-system-obf.md");
}

export async function cmdFontInstall(bundle: string): Promise<void> {
  const name = bundle || "retro";
  console.log(chalk.cyan(`Installing font bundle "${name}"…`));
  console.log(chalk.dim("CDN:"), cdnBase(), chalk.dim("(override: UDOS_CDN_BASE)"));
  try {
    const copied = await installBundle(name);
    console.log(chalk.green(`Cached ${copied.length} file(s) under ~/.cache/udos/fonts/`));
    copied.forEach((p) => console.log(chalk.dim(" ·"), p));
  } catch (e) {
    console.error(chalk.red("Install failed:"), e);
    console.log(chalk.dim("Tip: add binaries under"), `uDosConnect/cdn/fonts/seed/`, chalk.dim("or deploy CDN per dev/cdn-cloud-setup.md"));
    process.exitCode = 1;
  }
}

export async function cmdFontList(): Promise<void> {
  const cached = await listCachedFonts();
  const active = await readActiveFontConfig();
  const m = await loadManifest();
  console.log(chalk.bold("Cached fonts"), chalk.dim(`(~/.cache/udos/fonts/)`));
  if (cached.length === 0) console.log(chalk.dim("(none — run: udo font install retro)"));
  else cached.forEach((f) => console.log(" ", f));
  if (active) {
    console.log(chalk.bold("\nActive (publish / preview)"));
    console.log(
      " ",
      active.id,
      chalk.dim("→"),
      active.cssFamily,
      chalk.dim(active.cachePath)
    );
  }
  if (m) {
    console.log(chalk.bold("\nManifest bundles"), chalk.dim(manifestPathShort()));
    console.log(chalk.dim(" ·"), Object.keys(m.bundles).join(", "));
  }
}

function manifestPathShort(): string {
  return path.relative(process.cwd(), path.join(udosConnectRoot(), "cdn", "fonts", "manifest.json")) || "cdn/fonts/manifest.json";
}

export async function cmdFontActivate(name: string): Promise<void> {
  try {
    const cfg = await activateFont(name);
    console.log(chalk.green(`Active font: ${cfg.id} (${cfg.cssFamily})`));
    console.log(chalk.dim("Applies on `udo publish build` / `udo publish preview`"));
  } catch (e) {
    console.error(chalk.red(String(e)));
    process.exitCode = 1;
  }
}

export async function cmdFontPreview(name: string): Promise<void> {
  const p = await resolveFontFileById(name);
  console.log(chalk.bold("Font preview (P3)"), chalk.dim("— terminal cannot render the face; open the file in a font viewer."));
  console.log(chalk.dim("Spec:"), specPath());
  if (p && (await fs.pathExists(p))) {
    console.log(chalk.green("Resolved:"), p);
    console.log("");
    console.log("  " + chalk.green("█") + chalk.greenBright("░") + chalk.hex("#00FF00")("▒ Teletext sample strip"));
  } else {
    console.log(chalk.yellow("Not in cache — run: udo font install retro"));
  }
}
