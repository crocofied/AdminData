import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
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
  define: command === 'build' ? {
    'import.meta.env.VITE_API_URL': JSON.stringify('__VITE_API_URL__'),
  } : {},
}))