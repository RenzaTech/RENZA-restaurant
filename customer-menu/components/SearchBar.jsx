'use client';

import { forwardRef, useState, useRef, useEffect } from 'react';
import { Search, X, ArrowUpDown, ChevronDown, Check } from 'lucide-react';

const filterOptions = [
  { id: 'veg', label: 'Pure Veg', emoji: '🌱' },
  { id: 'non-veg', label: 'Non-Veg', emoji: '🍗' },
  { id: 'vegan', label: 'Vegan', emoji: '🥗' },
  { id: 'jain', label: 'Jain', emoji: '🪔' },
  { id: 'gluten-free', label: 'Gluten-free', emoji: '🌾' },
  { id: 'available', label: 'Available now', emoji: '⚡' },
];

const sortOptions = [
  { id: 'default', label: 'Default Order', shortLabel: 'Sort', badge: 'Original' },
  { id: 'price-asc', label: 'Price: Low to High', shortLabel: '₹ Low → High', badge: '₹ → ₹₹₹' },
  { id: 'price-desc', label: 'Price: High to Low', shortLabel: '₹ High → Low', badge: '₹₹₹ → ₹' },
];

const SearchBar = forwardRef(function SearchBar(
  {
    searchQuery,
    setSearchQuery,
    activeFilters,
    onToggleFilter,
    sortBy = 'default',
    onSortChange,
    onClearAll,
    resultCount,
  },
  ref
) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  const isSorted = sortBy && sortBy !== 'default';
  const isFiltering = Boolean(searchQuery || activeFilters.length > 0 || isSorted);
  const currentSort = sortOptions.find((opt) => opt.id === sortBy) || sortOptions[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsSortOpen(false);
      }
    }
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSortOpen]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-2 px-4 py-2.5 sm:py-3">
      {/* Frosted Glass Search Input */}
      <div className="relative rounded-xl border border-white/80 bg-white/75 shadow-xs backdrop-blur-xl transition-all duration-200 focus-within:border-renza-gold/60 focus-within:bg-white/95 focus-within:ring-2 focus-within:ring-renza-gold/20">
        <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-renza-ink/40" />
        <input
          ref={ref}
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search dishes, ingredients, flavours..."
          className="h-9 w-full rounded-xl bg-transparent py-1.5 pl-9 pr-9 text-xs font-medium text-renza-ink outline-none placeholder:text-renza-ink/40 sm:text-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-renza-ink/40 hover:bg-slate-100 hover:text-renza-ink active:scale-90 focus:outline-none focus:ring-2 focus:ring-renza-gold transition-all"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Sort & Dietary Filters Row */}
      <div className="flex items-center gap-2">
        {/* Pinned Sort Dropdown Button */}
        <div className="relative shrink-0" ref={sortRef}>
          <button
            type="button"
            onClick={() => setIsSortOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isSortOpen}
            aria-label="Sort dishes by price"
            className={`min-h-7 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-renza-gold active:scale-95 ${
              isSorted
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border border-amber-500/50 shadow-xs'
                : 'bg-white/70 text-renza-ink/80 hover:bg-white/95 hover:text-renza-ink border border-white/80 backdrop-blur-md shadow-xs'
            }`}
          >
            <ArrowUpDown className={`h-3 w-3 ${isSorted ? 'text-amber-200' : 'text-renza-ink/60'}`} />
            <span>{currentSort.shortLabel}</span>
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Floating Sort Dropdown Menu */}
          {isSortOpen && (
            <div
              className="absolute left-0 top-full z-50 mt-1.5 w-56 rounded-2xl border border-white/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-2xl transition-all"
              role="listbox"
              aria-label="Sort options"
            >
              <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-renza-ink/40 uppercase">
                Sort by price
              </div>
              {sortOptions.map((option) => {
                const isSelected = (sortBy || 'default') === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      if (onSortChange) onSortChange(option.id);
                      setIsSortOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-amber-50 font-bold text-amber-950'
                        : 'font-medium text-renza-ink/80 hover:bg-slate-50 hover:text-renza-ink'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-[10px] text-renza-ink/45">{option.badge}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-amber-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Subtle Vertical Divider */}
        <div className="h-4 w-[1px] bg-renza-ink/15 shrink-0" />

        {/* Glassmorphic Dietary Filter Chips */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-hide -webkit-overflow-scrolling-touch flex-1"
          aria-label="Menu filters"
        >
          {filterOptions.map(({ id, label, emoji }) => {
            const isSelected = activeFilters.includes(id);
            return (
              <button
                type="button"
                key={id}
                onClick={() => onToggleFilter(id)}
                aria-pressed={isSelected}
                className={`min-h-7 flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-renza-gold active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-renza-ink to-renza-charcoal text-renza-cream border border-renza-gold/40 shadow-sm'
                    : 'bg-white/70 text-renza-ink/70 hover:bg-white/95 hover:text-renza-ink border border-white/80 backdrop-blur-md shadow-xs'
                }`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            );
          })}

          {isFiltering && (
            <button
              type="button"
              onClick={onClearAll}
              className="min-h-7 flex-shrink-0 rounded-full border border-renza-ink/15 bg-white/40 px-2.5 py-1 text-[11px] font-bold text-renza-ink/60 backdrop-blur-sm transition hover:border-renza-ink/30 hover:bg-white hover:text-renza-ink active:scale-95 focus:outline-none focus:ring-2 focus:ring-renza-gold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Result Count and Active Sort Indicator */}
      {isFiltering && (
        <div className="flex items-center justify-between text-[10px] font-medium text-renza-ink/50 px-0.5">
          <p aria-live="polite">
            Found <span className="font-bold text-renza-ink">{resultCount}</span> {resultCount === 1 ? 'dish' : 'dishes'}
            {isSorted && (
              <span className="ml-1.5 font-semibold text-amber-700">
                • Sorted: {currentSort.label}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
});

export default SearchBar;