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
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-renza-ink/40" />
        <input ref={ref} type="text" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search dishes or ingredients..." className="min-h-11 w-full rounded-2xl border border-renza-ink/10 bg-white/70 py-3 pl-11 pr-10 text-xs font-medium text-renza-ink outline-none transition focus:border-renza-gold focus:ring-2 focus:ring-renza-gold/20" />
        {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-renza-ink/40 hover:text-renza-ink focus:outline-none focus:ring-2 focus:ring-renza-gold" aria-label="Clear search"><X className="h-3.5 w-3.5" /></button>}
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-hide" aria-label="Menu filters">
        {filterOptions.map(({ id, label }) => (
          <button type="button" key={id} onClick={() => onToggleFilter(id)} aria-pressed={activeFilters.includes(id)} className={`min-h-11 flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-renza-gold ${activeFilters.includes(id) ? 'bg-renza-ink text-renza-cream shadow-sm' : 'bg-white/70 text-renza-ink/60 hover:bg-white'}`}>{label}</button>
        ))}
        <button type="button" onClick={onClearAll} className="min-h-11 flex-shrink-0 rounded-full border border-renza-ink/15 px-3 py-1.5 text-[11px] font-bold text-renza-ink/55 transition hover:border-renza-ink/40 hover:text-renza-ink focus:outline-none focus:ring-2 focus:ring-renza-gold">Clear all</button>
      </div>
      <p className="text-[11px] font-medium text-renza-ink/45" aria-live="polite">{resultCount} {resultCount === 1 ? 'dish' : 'dishes'} found</p>
    </div>
  );
});

export default SearchBar;