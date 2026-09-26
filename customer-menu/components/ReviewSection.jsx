'use client';

function formatExternalUrl(url) {
  if (!url || !url.trim()) return '';
  const clean = url.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    return `https://${clean}`;
  }
  return clean;
}

export default function ReviewSection({ restaurant, onRateUs }) {
  const reviewUrl = restaurant?.googleReviewUrl;
  const feedbackUrl = restaurant?.feedbackUrl;
  const targetFeedbackUrl = feedbackUrl ? formatExternalUrl(feedbackUrl) : null;

  return (
    <section className="review-section" aria-labelledby="reviewHeading">
      <div className="review-card">
        <span className="menu-intro-eyebrow">REVIEW &amp; FEEDBACK</span>
        <h3 id="reviewHeading">How was your dining experience?</h3>
        <p>
          We would love to hear your feedback. Share your experience at {restaurant?.name || 'our restaurant'} and help us elevate every visit.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {reviewUrl ? (
            <a
              className="review-form-link"
              href={reviewUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span>★ Leave a Google Review</span>
            </a>
          ) : (
            <button
              type="button"
              className="review-form-link"
              onClick={onRateUs}
            >
              <span>★ Rate Us on Google Maps</span>
            </button>
          )}

          {targetFeedbackUrl && (
            <a
              className="review-form-link !bg-transparent !text-amber-200 border border-amber-300/40 hover:!bg-amber-300/10"
              href={targetFeedbackUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span>💬 Share Dining Feedback</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
