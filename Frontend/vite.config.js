import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Bind to all network interfaces (IPv4 + IPv6), so localhost works reliably
    host: true,
    port: 5173,
  },
})
