'use client';

import { useEffect, useState } from 'react';
import { MapPin, Phone, Search } from 'lucide-react';
import Image from 'next/image';

export default function MenuHero({ restaurant, resolveImageUrl, onSearch }) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsCompact(window.scrollY > 90);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoUrl = resolveImageUrl(restaurant.logoUrl);

  return (
    <>
      {/* ── Compact Main Hero Banner (Luxury Dining Glassmorphism) ── */}
      <header className="relative overflow-hidden bg-renza-ink text-renza-cream">
        {/* Ambient background blur elements for glassmorphism */}
        {logoUrl && (
          <Image
            src={logoUrl}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="absolute inset-0 h-full w-full scale-125 object-cover opacity-20 blur-3xl"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-renza-ink/70 via-renza-ink/85 to-renza-ink" />

        {/* Ambient decorative glowing glass orbs */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-44 w-44 rounded-full bg-renza-gold/15 blur-2xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-10 top-10 h-44 w-44 rounded-full bg-renza-ember/10 blur-2xl" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-[1200px] px-4 py-4 sm:py-6">
          <div className="flex items-center gap-3.5 sm:gap-5 sm:justify-center">
            {/* Frosted Glass Logo Box */}
            <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-glow backdrop-blur-xl ring-1 ring-white/10 sm:h-20 sm:w-20">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`${restaurant.name} logo`}
                  fill
                  sizes="80px"
                  className="h-full w-full object-cover"
                  onError={(event) => { event.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <span className="font-display text-2xl font-black text-renza-gold drop-shadow-md sm:text-4xl">
                  {restaurant.name?.charAt(0) || 'R'}
                </span>
              )}
            </div>

            {/* Restaurant Details */}
            <div className="min-w-0 flex-1 sm:flex-initial sm:text-center">
              <h1 className="truncate font-display text-xl font-bold tracking-tight text-white drop-shadow-sm sm:text-3xl">
                {restaurant.name}
              </h1>

              {restaurant.description && (
                <p className="mt-0.5 line-clamp-1 max-w-lg text-[11px] text-renza-cream/70 sm:text-xs">
                  {restaurant.description}
                </p>
              )}

              {/* Glassmorphic Contact & Cuisine Badges */}
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:justify-center text-[10px] font-medium text-white/80">
                {restaurant.cuisineType && (
                  <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 backdrop-blur-md">
                    {restaurant.cuisineType}
                  </span>
                )}
                {restaurant.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name} ${restaurant.address}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 backdrop-blur-md transition hover:bg-white/20 active:scale-95"
                  >
                    <MapPin className="h-2.5 w-2.5 text-renza-gold" />
                    <span className="max-w-[140px] truncate sm:max-w-none">{restaurant.address}</span>
                  </a>
                )}
                {restaurant.phone && (
                  <a
                    href={`tel:${restaurant.phone.replace(/[^0-9+]/g, '')}`}
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 backdrop-blur-md transition hover:bg-white/20 active:scale-95"
                  >
                    <Phone className="h-2.5 w-2.5 text-emerald-400" />
                    <span>{restaurant.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Fixed Frosted Glass Top Bar (Appears seamlessly on scroll) ── */}
      <div
        className={`fixed inset-x-0 top-0 z-40 flex h-13 items-center justify-between border-b border-white/10 bg-renza-ink/90 px-4 py-2 backdrop-blur-2xl shadow-md transition-all duration-300 ease-out ${
          isCompact ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl">
            {logoUrl ? (
              <Image src={logoUrl} alt={`${restaurant.name} logo`} fill sizes="32px" className="object-cover" />
            ) : (
              <span className="font-display text-base font-bold text-renza-gold">{restaurant.name?.charAt(0) || 'R'}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold text-white sm:text-base">{restaurant.name}</p>
            {restaurant.cuisineType && <p className="truncate text-[9px] text-white/50">{restaurant.cuisineType}</p>}
          </div>
        </div>
        <button
          onClick={onSearch}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20 active:scale-90 focus:outline-none focus:ring-2 focus:ring-renza-gold"
          aria-label="Search menu"
        >
          <Search className="h-3.5 w-3.5 text-renza-gold" />
        </button>
      </div>
    </>
  );
}