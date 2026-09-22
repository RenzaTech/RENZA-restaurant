'use client';

import { useState, useEffect } from 'react';
import { Star, X, MapPin, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

const RATING_MESSAGES = {
  1: { text: "We're sorry your experience wasn't ideal.", subtitle: "Your feedback helps us improve." },
  2: { text: "Decent. We're always striving to do better.", subtitle: "Thank you for letting us know." },
  3: { text: "Good! Thank you for dining with us.", subtitle: "We appreciate your honest review." },
  4: { text: "Very Good! Glad you enjoyed your meal!", subtitle: "Help others discover our food on Google Maps." },
  5: { text: "Outstanding! We're thrilled you loved it!", subtitle: "Share your love directly on Google Maps!" },
};

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

export default function RateUsModal({ isOpen, onClose, restaurant }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setHoverRating(0);
      setHasSubmitted(false);
    }
  }, [isOpen]);

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

  const currentRating = hoverRating || rating;
  const ratingInfo = RATING_MESSAGES[currentRating] || RATING_MESSAGES[5];
  const targetReviewUrl = resolveGoogleReviewUrl(restaurant);

  const handleReviewClick = () => {
    setHasSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Frosted Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rate-us-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300 animate-in fade-in zoom-in-95 sm:p-7"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center space-y-4">
          {/* Restaurant Badge / Logo */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-md shadow-amber-500/20 text-white font-bold text-xl">
            {restaurant?.name?.charAt(0) || 'R'}
          </div>

          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200/60 mb-1.5">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Customer Feedback
            </span>
            <h3 id="rate-us-title" className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Rate Your Experience at {restaurant?.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              How was your dining experience with us today?
            </p>
          </div>

          {/* 5-Star Interactive Rating */}
          <div className="py-2">
            <div className="flex justify-center items-center gap-2 sm:gap-2.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= currentRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded-full transition-transform duration-150 hover:scale-125 active:scale-95 focus:outline-none cursor-pointer"
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`h-8 w-8 sm:h-9 sm:w-9 transition-all ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]'
                          : 'fill-slate-100 text-slate-300 hover:text-amber-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Dynamic Rating Feedback Text */}
            <div className="mt-3 min-h-11">
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {ratingInfo.text}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {ratingInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Google Maps Callout Box */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-left flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="text-[11px] leading-relaxed text-slate-600">
              <span className="font-bold text-slate-900 block">
                Google Maps Verified Review
              </span>
              Clicking below opens {restaurant?.name}&apos;s rating page directly on Google Maps to submit your review with your Google account.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <a
              href={targetReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleReviewClick}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:opacity-95 hover:shadow-blue-600/40 active:scale-98 cursor-pointer"
            >
              <Star className="h-4 w-4 fill-amber-300 text-amber-300 shrink-0" />
              <span>Submit {rating}-Star Rating on Google Maps</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80 shrink-0" />
            </a>

            {hasSubmitted && (
              <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-semibold text-emerald-600 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Opening Google Maps to complete your {rating}-star rating! Thank you!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
