import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 80,
    historyApiFallback: true,
  },
  preview: {
    host: true,
    port: 3000,
  },
  // Comment if development
  define: {
    'import.meta.env.VITE_API_URL': 'window._env_.VITE_API_URL',
  },
})