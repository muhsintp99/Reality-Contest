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
  'background: #16a34a; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;',
  'background: #0f172a; color: #4ade80; font-weight: bold; padding: 4px 8px; border-radius: 0 4px 4px 0;'
);

// Configure global defaults for raw axios calls across all pages/components
axios.defaults.baseURL = BASE_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Custom API Axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to attach comprehensive console logging to any axios instance
const attachApiLogger = (instance, instanceName = 'Axios') => {
  instance.interceptors.request.use(
    (config) => {
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

      config._startTime = performance.now();
      config._fullUrl = fullUrl;

      const method = config.method?.toUpperCase() || 'GET';
      const methodColor = method === 'GET' ? '#0ea5e9' : method === 'POST' ? '#10b981' : method === 'PUT' ? '#f59e0b' : '#ef4444';

      console.log(
        `%c📡 [API REQUEST USING] %c ${method} %c ${fullUrl}`,
        'background: #1e1b4b; color: #a78bfa; font-weight: bold; padding: 3px 6px; border-radius: 4px 0 0 4px; border: 1px solid #4338ca;',
        `background: ${methodColor}; color: #000; font-weight: 900; padding: 3px 6px; border-radius: 0;`,
        'background: #0f172a; color: #38bdf8; font-weight: bold; padding: 3px 8px; border-radius: 0 4px 4px 0;',
        {
          endpoint: config.url,
          fullUrl,
          method,
          params: config.params || undefined,
          body: config.data || undefined
        }
      );

      return config;
    },
    (error) => {
      console.error('❌ [API REQUEST SETUP ERROR]:', error);
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      const duration = response.config?._startTime ? Math.round(performance.now() - response.config._startTime) : 0;
      const fullUrl = response.config?._fullUrl || response.config?.url;
      const method = response.config?.method?.toUpperCase() || 'GET';
      const status = response.status;

      console.log(
        `%c✅ [API RESPONSE SUCCESS] %c ${status} %c ${method} %c ${fullUrl} %c ${duration}ms`,
        'background: #064e3b; color: #34d399; font-weight: bold; padding: 3px 6px; border-radius: 4px 0 0 4px; border: 1px solid #059669;',
        'background: #10b981; color: #000; font-weight: 900; padding: 3px 6px; border-radius: 0;',
        'background: #0284c7; color: #fff; font-weight: 800; padding: 3px 6px; border-radius: 0;',
        'background: #0f172a; color: #a7f3d0; font-weight: bold; padding: 3px 6px; border-radius: 0;',
        'background: #334155; color: #fbbf24; font-weight: bold; padding: 3px 6px; border-radius: 0 4px 4px 0;',
        response.data
      );

      return response;
    },
    (error) => {
      const fullUrl = error.config?._fullUrl || error.config?.url || 'Unknown URL';
      const method = error.config?.method?.toUpperCase() || 'REQUEST';
      const status = error.response?.status || 'FAIL';
      const duration = error.config?._startTime ? Math.round(performance.now() - error.config._startTime) : 0;

      // Handle expected guest session initialization check cleanly
      if (status === 401 && (fullUrl.includes('/auth/me') || error.config?.url?.includes('/auth/me'))) {
        console.log(
          `%cℹ️ [GUEST SESSION] %c 401 (UNAUTHENTICATED) %c ${fullUrl} %c ${duration}ms`,
          'background: #1e293b; color: #94a3b8; font-weight: bold; padding: 3px 6px; border-radius: 4px 0 0 4px; border: 1px solid #475569;',
          'background: #475569; color: #f8fafc; font-weight: 700; padding: 3px 6px; border-radius: 0;',
          'background: #0f172a; color: #94a3b8; font-weight: normal; padding: 3px 6px; border-radius: 0;',
          'background: #334155; color: #94a3b8; font-weight: normal; padding: 3px 6px; border-radius: 0 4px 4px 0;',
          'Browsing in Guest Mode (Login to access Coins & Wallet)'
        );
        return Promise.reject(error);
      }

      console.warn(
        `%c❌ [API RESPONSE FAILED] %c ${status} %c ${method} %c ${fullUrl} %c ${duration}ms`,
        'background: #7f1d1d; color: #f87171; font-weight: bold; padding: 3px 6px; border-radius: 4px 0 0 4px; border: 1px solid #dc2626;',
        'background: #ef4444; color: #fff; font-weight: 900; padding: 3px 6px; border-radius: 0;',
        'background: #991b1b; color: #fff; font-weight: 800; padding: 3px 6px; border-radius: 0;',
        'background: #0f172a; color: #fca5a5; font-weight: bold; padding: 3px 6px; border-radius: 0;',
        'background: #334155; color: #f87171; font-weight: bold; padding: 3px 6px; border-radius: 0 4px 4px 0;',
        {
          status,
          message: error.response?.data?.message || error.message,
          response: error.response?.data
        }
      );

      return Promise.reject(error);
    }
  );
};

// Attach to both default axios and custom api instance
attachApiLogger(axios, 'Global Axios');
attachApiLogger(api, 'Custom API Instance');

export default api;
