import type { ParsedGrid } from "@udos/obf-grid";
import type { ParsedUsxd } from "./types.js";
import fs from "fs-extra";
import path from "node:path";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderGridCells(grid: ParsedGrid): string {
  const { width, height } = grid.options;
  let html = "";
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ch = grid.rows[y]?.[x] ?? " ";
      html += `<div class="usxd-cell flex items-center justify-center text-sm leading-none border border-white/10">${escapeHtml(ch)}</div>`;
    }
  }
  return html;
}

function renderControls(usxd: ParsedUsxd): string {
  if (!usxd.controls.length) return "";
  const parts = usxd.controls.map(
    (c) => `<span class="mr-4 text-xs opacity-90">${escapeHtml(c.keys)}: ${escapeHtml(c.action)}</span>`
  );
  return `<div class="mt-6 flex flex-wrap border-t border-white/20 pt-3 font-mono text-[11px]">${parts.join("")}</div>`;
}

export type RenderOptions = {
  /** Inject Tailwind CDN (preview); export uses false for offline HTML. */
  tailwindCdn?: boolean;
  /** Inject live-reload client (preview only). */
  liveReload?: boolean;
  /** Vault root for theme integration */
  vaultRoot?: string;
};

export async function renderToHTML(
  usxd: ParsedUsxd,
  grid: ParsedGrid | null,
  options: RenderOptions = {}
): Promise<string> {
  const bg = usxd.style.background ?? "#000000";
  const ink = usxd.style.ink ?? "#00ff00";
  const typo = usxd.style.typography ?? "ui-monospace, monospace";
  const gridBg = usxd.style["grid_color"] ?? "#1a1a1a";

  const header = usxd.regions.header ?? "USXD surface";
  const content = usxd.regions.content ?? "";
  const status = usxd.regions.status ?? "Ready";

  const cols = grid?.options.width ?? 12;
  const gridStyle = grid
    ? `display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));gap:1px;background:${escapeHtml(gridBg)};`
    : "";

  const tailwind =
    options.tailwindCdn === true
      ? `<script src="https://cdn.tailwindcss.com"></script>`
      : "";

  const reload =
    options.liveReload === true
      ? `<script>(function(){var u=(location.protocol==="https:"?"wss:":"ws:")+"//"+location.host;try{var w=new WebSocket(u);w.onmessage=function(ev){if(String(ev.data)==="reload")location.reload()};}catch(e){}})();</script>`
      : "";
  
  // Theme integration - read and inject active theme CSS
  let themeCss = "";
  if (options.vaultRoot) {
    try {
      // Read active theme name
      const activePath = path.join(options.vaultRoot, "system", "usxd", "active.json");
      if (await fs.pathExists(activePath)) {
        const activeContent = await fs.readFile(activePath, "utf8");
        const active = JSON.parse(activeContent);
        const themeName = active.name;
        
        // Try vault theme CSS first
        const vaultThemeCss = path.join(options.vaultRoot, "system", "usxd", "current", "theme.css");
        if (await fs.pathExists(vaultThemeCss)) {
          const cssContent = await fs.readFile(vaultThemeCss, "utf8");
          themeCss = `<style>
/* Active USXD Theme: ${themeName} */
${cssContent}
</style>`;
        }
      }
    } catch (e) {
      console.error("Theme integration error:", e);
      // Silently fail - surface will render without theme
    }
  }

  const gridBlock = grid
    ? `<div class="usxd-grid my-4 rounded border border-white/10 p-2" style="${gridStyle}">${renderGridCells(grid)}</div>`
    : `<p class="text-sm opacity-60">No <code>grid</code> block in this document.</p>`;

  const contentBlock = content
    ? `<div class="region-content my-4 min-h-[120px] rounded border border-white/10 p-4 text-sm">${escapeHtml(content)}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(usxd.name)}</title>
  ${themeCss}
  ${tailwind}
  <style>
    body { margin:0; background:${escapeHtml(bg)}; color:${escapeHtml(ink)}; font-family:${escapeHtml(typo)}, ui-monospace, monospace; }
  </style>
</head>
<body class="min-h-screen p-6">
  <header class="mb-4 border-b border-white/20 pb-3 font-mono text-sm tracking-wide">${escapeHtml(header)}</header>
  ${contentBlock}
  ${gridBlock}
  <footer class="mt-6 border-t border-white/10 pt-2 font-mono text-xs opacity-80">${escapeHtml(status)}</footer>
  ${renderControls(usxd)}
  ${reload}
</body>
</html>`;
}
