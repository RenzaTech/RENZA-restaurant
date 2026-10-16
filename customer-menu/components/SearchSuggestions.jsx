'use client';

import { useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { renderHighlight } from '../utils/highlight';

/**
 * Scores a single dish against the query and returns a numeric relevance score.
 * Returns 0 if there is no match at all.
 */
function scoreItem(item, q) {
  const name  = (item.name        || '').toLowerCase();
  const desc  = (item.description || '').toLowerCase();
  const cat   = (item.categoryName || item.category?.name || '').toLowerCase();
  const ingr  = Array.isArray(item.ingredients)
    ? item.ingredients.join(' ').toLowerCase()
    : (item.ingredients || '').toLowerCase();

  let score = 0;
  if (name.startsWith(q))    score += 100;
  else if (name.includes(q)) score += 60;
  if (desc.includes(q))      score += 30;
  if (cat.includes(q))       score += 20;
  if (ingr.includes(q))      score += 10;
  if (item.isAvailable)      score += 5;

  return score;
}

/**
 * SearchSuggestions — Google/YouTube-style autocomplete dropdown.
 *
 * Props:
 *   query            {string}   Live (un-debounced) search query
 *   allItems         {Array}    Flat array of all menu items (with categoryName attached)
 *   activeIndex      {number}   Keyboard-highlighted row index (-1 = none)
 *   onSelectItem     {fn}       Called when user picks a dish row → opens DishSheet
 *   onCommitSearch   {fn}       Called when user picks the "Search for …" row
 *   resolveImageUrl  {fn}       Resolve relative image URLs
 *   suggestionListId {string}   ID for aria-owns on the input
 */
export default function SearchSuggestions({
  query = '',
  allItems = [],
  activeIndex = -1,
  onSelectItem,
  onCommitSearch,
  resolveImageUrl,
  suggestionListId = 'suggestion-list',
}) {
  // Compute top-6 scored suggestions
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
      } else if (idx === suggestions.length) {
        onCommitSearch();
      }
    };
    window.addEventListener('suggestion:enter', handleEnter);
    return () => window.removeEventListener('suggestion:enter', handleEnter);
  }, [suggestions, onSelectItem, onCommitSearch]);

  // Don't render at all if nothing to show
  if (!query.trim() || suggestions.length === 0) return null;

  return (
    <ul
      id={suggestionListId}
      className="suggestions-panel"
      role="listbox"
      aria-label="Dish suggestions"
    >
      {suggestions.map((item, idx) => {
        const isActive = activeIndex === idx;
        const isVeg    = item.isVeg !== false && item.foodType !== 'non-veg';
        const imageUrl = resolveImageUrl ? resolveImageUrl(item.imageUrl) : item.imageUrl;
        const price    = Number(item.price);

        return (
          <li
            key={item.id || item._id || item.name}
            id={`suggestion-${idx}`}
            role="option"
            aria-selected={isActive}
            className={`suggestion-row${isActive ? ' suggestion-row--active' : ''}`}
            onMouseDown={(e) => {
              // mousedown fires before blur; prevent blur from closing dropdown first
              e.preventDefault();
              onSelectItem(item);
            }}
          >
            {/* Thumbnail or veg dot */}
            <div className="suggestion-thumb">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover rounded"
                  sizes="36px"
                />
              ) : (
                <span
                  className={`suggestion-dot ${isVeg ? 'suggestion-dot--veg' : 'suggestion-dot--nonveg'}`}
                  title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                />
              )}
            </div>

            {/* Dish name (highlighted) + category */}
            <div className="suggestion-body">
              <span className="suggestion-name">
                {renderHighlight(item.name, query.trim())}
              </span>
              {item.categoryName && (
                <span className="suggestion-category">{item.categoryName}</span>
              )}
            </div>

            {/* Price */}
            {price > 0 && (
              <span className="suggestion-price">₹{price.toFixed(0)}</span>
            )}
          </li>
        );
      })}

      {/* "Search for …" fallthrough row */}
      <li
        role="option"
        aria-selected={activeIndex === suggestions.length}
        className={`suggestion-row suggestion-row--commit${
          activeIndex === suggestions.length ? ' suggestion-row--active' : ''
        }`}
        onMouseDown={(e) => {
          e.preventDefault();
          onCommitSearch();
        }}
      >
        <Search className="suggestion-commit-icon" aria-hidden="true" />
        <span>
          Search for{' '}
          <strong className="text-[#f5d98f]">&ldquo;{query.trim()}&rdquo;</strong>{' '}
          in all dishes
        </span>
      </li>
    </ul>
  );
}
