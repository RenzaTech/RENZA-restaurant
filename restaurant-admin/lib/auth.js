import Cookies from 'js-cookie';

const COOKIE_NAME = 'renza_restaurant_token';
const COOKIE_OPTIONS = {
  expires: 7,       // 7 days
  sameSite: 'Lax',
  secure: process.env.NODE_ENV === 'production',
};

export function getToken() {
  return Cookies.get(COOKIE_NAME) || null;
}

export function setToken(token) {
  Cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
}

export function clearToken() {
  Cookies.remove(COOKIE_NAME);
}

export function isAuthenticated() {
  return !!getToken();
}
