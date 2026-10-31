'use client';

import { MapPin } from 'lucide-react';
import { resolveImageUrl } from '../utils/image';

export default function PortalHeader({ restaurant, googleReviewUrl, onOpenSplash }) {
  const name = restaurant?.name || "Anbu'de Cafe";
  const cuisineType = restaurant?.cuisineType || 'Café · Fast Food · Beverages';
  const address = restaurant?.address || 'Vallal MGR Salai, Maraimalai Nagar';

  const description =
    restaurant?.description ||
    'A cozy place to enjoy great coffee, freshly prepared food and a relaxing atmosphere.';

  // Check if admin uploaded a custom cover image or logo
  const hasCustomCover = Boolean(restaurant?.coverImage && !restaurant.coverImage.includes('default-cafe-cover'));

  const rawCover = restaurant?.coverImage || '/hub/default-cafe-cover.jpg';
  const coverImage = resolveImageUrl(rawCover) || rawCover;
  const rawLogo = restaurant?.logoUrl || '/hub/anbu-cafe-logo.png';
  const logoUrl = resolveImageUrl(rawLogo) || rawLogo;

  // Google Maps redirection URL for cafe location
  const mapUrl =
    restaurant?.mapUrl ||
    restaurant?.googleMapsUrl ||
    restaurant?.googleReviewUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address}`)}`;

  return (
    <header className="relative w-full bg-[#FFFCF7] pb-2">
      {/* 1. Header Banner / Cover Section */}
      {!hasCustomCover ? (
        /* Default State: Master Edge-to-Edge Banner with Scalloped Wave & Leaves, with Separate Circular Logo */
        <div className="relative w-full overflow-hidden bg-[#1a1510]">
          <img
            src="/hub/hub-banner-base.png"
            alt={`${name} cover`}
            className="w-full h-auto object-cover block select-none"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />

          {/* SEPARATE Circular Logo Element: Independent from upper image, dynamically displays admin or default logo */}
          {onOpenSplash ? (
            <button
              type="button"
              onClick={onOpenSplash}
              title="View Welcome Splash Screen"
              aria-label="View Welcome Splash Screen"
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden flex items-center justify-center z-20 cursor-pointer active:scale-95 hover:scale-105 transition-all select-none"
              style={{
                top: '71.96%',
                width: '21%',
                aspectRatio: '1 / 1',
              }}
            >
              <img
                src={logoUrl}
                alt={name}
                className="w-full h-full object-contain"
              />
            </button>
          ) : (
            <div
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden flex items-center justify-center z-20 pointer-events-none select-none"
              style={{
                top: '71.96%',
                width: '21%',
                aspectRatio: '1 / 1',
              }}
            >
              <img
                src={logoUrl}
                alt={name}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      ) : (
        /* Custom Admin-Uploaded Cover State */
        <div className="relative w-full">
          <div className="relative w-full h-[220px] sm:h-[240px] overflow-hidden bg-[#1a1510]">
            <img
              src={coverImage}
              alt={`${name} cover`}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent pointer-events-none" />
            <svg
              viewBox="0 0 500 80"
              preserveAspectRatio="none"
              className="absolute -bottom-1 left-0 w-full h-14 sm:h-16 text-[#FFFCF7] fill-current pointer-events-none block z-0"
            >
              <path d="M0,45 C100,75 160,25 250,55 C340,85 400,35 500,50 L500,85 L0,85 Z" />
            </svg>
          </div>

          <div className="relative max-w-sm mx-auto px-4 -mt-[56px] flex flex-col items-center text-center z-10">
            <div className="relative rounded-full bg-white p-1.5 shadow-[0_10px_28px_rgba(255,184,0,0.22)] border-2 border-[#FFB800]/50 flex items-center justify-center overflow-hidden ring-4 ring-[#FEF3C7] w-[120px] h-[120px] z-20">
              <img
                src={logoUrl}
                alt={name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Restaurant Profile Information Container */}
      <div className="relative w-full max-w-[420px] mx-auto px-2 min-[360px]:px-2.5 sm:px-4 pt-1 sm:pt-2 flex flex-col items-center text-center z-10">
        {/* Restaurant Name with Clickable Location Pin */}
        <div className="mt-1 flex items-center justify-center gap-1.5 sm:gap-2">
          <h1 className="text-[27px] sm:text-[30px] font-black tracking-tight text-[#101B35] font-sans leading-tight">
            {name}
          </h1>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-[#E8EAF0] shadow-2xs hover:border-[#FFB800] hover:bg-[#FFF5D9]/60 text-[#E11D48] hover:text-[#BE123C] active:scale-95 transition cursor-pointer shrink-0"
            title={`View ${name} location on Google Maps`}
            aria-label={`View ${name} location on Google Maps`}
          >
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E11D48] fill-[#E11D48]/15 stroke-[2.2]" />
          </a>
        </div>

        {/* Cuisine Concept Subtitle */}
        <p className="mt-1 text-xs font-semibold text-[#718096] font-sans tracking-wide">
          {cuisineType}
        </p>

        {/* Short Restaurant Description: Neatly Spanned with Balanced Margins (No Empty Side Voids) */}
        <p
          className="mt-2 text-[12px] sm:text-[13px] text-[#718096] w-full max-w-[365px] sm:max-w-md mx-auto leading-relaxed font-sans text-center px-0"
          style={{ textWrap: 'balance' }}
        >
          {description}
        </p>

        {/* Table Number Badge: Below Description, Airy & Uncongested Typography */}
        {restaurant?.table && (
          <div
            id="dining-hub-table-badge"
            className="mt-3.5 inline-flex items-center justify-center px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-gradient-to-r from-[#FFF5D9] to-[#FEF3C7] border border-[#F59E0B]/60 text-[#92400E] shadow-xs animate-in fade-in zoom-in-95 duration-150"
          >
            <div
              className="text-[13.5px] sm:text-[14.5px] tracking-wide inline-flex items-center gap-1.5"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span className="text-[#92400E] font-medium">You&apos;re</span>
              <span className="text-[#92400E] font-medium">at</span>
              <span className="text-[#78350F] font-bold">
                {(() => {
                  const raw = (restaurant.table.label || restaurant.table.name || '').trim();
                  const match = raw.match(/(\d+)/);
                  return match ? `Table ${parseInt(match[1], 10)}` : (raw || 'Table 1');
                })()}
              </span>
            </div>
          </div>
        )}

        {/* Section Header: Guest Dining Portal */}
        <div className="relative mt-4 pt-3.5 w-full border-t border-[#E8EAF0] flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 text-[#FFB800] mb-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2,21H20V19H2M20,8H18V5H20M20,3H4V13A4,4 0 0,0 8,17H14A4,4 0 0,0 18,13V10H20A2,2 0 0,0 22,8V5A2,2 0 0,0 20,3Z" />
            </svg>
          </div>
          <h2 className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#718096] font-sans">
            GUEST DINING PORTAL
          </h2>
          <p className="text-xs text-[#718096]/90 font-medium mt-0.5 font-sans">
            Explore our menu, give feedback and help us improve!
          </p>
        </div>
      </div>
    </header>
  );
}
