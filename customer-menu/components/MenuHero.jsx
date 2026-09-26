'use client';

import Image from 'next/image';
import { Search, X, MapPin, Phone } from 'lucide-react';

export default function MenuHero({
  restaurant,
  resolveImageUrl,
  searchQuery,
  setSearchQuery,
  searchInputRef,
}) {
  const logoUrl = resolveImageUrl ? resolveImageUrl(restaurant?.logoUrl) : null;
  const heroCoverUrl =
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=80';

  const handleScrollToMenu = (e) => {
    e.preventDefault();
    const menuEl = document.getElementById('menuSection');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="cinematic-hero" id="heroSection">
      {/* Background Image & Shading */}
      <div
        className="hero-bg-image"
        style={{ backgroundImage: `url('${heroCoverUrl}')` }}
      />
      <div className="hero-photo-shade" />

      {/* Top Search Bar */}
      <div className="hero-top-search-wrap">
        <div className="hero-search-bar">
          <Search className="hero-search-icon !ml-0 !mr-2.5 h-4 w-4 text-[#d4b15d]" />
          <input
            ref={searchInputRef}
            type="text"
            className="hero-search-input"
            placeholder="Search dishes or ingredients..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#d4b15d] hover:text-[#f5d98f] p-1"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Center Circular Lens Badge */}
      <div className="hero-center-badge">
        <div className="center-lens-circle">
          {logoUrl ? (
            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-amber-300/40 mb-1">
              <Image
                src={logoUrl}
                alt={restaurant?.name || 'Restaurant Logo'}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <svg className="center-brand-svg" viewBox="0 0 100 100" fill="none">
              <path
                d="M50 10 C35 25 25 35 25 50 C25 65 35 75 50 90 C65 75 75 65 75 50 C75 35 65 25 50 10 Z"
                fill="#C9A84C"
                opacity="0.95"
              />
              <circle cx="50" cy="50" r="14" fill="#070A12" />
              <path d="M42 50 Q50 42 58 50" stroke="#F5D77F" strokeWidth="2" fill="none" />
            </svg>
          )}

          <div className="center-lens-text gold-accent-text">
            {restaurant?.name || 'Royal Dining'}
          </div>

          {restaurant?.cuisineType && (
            <span className="text-[10px] tracking-widest text-amber-200/80 font-bold uppercase mt-1">
              {restaurant.cuisineType}
            </span>
          )}
        </div>
      </div>

      {/* Restaurant Contact / Location Meta */}
      {(restaurant?.address || restaurant?.phone) && (
        <div className="relative z-20 flex flex-wrap items-center justify-center gap-3 px-4 text-[11px] text-slate-300/90 -mt-2">
          {restaurant?.address && (
            <span className="inline-flex items-center gap-1 bg-black/60 px-3 py-1 rounded border border-white/10 backdrop-blur-md">
              <MapPin className="h-3 w-3 text-[#d4b15d]" />
              <span className="truncate max-w-[260px]">{restaurant.address}</span>
            </span>
          )}
          {restaurant?.phone && (
            <span className="inline-flex items-center gap-1 bg-black/60 px-3 py-1 rounded border border-white/10 backdrop-blur-md">
              <Phone className="h-3 w-3 text-[#d4b15d]" />
              <span>{restaurant.phone}</span>
            </span>
          )}
        </div>
      )}

      {/* Bottom CTA Pill */}
      <div className="hero-bottom-bar">
        <a
          href="#menuSection"
          onClick={handleScrollToMenu}
          className="hero-shop-pill gold-accent-btn"
        >
          <span>Explore Menu</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* Curved Arc Divider */}
      <div className="hero-curved-arc" />
    </section>
  );
}