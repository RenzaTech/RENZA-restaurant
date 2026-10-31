import { getApiUrl } from './api';

const blurColours = ['#5B4636', '#6B5745', '#536653', '#765A43', '#4A505B', '#8A6248'];

export function resolveImageUrl(url) {
  if (!url) return null;
  let resolved = url;
  if (resolved.startsWith('http://') || resolved.startsWith('https://')) return resolved;
  if (resolved.startsWith('/uploads') || resolved.startsWith('/api/uploads')) {
    const apiUrl = getApiUrl();
    return `${apiUrl}${resolved}`;
  }
  return resolved;
}

export function getDishBlurDataUrl(name = '') {
  let hash = 0;
  for (const character of name) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  const colour = blurColours[hash % blurColours.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="6" viewBox="0 0 8 6"><rect width="8" height="6" fill="${colour}"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
