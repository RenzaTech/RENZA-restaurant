'use client';

import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

const filterOptions = [
  { id: 'veg', label: 'Veg' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'jain', label: 'Jain' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'available', label: 'Available now' },
];

const SearchBar = forwardRef(function SearchBar({ searchQuery, setSearchQuery, activeFilters, onToggleFilter, onClearAll, resultCount }, ref) {
  return (
    <div className="mx-auto max-w-[1200px] space-y-2.5 px-4 py-3">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={ref}
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search dishes or ingredients..."
          className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#101821]/90 py-3 pl-11 pr-10 text-xs font-medium text-slate-100 outline-none transition shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] placeholder:text-slate-400 focus:border-amber-300/35 focus:ring-2 focus:ring-amber-300/12"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300/70" aria-label="Clear search">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-hide" aria-label="Menu filters">
        {filterOptions.map(({ id, label }) => (
          <button
            type="button"
            key={id}
            onClick={() => onToggleFilter(id)}
            aria-pressed={activeFilters.includes(id)}
            className={`min-h-10 flex-shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-all focus:outline-none focus:ring-2 focus:ring-amber-300/70 ${activeFilters.includes(id) ? 'bg-gradient-to-r from-amber-200 via-[#d9b36c] to-[#f0d7a3] text-slate-950 shadow-[0_10px_18px_rgba(217,179,108,0.28)]' : 'border border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/15 hover:text-white'}`}
          >
            {label}
          </button>
        ))}
        <button type="button" onClick={onClearAll} className="min-h-10 flex-shrink-0 rounded-full border border-white/10 bg-transparent px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300 transition hover:border-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300/70">Clear all</button>
      </div>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400" aria-live="polite">{resultCount} {resultCount === 1 ? 'dish' : 'dishes'} found</p>
    </div>
  );
});

export default SearchBar;