'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Share2, UtensilsCrossed, X } from 'lucide-react';
import { DietaryTags, VegIndicator } from './DishCard';
import { getDishBlurDataUrl } from '../utils/image';

function PhotoPlaceholder({ item }) {
  const initials = item.name?.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'R';
  return <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-renza-charcoal via-renza-ink to-renza-ember/70 text-renza-cream"><UtensilsCrossed className="mb-2 h-10 w-10 text-renza-gold/80" strokeWidth={1.5} /><span className="font-display text-4xl tracking-wide text-white/90">{initials}</span></div>;
}

function DetailCard({ label, children, warning = false }) {
  return <div className={`rounded-2xl border p-3 ${warning ? 'border-amber-200/80 bg-amber-50' : 'border-renza-ink/5 bg-renza-cream/70'}`}><span className={`mb-1 block text-[10px] font-bold uppercase tracking-wider ${warning ? 'text-amber-700' : 'text-renza-ink/45'}`}>{label}</span><div className={`text-xs leading-relaxed ${warning ? 'text-amber-900' : 'font-semibold text-renza-ink/80'}`}>{children}</div></div>;
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
  const ingredients = typeof item.ingredients === 'string'
    ? item.ingredients.split(',').map((value) => value.trim()).filter(Boolean)
    : Array.isArray(item.ingredients) ? item.ingredients : [];
  const chilliCount = Math.min(3, Math.max(0, Number(item.spicyLevel) || 0));

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
      const focusable = overlayRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
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
    const shouldClose = dragOffset > 110;
    dragStartRef.current = null;
    setDragOffset(0);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (shouldClose) onClose();
  };

  const handleShare = async () => {
    const shareData = { title: item.name, text: `Check out ${item.name} on the menu.`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else throw new Error('Share unavailable');
      setShareLabel('Shared');
    } catch (error) {
      if (error.name === 'AbortError') return;
      await navigator.clipboard?.writeText(window.location.href);
      setShareLabel('Link copied');
    }
    window.setTimeout(() => setShareLabel('Share dish'), 1800);
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-end bg-slate-950/75 p-0 backdrop-blur-md md:items-center md:p-6" role="dialog" aria-modal="true" aria-labelledby="dish-sheet-title" onClick={(event) => { if (event.target === overlayRef.current) onClose(); }}>
      <div ref={panelRef} className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[linear-gradient(180deg,#0c121a,#090d14)] shadow-[0_30px_80px_rgba(0,0,0,0.55)] md:rounded-[2rem]" style={{ transform: `translateY(${dragOffset}px)`, opacity: Math.max(0.55, 1 - dragOffset / 420), transition: dragStartRef.current === null ? 'transform 300ms ease, opacity 300ms ease' : 'none' }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
        <div className="flex justify-center pb-1 pt-3 md:hidden"><div className="h-1.5 w-12 rounded-full bg-slate-500" /></div>
        <button ref={closeButtonRef} onClick={onClose} className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/60 text-white backdrop-blur-md transition hover:border-amber-300/40 hover:bg-amber-300/10 focus:outline-none focus:ring-2 focus:ring-amber-300/70" aria-label="Close dish details"><X className="h-5 w-5" /></button>

        <button type="button" className={`relative block aspect-[4/3] w-full overflow-hidden bg-[#0b1220] text-left transition-[transform,opacity] duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-300/70 ${isVisible ? 'scale-100 opacity-100' : 'scale-[0.96] opacity-0'} motion-reduce:transition-none`} onClick={() => imageUrl && !imageFailed && setIsZoomed(true)} aria-label={imageUrl && !imageFailed ? 'Zoom dish photo' : undefined}>
          {imageUrl && !imageFailed ? <Image src={imageUrl} alt={item.name} fill sizes="(min-width: 768px) 672px, 100vw" placeholder="blur" blurDataURL={getDishBlurDataUrl(item.name)} className="object-cover" onError={() => setImageFailed(true)} /> : <PhotoPlaceholder item={item} />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060a12]/80 via-transparent to-transparent" />
          {imageUrl && !imageFailed && <span className="absolute bottom-4 right-4 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">Tap to zoom</span>}
        </button>

        <div className="space-y-6 p-6 pb-10 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0"><div className="mb-2 flex items-center gap-2"><VegIndicator isVeg={isVeg} /><span className="text-xs font-semibold text-slate-400">{isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</span></div><h2 id="dish-sheet-title" className="font-display text-3xl leading-tight text-white sm:text-4xl">{item.name}</h2></div>
            <span className="flex-shrink-0 rounded-full border border-amber-200/20 bg-amber-200/10 px-4 py-2 text-base font-black text-amber-100">₹{Number(item.price).toFixed(2)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2"><DietaryTags item={item} />{isUnavailable ? <span className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-[11px] font-bold text-rose-200">Currently sold out</span> : <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Available</span>}</div>
          {item.description && <p className="text-sm leading-relaxed text-slate-300">{item.description}</p>}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ingredients.length > 0 && <DetailCard label="Ingredients"><div className="flex flex-wrap gap-1.5">{ingredients.map((ingredient, index) => <span key={index} className="rounded-lg border border-white/10 bg-slate-950/50 px-2 py-1 text-[11px] text-slate-200">{ingredient}</span>)}</div></DetailCard>}
            {item.spices && <DetailCard label="Signature spices">{item.spices}</DetailCard>}
            {item.allergens && <DetailCard label="Allergens" warning><span className="inline-flex items-start gap-1.5"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />{item.allergens}</span></DetailCard>}
            {item.portionSize && <DetailCard label="Portion">{item.portionSize}</DetailCard>}
            {item.prepTime && <DetailCard label="Prep time">{item.prepTime}</DetailCard>}
            {item.calories && <DetailCard label="Calories">{item.calories} kcal</DetailCard>}
            {chilliCount > 0 && <DetailCard label="Spice level"><span aria-label={`${chilliCount} out of 3 chillies`}>{Array.from({ length: chilliCount }, (_, index) => <span key={index}>🌶</span>)}</span></DetailCard>}
          </div>

          <button onClick={handleShare} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/20 bg-[linear-gradient(135deg,rgba(217,179,108,0.12),rgba(255,255,255,0.02))] px-4 py-3 text-sm font-bold text-amber-100 transition hover:border-amber-300/40 hover:bg-amber-300/10 focus:outline-none focus:ring-2 focus:ring-amber-300/70">{shareLabel === 'Link copied' || shareLabel === 'Shared' ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}{shareLabel}</button>
        </div>
      </div>

      {isZoomed && imageUrl && !imageFailed && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true" aria-label={`${item.name} photo`} onClick={() => setIsZoomed(false)}><button ref={zoomCloseButtonRef} className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-300/70" onClick={() => setIsZoomed(false)} aria-label="Close photo"><X className="h-5 w-5" /></button><div className="relative h-full w-full" onClick={(event) => event.stopPropagation()}><Image src={imageUrl} alt={item.name} fill sizes="100vw" className="object-contain" /></div></div>}
    </div>
  );
}