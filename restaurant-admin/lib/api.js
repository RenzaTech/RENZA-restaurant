import axios from 'axios';
import { getToken, clearToken } from '@/lib/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // When sending FormData, delete Content-Type so Axios/browser sets boundary automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      // Do not redirect if already on login page or if the request is login itself
      const isLoginRequest = error.config?.url?.includes('/api/auth/login');
      const isAlreadyOnLogin =
        typeof window !== 'undefined' && window.location.pathname.startsWith('/login');
      if (!isLoginRequest && !isAlreadyOnLogin && typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
