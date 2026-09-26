'use client';

import { useEffect, useRef } from 'react';

export default function CategoryRail({ categories, activeCategory, onSelect, onActiveChange }) {
  const railRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && onActiveChange) {
            onActiveChange(entry.target.dataset.categoryId);
          }
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
    <nav ref={railRef} className="category-tabs" aria-label="Categories Navigation">
      <button
        type="button"
        data-active={activeCategory === 'all'}
        onClick={() => onSelect('all')}
        className={`tab-pill ${activeCategory === 'all' ? 'active' : ''}`}
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
            className={`tab-pill ${isActive ? 'active' : ''}`}
          >
            {cat.name}
          </button>
        );
      })}
    </nav>
  );
}