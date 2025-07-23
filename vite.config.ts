import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    https: true, // Required for WebXR
    host: true,
    port: 3000
  },
  optimizeDeps: {
    include: ['three']
  }
}) 