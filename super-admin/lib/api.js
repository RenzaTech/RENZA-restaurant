import axios from 'axios'
import { getToken, clearToken } from './auth'

export const BACKEND_URL = 'https://renza-restaurant.vercel.app'

export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // In browser, same-origin relative URL uses Next.js rewrites to proxy requests,
    // avoiding cross-origin issues or browser shield blocking entirely!
    return ''
  }
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '')
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl
  }
  return BACKEND_URL
}

/**
 * Universal dual-path API fetcher with automatic failover
 * Tries Next.js same-origin proxy first, then falls back directly to central backend
 */
export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`

  // 1. First attempt: via Next.js same-origin proxy
  try {
    const res = await fetch(cleanPath, { ...options, headers })
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // Fall through to direct central backend
  }

  // 2. Second attempt: directly to central backend
  const directUrl = `${BACKEND_URL}${cleanPath}`
  const directRes = await fetch(directUrl, { ...options, headers })
  if (!directRes.ok) {
    const errData = await directRes.json().catch(() => ({}))
    throw new Error(errData.error || errData.message || `Request failed with status ${directRes.status}`)
  }
  return await directRes.json()
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
