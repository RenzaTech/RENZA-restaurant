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
      {/* Background Image & Ambient Shade */}
      <div
        className="hero-bg-image"
        style={{ backgroundImage: `url('${heroCoverUrl}')` }}
      />
      <div className="hero-photo-shade" />

      {/* ── Top Bar: Search Bar ── */}
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
              className="text-[#d4b15d] hover:text-[#f5d98f] p-1 transition"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Center Unified Brand Block ── */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center my-auto py-5 px-4 w-full max-w-xl">
        {/* Center Circular Lens Badge */}
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
            <span className="text-[10px] tracking-[0.2em] text-amber-200/85 font-bold uppercase mt-1">
              {restaurant.cuisineType}
            </span>
          )}
        </div>

        {/* Restaurant Description (Bigger, elegant font & centered) */}
        {restaurant?.description && (
          <p className="mt-4 font-display text-base sm:text-lg italic text-[#f6f2eb] max-w-md mx-auto leading-relaxed drop-shadow px-2">
            &ldquo;{restaurant.description}&rdquo;
          </p>
        )}

        {/* Location & Phone Number Meta Badges (Bigger, properly aligned) */}
        {(restaurant?.address || restaurant?.phone) && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {restaurant?.address && (
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,177,93,0.35)] bg-[rgba(6,9,13,0.85)] px-4 py-2 shadow-lg backdrop-blur-md">
                <MapPin className="h-4 w-4 text-[#d4b15d] flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium tracking-wide text-[#f6f2eb]">
                  {restaurant.address}
                </span>
              </div>
            )}

            {restaurant?.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,177,93,0.35)] bg-[rgba(6,9,13,0.85)] px-4 py-2 shadow-lg backdrop-blur-md transition hover:border-[#d4b15d] active:scale-95"
                title="Call restaurant"
              >
                <Phone className="h-4 w-4 text-[#d4b15d] flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium tracking-wide text-[#f6f2eb]">
                  {restaurant.phone}
                </span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom CTA Pill ── */}
      <div className="hero-bottom-bar !mb-8">
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