import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dns from 'dns'

// Force dns to use verbatim order, avoiding IPv6/IPv4 mismatch for localhost HMR
dns.setDefaultResultOrder('verbatim')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  server: {
    port: 10001,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 10001
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:10000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

