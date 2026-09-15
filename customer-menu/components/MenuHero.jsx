'use client';

import { useEffect, useState } from 'react';
import { MapPin, Phone, Search } from 'lucide-react';
import Image from 'next/image';

export default function MenuHero({ restaurant, resolveImageUrl, onSearch }) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsCompact(window.scrollY > 150);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoUrl = resolveImageUrl(restaurant.logoUrl);

  return (
    <>
      {/* ── Main Hero Banner (Flows naturally, zero CLS) ── */}
      <header className="relative overflow-hidden bg-renza-ink text-renza-cream">
        {/* Ambient background blur elements for glassmorphism */}
        {logoUrl && (
          <Image
            src={logoUrl}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="absolute inset-0 h-full w-full scale-125 object-cover opacity-25 blur-3xl"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-renza-ink/60 via-renza-ink/80 to-renza-ink" />

        {/* Ambient decorative glowing glass orbs */}
        <div className="pointer-events-none absolute -left-12 -top-12 h-64 w-64 rounded-full bg-renza-gold/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-12 top-20 h-64 w-64 rounded-full bg-renza-ember/10 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center justify-center px-5 pb-8 pt-10 text-center sm:pb-12 sm:pt-14">
          {/* Frosted Glass Logo Box */}
          <div className="relative mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white/25 bg-white/10 shadow-glow backdrop-blur-2xl ring-1 ring-white/10 sm:h-28 sm:w-28">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${restaurant.name} logo`}
                fill
                sizes="112px"
                className="h-full w-full object-cover"
                onError={(event) => { event.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <span className="font-display text-4xl font-black text-renza-gold drop-shadow-md sm:text-5xl">
                {restaurant.name?.charAt(0) || 'R'}
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-white drop-shadow-sm sm:text-5xl">
            {restaurant.name}
          </h1>

          {restaurant.description && (
            <p className="mx-auto mt-2.5 max-w-lg text-xs leading-relaxed text-renza-cream/70 sm:text-sm">
              {restaurant.description}
            </p>
          )}

          {/* Glassmorphic Contact & Cuisine Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-white/80">
            {restaurant.cuisineType && (
              <span className="rounded-full border border-white/15 bg-white/10 px-3.5 py-1 backdrop-blur-md shadow-xs">
                {restaurant.cuisineType}
              </span>
            )}
            {restaurant.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name} ${restaurant.address}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 backdrop-blur-md shadow-xs transition hover:bg-white/20 active:scale-95"
              >
                <MapPin className="h-3 w-3 text-renza-gold" />
                <span className="max-w-[220px] truncate sm:max-w-none">{restaurant.address}</span>
              </a>
            )}
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 backdrop-blur-md shadow-xs transition hover:bg-white/20 active:scale-95"
              >
                <Phone className="h-3 w-3 text-emerald-400" />
                <span>{restaurant.phone}</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── Fixed Frosted Glass Top Bar (Appears seamlessly on scroll) ── */}
      <div
        className={`fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-renza-ink/85 px-4 backdrop-blur-2xl shadow-md transition-all duration-300 ease-out ${
          isCompact ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
            {logoUrl ? (
              <Image src={logoUrl} alt={`${restaurant.name} logo`} fill sizes="40px" className="object-cover" />
            ) : (
              <span className="font-display text-xl font-bold text-renza-gold">{restaurant.name?.charAt(0) || 'R'}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold text-white sm:text-lg">{restaurant.name}</p>
            {restaurant.cuisineType && <p className="truncate text-[10px] text-white/55">{restaurant.cuisineType}</p>}
          </div>
        </div>
        <button
          onClick={onSearch}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20 active:scale-90 focus:outline-none focus:ring-2 focus:ring-renza-gold"
          aria-label="Search menu"
        >
          <Search className="h-4 w-4 text-renza-gold" />
        </button>
      </div>
    </>
  );
}