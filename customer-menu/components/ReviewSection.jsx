'use client';

import { resolveGoogleReviewUrl } from './RateUsModal';

function formatExternalUrl(url) {
  if (!url || !url.trim()) return '';
  const clean = url.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    return `https://${clean}`;
  }
  return clean;
}

export default function ReviewSection({ restaurant, onRateUs }) {
  const targetReviewUrl = resolveGoogleReviewUrl(restaurant);
  const feedbackUrl = restaurant?.feedbackUrl || restaurant?.superAdminFeedbackUrl;
  const targetFeedbackUrl = feedbackUrl ? formatExternalUrl(feedbackUrl) : null;
  const phoneUrl = restaurant?.phone ? `tel:${restaurant.phone}` : null;

  return (
    <section className="review-section" aria-labelledby="reviewHeading">
      <div className="review-card">
        <span className="menu-intro-eyebrow">REVIEW &amp; FEEDBACK</span>
        <h3 id="reviewHeading">How was your dining experience?</h3>
        <p>
          We would love to hear your feedback. Share your experience at{' '}
          <strong className="text-white font-semibold">{restaurant?.name || 'our restaurant'}</strong>{' '}
          and help us elevate every visit.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            className="review-form-link"
            href={targetReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>★ Rate Us on Google Maps</span>
          </a>

          {targetFeedbackUrl ? (
            <a
              className="review-form-link !bg-transparent !text-amber-200 border border-amber-300/40 hover:!bg-amber-300/10"
              href={targetFeedbackUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>💬 Share Dining Feedback</span>
            </a>
          ) : phoneUrl ? (
            <a
              className="review-form-link !bg-transparent !text-amber-200 border border-amber-300/40 hover:!bg-amber-300/10"
              href={phoneUrl}
            >
              <span>💬 Share Dining Feedback</span>
            </a>
          ) : (
            <button
              type="button"
              className="review-form-link !bg-transparent !text-amber-200 border border-amber-300/40 hover:!bg-amber-300/10"
              onClick={onRateUs}
            >
              <span>💬 Share Dining Feedback</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
