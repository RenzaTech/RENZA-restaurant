export function getApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return 'https://renza-restaurant.vercel.app';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
}
