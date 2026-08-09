import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.hakalive.in/api';

// Configure global defaults for raw axios calls across all pages/components
axios.defaults.baseURL = BASE_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Global request interceptor to automatically resolve leading '/api' prefixes to BASE_URL
axios.interceptors.request.use((config) => {
  if (config.url) {
    if (config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    } else if (config.url === '/api') {
      config.url = '';
    }
  }
  return config;
});

// Custom API Axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
