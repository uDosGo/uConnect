import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  // Production-specific base URL
  base: '/udos/',

  // Build configuration
  build: {
    outDir: '../../dist/ui',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild', // Use esbuild (faster, no require() issues)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue'],
          milkdown: ['@milkdown/core', '@milkdown/vue', '@milkdown/preset-commonmark'],
          editor: ['@milkdown/theme-nord'],
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },

  // Production server configuration
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  },

  // Resolve aliases
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
