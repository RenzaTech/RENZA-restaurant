'use client';

import { useEffect, useRef, useCallback } from 'react';
import { X, Star, ExternalLink } from 'lucide-react';

export function resolveGoogleReviewUrl(restaurant) {
  const customUrl = restaurant?.googleReviewUrl?.trim();
  if (customUrl) {
    const match = customUrl.match(/[?&]placeid=([a-zA-Z0-9_-]+)/i);
    if (match) {
      return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(match[1])}`;
    }
    if (customUrl.startsWith('ChIJ') || (!customUrl.includes('/') && customUrl.length > 20)) {
      return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(customUrl)}`;
    }
    if (customUrl.includes('g.page') && !customUrl.includes('/review')) {
      return `${customUrl.replace(/\/+$/, '')}/review`;
    }
    if (!customUrl.startsWith('http://') && !customUrl.startsWith('https://')) {
      return `https://${customUrl}`;
    }
    return customUrl;
  }

  const query = `${restaurant?.name || ''} ${restaurant?.address || ''} write a review`.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export default function ReviewModal({ isOpen, onClose, restaurant }) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const handleDismiss = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.state?.modal === 'review') {
      window.history.back();
    } else {
      onCloseRef.current?.();
    }
  }, []);

  // Mobile hardware/gesture back button support
  useEffect(() => {
    if (!isOpen) return;
    try {
      if (window.history.state?.modal !== 'review') {
        window.history.pushState({ modal: 'review' }, '', window.location.href);
      }
    } catch (_) {}

    const handlePop = () => {
      onCloseRef.current?.();
    };

    window.addEventListener('popstate', handlePop);

    return () => {
      window.removeEventListener('popstate', handlePop);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const name = restaurant?.name || "Anbu'de Cafe";
  const googleReviewUrl = resolveGoogleReviewUrl(restaurant);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm transition-opacity"
      onClick={handleDismiss}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-gray-200 text-gray-800 animate-in fade-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF8E7] border border-[#FFBB17]/40 flex items-center justify-center text-[#92400E]">
              <Star className="w-4 h-4 fill-[#FFBB17] text-[#FFBB17]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 font-sans">
                Review on Google
              </h2>
              <p className="text-[11px] text-gray-500 font-sans">
                Your feedback means the world to us
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="py-6 text-center space-y-3">
          <div className="flex items-center justify-center gap-1 text-[#FFBB17]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-[#FFBB17] text-[#FFBB17]" />
            ))}
          </div>

          <p className="text-sm text-gray-600 px-4">
            If you enjoyed your time at <strong className="text-gray-900">{name}</strong>, please take a quick 15 seconds to leave us a 5-star review on Google!
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition"
          >
            Maybe Later
          </button>
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDismiss}
            className="flex-1 py-3 px-4 rounded-xl bg-[#FFBB17] hover:bg-[#E5A710] text-gray-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Rate on Google</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
