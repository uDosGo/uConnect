import fs from "fs-extra";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { glob } from "glob";
import { siteOutputDir, siteAssetsDir, relativePathToAssets } from "./site-paths.js";
import { readActiveFontConfig } from "./font-runtime.js";
import { readActiveUsxd, resolveThemeCssPath, usxdTemplatesRoot } from "./usxd-theme.js";

export type PublishBuildResult = {
  outDir: string;
  pages: number;
  buildJsonPath: string;
};

function htmlShell(title: string, bodyHtml: string, cssHref: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${cssHref}"/>
</head>
<body>
<main class="udo-page">
${bodyHtml}
</main>
</body>
</html>
`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Build static HTML into the vault `.site` directory from Markdown files under `content/`. */
export async function buildStaticSite(vaultRoot: string): Promise<PublishBuildResult> {
  const contentRoot = path.join(vaultRoot, "content");
  if (!(await fs.pathExists(contentRoot))) {
    await fs.mkdir(contentRoot, { recursive: true });
  }

  const outRoot = siteOutputDir(vaultRoot);
  await fs.remove(outRoot).catch(() => {});
  await fs.mkdir(outRoot, { recursive: true });
  const assets = siteAssetsDir(vaultRoot);
  await fs.mkdir(assets, { recursive: true });

  const active = await readActiveUsxd(vaultRoot);
  const themeName = active?.name ?? "default";
  const cssSrc = await resolveThemeCssPath(vaultRoot, themeName);
  const fallbackCss = path.join(await usxdTemplatesRoot(), "default", "theme.css");
  let themeText: string;
  if (cssSrc && (await fs.pathExists(cssSrc))) {
    themeText = await fs.readFile(cssSrc, "utf8");
  } else if (await fs.pathExists(fallbackCss)) {
    themeText = await fs.readFile(fallbackCss, "utf8");
  } else {
    themeText = `body{font-family:system-ui,sans-serif;line-height:1.5;max-width:42rem;margin:2rem auto;padding:0 1rem;}\n`;
  }

  const activeFont = await readActiveFontConfig();
  if (activeFont && (await fs.pathExists(activeFont.cachePath))) {
    const fontBase = path.basename(activeFont.cachePath);
    const fontDest = path.join(assets, "fonts", fontBase);
    await fs.mkdir(path.dirname(fontDest), { recursive: true });
    await fs.copy(activeFont.cachePath, fontDest, { overwrite: true });
    const rel = `./fonts/${fontBase}`;
    const ext = path.extname(fontBase).toLowerCase();
    const fmt =
      ext === ".woff2" ? "woff2" : ext === ".woff" ? "woff" : ext === ".otf" ? "opentype" : "truetype";
    themeText =
      `@font-face{font-family:'${activeFont.cssFamily}';src:url('${rel}') format('${fmt}');font-display:swap;}\n` +
      `:root{--udo-font-active:'${activeFont.cssFamily}',system-ui,sans-serif;}\n` +
      themeText +
      `\nbody{font-family:var(--udo-font-active),system-ui,sans-serif;}\n`;
  }
  await fs.writeFile(path.join(assets, "theme.css"), themeText, "utf8");

  const files = await glob("**/*.md", { cwd: contentRoot, nodir: true });
  files.sort();

  const pages: { rel: string; title: string; href: string }[] = [];

  for (const rel of files) {
    const absMd = path.join(contentRoot, rel);
    const raw = await fs.readFile(absMd, "utf8");
    const { data, content } = matter(raw);
    const title = (data.title as string) || path.basename(rel, ".md");
    const bodyHtml = await marked.parse(content.trim() || "");
    const htmlRel = rel.replace(/\.md$/i, ".html");
    const htmlPath = path.join(outRoot, htmlRel);
    await fs.mkdir(path.dirname(htmlPath), { recursive: true });
    const cssHref = relativePathToAssets(htmlRel);
    const doc = htmlShell(String(title), bodyHtml, cssHref);
    await fs.writeFile(htmlPath, doc, "utf8");
    pages.push({ rel, title: String(title), href: htmlRel.replace(/\\/g, "/") });
  }

  const indexLinks = pages
    .map((p) => `  <li><a href="${escapeHtml(p.href)}">${escapeHtml(p.title)}</a></li>`)
    .join("\n");
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Site</title>
  <link rel="stylesheet" href="./assets/theme.css"/>
</head>
<body>
<main class="udo-index">
  <h1>Vault site</h1>
  <ul>
${indexLinks || "  <li>(no pages)</li>"}
  </ul>
</main>
</body>
</html>
`;
  await fs.writeFile(path.join(outRoot, "index.html"), indexHtml, "utf8");

  const buildJsonPath = path.join(outRoot, "build.json");
  const activeFontMeta = await readActiveFontConfig();
  const meta = {
    builtAt: new Date().toISOString(),
    pages: pages.length,
    vault: vaultRoot,
    theme: themeName,
    activeFont: activeFontMeta
      ? { id: activeFontMeta.id, cssFamily: activeFontMeta.cssFamily }
      : null,
  };
  await fs.writeFile(buildJsonPath, JSON.stringify(meta, null, 2), "utf8");

  return { outDir: outRoot, pages: pages.length, buildJsonPath };
}
