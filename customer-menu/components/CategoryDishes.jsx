'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  X,
  ArrowUpDown,
} from 'lucide-react';
import DishDetailModal, { getDishImagePair, parsePortions, parsePreparationPrices } from './DishDetailModal';
import SearchSuggestions from './SearchSuggestions';
import { renderHighlight } from '../utils/highlight';
import { trackEvent } from '../utils/analytics';

function VegBadge({ isVeg }) {
  if (isVeg === true || isVeg === 1 || isVeg === 'veg') {
    return (
      <span
        title="Vegetarian"
        className="w-4 h-4 rounded-sm border border-emerald-600 flex items-center justify-center shrink-0 bg-white shadow-2xs"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-600" />
      </span>
    );
  }

  return (
    <span
      title="Non-Vegetarian"
      className="w-4 h-4 rounded-sm border border-rose-600 flex items-center justify-center shrink-0 bg-white shadow-2xs"
    >
      <span className="w-2 h-2 rounded-full bg-rose-600" />
    </span>
  );
}

function formatPrice(price) {
  if (price === undefined || price === null) return '';
  const num = Number(price);
  if (isNaN(num)) return price;
  return num % 1 === 0 ? `₹${num}` : `₹${num.toFixed(2)}`;
}

function getPriceDisplay(dish) {
  const portions = parsePortions(dish);
  const preps = parsePreparationPrices(dish);

  if (portions && portions.length > 0) {
    const prices = portions.map((p) => p.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    return minP === maxP ? formatPrice(minP) : `${formatPrice(minP)} – ${formatPrice(maxP)}`;
  }

  if (preps && preps.length > 0) {
    const prices = preps.map((p) => p.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    return minP === maxP ? formatPrice(minP) : `${formatPrice(minP)} – ${formatPrice(maxP)}`;
  }

  return formatPrice(dish.price);
}

const FILTER_OPTIONS = [
  { id: 'all', label: 'All Items' },
  { id: 'veg', label: 'Pure Veg', isVeg: true },
  { id: 'non-veg', label: 'Non-Veg', isNonVeg: true },
  { id: 'vegan', label: '🥗 Vegan' },
  { id: 'jain', label: '🪔 Jain' },
  { id: 'gluten-free', label: '🌾 Gluten-Free' },
  { id: 'combo', label: '🍱 Combos' },
  { id: 'available', label: 'Available now' },
];

export default function CategoryDishes({
  category,
  onBackToCategories,
  restaurantSlug = 'anbude-cafe',
  table = null,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState(['all']);
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'price-asc' | 'price-desc'
  const [selectedDish, setSelectedDish] = useState(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const searchInputRef = useRef(null);

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const q = sp.get('q') || sp.get('search') || '';
      if (q) {
        setSearchQuery(q);
        setSuggestionsOpen(true);
      }
    } catch (_) {}
  }, []);

  // Search analytics tracking — debounced 1s, query >= 3 chars
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 3) return;
    const timer = setTimeout(() => {
      trackEvent(restaurantSlug, 'search', null);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchQuery, restaurantSlug]);

  const items = useMemo(() => {
    return category?.foodItems || category?.items || [];
  }, [category]);

  const toggleFilter = (id) => {
    if (id === 'all') {
      setActiveFilters(['all']);
      return;
    }

    setActiveFilters((prev) => {
      const withoutAll = prev.filter((f) => f !== 'all');
      let next;
      if (withoutAll.includes(id)) {
        next = withoutAll.filter((f) => f !== id);
      } else {
        if (id === 'veg') next = [...withoutAll.filter((f) => f !== 'non-veg'), id];
        else if (id === 'non-veg') next = [...withoutAll.filter((f) => f !== 'veg'), id];
        else next = [...withoutAll, id];
      }
      return next.length === 0 ? ['all'] : next;
    });
  };

  const filteredDishes = useMemo(() => {
    let result = items.filter((dish) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (dish.name || '').toLowerCase().includes(q);
        const matchesDesc = (dish.description || '').toLowerCase().includes(q);
        const matchesIngr = Array.isArray(dish.ingredients)
          ? dish.ingredients.some((i) => i.toLowerCase().includes(q))
          : (dish.ingredients || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesIngr) return false;
      }

      // Dietary & lifestyle filters
      if (!activeFilters.includes('all')) {
        const isVeg = dish.isVeg === true || dish.isVeg === 1 || dish.dietary === 'veg';

        if (activeFilters.includes('veg') && !isVeg) return false;
        if (activeFilters.includes('non-veg') && isVeg) return false;
        if (activeFilters.includes('vegan') && !dish.isVegan) return false;
        if (activeFilters.includes('jain') && !dish.isJain) return false;
        if (activeFilters.includes('gluten-free') && !dish.isGlutenFree) return false;
        if (activeFilters.includes('combo') && !dish.isCombo) return false;
        if (activeFilters.includes('available') && dish.isAvailable === false) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }

    return result;
  }, [items, searchQuery, activeFilters, sortBy]);

  // Keyboard navigation for search suggestions
  const handleKeyDown = (e) => {
    if (!suggestionsOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSuggestionIndex((prev) => Math.min(prev + 1, 6));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSuggestionIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestionIndex >= 0) {
        window.dispatchEvent(new CustomEvent('suggestion:enter', { detail: { index: suggestionIndex } }));
      }
      setSuggestionsOpen(false);
    } else if (e.key === 'Escape') {
      setSuggestionsOpen(false);
      setSuggestionIndex(-1);
    }
  };

  return (
    <div className="relative w-full px-4 pt-3 pb-6 animate-in fade-in duration-200 selection:bg-[#FFBB17]/30">
      {/* 1. Header: Back to Categories + Table Pill / Items Label */}
      <div className="relative z-10 flex items-center justify-between gap-2 pb-3 border-b border-[#E8EAF0] mb-3.5">
        <button
          type="button"
          onClick={onBackToCategories}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8EAF0] bg-white text-[#182238] text-xs font-semibold shadow-[0_1px_3px_rgba(24,34,56,0.04)] hover:bg-[#FFF5D9]/40 active:scale-95 transition shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#182238] stroke-[2.2]" />
          <span>All Categories</span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          {table && (
            <span
              className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FFF5D9] to-[#FEF3C7] border border-[#F59E0B]/60 text-[#92400E] text-[11.5px] font-bold tracking-wider uppercase whitespace-nowrap shrink-0 shadow-xs"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span className="whitespace-nowrap">
                {(() => {
                  const raw = (table.label || table.name || '').trim();
                  const match = raw.match(/(\d+)/);
                  return match ? `Table ${parseInt(match[1], 10)}` : (raw || 'Table');
                })()}
              </span>
            </span>
          )}
          <span className="hidden min-[380px]:inline-block text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#9AA3B2] font-sans whitespace-nowrap">
            Menu Items
          </span>
        </div>
      </div>

      {/* 2. Page Heading & Subtitle */}
      <div className="relative z-10 mb-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-[#182238] leading-tight font-sans">
            {category?.name}
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF5D9] text-[#A16207] border border-[#FFE3A0]/70 shrink-0">
            {items.length} {items.length === 1 ? 'dish' : 'dishes'}
          </span>
        </div>
        <p className="text-xs sm:text-[13px] text-[#737D8D] mt-1 leading-relaxed font-normal">
          Explore freshly prepared dishes available in {category?.name || 'this category'}.
        </p>
      </div>

      {/* 3. Search Bar with Signature Gold Border & Autocomplete Dropdown */}
      <div className="relative z-20 mb-3">
        <div className="relative w-full h-[46px] rounded-2xl bg-white border-2 border-[#FFE082] focus-within:border-[#FFBB17] shadow-[0_2px_8px_rgba(255,187,23,0.08)] transition flex items-center">
          <Search className="w-4 h-4 text-[#9AA3B2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSuggestionsOpen(Boolean(e.target.value.trim()));
              setSuggestionIndex(-1);
            }}
            onFocus={() => {
              if (searchQuery.trim()) setSuggestionsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Search dishes in ${category?.name || 'this category'}...`}
            className="w-full h-full pl-10 pr-9 bg-transparent rounded-2xl text-xs sm:text-[13px] text-[#182238] placeholder-[#9AA3B2] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSuggestionsOpen(false);
              }}
              className="w-6 h-6 rounded-full flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9AA3B2] hover:text-[#182238] hover:bg-[#FFF5D9] transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Suggestions Dropdown */}
        {suggestionsOpen && (
          <SearchSuggestions
            query={searchQuery}
            allItems={items.map((i) => ({ ...i, categoryName: category?.name }))}
            activeIndex={suggestionIndex}
            onSelectItem={(dish) => {
              setSelectedDish(dish);
              setSuggestionsOpen(false);
            }}
            onCommitSearch={() => setSuggestionsOpen(false)}
          />
        )}
      </div>

      {/* 4. Dietary & Lifestyle Filter Rail */}
      <div className="relative z-10 mb-3 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4">
        <div className="flex items-center gap-1.5 whitespace-nowrap min-w-max">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = activeFilters.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleFilter(opt.id)}
                className={`h-[32px] px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 font-sans inline-flex items-center gap-1.5 shadow-[0_1px_3px_rgba(24,34,56,0.04)] ${
                  isActive
                    ? 'bg-[#182238] text-white border-[#182238]'
                    : 'bg-white text-[#737D8D] border-[#E8EAF0] hover:bg-[#FFF5D9]/40 hover:text-[#182238]'
                }`}
              >
                {opt.isVeg && <span className="w-2 h-2 rounded-full bg-[#16B86A]" />}
                {opt.isNonVeg && <span className="w-2 h-2 rounded-full bg-[#E11D48]" />}
                <span>{opt.label}</span>
              </button>
            );
          })}

          {!activeFilters.includes('all') && (
            <button
              type="button"
              onClick={() => setActiveFilters(['all'])}
              className="h-[32px] px-2.5 rounded-xl text-xs font-bold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition active:scale-95"
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* 5. Results Count & Sorting Controls */}
      <div className="relative z-10 flex items-center justify-between py-1.5 mb-3 text-xs text-[#718096]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#718096] font-sans">
          {filteredDishes.length} {filteredDishes.length === 1 ? 'dish' : 'dishes'} found
        </span>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10.5px] uppercase tracking-wider text-[#9AA3B2] font-bold hidden min-[360px]:inline">
            Sort:
          </span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-xl border border-[#E8EAF0] bg-white py-1 pl-2.5 pr-7 text-[11px] font-bold text-[#101B35] outline-none transition hover:border-[#FFB800] cursor-pointer shadow-2xs"
              aria-label="Sort dishes"
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High (₹ ↑)</option>
              <option value="price-desc">Price: High to Low (₹ ↓)</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#FFB800]" />
          </div>
        </div>
      </div>

      {/* 6. Dishes List */}
      {filteredDishes.length === 0 ? (
        <div className="relative z-10 py-12 text-center bg-white border border-[#E8EAF0] rounded-2xl p-6 shadow-[0_2px_8px_rgba(24,34,56,0.04)]">
          <p className="text-xs font-semibold text-[#182238] font-sans">No dishes match your selection</p>
          <p className="text-[11px] text-[#737D8D] mt-1 font-sans">
            Try resetting your filters or search keywords.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveFilters(['all']);
              setSortBy('default');
            }}
            className="mt-3 px-3 py-1 bg-[#FFF5D9] text-[#8A5700] text-xs font-semibold rounded-lg hover:bg-[#FFE3A0] transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="relative z-10 space-y-2.5">
          {filteredDishes.map((dish, idx) => {
            const isAvailable = dish.isAvailable !== false;
            const isVeg = dish.isVeg === true || dish.isVeg === 1 || dish.dietary === 'veg';
            const { imageUrl } = getDishImagePair(dish);
            const priceLabel = getPriceDisplay(dish);

            const comboList = dish.isCombo
              ? Array.isArray(dish.comboItemsList)
                ? dish.comboItemsList
                : (() => {
                    try {
                      return typeof dish.comboItems === 'string' ? JSON.parse(dish.comboItems) : (dish.comboItems || []);
                    } catch {
                      return [];
                    }
                  })()
              : [];

            return (
              <div
                key={dish.id || dish._id || `${dish.name}-${idx}`}
                onClick={() => setSelectedDish(dish)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedDish(dish);
                  }
                }}
                className={`group p-3 sm:p-3.5 bg-white border border-[#E8EAF0] rounded-2xl shadow-[0_2px_8px_rgba(24,34,56,0.04)] hover:border-[#FFBB17] hover:shadow-[0_4px_14px_rgba(255,187,23,0.14)] active:scale-[0.98] transition-all duration-150 flex items-center justify-between gap-3 text-left select-none cursor-pointer ${
                  !isAvailable ? 'opacity-60 bg-gray-50' : ''
                }`}
              >
                {/* Left: Dish Thumbnail */}
                <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-[#FFF6E3] shrink-0 border border-[#FFE3A0]/60">
                  <img
                    src={imageUrl}
                    alt={dish.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                      !isAvailable ? 'grayscale' : ''
                    }`}
                  />
                  <div className="absolute top-1.5 left-1.5 bg-white/95 backdrop-blur-xs rounded-sm p-0.5 shadow-2xs">
                    <VegBadge isVeg={isVeg} />
                  </div>
                </div>

                {/* Center: Dish Info */}
                <div className="flex-1 min-w-0 pr-1 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm sm:text-[15px] font-bold text-[#182238] font-sans tracking-tight truncate group-hover:text-black transition-colors">
                      {renderHighlight(dish.name, searchQuery)}
                    </h3>
                    {dish.isCombo && (
                      <span className="shrink-0 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#FFF5D9] text-[#8A5700] border border-[#FFBB17]/40 shadow-2xs">
                        🍱 {dish.comboLabel || 'Combo'}
                      </span>
                    )}
                    {dish.isBestseller && (
                      <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                        ★ Bestseller
                      </span>
                    )}
                  </div>

                  {dish.description ? (
                    <p className="text-[11px] sm:text-xs text-[#737D8D] line-clamp-1 mt-0.5 font-sans leading-relaxed">
                      {renderHighlight(dish.description, searchQuery)}
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#9AA3B2] mt-0.5 font-sans">
                      Freshly prepared on order
                    </p>
                  )}

                  {dish.isCombo && comboList.length > 0 && (
                    <p className="text-[10px] text-[#8A5700] line-clamp-1 mt-0.5 font-sans font-medium">
                      Includes: {comboList.map((c) => `${c.quantity ? c.quantity + ' ' : ''}${c.name}`).join(', ')}
                    </p>
                  )}

                  {/* Dietary / Spicy micro tags */}
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {dish.spicyLevel > 0 && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                        {'🌶'.repeat(Math.min(3, dish.spicyLevel))}
                      </span>
                    )}
                    {dish.isVegan && (
                      <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Vegan
                      </span>
                    )}
                    {dish.isJain && (
                      <span className="text-[9.5px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        Jain
                      </span>
                    )}
                    {dish.isGlutenFree && (
                      <span className="text-[9.5px] font-bold text-sky-800 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                        Gluten-Free
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[14.5px] sm:text-[15.5px] font-extrabold text-[#182238] font-sans">
                      {priceLabel}
                    </span>

                    {!isAvailable && (
                      <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-[#737D8D] border border-[#E8EAF0]">
                        Sold Out
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Action Chevron */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FFF5D9] border border-[#FFE082] flex items-center justify-center shrink-0 group-hover:bg-[#FFB800] group-hover:border-[#FFB800] transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8A5700] group-hover:text-[#101B35] stroke-[2.5]" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dish Detail Modal */}
      {selectedDish && (
        <DishDetailModal
          dish={selectedDish}
          onClose={() => setSelectedDish(null)}
          restaurantSlug={restaurantSlug}
        />
      )}
    </div>
  );
}
