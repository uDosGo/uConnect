import http from "node:http";
import express from "express";
import { WebSocketServer } from "ws";
import chokidar from "chokidar";
import path from "node:path";
import fs from "fs-extra";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import readline from "node:readline";
import os from "node:os";
import { buildSurfaceIndex, buildSurfaceIndexFromFile, bundleForSurface } from "./surface-index.js";
import { renderToHTML } from "./renderer.js";

export type ServeOptions = {
  file?: string;
  dir?: string;
  port: number;
  open?: boolean;
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function serve(opts: ServeOptions): Promise<void> {
  const port = opts.port;
  const shouldPromptOpen = opts.open ?? true;
  const singleFile = opts.file ? path.resolve(opts.file) : undefined;
  const watchDir = singleFile ? path.dirname(singleFile) : path.resolve(opts.dir ?? process.cwd());
  const baseUrl = `http://localhost:${port}`;

  let index = singleFile
    ? await buildSurfaceIndexFromFile(singleFile)
    : await buildSurfaceIndex(watchDir);

  async function refreshIndex(): Promise<void> {
    index = singleFile
      ? await buildSurfaceIndexFromFile(singleFile)
      : await buildSurfaceIndex(watchDir);
  }

  function openInBrowser(url: string): void {
    const platform = process.platform;
    if (platform === "darwin") {
      spawn("open", [url], { stdio: "ignore", detached: true }).unref();
      return;
    }
    if (platform === "win32") {
      spawn("cmd", ["/c", "start", "", url], { stdio: "ignore", detached: true }).unref();
      return;
    }
    spawn("xdg-open", [url], { stdio: "ignore", detached: true }).unref();
  }

  function askOpenPrompt(defaultUrl: string): void {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`[OK|Enter] Open preview in browser (${defaultUrl})? `, (ans) => {
      const v = ans.trim().toLowerCase();
      if (v === "" || v === "ok" || v === "y" || v === "yes") {
        try {
          openInBrowser(defaultUrl);
          console.log(`Opened ${defaultUrl}`);
        } catch (e) {
          console.log(`Could not open browser automatically: ${e instanceof Error ? e.message : String(e)}`);
        }
      } else {
        console.log(`Open manually: ${defaultUrl}`);
      }
      rl.close();
    });
  }

  const app = express();

  const here = path.dirname(fileURLToPath(import.meta.url));
  const publicDir = path.join(here, "..", "public");
  if (await fs.pathExists(publicDir)) {
    app.use(express.static(publicDir));
  }
  
  // Determine vault root for theme integration
  const vaultRoot = process.env.UDOS_VAULT || path.join(os.homedir(), "vault");

  app.get("/", (_req, res) => {
    const ids = [...index.keys()].sort();
    const links = ids.map(
      (id) => `<li><a class="text-green-400 underline" href="/surface/${encodeURIComponent(id)}">${escapeHtml(id)}</a></li>`
    );
    res.type("html").send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>USXD-Express</title>
<script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-black text-green-400 p-8 font-mono">
<h1 class="text-xl mb-4">USXD-Express</h1>
<p class="mb-4 text-sm opacity-70">Surfaces in ${escapeHtml(watchDir)}${singleFile ? ` (file: ${escapeHtml(singleFile)})` : ""}</p>
<ul class="list-disc pl-6">${links.join("") || "<li class='opacity-50'>No usxd surfaces found.</li>"}</ul>
</body></html>`);
  });

  app.get("/surface/:id", async (req, res) => {
    const id = req.params.id!;
    const entry = index.get(id);
    const bundle = bundleForSurface(id, entry);
    if (!bundle) {
      res.status(404).type("text/plain").send(`Unknown surface: ${id}`);
      return;
    }
    try {
      const html = await renderToHTML(bundle.usxd, bundle.grid, { 
        tailwindCdn: true, 
        liveReload: true,
        vaultRoot: vaultRoot 
      });
      res.type("html").send(html);
    } catch (error) {
      console.error(`Failed to render surface ${id}:`, error);
      res.status(500).type("text/plain").send(`Render error: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  function broadcastReload(): void {
    for (const c of wss.clients) {
      if (c.readyState === 1) c.send("reload");
    }
  }

  const watcher = singleFile
    ? chokidar.watch(singleFile, { ignoreInitial: true })
    : chokidar.watch("**/*.md", { cwd: watchDir, ignoreInitial: true });
  watcher.on("all", async () => {
    await refreshIndex();
    broadcastReload();
  });

  server.listen(port, () => {
    const ids = [...index.keys()].sort();
    const firstSurfaceUrl = ids.length > 0 ? `${baseUrl}/surface/${encodeURIComponent(ids[0]!)}` : baseUrl;
    console.log(`USXD-Express ready`);
    console.log(`  URL: ${baseUrl}`);
    console.log(`  Surfaces: ${ids.length}`);
    console.log(`  ${singleFile ? `Watching file: ${singleFile}` : `Watching: ${path.join(watchDir, "**/*.md")}`}`);
    if (ids.length > 0) {
      console.log(`  First surface: ${firstSurfaceUrl}`);
    } else {
      console.log(`  Tip: add a \`\`\`usxd fence to a .md file under the watch path.`);
    }
    if (shouldPromptOpen && process.stdin.isTTY && process.stdout.isTTY && !process.env.CI) {
      askOpenPrompt(firstSurfaceUrl);
    }
  });
}
