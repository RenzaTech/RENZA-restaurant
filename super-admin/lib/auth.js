import Cookies from 'js-cookie'

const COOKIE_NAME = 'renza_admin_token'
const COOKIE_EXPIRES = 7 // days

export function getToken() {
  return Cookies.get(COOKIE_NAME) || null
}

export function setToken(token) {
  Cookies.set(COOKIE_NAME, token, { expires: COOKIE_EXPIRES, sameSite: 'lax' })
}

export function clearToken() {
  Cookies.remove(COOKIE_NAME)
}

export function isAuthenticated() {
  const token = getToken()
  return !!token
}
