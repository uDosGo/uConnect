import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve paths relative to this workspace
const notionishBuild = path.resolve(__dirname, 'notionish/build');
const milkdownBuild = path.resolve(__dirname, 'public/milkdown');

function serveStaticBuild(basePath, buildDir, staticPaths) {
  return {
    name: `serve-${basePath}`,
    configureServer(server) {
      if (!fs.existsSync(buildDir)) return;

      // Serve standalone SPA at basePath
      server.middlewares.use(basePath, (req, res, next) => {
        const url = req.url || '';
        const filePath = url === '/' || url === ''
          ? path.join(buildDir, 'index.html')
          : path.join(buildDir, url.replace(/[?#].*$/, ''));
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath);
          const mime = ext === '.js' ? 'application/javascript; charset=utf-8'
            : ext === '.css' ? 'text/css; charset=utf-8'
            : ext === '.html' ? 'text/html; charset=utf-8'
            : ext === '.png' ? 'image/png'
            : ext === '.svg' ? 'image/svg+xml'
            : ext === '.json' ? 'application/json'
            : ext === '.ico' ? 'image/x-icon'
            : 'application/octet-stream';
          res.writeHead(200, { 'Content-Type': mime });
          fs.createReadStream(filePath).pipe(res);
        } else {
          // SPA fallback
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          fs.createReadStream(path.join(buildDir, 'index.html')).pipe(res);
        }
      });

      // Also serve additional static paths from this build dir (e.g., /static/ -> notionish/static/)
      if (staticPaths) {
        for (const [servePath, subDir] of Object.entries(staticPaths)) {
          server.middlewares.use(servePath, (req, res, next) => {
            const url = req.url || '';
            const filePath = path.join(buildDir, subDir, url.replace(/[?#].*$/, ''));
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const ext = path.extname(filePath);
              const mime = ext === '.js' ? 'application/javascript; charset=utf-8'
                : ext === '.css' ? 'text/css; charset=utf-8'
                : ext === '.html' ? 'text/html; charset=utf-8'
                : ext === '.png' ? 'image/png'
                : ext === '.svg' ? 'image/svg+xml'
                : ext === '.json' ? 'application/json'
                : ext === '.ico' ? 'image/x-icon'
                : 'application/octet-stream';
              res.writeHead(200, { 'Content-Type': mime });
              fs.createReadStream(filePath).pipe(res);
            } else {
              next();
            }
          });
        }
      }
    },
  };
}

const vaultRoot = path.resolve(__dirname, '../../Vault');

function vaultApi() {
  return {
    name: 'vault-api',
    configureServer(server) {
      // GET /api/vault/read?path=some/file.md
      server.middlewares.use('/api/vault/read', (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const filePath = url.searchParams.get('path') || '';
        const safePath = path.resolve(vaultRoot, filePath);
        if (!safePath.startsWith(vaultRoot)) {
          res.writeHead(403); res.end('Forbidden');
          return;
        }
        if (!fs.existsSync(safePath)) {
          res.writeHead(404); res.end('Not found');
          return;
        }
        if (fs.statSync(safePath).isDirectory()) {
          res.writeHead(400); res.end('Is a directory');
          return;
        }
        const content = fs.readFileSync(safePath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(content);
      });

      // POST /api/vault/write  body: { path: "...", content: "..." }
      server.middlewares.use('/api/vault/write', (req, res, next) => {
        if (req.method !== 'POST') { next(); return; }
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const { path: filePath, content } = JSON.parse(body);
            const safePath = path.resolve(vaultRoot, filePath);
            if (!safePath.startsWith(vaultRoot)) {
              res.writeHead(403); res.end(JSON.stringify({ error: 'Forbidden' }));
              return;
            }
            fs.mkdirSync(path.dirname(safePath), { recursive: true });
            fs.writeFileSync(safePath, content, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } catch (e) {
            res.writeHead(400); res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

      // GET /api/vault/list?path=some/dir
      server.middlewares.use('/api/vault/list', (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const dirPath = url.searchParams.get('path') || '';
        const safePath = path.resolve(vaultRoot, dirPath);
        if (!safePath.startsWith(vaultRoot)) {
          res.writeHead(403); res.end('[]'); return;
        }
        try {
          const items = fs.readdirSync(safePath, { withFileTypes: true }).map(d => ({
            name: d.name,
            isDir: d.isDirectory(),
            path: path.join(dirPath, d.name),
          }));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(items));
        } catch {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end('[]');
        }
      });

      // DELETE /api/vault/delete?path=some/file.md
      server.middlewares.use('/api/vault/delete', (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const filePath = url.searchParams.get('path') || '';
        const safePath = path.resolve(vaultRoot, filePath);
        if (!safePath.startsWith(vaultRoot)) {
          res.writeHead(403); res.end('Forbidden'); return;
        }
        try {
          fs.unlinkSync(safePath);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    vaultApi(),
    serveStaticBuild('/notionish', notionishBuild, { '/static': 'static' }),
    serveStaticBuild('/milkdown', milkdownBuild),
  ],
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 4687,
    strictPort: false,
    proxy: {
      '/ucef1': {
        target: 'http://localhost:4688',
      },
    },
  },
});
