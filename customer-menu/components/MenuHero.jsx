'use client';

import { useEffect, useState } from 'react';
import { MapPin, Phone, Search } from 'lucide-react';
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
    <header className={`relative sticky top-0 z-40 overflow-hidden bg-renza-ink text-renza-cream shadow-lg shadow-renza-ink/10 ${isCompact ? 'h-16' : 'min-h-[19rem]'}`}>
      {logoUrl && (
        <Image
          src={logoUrl}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-2xl"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-renza-ink/55 via-renza-ink/75 to-renza-ink" />

      <div className={`relative flex min-h-[19rem] flex-col items-center justify-center px-5 py-8 text-center transition-transform duration-500 ease-out ${isCompact ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-glow backdrop-blur-xl">
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
            <span className="font-display text-4xl text-renza-gold">{restaurant.name?.charAt(0) || 'R'}</span>
          )}
        </div>

        <h1 className="font-display text-4xl leading-tight tracking-tight text-white sm:text-5xl">{restaurant.name}</h1>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/65">
          {restaurant.cuisineType && <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">{restaurant.cuisineType}</span>}
          {restaurant.address && <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1"><MapPin className="h-3 w-3" />{restaurant.address}</span>}
          {restaurant.phone && <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1"><Phone className="h-3 w-3" />{restaurant.phone}</span>}
        </div>
      </div>

      <div className={`absolute inset-x-0 top-0 flex h-16 items-center justify-between px-4 transition-transform duration-500 ease-out ${isCompact ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
            {logoUrl ? <Image src={logoUrl} alt={`${restaurant.name} logo`} fill sizes="44px" className="h-full w-full object-cover" /> : <span className="font-display text-xl text-renza-gold">{restaurant.name?.charAt(0) || 'R'}</span>}
          </div>
          <span className="truncate font-display text-xl text-white">{restaurant.name}</span>
        </div>
        <button onClick={onSearch} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-renza-gold" aria-label="Search menu">
          <Search className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}