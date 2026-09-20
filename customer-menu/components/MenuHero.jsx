'use client';

import { useEffect, useState } from 'react';
import { MapPin, Phone, Search, Star } from 'lucide-react';
import Image from 'next/image';

export default function MenuHero({ restaurant, resolveImageUrl, onSearch, onRateUs }) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsCompact(window.scrollY > 70);
          ticking = false;
        });
        ticking = true;
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoUrl = resolveImageUrl(restaurant.logoUrl);

  return (
    <>
      {/* ── 1. INNOVATIVE COMPACT HERO (Normal document flow, no layout shift) ── */}
      <header className="relative z-20 overflow-hidden border-b border-white/10 bg-[#070b11] text-slate-50 shadow-md">
        {/* Subtle Ambient Background Glow */}
        {logoUrl && (
          <Image
            src={logoUrl}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="absolute inset-0 h-full w-full scale-125 object-cover opacity-15 blur-3xl"
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,7,12,0.97),rgba(11,17,25,0.92),rgba(4,7,12,0.97))]" />
        <div className="luxury-divider absolute inset-x-8 top-0 h-px" />

        <div className="relative mx-auto max-w-[1200px] px-4 py-3.5 sm:py-4">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            {/* ── Left Column: Brand Title, Badges & Action Pills ── */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="glow-text font-display text-xl sm:text-2xl font-bold tracking-tight truncate leading-tight">
                  {restaurant.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Open
                </span>
              </div>

              {restaurant.cuisineType && (
                <p className="text-[11px] sm:text-xs font-medium text-amber-200/75 tracking-wide truncate mt-0.5">
                  {restaurant.cuisineType}
                </p>
              )}

              {/* Action Pills Row */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-slate-300">
                {restaurant.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name} ${restaurant.address}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-slate-300 hover:text-white hover:border-white/20 transition active:scale-95"
                    title={restaurant.address}
                  >
                    <MapPin className="h-2.5 w-2.5 text-amber-200 shrink-0" />
                    <span className="max-w-[130px] sm:max-w-[200px] truncate">{restaurant.address}</span>
                  </a>
                )}

                {restaurant.phone && (
                  <a
                    href={`tel:${restaurant.phone.replace(/[^0-9+]/g, '')}`}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-slate-300 hover:text-white hover:border-white/20 transition active:scale-95"
                  >
                    <Phone className="h-2.5 w-2.5 text-amber-200 shrink-0" />
                    <span>Call</span>
                  </a>
                )}

                {onRateUs && (
                  <button
                    type="button"
                    onClick={onRateUs}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-300/15 px-2.5 py-0.5 text-amber-200 hover:border-amber-300/70 hover:bg-amber-300/25 transition active:scale-95 font-bold cursor-pointer shadow-xs"
                  >
                    <Star className="h-2.5 w-2.5 fill-amber-300 text-amber-300 shrink-0" />
                    <span>Rate Us</span>
                  </button>
                )}
              </div>
            </div>

            {/* ── Right Column: Restaurant Logo (Top Right) ── */}
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-amber-300/30 bg-slate-900/80 shadow-[0_0_24px_rgba(217,179,108,0.22)] backdrop-blur-xl">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`${restaurant.name} logo`}
                  fill
                  sizes="64px"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-display text-2xl font-bold text-amber-200">
                  {restaurant.name?.charAt(0) || 'R'}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. FIXED ULTRA-SMOOTH FLOATING TOP BAR (Appears on scroll without layout shift) ── */}
      <div
        className={`fixed inset-x-0 top-0 z-50 flex h-12 items-center justify-between border-b border-white/10 bg-[#070b11]/95 px-4 backdrop-blur-xl shadow-lg transition-transform duration-300 ease-out ${
          isCompact ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isCompact}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-amber-300/30 bg-white/5 backdrop-blur-md">
            {logoUrl ? (
              <Image src={logoUrl} alt={`${restaurant.name} logo`} fill sizes="28px" className="object-cover" />
            ) : (
              <span className="font-display text-sm font-bold text-amber-200">
                {restaurant.name?.charAt(0) || 'R'}
              </span>
            )}
          </div>
          <span className="truncate font-display text-sm font-bold tracking-tight text-white max-w-[160px] sm:max-w-xs">
            {restaurant.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onRateUs && (
            <button
              type="button"
              onClick={onRateUs}
              className="flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-300/15 px-2.5 py-1 text-[10px] font-bold text-amber-200 backdrop-blur-md hover:bg-amber-300/25 active:scale-95 transition cursor-pointer"
              aria-label="Rate us on Google Maps"
            >
              <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
              <span>Rate</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSearch}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 hover:border-amber-300/50 hover:bg-amber-300/10 active:scale-95 transition focus:outline-none focus:ring-1 focus:ring-amber-300/70"
            aria-label="Search menu"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}