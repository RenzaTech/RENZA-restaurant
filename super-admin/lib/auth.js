import Cookies from 'js-cookie'

const COOKIE_NAME = 'renza_admin_token'
const COOKIE_EXPIRES = 7 // days

export function getToken() {
  const fromCookie = Cookies.get(COOKIE_NAME)
  if (fromCookie) return fromCookie
  if (typeof window !== 'undefined') {
    return (
      localStorage.getItem(COOKIE_NAME) ||
      localStorage.getItem('sales_auth_token') ||
      sessionStorage.getItem(COOKIE_NAME) ||
      null
    )
  }
  return null
}

export function setToken(token) {
  Cookies.set(COOKIE_NAME, token, { expires: COOKIE_EXPIRES, sameSite: 'lax' })
  if (typeof window !== 'undefined') {
    localStorage.setItem(COOKIE_NAME, token)
  }
}

export function clearToken() {
  Cookies.remove(COOKIE_NAME)
  if (typeof window !== 'undefined') {
    localStorage.removeItem(COOKIE_NAME)
    sessionStorage.removeItem(COOKIE_NAME)
  }
}

export function isAuthenticated() {
  const token = getToken()
  return !!token
}
