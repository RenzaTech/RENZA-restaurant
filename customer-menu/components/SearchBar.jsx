'use client';

import { forwardRef } from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';

export const filterOptions = [
  { id: 'veg', label: 'Veg' },
  { id: 'non-veg', label: 'Non-Veg' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'jain', label: 'Jain' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'available', label: 'Available now' },
];

export const SearchBar = forwardRef(function SearchBar(
  {
    searchQuery,
    setSearchQuery,
  },
  ref
) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-2 sm:py-2.5">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          ref={ref}
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search dishes or ingredients..."
          className="h-10 w-full rounded-xl border border-white/10 bg-[#101821]/90 py-2 pl-9 pr-9 text-xs font-medium text-slate-100 outline-none transition shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] placeholder:text-slate-400 focus:border-amber-300/35 focus:ring-2 focus:ring-amber-300/12"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:text-white focus:outline-none focus:ring-1 focus:ring-amber-300/70 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
});

export function DietaryFilters({
  activeFilters,
  onToggleFilter,
  sortBy = 'default',
  onSortChange,
  onClearAll,
  resultCount,
}) {
  return (
    <div className="mx-auto max-w-[1200px] space-y-2 px-4 py-2 sm:py-2.5">
      {/* Dietary filter pills (Veg, Non-Veg, Vegan, Jain, etc.) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-hide" aria-label="Menu filters">
        {filterOptions.map(({ id, label }) => (
          <button
            type="button"
            key={id}
            onClick={() => onToggleFilter(id)}
            aria-pressed={activeFilters.includes(id)}
            className={`min-h-[30px] flex-shrink-0 rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.1em] transition-all focus:outline-none focus:ring-1 focus:ring-amber-300/70 cursor-pointer ${
              activeFilters.includes(id)
                ? 'bg-gradient-to-r from-amber-200 via-[#d9b36c] to-[#f0d7a3] text-slate-950 shadow-[0_8px_14px_rgba(217,179,108,0.25)]'
                : 'border border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/15 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
        {activeFilters.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="min-h-[30px] flex-shrink-0 rounded-full border border-white/10 bg-transparent px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-400 transition hover:border-white/15 hover:text-white focus:outline-none focus:ring-1 focus:ring-amber-300/70 cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Results Count & Sort Dropdown */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400" aria-live="polite">
          {resultCount} {resultCount === 1 ? 'dish' : 'dishes'} found
        </p>

        {onSortChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold hidden xs:inline">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="appearance-none rounded-xl border border-white/10 bg-[#101821] py-1 pl-2.5 pr-7 text-[11px] font-bold text-amber-200 outline-none transition hover:border-amber-300/40 focus:border-amber-300/60 focus:ring-1 focus:ring-amber-300/30 cursor-pointer"
                aria-label="Sort dishes by price"
              >
                <option value="default" className="bg-[#101821] text-slate-200">Default</option>
                <option value="price-asc" className="bg-[#101821] text-slate-200">Price: Low to High (₹ ↑)</option>
                <option value="price-desc" className="bg-[#101821] text-slate-200">Price: High to Low (₹ ↓)</option>
              </select>
              <ArrowUpDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-amber-200/70" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBar;