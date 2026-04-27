import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_'],
  css: {
    postcss: {
      plugins: [
        require('@tailwindcss/postcss')({ config: './tailwind.config.js' }),
        require('autoprefixer'),
      ],
    },
  },
})