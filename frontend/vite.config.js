import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ewaste-db.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
