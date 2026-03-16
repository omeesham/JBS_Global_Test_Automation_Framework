import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      // Encore Fastify backend — SPECIFIC PATHS FIRST (Vite matches first-wins)
      '/api/pipeline': { target: 'http://localhost:3100', changeOrigin: true },
      '/api/admin':    { target: 'http://localhost:3100', changeOrigin: true },
      '/health':       { target: 'http://localhost:3100', changeOrigin: true },
      // JBS Express backend — CATCH-ALL LAST (includes /api/website-runs SSE proxy)
      '/api':          { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
})
