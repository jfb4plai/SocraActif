// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['@anthropic-ai/sdk']
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js'
  }
})
