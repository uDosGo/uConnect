import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// Resolve uCode1 themes directory relative to this workspace
const uCode1Themes = path.resolve(__dirname, '../../uCode1/themes');

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 4687,
    strictPort: false,
    proxy: {
      // Proxy /ucef1/ to uCode1 static assets (themes, etc.)
      '/ucef1': {
        target: 'http://localhost:4688',
        // Fallback: serve directly from filesystem via a custom middleware
      },
    },
  },
});
