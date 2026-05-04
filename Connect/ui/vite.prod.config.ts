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
    sourcemap: false, // Disable source maps in production
    minify: 'terser', // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true, // Remove debugger statements
      },
    },
    chunkSizeWarningLimit: 1000, // Warn for chunks > 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          vue: ['vue'],
          milkdown: ['@milkdown/core', '@milkdown/vue', '@milkdown/preset-commonmark'],
          editor: ['@milkdown/theme-nord'],
        },
        // Entry file names
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
  
  // Production environment variables
  define: {
    'import.meta.env.PROD': JSON.stringify(true),
    'import.meta.env.DEV': JSON.stringify(false),
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'vue',
      '@milkdown/core',
      '@milkdown/vue',
      '@milkdown/preset-commonmark',
      '@milkdown/theme-nord',
    ],
  },
  
  // CSS optimization
  css: {
    devSourcemap: false,
    postcss: {
      plugins: [
        require('autoprefixer')(),
        require('cssnano')({
          preset: 'default',
        }),
      ],
    },
  },
  
  // Resolve aliases
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  
  // Performance budget
  performance: {
    chunks: 'warn',
    assetFilter: function(assetFilename) {
      return assetFilename.endsWith('.js') || assetFilename.endsWith('.css')
    },
  },
})