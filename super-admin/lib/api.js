import axios from 'axios'
import { getToken, clearToken } from './auth'

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000'
  }
  return 'https://renza-restaurant.vercel.app'
}

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach Authorization header
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 unauthorized & 403 forbidden
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearToken()
      // Do not redirect if already on login page or if the request is login itself
      const isLoginRequest = error.config?.url?.includes('/api/auth/login')
      const isAlreadyOnLogin =
        typeof window !== 'undefined' && window.location.pathname.startsWith('/login')
      if (!isLoginRequest && !isAlreadyOnLogin && typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
