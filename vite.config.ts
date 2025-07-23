import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    // https: true, // Enable for WebXR testing, disable for easy development
    host: "0.0.0.0",
    port: 3000,
  },
  optimizeDeps: {
    include: ["three"],
  },
}); 