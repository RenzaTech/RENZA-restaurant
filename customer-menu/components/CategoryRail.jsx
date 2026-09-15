'use client';

import { useEffect, useRef } from 'react';

export default function CategoryRail({ categories, activeCategory, onSelect, onActiveChange }) {
  const railRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Collect currently intersecting sections
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          // Sort by distance to top of viewport to get the active topmost section
          intersecting.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const topId = intersecting[0].target.dataset.categoryId;
          if (topId) {
            onActiveChange(topId);
          }
        }
      },
      { rootMargin: '-100px 0px -70% 0px', threshold: 0 }
    );

    const sections = document.querySelectorAll('[data-category-id]');
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [onActiveChange, categories]);

  // Center active tab horizontally in the rail WITHOUT triggering window-level scrollIntoView
  useEffect(() => {
    if (!railRef.current) return;
    const container = railRef.current;
    const active = container.querySelector('[data-active="true"]');
    if (!active) return;

    const targetScrollLeft =
      active.offsetLeft - container.clientWidth / 2 + active.clientWidth / 2;

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: 'smooth',
    });
  }, [activeCategory]);

  return (
    <nav className="sticky top-[52px] z-30 border-b border-white/60 bg-renza-cream/90 shadow-xs backdrop-blur-2xl transition-colors">
      <div
        ref={railRef}
        className="mx-auto flex max-w-[1200px] gap-1.5 overflow-x-auto px-4 py-2 scrollbar-hide -webkit-overflow-scrolling-touch touch-pan-x"
      >
        <button
          type="button"
          data-active={activeCategory === 'all'}
          onClick={() => onSelect('all')}
          className={`min-h-8 flex-shrink-0 rounded-full px-3.5 py-1 text-xs font-bold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-renza-gold active:scale-95 touch-manipulation select-none cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-gradient-to-r from-renza-ink to-renza-charcoal text-renza-cream shadow-md shadow-renza-ink/20 border border-renza-gold/40'
              : 'bg-white/75 text-renza-ink/70 hover:text-renza-ink hover:bg-white border border-white/80 backdrop-blur-sm'
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
              className={`min-h-8 flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-bold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-renza-gold active:scale-95 touch-manipulation select-none cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-renza-ink to-renza-charcoal text-renza-cream shadow-md shadow-renza-ink/20 border border-renza-gold/40'
                  : 'bg-white/75 text-renza-ink/70 hover:text-renza-ink hover:bg-white border border-white/80 backdrop-blur-sm'
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