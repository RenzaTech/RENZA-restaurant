'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Share2, UtensilsCrossed, X } from 'lucide-react';
import { DietaryTags, VegIndicator } from './DishCard';
import { getDishBlurDataUrl } from '../utils/image';

function PhotoPlaceholder({ item }) {
  const initials =
    item.name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'R';
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-renza-charcoal via-renza-ink to-renza-ember/60 text-renza-cream">
      <UtensilsCrossed className="mb-2 h-10 w-10 text-renza-gold/80" strokeWidth={1.5} />
      <span className="font-display text-4xl tracking-wide text-white/90">{initials}</span>
    </div>
  );
}

function DetailCard({ label, children, warning = false }) {
  return (
    <div
      className={`rounded-2xl border p-3.5 transition-all ${
        warning
          ? 'border-amber-300/80 bg-amber-50/90 shadow-xs'
          : 'border-white/90 bg-renza-cream/70 backdrop-blur-sm shadow-xs hover:border-renza-gold/30'
      }`}
    >
      <span
        className={`mb-1 block text-[10px] font-bold uppercase tracking-wider ${
          warning ? 'text-amber-800' : 'text-renza-ink/50'
        }`}
      >
        {label}
      </span>
      <div className={`text-xs leading-relaxed ${warning ? 'text-amber-950 font-semibold' : 'font-semibold text-renza-ink/85'}`}>
        {children}
      </div>
    </div>
  );
}

export default function DishSheet({ item, onClose, resolveImageUrl, triggerRef }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const zoomCloseButtonRef = useRef(null);
  const dragStartRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [shareLabel, setShareLabel] = useState('Share dish');
  const imageUrl = resolveImageUrl(item.imageUrl);
  const isVeg = item.isVeg !== false && item.foodType !== 'non-veg';
  const isUnavailable = !item.isAvailable;
  const ingredients =
    typeof item.ingredients === 'string'
      ? item.ingredients
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      : Array.isArray(item.ingredients)
      ? item.ingredients
      : [];
  const chilliCount = Math.min(3, Math.max(0, Number(item.spicyLevel) || 0));
  const priceFormatted = (Number(item.price) || 0).toFixed(2);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const focusTimer = requestAnimationFrame(() => {
      setIsVisible(true);
      if (isZoomed) zoomCloseButtonRef.current?.focus();
      else closeButtonRef.current?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isZoomed) setIsZoomed(false);
        else onClose();
        return;
      }
      if (event.key !== 'Tab' || !overlayRef.current) return;
      const focusable = overlayRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isZoomed, onClose]);

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragStartRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (dragStartRef.current === null) return;
    setDragOffset(Math.max(0, event.clientY - dragStartRef.current));
  };

  const handlePointerUp = (event) => {
    if (dragStartRef.current === null) return;
    const shouldClose = dragOffset > 90;
    dragStartRef.current = null;
    setDragOffset(0);
    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    } catch {
      // Ignore if pointer capture was already released
    }
    if (shouldClose) onClose();
  };

  const handleShare = async () => {
    const shareData = {
      title: item.name,
      text: `Check out ${item.name} on the menu.`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareLabel('Shared');
      } else {
        throw new Error('Share unavailable');
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      try {
        await navigator.clipboard?.writeText(window.location.href);
        setShareLabel('Link copied');
      } catch {
        setShareLabel('Link ready');
      }
    }
    window.setTimeout(() => setShareLabel('Share dish'), 1800);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end bg-renza-ink/70 p-0 backdrop-blur-md md:items-center md:justify-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dish-sheet-title"
      onClick={(event) => {
        if (event.target === overlayRef.current) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2.5rem] border-t border-white/80 bg-white/95 shadow-2xl backdrop-blur-2xl md:rounded-[2.5rem] md:border"
        style={{
          transform: `translateY(${dragOffset}px)`,
          opacity: Math.max(0.55, 1 - dragOffset / 380),
          transition: dragStartRef.current === null ? 'transform 300ms ease, opacity 300ms ease' : 'none',
        }}
      >
        {/* Mobile Swipe Drag Handle (Isolated to handle only so body scrolls smoothly) */}
        <div
          className="flex cursor-grab justify-center pb-2 pt-3 touch-none active:cursor-grabbing md:hidden"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          aria-label="Drag down to close"
        >
          <div className="h-1.5 w-14 rounded-full bg-slate-300 shadow-xs" />
        </div>

        {/* Floating Glass Close Button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/60 text-white backdrop-blur-xl transition hover:bg-black/80 active:scale-90 focus:outline-none focus:ring-2 focus:ring-renza-gold"
          aria-label="Close dish details"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Hero Dish Image */}
        <button
          type="button"
          className={`relative block aspect-[4/3] w-full overflow-hidden bg-renza-charcoal text-left transition-[transform,opacity] duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-inset focus:ring-renza-gold ${
            isVisible ? 'scale-100 opacity-100' : 'scale-[0.96] opacity-0'
          } motion-reduce:transition-none`}
          onClick={() => imageUrl && !imageFailed && setIsZoomed(true)}
          aria-label={imageUrl && !imageFailed ? 'Zoom dish photo' : undefined}
        >
          {imageUrl && !imageFailed ? (
            <Image
              src={imageUrl}
              alt={item.name}
              fill
              sizes="(min-width: 768px) 672px, 100vw"
              placeholder="blur"
              blurDataURL={getDishBlurDataUrl(item.name)}
              className="object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <PhotoPlaceholder item={item} />
          )}
          {imageUrl && !imageFailed && (
            <span className="absolute bottom-4 right-4 rounded-full border border-white/25 bg-black/70 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xl shadow-md">
              Tap to zoom
            </span>
          )}
        </button>

        {/* Dish Content Body */}
        <div className="space-y-6 p-6 pb-[max(2rem,env(safe-area-inset-bottom))] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <VegIndicator isVeg={isVeg} />
                <span className="text-xs font-semibold text-renza-ink/50">
                  {isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                </span>
              </div>
              <h2 id="dish-sheet-title" className="font-display text-2xl font-bold leading-tight text-renza-ink sm:text-4xl">
                {item.name}
              </h2>
            </div>
            {/* Floating Glass Price Pill */}
            <span className="flex-shrink-0 rounded-full border border-white/20 bg-renza-ink/90 px-4 py-2 text-base font-black text-renza-cream shadow-md backdrop-blur-md">
              ₹{priceFormatted}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DietaryTags item={item} />
            {isUnavailable ? (
              <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-600 border border-rose-200/60">
                Currently sold out
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Available to order
              </span>
            )}
          </div>

          {item.description && (
            <p className="text-xs leading-relaxed text-renza-ink/75 sm:text-sm">
              {item.description}
            </p>
          )}

          {/* Glassmorphic Specifications Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ingredients.length > 0 && (
              <DetailCard label="Ingredients">
                <div className="flex flex-wrap gap-1.5">
                  {ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="rounded-lg border border-white/90 bg-white/80 px-2 py-1 text-[11px] font-medium shadow-xs"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </DetailCard>
            )}
            {item.spices && <DetailCard label="Signature spices">{item.spices}</DetailCard>}
            {item.allergens && (
              <DetailCard label="Allergens" warning>
                <span className="inline-flex items-start gap-1.5">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
                  {item.allergens}
                </span>
              </DetailCard>
            )}
            {item.portionSize && <DetailCard label="Portion">{item.portionSize}</DetailCard>}
            {item.prepTime && <DetailCard label="Prep time">{item.prepTime}</DetailCard>}
            {item.calories && <DetailCard label="Calories">{item.calories} kcal</DetailCard>}
            {chilliCount > 0 && (
              <DetailCard label="Spice level">
                <span aria-label={`${chilliCount} out of 3 chillies`}>
                  {Array.from({ length: chilliCount }, (_, index) => (
                    <span key={index}>🌶</span>
                  ))}
                </span>
              </DetailCard>
            )}
          </div>

          {/* Glassmorphic Share Action */}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-renza-gold/30 bg-gradient-to-r from-renza-cream to-white px-4 py-3 text-sm font-bold text-renza-ink shadow-xs backdrop-blur-md transition hover:border-renza-gold/60 hover:shadow-md active:scale-98 focus:outline-none focus:ring-2 focus:ring-renza-gold"
          >
            {shareLabel === 'Link copied' || shareLabel === 'Shared' ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Share2 className="h-4 w-4 text-renza-gold" />
            )}
            <span>{shareLabel}</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Photo Zoom Modal */}
      {isZoomed && imageUrl && !imageFailed && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label={`${item.name} photo`}
          onClick={() => setIsZoomed(false)}
        >
          <button
            ref={zoomCloseButtonRef}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-renza-gold transition"
            onClick={() => setIsZoomed(false)}
            aria-label="Close photo"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-full w-full max-h-[85vh] max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <Image src={imageUrl} alt={item.name} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}