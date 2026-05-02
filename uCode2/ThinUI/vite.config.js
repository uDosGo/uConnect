import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const vaultRoot = path.resolve(__dirname, '../../Vault');

/* ── Vault API ── read/write/list/delete files in ~/Code/Vault ── */
function vaultApi() {
  return {
    name: 'vault-api',
    configureServer(server) {
      server.middlewares.use('/api/vault/read', (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const filePath = url.searchParams.get('path') || '';
        const safePath = path.resolve(vaultRoot, filePath);
        if (!safePath.startsWith(vaultRoot)) { res.writeHead(403); res.end('Forbidden'); return; }
        if (!fs.existsSync(safePath)) { res.writeHead(404); res.end('Not found'); return; }
        if (fs.statSync(safePath).isDirectory()) { res.writeHead(400); res.end('Is a directory'); return; }
        const content = fs.readFileSync(safePath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(content);
      });

      server.middlewares.use('/api/vault/write', (req, res, next) => {
        if (req.method !== 'POST') { next(); return; }
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const { path: filePath, content } = JSON.parse(body);
            const safePath = path.resolve(vaultRoot, filePath);
            if (!safePath.startsWith(vaultRoot)) { res.writeHead(403); res.end(JSON.stringify({error:'Forbidden'})); return; }
            fs.mkdirSync(path.dirname(safePath), { recursive: true });
            fs.writeFileSync(safePath, content, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } catch (e) { res.writeHead(400); res.end(JSON.stringify({error: e.message})); }
        });
      });

      server.middlewares.use('/api/vault/list', (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const dirPath = url.searchParams.get('path') || '';
        const safePath = path.resolve(vaultRoot, dirPath);
        if (!safePath.startsWith(vaultRoot)) { res.writeHead(403); res.end('[]'); return; }
        try {
          const items = fs.readdirSync(safePath, { withFileTypes: true }).map(d => ({
            name: d.name, isDir: d.isDirectory(), path: path.join(dirPath, d.name),
          }));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(items));
        } catch { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('[]'); }
      });

      server.middlewares.use('/api/vault/delete', (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const filePath = url.searchParams.get('path') || '';
        const safePath = path.resolve(vaultRoot, filePath);
        if (!safePath.startsWith(vaultRoot)) { res.writeHead(403); res.end('Forbidden'); return; }
        try { fs.unlinkSync(safePath); res.writeHead(200, {'Content-Type':'application/json'}); res.end(JSON.stringify({success:true})); }
        catch (e) { res.writeHead(500); res.end(JSON.stringify({error: e.message})); }
      });
    },
  };
}

/* ── MCP API ── simulated AI agent dispatch ── */
function mcpApi() {
  return {
    name: 'mcp-api',
    configureServer(server) {
      server.middlewares.use('/api/mcp/ping', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', session_id: 'dev-' + Date.now() }));
      });

      server.middlewares.use('/api/mcp/chat', (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          const { agent, message } = JSON.parse(body);
          const responses = {
            hivemind: `Hivemind orchestration complete for: "${message}". OK Agent, Code Assistant, Vault Searcher all dispatched.`,
            re3engine: `Re3Engine analysis: "${message}". Reasoning chain complete. Confidence: 0.87.`,
            default: `Agent "${agent}" processed: "${message}"`,
          };
          const response = responses[agent] || responses.default;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ response, agent }));
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    vaultApi(),
    mcpApi(),
  ],
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 4687,
    strictPort: false,
  },
});

