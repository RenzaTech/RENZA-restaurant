'use client';

import { useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { renderHighlight } from '../utils/highlight';
import { getDishImagePair } from './DishDetailModal';

function scoreItem(item, q) {
  const name = (item.name || '').toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const cat = (item.categoryName || item.category?.name || '').toLowerCase();
  const ingr = Array.isArray(item.ingredients)
    ? item.ingredients.join(' ').toLowerCase()
    : (item.ingredients || '').toLowerCase();

  let score = 0;
  if (name.startsWith(q)) score += 100;
  else if (name.includes(q)) score += 60;
  if (desc.includes(q)) score += 30;
  if (cat.includes(q)) score += 20;
  if (ingr.includes(q)) score += 10;
  if (item.isAvailable !== false) score += 5;

  return score;
}

export default function SearchSuggestions({
  query = '',
  allItems = [],
  activeIndex = -1,
  onSelectItem,
  onCommitSearch,
  suggestionListId = 'suggestion-list',
}) {
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return allItems
      .map((item) => {
        const score = scoreItem(item, q);
        return score > 0 ? { item, score } : null;
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          b.score - a.score ||
          (a.item.name || '').localeCompare(b.item.name || '')
      )
      .slice(0, 6)
      .map((s) => s.item);
  }, [query, allItems]);

  // Handle keyboard Enter selection
  useEffect(() => {
    const handleEnter = (e) => {
      const idx = e.detail?.index;
      if (idx !== undefined && idx >= 0 && idx < suggestions.length) {
        onSelectItem(suggestions[idx]);
      } else if (idx === suggestions.length && onCommitSearch) {
        onCommitSearch();
      }
    };
    window.addEventListener('suggestion:enter', handleEnter);
    return () => window.removeEventListener('suggestion:enter', handleEnter);
  }, [suggestions, onSelectItem, onCommitSearch]);

  if (!query.trim() || suggestions.length === 0) return null;

  return (
    <ul
      id={suggestionListId}
      className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-[#FFE082] shadow-[0_12px_32px_rgba(255,187,23,0.18)] overflow-hidden z-40 divide-y divide-[#F6F3EC] animate-in fade-in zoom-in-95 duration-150"
      role="listbox"
      aria-label="Dish suggestions"
    >
      {suggestions.map((item, idx) => {
        const isActive = activeIndex === idx;
        const isVeg = item.isVeg === true || item.isVeg === 1 || item.dietary === 'veg';
        const { imageUrl } = getDishImagePair(item);
        const price = Number(item.price);
        const priceDisplay = price > 0 ? `₹${price.toFixed(0)}` : '';
        const catName = item.categoryName || item.category?.name || '';

        return (
          <li
            key={item.id || item._id || `${item.name}-${idx}`}
            role="option"
            aria-selected={isActive}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelectItem(item);
            }}
            className={`flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition select-none ${
              isActive ? 'bg-[#FFF5D9]' : 'hover:bg-[#FFFCF7]'
            }`}
          >
            {/* Dish Thumbnail */}
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#F6F3EC] shrink-0 border border-[#E8EAF0]">
              <img
                src={imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Dish Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                  className={`w-3 h-3 rounded-xs border flex items-center justify-center shrink-0 bg-white ${
                    isVeg ? 'border-emerald-600' : 'border-rose-600'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                  />
                </span>
                <span className="text-xs sm:text-[13px] font-bold text-[#101B35] truncate font-sans">
                  {renderHighlight(item.name, query)}
                </span>
              </div>
              {catName && (
                <span className="text-[10px] text-[#718096] font-medium font-sans block truncate mt-0.5">
                  in {catName}
                </span>
              )}
            </div>

            {/* Price */}
            {priceDisplay && (
              <span className="text-xs font-bold text-[#101B35] font-mono shrink-0">
                {priceDisplay}
              </span>
            )}
          </li>
        );
      })}

      {/* Commit search row */}
      {onCommitSearch && (
        <li
          role="option"
          aria-selected={activeIndex === suggestions.length}
          onMouseDown={(e) => {
            e.preventDefault();
            onCommitSearch();
          }}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#8A5700] cursor-pointer transition select-none bg-[#FFF8E7] ${
            activeIndex === suggestions.length ? 'bg-[#FFE3A0]' : 'hover:bg-[#FFE3A0]/60'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-[#8A5700]" />
          <span>See all results for "{query}"</span>
        </li>
      )}
    </ul>
  );
}
