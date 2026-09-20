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
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
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
    <nav className="sticky top-12 z-40 border-b border-white/10 bg-[#070b11]/90 shadow-[0_8px_20px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div ref={railRef} className="relative mx-auto flex max-w-[1200px] gap-1.5 overflow-x-auto px-4 py-2.5 scrollbar-hide">
        <span className="absolute bottom-2 left-0 h-9 rounded-full bg-gradient-to-r from-[#f4e5bf] via-[#d7b368] to-[#f2d9a1] shadow-[0_10px_20px_rgba(217,179,108,0.2)] transition-transform duration-300 ease-out" style={highlight} aria-hidden="true" />
        <button data-active={activeCategory === 'all'} onClick={() => onSelect('all')} className={`relative z-10 min-h-10 flex-shrink-0 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-all focus:outline-none focus:ring-2 focus:ring-amber-300/70 ${activeCategory === 'all' ? 'text-slate-950' : 'text-slate-300 hover:text-white'}`}>All Dishes</button>
        {categories.map((cat) => {
          const id = cat.id || cat.name;
          return <button key={id} data-active={activeCategory === id} onClick={() => onSelect(id)} className={`relative z-10 min-h-10 flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-all focus:outline-none focus:ring-2 focus:ring-amber-300/70 ${activeCategory === id ? 'text-slate-950' : 'text-slate-300 hover:text-white'}`}>{cat.name}</button>;
        })}
      </div>
    </nav>
  );
}