'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

const HIGHLIGHT_TAGS = [
  'Delicious Food',
  'Quick Service',
  'Polite Staff',
  'Clean & Hygienic',
  'Cozy Ambience',
  'Great Beverages',
  'Fresh Ingredients',
  'Fair Pricing',
];

const IMPROVEMENT_TAGS = [
  'Wait Time',
  'Seating Comfort',
  'Portion Size',
  'Music / Noise',
  'Menu Variety',
];

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent!',
};

export default function FeedbackPage({
  restaurant,
  onBackToHub,
  onViewMenu,
}) {
  const restaurantName = restaurant?.name || "Anbu'de Cafe";
  const slug = restaurant?.slug || 'anbude-cafe';

  const [tableNumber, setTableNumber] = useState(restaurant?.table?.label || '');

  useEffect(() => {
    if (restaurant?.table?.label) {
      setTableNumber(restaurant.table.label);
    }
  }, [restaurant?.table?.label]);
  const [overallRating, setOverallRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  // Aspect ratings
  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);

  const [selectedHighlights, setSelectedHighlights] = useState([]);
  const [selectedImprovements, setSelectedImprovements] = useState([]);
  const [comment, setComment] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleHighlight = (tag) => {
    setSelectedHighlights((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleImprovement = (tag) => {
    setSelectedImprovements((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newFeedback = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      restaurantName,
      slug,
      tableNumber: tableNumber.trim() || 'Unspecified',
      overallRating,
      foodRating,
      serviceRating,
      cleanlinessRating,
      highlights: selectedHighlights,
      improvements: selectedImprovements,
      comment: comment.trim(),
    };

    // Silently store in background
    try {
      const existing = localStorage.getItem(`renza_feedback_${slug}`);
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newFeedback);
      localStorage.setItem(`renza_feedback_${slug}`, JSON.stringify(list));
    } catch (err) {
      // Ignore storage error
    }

    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SUCCESS SCREEN
  if (isSubmitted) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-200">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
              Feedback Received!
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed font-sans max-w-sm mx-auto">
              Thank you for sharing your thoughts. Your anonymous review has been recorded directly for the management of <strong>{restaurantName}</strong>.
            </p>
          </div>

          {/* Anonymous Guarantee Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Anonymous & Confidential</span>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onBackToHub}
              className="w-full py-3 px-4 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold transition shadow-sm"
            >
              Back to Dining Hub
            </button>

            {onViewMenu && (
              <button
                type="button"
                onClick={onViewMenu}
                className="w-full py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition"
              >
                Browse Menu
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setComment('');
                setSelectedHighlights([]);
                setSelectedImprovements([]);
                setTableNumber('');
              }}
              className="text-xs text-gray-400 hover:text-gray-600 pt-2"
            >
              Submit another response
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 sm:px-6 py-4 animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-3.5 border-b border-gray-200/80 mb-5">
        <button
          type="button"
          onClick={onBackToHub}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 active:scale-95 transition shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Back to Hub</span>
        </button>

        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 font-sans">
          Guest Feedback
        </span>
      </div>

      {/* Main Feedback Form Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">
          Anonymous Guest Feedback
        </h1>
        <p className="text-xs text-gray-500 mt-1 font-sans leading-relaxed">
          Tell us about your experience at <strong>{restaurantName}</strong>. Your honest response helps us maintain quality and serve you better.
        </p>
      </div>

      {/* If Restaurant Admin configured an external feedback link (Google Forms, Typeform, etc.) */}
      {restaurant?.feedbackUrl && (
        <div className="mb-5 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-blue-900 font-sans">Official Management Survey</p>
            <p className="text-[11px] text-blue-700/80 font-sans truncate">Direct link configured by restaurant management</p>
          </div>
          <a
            href={restaurant.feedbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shrink-0 active:scale-95 shadow-xs"
          >
            Open Survey ↗
          </a>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Table Number Card (Optional) */}
        <div className="p-4 bg-white border border-gray-200/90 rounded-2xl shadow-sm">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 font-sans">
            Table Number <span className="text-gray-400 font-normal lowercase">(optional)</span>
          </label>
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="e.g. Table 4 or Outdoor 2"
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-400 transition"
          />
        </div>

        {/* 1. Overall Experience (5-Star) */}
        <div className="p-5 bg-white border border-gray-200/90 rounded-2xl shadow-sm text-center">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1 font-sans">
            Overall Experience
          </span>
          <span className="text-xs font-bold text-amber-600 block mb-3 font-sans">
            {RATING_LABELS[hoverRating || overallRating]}
          </span>

          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || overallRating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setOverallRating(star)}
                  className="p-1.5 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-8 h-8 ${
                      active
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200 fill-gray-100'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Aspect Ratings */}
        <div className="p-4 bg-white border border-gray-200/90 rounded-2xl shadow-sm space-y-3">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block font-sans">
            Rate Key Areas
          </span>

          {/* Food Quality */}
          <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
            <span className="font-semibold text-gray-700 font-sans">Food Taste & Quality</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFoodRating(s)}
                  className="p-0.5"
                >
                  <Star
                    className={`w-4 h-4 ${
                      foodRating >= s
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200 fill-gray-100'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Service Speed */}
          <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
            <span className="font-semibold text-gray-700 font-sans">Staff & Service Speed</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setServiceRating(s)}
                  className="p-0.5"
                >
                  <Star
                    className={`w-4 h-4 ${
                      serviceRating >= s
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200 fill-gray-100'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Cleanliness */}
          <div className="flex items-center justify-between text-xs py-1">
            <span className="font-semibold text-gray-700 font-sans">Cleanliness & Ambience</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCleanlinessRating(s)}
                  className="p-0.5"
                >
                  <Star
                    className={`w-4 h-4 ${
                      cleanlinessRating >= s
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200 fill-gray-100'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Highlights Tags */}
        <div className="p-4 bg-white border border-gray-200/90 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2 font-sans">
            What did you like? (Optional)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {HIGHLIGHT_TAGS.map((tag) => {
              const selected = selectedHighlights.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleHighlight(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    selected
                      ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Improvement Areas */}
        <div className="p-4 bg-white border border-gray-200/90 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2 font-sans">
            Any areas to improve? (Optional)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {IMPROVEMENT_TAGS.map((tag) => {
              const selected = selectedImprovements.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleImprovement(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    selected
                      ? 'bg-rose-50 border-rose-400 text-rose-700 font-semibold shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Detailed Comments */}
        <div className="p-4 bg-white border border-gray-200/90 rounded-2xl shadow-sm">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 font-sans">
            Detailed Comments & Suggestions
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Write your suggestions, compliments, or thoughts..."
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition resize-none leading-relaxed"
          />
        </div>

        {/* Anonymous Guarantee & Submit */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-sans">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Anonymous. No phone number or email stored.</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-[#FFBB17] hover:bg-[#E5A710] text-gray-950 text-xs font-bold uppercase tracking-wider transition shadow-sm active:scale-[0.99]"
          >
            Submit Feedback
          </button>
        </div>
      </form>
    </div>
  );
}
