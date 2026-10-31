'use client';

import { useState, useEffect } from 'react';
import { X, Star, CheckCircle2, MessageSquare, ThumbsUp } from 'lucide-react';

const QUICK_TAGS = [
  'Delicious Food',
  'Quick Service',
  'Cozy Ambience',
  'Friendly Staff',
  'Clean & Hygienic',
  'Fair Pricing',
];

export default function FeedbackModal({ isOpen, onClose, restaurantName }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mobile hardware/gesture back button support
  useEffect(() => {
    if (!isOpen) return;
    let closedByPop = false;
    try {
      window.history.pushState({ modal: 'feedback' }, '', window.location.href);
    } catch (_) {}

    const handlePop = () => {
      closedByPop = true;
      onClose();
    };

    window.addEventListener('popstate', handlePop);

    return () => {
      window.removeEventListener('popstate', handlePop);
      if (!closedByPop && typeof window !== 'undefined' && window.history.state?.modal === 'feedback') {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      // Auto close after 2 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setComment('');
        setSelectedTags([]);
        onClose();
      }, 1500);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-gray-200 text-gray-800 animate-in fade-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <MessageSquare className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 font-sans">
                Anonymous Feedback
              </h2>
              <p className="text-[11px] text-gray-500 font-sans">
                100% private to {restaurantName || 'the manager'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-10 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Thank You!</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              Your anonymous feedback helps us serve you better every visit.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Star Rating */}
            <div className="text-center py-1">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-2 font-sans">
                How was your experience?
              </span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          active
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-gray-200 fill-gray-100'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Feedback Tags */}
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2 font-sans">
                What stood out? (Optional)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map((tag) => {
                  const selected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selected
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note text area */}
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Share any details, special compliments, or suggestions..."
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50/50 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
              >
                Submit Anonymously
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
