'use client';

import { useEffect, useRef, useState } from 'react';

export default function CategoryRail({ categories, activeCategory, onSelect, onActiveChange }) {
  const railRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onActiveChange(entry.target.dataset.categoryId);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    document.querySelectorAll('[data-category-id]').forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [onActiveChange]);

  useEffect(() => {
    const active = railRef.current?.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategory]);

  return (
    <nav className="sticky top-12 z-40 border-b border-white/10 bg-[#070b11]/95 shadow-[0_8px_20px_rgba(0,0,0,0.25)] backdrop-blur-xl" aria-label="Categories">
      <div className="mx-auto max-w-[1200px] px-4 pt-2.5 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200/85">
            Categories
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-amber-200/20 via-white/5 to-transparent" />
        </div>
      </div>
      <div ref={railRef} className="mx-auto flex max-w-[1200px] items-center gap-1.5 overflow-x-auto px-4 pb-2.5 pt-0.5 scrollbar-hide">
        <button
          type="button"
          data-active={activeCategory === 'all'}
          onClick={() => onSelect('all')}
          className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-200 focus:outline-none ${
            activeCategory === 'all'
              ? 'bg-gradient-to-r from-[#f4e5bf] via-[#d7b368] to-[#f2d9a1] text-slate-950 shadow-[0_4px_16px_rgba(217,179,108,0.35)]'
              : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          All Dishes
        </button>
        {categories.map((cat) => {
          const id = cat.id || cat.name;
          const isActive = activeCategory === id;
          return (
            <button
              type="button"
              key={id}
              data-active={isActive}
              onClick={() => onSelect(id)}
              className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-200 focus:outline-none ${
                isActive
                  ? 'bg-gradient-to-r from-[#f4e5bf] via-[#d7b368] to-[#f2d9a1] text-slate-950 shadow-[0_4px_16px_rgba(217,179,108,0.35)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}