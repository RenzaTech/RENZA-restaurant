'use client';

import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

const filterOptions = [
  { id: 'veg', label: 'Pure Veg', emoji: '🌱' },
  { id: 'non-veg', label: 'Non-Veg', emoji: '🍗' },
  { id: 'vegan', label: 'Vegan', emoji: '🥗' },
  { id: 'jain', label: 'Jain', emoji: '🪔' },
  { id: 'gluten-free', label: 'Gluten-free', emoji: '🌾' },
  { id: 'available', label: 'Available now', emoji: '⚡' },
];

const SearchBar = forwardRef(function SearchBar(
  { searchQuery, setSearchQuery, activeFilters, onToggleFilter, onClearAll, resultCount },
  ref
) {
  const isFiltering = Boolean(searchQuery || activeFilters.length > 0);

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

      {/* Glassmorphic Dietary Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-hide -webkit-overflow-scrolling-touch" aria-label="Menu filters">
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

      {isFiltering && (
        <div className="flex items-center justify-between text-[10px] font-medium text-renza-ink/50 px-0.5">
          <p aria-live="polite">
            Found <span className="font-bold text-renza-ink">{resultCount}</span> {resultCount === 1 ? 'dish' : 'dishes'}
          </p>
        </div>
      )}
    </div>
  );
});

export default SearchBar;