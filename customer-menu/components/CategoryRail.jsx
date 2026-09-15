'use client';

import { useEffect, useRef } from 'react';

export default function CategoryRail({ categories, activeCategory, onSelect, onActiveChange }) {
  const railRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            onActiveChange(entry.target.dataset.categoryId);
          }
        }
      },
      { rootMargin: '-25% 0px -65% 0px', threshold: 0 }
    );

    document.querySelectorAll('[data-category-id]').forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [onActiveChange, categories]);

  useEffect(() => {
    const active = railRef.current?.querySelector('[data-active="true"]');
    if (!active) return;
    active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeCategory]);

  return (
    <nav className="sticky top-16 z-30 border-b border-white/60 bg-renza-cream/85 shadow-xs backdrop-blur-2xl transition-colors">
      <div
        ref={railRef}
        className="mx-auto flex max-w-[1200px] gap-2 overflow-x-auto px-4 py-2.5 scrollbar-hide -webkit-overflow-scrolling-touch"
      >
        <button
          type="button"
          data-active={activeCategory === 'all'}
          onClick={() => onSelect('all')}
          className={`min-h-10 flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-renza-gold active:scale-95 ${
            activeCategory === 'all'
              ? 'bg-gradient-to-r from-renza-ink to-renza-charcoal text-renza-cream shadow-md shadow-renza-ink/20 border border-renza-gold/40'
              : 'bg-white/70 text-renza-ink/65 hover:text-renza-ink hover:bg-white border border-white/80 backdrop-blur-sm'
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
              className={`min-h-10 flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-renza-gold active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-renza-ink to-renza-charcoal text-renza-cream shadow-md shadow-renza-ink/20 border border-renza-gold/40'
                  : 'bg-white/70 text-renza-ink/65 hover:text-renza-ink hover:bg-white border border-white/80 backdrop-blur-sm'
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