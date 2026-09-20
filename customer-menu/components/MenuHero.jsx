'use client';

import { useEffect, useState } from 'react';
import { MapPin, Phone, Search, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function MenuHero({ restaurant, resolveImageUrl, onSearch }) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsCompact(window.scrollY > 120);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoUrl = resolveImageUrl(restaurant.logoUrl);

  return (
    <header className={`relative sticky top-0 z-40 overflow-hidden border-b border-white/10 bg-[#070b11]/90 text-slate-50 shadow-[0_18px_38px_rgba(0,0,0,0.32)] backdrop-blur-2xl ${isCompact ? 'h-16' : 'min-h-[20rem]'}`}>
      {logoUrl && (
        <Image
          src={logoUrl}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-3xl"
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(3,6,11,0.96),rgba(11,17,24,0.9),rgba(3,6,11,0.96))]" />
      <div className="luxury-divider absolute inset-x-12 top-0 h-px" />

      <div className={`relative flex min-h-[20rem] flex-col items-center justify-center px-5 pb-8 pt-10 text-center transition-all duration-500 ease-out ${isCompact ? '-translate-y-16 opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 shadow-[0_0_30px_rgba(217,179,108,0.14)] backdrop-blur-xl">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${restaurant.name} logo`}
              fill
              sizes="96px"
              className="h-full w-full object-cover"
              onError={(event) => { event.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <span className="font-display text-4xl text-amber-200">{restaurant.name?.charAt(0) || 'R'}</span>
          )}
        </div>

        <h1 className="glow-text max-w-3xl font-display text-4xl leading-[0.9] tracking-[-0.06em] sm:text-5xl md:text-6xl">{restaurant.name}</h1>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-200/80">
          {restaurant.cuisineType && <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 tracking-[0.12em] text-[10px] uppercase text-slate-200">{restaurant.cuisineType}</span>}
          {restaurant.address && <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5"><MapPin className="h-3 w-3 text-amber-200" />{restaurant.address}</span>}
          {restaurant.phone && <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5"><Phone className="h-3 w-3 text-amber-200" />{restaurant.phone}</span>}
        </div>
      </div>

      <div className={`absolute inset-x-0 top-0 flex h-16 items-center justify-between px-4 transition-all duration-500 ease-out ${isCompact ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-[0_10px_18px_rgba(0,0,0,0.2)] backdrop-blur-xl">
            {logoUrl ? <Image src={logoUrl} alt={`${restaurant.name} logo`} fill sizes="44px" className="h-full w-full object-cover" /> : <span className="font-display text-xl text-amber-200">{restaurant.name?.charAt(0) || 'R'}</span>}
          </div>
          <span className="truncate font-display text-lg tracking-[-0.04em] text-white">{restaurant.name}</span>
        </div>
        <button onClick={onSearch} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 shadow-[0_10px_20px_rgba(0,0,0,0.2)] backdrop-blur-md transition hover:border-amber-300/50 hover:bg-amber-300/10 focus:outline-none focus:ring-2 focus:ring-amber-300/70" aria-label="Search menu">
          <Search className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}