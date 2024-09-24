import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 80,
    historyApiFallback: true, // Füge diese Zeile hinzu
  },
  preview: {
    host: true,
    port: 3000,
  },
})