const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Get or create a persistent session ID for this slug.
 * Stored in localStorage so the same user doesn't re-count on refresh.
 */
function getSessionId(slug) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 'ssr_session';
  }
  const key = `renza_session_${slug}`;
  let id = localStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem(key, id);
  }
  return id;
}

/**
 * Detect mobile vs desktop based on viewport width.
 */
function getDeviceType() {
  if (typeof window === 'undefined') return 'mobile';
  return window.innerWidth < 768 ? 'mobile' : 'desktop';
}

/**
 * Fire an analytics event — completely silent, never blocks UI.
 * @param {string} slug - Restaurant slug
 * @param {string} eventType - e.g. 'qr_scan', 'menu_view', 'item_view'
 * @param {string|null} foodItemId - Optional food item ID for item_view events
 */
export async function trackEvent(slug, eventType, foodItemId = null) {
  try {
    const sessionId = getSessionId(slug);
    const deviceType = getDeviceType();
    await fetch(`${API_URL}/api/menu/${slug}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, sessionId, deviceType, foodItemId }),
    });
  } catch (e) {
    // Silent fail — analytics must never affect UX
  }
}
