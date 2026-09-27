'use client';

import { useState, useEffect, useRef } from 'react';

export default function SplashScreen({
  isStatic = false,
  isLoading = false,
  minDuration = 2300,
  restaurant = null,
  onFinish,
  showSkip = true,
}) {
  const [mounted, setMounted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const [isGone, setIsGone] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    setMounted(true);
    startTimeRef.current = Date.now();

    if (isStatic) return;

    // Allow skip after 800ms
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 800);

    return () => clearTimeout(skipTimer);
  }, [isStatic]);

  // When loading finishes (or if not loading), wait for minDuration before fading out
  useEffect(() => {
    if (isStatic) return;
    if (isLoading) return;

    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, minDuration - elapsed);

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, remaining);

    return () => clearTimeout(fadeTimer);
  }, [isLoading, minDuration, isStatic]);

  // Fast silky fade out (350ms) to immediately reveal the restaurant name & menu
  useEffect(() => {
    if (!isFadingOut) return;

    const exitTimer = setTimeout(() => {
      setIsGone(true);
      if (onFinish) onFinish();
    }, 350);

    return () => clearTimeout(exitTimer);
  }, [isFadingOut, onFinish]);

  const handleManualDismiss = () => {
    if (isStatic || isFadingOut) return;
    setIsFadingOut(true);
  };

  if (isGone) return null;

  const restaurantName = restaurant?.name || null;

  return (
    <div
      aria-label="Loading Scanzaa dining experience"
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between select-none overflow-hidden transition-all duration-350 ease-out ${
        isFadingOut
          ? 'opacity-0 scale-105 pointer-events-none filter blur-sm'
          : 'opacity-100 scale-100 pointer-events-auto'
      }`}
      style={{
        background: '#040608',
      }}
    >
      {/* ── Ambient Radial Lighting Background ── */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 45%, rgba(14, 208, 186, 0.14) 0%, rgba(212, 177, 93, 0.05) 45%, rgba(4, 6, 8, 0.98) 85%, #040608 100%)',
        }}
      />

      {/* ── Subtle Geometric Ambient Grid ── */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Top Bar / Skip Hint ── */}
      <div className="relative z-10 w-full max-w-md px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0ed0ba] animate-ping opacity-75" />
          <span className="text-[10px] tracking-[0.2em] uppercase font-sans text-white/50 font-semibold">
            {restaurantName || 'Digital Dining'}
          </span>
        </div>

        {canSkip && showSkip && !isStatic && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleManualDismiss();
            }}
            className="text-[11px] tracking-wider uppercase text-white/50 hover:text-white/90 bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 px-3 py-1 rounded-full transition-all duration-200 backdrop-blur-md"
          >
            Skip →
          </button>
        )}
      </div>

      {/* ── Central Brand Container ── */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto px-6 text-center max-w-md w-full">
        {/* Ambient Glow behind the Logo */}
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-8 rounded-full bg-[#0ed0ba]/15 blur-3xl opacity-70 pointer-events-none" />
          <div className="absolute -inset-4 rounded-full bg-[#d4b15d]/10 blur-2xl opacity-60 pointer-events-none" />

          {/* SCANZAA Official Logo Image (Clean transparent, no black box) */}
          <div
            className={`transform transition-all duration-700 ease-out ${
              mounted ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-3'
            }`}
          >
            <img
              src="/scanzaa-logo.png"
              alt="SCANZAA — Scan Discover Dine"
              className="w-64 sm:w-80 max-w-[85vw] h-auto object-contain drop-shadow-[0_12px_40px_rgba(14,208,186,0.25)]"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>

        {/* ── High-Speed Progress Bar & Restaurant Name Preview ── */}
        <div className="mt-7 flex flex-col items-center gap-3 w-full max-w-[220px]">
          <div className="w-full h-[2.5px] bg-white/[0.08] rounded-full overflow-hidden relative">
            <div
              className="absolute inset-y-0 w-1/2 rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, #0ed0ba 50%, #d4b15d 100%)',
                animation: 'scanzaaProgress 0.9s ease-in-out infinite',
              }}
            />
          </div>

          {/* Subtitle / Restaurant Name */}
          <div className="flex flex-col items-center gap-1 text-center">
            {restaurantName && (
              <span className="text-sm font-semibold tracking-wide text-white drop-shadow">
                {restaurantName}
              </span>
            )}
            <div className="flex items-center gap-1.5 text-[10px] font-sans tracking-[0.24em] uppercase text-[#0ed0ba] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0ed0ba] animate-pulse" />
              <span>
                {restaurantName ? 'Entering Menu...' : 'Loading Dining Experience'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Branding & Hint ── */}
      <div className="relative z-10 w-full max-w-md px-6 pb-8 text-center flex flex-col items-center gap-1">
        <p className="text-[10px] tracking-[0.3em] uppercase text-white/30 font-medium">
          POWERED BY SCANZAA
        </p>
      </div>

      {/* Embedded Keyframes for Progress Bar */}
      <style jsx>{`
        @keyframes scanzaaProgress {
          0% {
            left: -50%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
}
