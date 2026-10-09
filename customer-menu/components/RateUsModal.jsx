'use client';

import { useEffect } from 'react';
import { Star, X, MessageSquare } from 'lucide-react';

export function resolveGoogleReviewUrl(restaurant) {
  const customUrl = restaurant?.googleReviewUrl?.trim();
  if (customUrl) {
    // If it contains placeid= in query params
    const match = customUrl.match(/[?&]placeid=([a-zA-Z0-9_-]+)/i);
    if (match) {
      return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(match[1])}`;
    }
    // If it's a raw Place ID (starts with ChIJ or has no slashes and is long)
    if (customUrl.startsWith('ChIJ') || (!customUrl.includes('/') && customUrl.length > 20)) {
      return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(customUrl)}`;
    }
    // If it's a g.page shortlink without /review
    if (customUrl.includes('g.page') && !customUrl.includes('/review')) {
      return `${customUrl.replace(/\/+$/, '')}/review`;
    }
    // Prepend https:// if protocol is missing
    if (!customUrl.startsWith('http://') && !customUrl.startsWith('https://')) {
      return `https://${customUrl}`;
    }
    return customUrl;
  }

  // Fallback when no direct review link configured:
  // Querying Google Search with 'write a review' intent opens the Google Business Review prompt
  const query = `${restaurant?.name || ''} ${restaurant?.address || ''} write a review`.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function formatExternalUrl(url) {
  if (!url || !url.trim()) return '';
  const clean = url.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    return `https://${clean}`;
  }
  return clean;
}

export default function RateUsModal({ isOpen, onClose, restaurant }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const targetReviewUrl = resolveGoogleReviewUrl(restaurant);
  const feedbackRaw = restaurant?.feedbackUrl || restaurant?.superAdminFeedbackUrl;
  const targetFeedbackUrl = feedbackRaw ? formatExternalUrl(feedbackRaw) : null;
  const phoneUrl = restaurant?.phone ? `tel:${restaurant.phone}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Frosted Dark Backdrop */}
      <div
        className="fixed inset-0 bg-[#06090d]/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rate-us-title"
        className="relative w-full max-w-[440px] overflow-hidden rounded-xl sm:rounded-2xl border border-[rgba(212,177,93,0.3)] bg-gradient-to-b from-[#111822] via-[#0d131b] to-[#070a0f] p-6 sm:p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all duration-300 animate-in fade-in zoom-in-95"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-[#f6f2eb] hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Eyebrow */}
        <span className="block text-center text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.26em] text-[#d4b15d] mb-2 sm:mb-2.5">
          REVIEW &amp; FEEDBACK
        </span>

        {/* Headline in Serif Display Font */}
        <h3
          id="rate-us-title"
          className="font-display text-2xl sm:text-3xl text-[#f6f2eb] font-normal tracking-wide leading-tight mb-3"
        >
          How was your dining experience?
        </h3>

        {/* Subtitle / Description */}
        <p className="text-center text-xs sm:text-[13px] leading-relaxed text-[#f6f2eb]/75 max-w-xs sm:max-w-sm mx-auto mb-6 sm:mb-7">
          We would love to hear your feedback.
          <br />
          Share your experience at{' '}
          <span className="font-semibold text-[#f6f2eb]">
            {restaurant?.name || 'our restaurant'}
          </span>{' '}
          and help us elevate every visit.
        </p>

        {/* Action Buttons Stack */}
        <div className="space-y-3">
          {/* Primary Button: Rate on Google Maps */}
          <a
            href={targetReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded sm:rounded-md bg-[#d4b15d] hover:bg-[#f5d98f] text-[#06090d] font-sans text-xs sm:text-[13px] font-bold tracking-[0.16em] uppercase shadow-lg shadow-[#d4b15d]/25 transition-all hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
          >
            <Star className="h-4 w-4 fill-[#06090d] text-[#06090d] shrink-0" />
            <span>Rate Us on Google Maps</span>
          </a>

          {/* Secondary Button: Share Dining Feedback */}
          {targetFeedbackUrl ? (
            <a
              href={targetFeedbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded sm:rounded-md bg-transparent hover:bg-[#d4b15d]/10 border border-[rgba(212,177,93,0.38)] text-[#d4b15d] hover:text-[#f5d98f] hover:border-[#d4b15d] font-sans text-xs sm:text-[13px] font-bold tracking-[0.16em] uppercase transition-all hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
            >
              <MessageSquare className="h-4 w-4 text-[#d4b15d] shrink-0" />
              <span>Share Dining Feedback</span>
            </a>
          ) : phoneUrl ? (
            <a
              href={phoneUrl}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded sm:rounded-md bg-transparent hover:bg-[#d4b15d]/10 border border-[rgba(212,177,93,0.38)] text-[#d4b15d] hover:text-[#f5d98f] hover:border-[#d4b15d] font-sans text-xs sm:text-[13px] font-bold tracking-[0.16em] uppercase transition-all hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
            >
              <MessageSquare className="h-4 w-4 text-[#d4b15d] shrink-0" />
              <span>Share Dining Feedback</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                window.open(targetReviewUrl, '_blank', 'noopener,noreferrer');
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded sm:rounded-md bg-transparent hover:bg-[#d4b15d]/10 border border-[rgba(212,177,93,0.38)] text-[#d4b15d] hover:text-[#f5d98f] hover:border-[#d4b15d] font-sans text-xs sm:text-[13px] font-bold tracking-[0.16em] uppercase transition-all hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
            >
              <MessageSquare className="h-4 w-4 text-[#d4b15d] shrink-0" />
              <span>Share Dining Feedback</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
