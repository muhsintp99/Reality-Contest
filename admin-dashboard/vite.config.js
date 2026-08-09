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
    port: 10002,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 10002
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'https://api.hakalive.in',
        // target: 'http://127.0.0.1:10000',
        changeOrigin: true,
        secure: false,
      },
      '/api-docs': {
        target: process.env.VITE_API_TARGET || 'https://api.hakalive.in',
        // target: 'http://127.0.0.1:10000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('react-redux') || id.includes('@reduxjs')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('recharts') || id.includes('chart.js')) {
              return 'vendor-charts';
            }
            if (id.includes('axios') || id.includes('formik') || id.includes('yup')) {
              return 'vendor-utils';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})

