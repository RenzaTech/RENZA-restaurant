'use client';

import { forwardRef } from 'react';
import { ArrowUpDown } from 'lucide-react';

export const filterOptions = [
  { id: 'veg', label: 'Pure Veg', dot: 'veg' },
  { id: 'non-veg', label: 'Non-Veg', dot: 'nonveg' },
  { id: 'vegan', label: 'Vegan', dot: 'veg' },
  { id: 'jain', label: 'Jain', dot: 'veg' },
  { id: 'gluten-free', label: 'Gluten-Free', dot: 'bestseller' },
  { id: 'available', label: 'Available now', dot: 'bestseller' },
];

export function DietaryFilters({
  activeFilters = [],
  onToggleFilter,
  sortBy = 'default',
  onSortChange,
  onClearAll,
  resultCount = 0,
}) {
  return (
    <div className="border-b border-[rgba(200,167,93,0.14)] bg-[rgba(5,8,16,0.96)]">
      {/* Scrollable Dietary Filter Pills */}
      <div className="diet-filter-bar" aria-label="Menu dietary filters">
        {filterOptions.map(({ id, label, dot }) => {
          const isActive = activeFilters.includes(id);
          return (
            <button
              type="button"
              key={id}
              data-diet={dot}
              onClick={() => onToggleFilter(id)}
              aria-pressed={isActive}
              className={`diet-btn ${isActive ? 'active' : ''}`}
            >
              <span>{label}</span>
            </button>
          );
        })}

        {activeFilters.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="diet-btn !border-rose-400/30 !text-rose-300 hover:!border-rose-400"
          >
            ✕ Clear filters
          </button>
        )}
      </div>

      {/* Results Count & Sort Dropdown */}
      <div className="mx-auto max-w-[1240px] flex items-center justify-between px-5 py-2 text-xs text-slate-400">
        <span className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          {resultCount} {resultCount === 1 ? 'dish' : 'dishes'} found
        </span>

        {onSortChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold hidden xs:inline">
              Sort:
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="appearance-none rounded border border-[rgba(200,167,93,0.25)] bg-[#111821] py-1 pl-2.5 pr-7 text-[11px] font-bold text-[#f5d98f] outline-none transition hover:border-[#d4b15d] cursor-pointer"
                aria-label="Sort dishes by price"
              >
                <option value="default" className="bg-[#111821] text-slate-200">
                  Default
                </option>
                <option value="price-asc" className="bg-[#111821] text-slate-200">
                  Price: Low to High (₹ ↑)
                </option>
                <option value="price-desc" className="bg-[#111821] text-slate-200">
                  Price: High to Low (₹ ↓)
                </option>
              </select>
              <ArrowUpDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#d4b15d]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DietaryFilters;