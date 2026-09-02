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
        // target: process.env.VITE_API_TARGET || 'https://api.hakalive.in',
        target: process.env.VITE_API_TARGET || 'http://localhost:10000/api',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: (process.env.VITE_API_TARGET || 'http://localhost:10000').replace(/\/api\/?$/, ''),
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

