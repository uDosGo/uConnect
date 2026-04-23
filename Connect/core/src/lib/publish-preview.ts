import http from "node:http";
import fs from "fs-extra";
import path from "node:path";
import { siteOutputDir } from "./site-paths.js";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

function contentType(file: string): string {
  return MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
}

/**
 * Serves `<vault>/.site` on 127.0.0.1 — blocks until SIGINT.
 */
export async function previewSite(vaultRoot: string, port: number): Promise<void> {
  const root = siteOutputDir(vaultRoot);
  if (!(await fs.pathExists(path.join(root, "index.html")))) {
    throw new Error("No build in .site — run: udo publish build");
  }

  const server = http.createServer(async (req, res) => {
    try {
      let urlPath = decodeURIComponent(req.url?.split("?")[0] ?? "/");
      if (urlPath === "/") urlPath = "/index.html";
      const file = path.normalize(path.join(root, urlPath));
      if (!file.startsWith(root)) {
        res.writeHead(403).end();
        return;
      }
      const stat = await fs.stat(file).catch(() => null);
      if (!stat?.isFile()) {
        res.writeHead(404).end("Not found");
        return;
      }
      const buf = await fs.readFile(file);
      res.writeHead(200, { "content-type": contentType(file) });
      res.end(buf);
    } catch {
      res.writeHead(500).end();
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(port, "127.0.0.1", () => resolve());
    server.on("error", reject);
  });

  const url = `http://127.0.0.1:${port}/`;
  console.log(`Preview ${url} (Ctrl+C to stop)`);
  console.log(`file://${path.join(root, "index.html")}`);

  await new Promise<void>((resolve) => {
    const stop = (): void => {
      server.close(() => resolve());
    };
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  });
}
