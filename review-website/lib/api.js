import axios from 'axios';

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const fetchRestaurants = async () => {
  const res = await api.get('/nfc/restaurants');
  return res.data;
};

export const fetchCards = async (restaurantId = null) => {
  const url = restaurantId ? `/nfc/cards?restaurantId=${restaurantId}` : '/nfc/cards';
  const res = await api.get(url);
  return res.data;
};

export const createCard = async (payload) => {
  const res = await api.post('/nfc/cards', payload);
  return res.data;
};

export const lookupCard = async (code) => {
  const res = await api.get(`/nfc/cards/lookup/${encodeURIComponent(code)}`);
  return res.data;
};

export const toggleCard = async (id, isActive) => {
  const res = await api.patch(`/nfc/cards/${id}/toggle`, { isActive });
  return res.data;
};

export const deleteCard = async (id) => {
  const res = await api.delete(`/nfc/cards/${id}`);
  return res.data;
};

export default api;
