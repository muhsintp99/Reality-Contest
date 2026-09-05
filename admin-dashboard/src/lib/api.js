import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Compute full absolute server URL for console logging
const getFullServerUrl = (url) => {
  if (!url) return window.location.origin;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

const absoluteApiUrl = getFullServerUrl(BASE_URL);

// Log Connected API Full Server URL to Console
console.log(
  `%c 🔌 API Connected %c ${absoluteApiUrl}`,
  'background: #2563eb; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;',
  'background: #0f172a; color: #38bdf8; font-weight: bold; padding: 4px 8px; border-radius: 0 4px 4px 0;'
);

// Configure global defaults for raw axios calls across all pages/components
axios.defaults.baseURL = BASE_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Helper to inject bearer token from localStorage if present
const attachAuthToken = (config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  if (token && !config.headers.Authorization && !config.headers.authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Global request interceptor to automatically resolve leading '/api' prefixes to BASE_URL
axios.interceptors.request.use((config) => {
  attachAuthToken(config);
  if (config.url) {
    if (config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    } else if (config.url === '/api') {
      config.url = '';
    }
  }

  const reqUrl = config.url || '';
  const currentBase = config.baseURL || BASE_URL;
  let fullUrl = '';

  if (reqUrl.startsWith('http://') || reqUrl.startsWith('https://')) {
    fullUrl = reqUrl;
  } else if (currentBase.startsWith('http://') || currentBase.startsWith('https://')) {
    const base = currentBase.endsWith('/') ? currentBase.slice(0, -1) : currentBase;
    const path = reqUrl.startsWith('/') ? reqUrl : '/' + reqUrl;
    fullUrl = base + (path === '/' ? '' : path);
  } else {
    const base = currentBase.endsWith('/') ? currentBase.slice(0, -1) : currentBase;
    const path = reqUrl.startsWith('/') ? reqUrl : '/' + reqUrl;
    fullUrl = getFullServerUrl(base + (path === '/' ? '' : path));
  }

  console.log(`🌐 [Admin API Request] ${config.method?.toUpperCase()} -> ${fullUrl}`);

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

api.interceptors.request.use((config) => {
  attachAuthToken(config);
  return config;
});

export default api;


