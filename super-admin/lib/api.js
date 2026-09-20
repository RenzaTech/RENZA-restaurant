import axios from 'axios'
import { getToken, clearToken } from './auth'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
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

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
