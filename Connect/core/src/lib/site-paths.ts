import path from "node:path";

/** Static site output: `<vault>/.site/` */
export function siteOutputDir(vaultRoot: string): string {
  return path.join(vaultRoot, ".site");
}

export function siteAssetsDir(vaultRoot: string): string {
  return path.join(siteOutputDir(vaultRoot), "assets");
}

/** Relative path from an HTML file under `.site/` to `assets/theme.css`. */
export function relativePathToAssets(htmlFileRelativeToSite: string): string {
  const dir = path.dirname(htmlFileRelativeToSite);
  const depth = dir === "." ? 0 : dir.split(path.sep).filter(Boolean).length;
  const prefix = depth === 0 ? "./" : `${"../".repeat(depth)}`;
  return `${prefix}assets/theme.css`;
}
