'use client';

import { useEffect, useRef, useState } from 'react';

export default function CategoryRail({ categories, activeCategory, onSelect, onActiveChange }) {
  const railRef = useRef(null);
  const [highlight, setHighlight] = useState({ width: 0, transform: 'translateX(0)' });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onActiveChange(entry.target.dataset.categoryId);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    document.querySelectorAll('[data-category-id]').forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [onActiveChange]);

  useEffect(() => {
    const active = railRef.current?.querySelector('[data-active="true"]');
    if (!active) return;
    setHighlight({ width: active.offsetWidth, transform: `translateX(${active.offsetLeft}px)` });
    active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeCategory, categories]);

  return (
    <nav className="sticky top-16 z-30 border-b border-renza-ink/10 bg-renza-cream/90 shadow-sm backdrop-blur-xl">
      <div ref={railRef} className="relative mx-auto flex max-w-[1200px] gap-1.5 overflow-x-auto px-4 py-2.5 scrollbar-hide">
        <span className="absolute bottom-2.5 left-4 h-8 rounded-full bg-renza-ink shadow-sm transition-transform duration-300 ease-out" style={highlight} aria-hidden="true" />
        <button data-active={activeCategory === 'all'} onClick={() => onSelect('all')} className={`relative z-10 min-h-11 flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-renza-gold ${activeCategory === 'all' ? 'text-renza-cream' : 'text-renza-ink/60 hover:text-renza-ink'}`}>All Dishes</button>
        {categories.map((cat) => {
          const id = cat.id || cat.name;
          return <button key={id} data-active={activeCategory === id} onClick={() => onSelect(id)} className={`relative z-10 min-h-11 flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-renza-gold ${activeCategory === id ? 'text-renza-cream' : 'text-renza-ink/60 hover:text-renza-ink'}`}>{cat.name}</button>;
        })}
      </div>
    </nav>
  );
}