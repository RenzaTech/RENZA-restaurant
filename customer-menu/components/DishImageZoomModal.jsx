'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react';

export default function DishImageZoomModal({
  isOpen,
  onClose,
  imageUrl,
  dishName,
  subtitle,
}) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const posStartRef = useRef({ x: 0, y: 0 });
  const lastTouchDistanceRef = useRef(null);
  const lastTapRef = useRef(0);

  // Reset zoom & position whenever modal opens or image changes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageUrl]);

  // Lock body scroll & listen to Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(3.5, Number((prev + 0.5).toFixed(1))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(1, Number((prev - 0.5).toFixed(1)));
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Double tap / double click to toggle zoom
  const handleDoubleTap = useCallback(
    (clientX, clientY) => {
      if (scale > 1) {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      } else {
        setScale(2.2);
        // Center zoom around tap point if on screen
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const offsetX = (centerX - clientX) * 0.8;
        const offsetY = (centerY - clientY) * 0.8;
        setPosition({ x: offsetX, y: offsetY });
      }
    },
    [scale]
  );

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    posStartRef.current = { ...position };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const maxOffset = (scale - 1) * 280;
    setPosition({
      x: Math.max(-maxOffset, Math.min(maxOffset, posStartRef.current.x + dx)),
      y: Math.max(-maxOffset, Math.min(maxOffset, posStartRef.current.y + dy)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers (Pinch-to-zoom + Drag + Double-tap)
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch start
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      lastTouchDistanceRef.current = dist;
    } else if (e.touches.length === 1) {
      const now = Date.now();
      const touch = e.touches[0];
      if (now - lastTapRef.current < 300) {
        // Double-tap detected
        handleDoubleTap(touch.clientX, touch.clientY);
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      if (scale > 1) {
        setIsDragging(true);
        dragStartRef.current = { x: touch.clientX, y: touch.clientY };
        posStartRef.current = { ...position };
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDistanceRef.current !== null) {
      // Pinch move
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const diff = dist - lastTouchDistanceRef.current;
      if (Math.abs(diff) > 4) {
        setScale((prev) => {
          const next = Math.max(1, Math.min(3.5, prev + diff * 0.008));
          if (next === 1) setPosition({ x: 0, y: 0 });
          return Number(next.toFixed(2));
        });
        lastTouchDistanceRef.current = dist;
      }
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Single finger pan
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.x;
      const dy = touch.clientY - dragStartRef.current.y;
      const maxOffset = (scale - 1) * 320;
      setPosition({
        x: Math.max(-maxOffset, Math.min(maxOffset, posStartRef.current.x + dx)),
        y: Math.max(-maxOffset, Math.min(maxOffset, posStartRef.current.y + dy)),
      });
    }
  };

  const handleTouchEnd = () => {
    lastTouchDistanceRef.current = null;
    setIsDragging(false);
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 select-none"
      onWheel={handleWheel}
      role="dialog"
      aria-modal="true"
      aria-label={`Zoom view for ${dishName || 'Dish'}`}
    >
      {/* ── Top Bar ── */}
      <header className="relative z-20 flex w-full items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex flex-col pr-4">
          <span className="font-display text-lg sm:text-2xl font-bold tracking-wide text-[#f6f2eb] drop-shadow line-clamp-1">
            {dishName}
          </span>
          {subtitle && (
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#d4b15d]">
              {subtitle}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95 cursor-pointer shadow-lg"
          aria-label="Close zoom view"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* ── Main Interactive Image Viewer ── */}
      <main
        className="relative flex-1 w-full flex items-center justify-center overflow-hidden touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          if (scale === 1 && !isDragging) handleDoubleTap(e.clientX, e.clientY);
        }}
        onDoubleClick={(e) => handleDoubleTap(e.clientX, e.clientY)}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
      >
        <div
          className="relative max-h-[80vh] max-w-[92vw] aspect-square transition-transform"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          <Image
            src={imageUrl}
            alt={dishName || 'Dish food photo'}
            width={900}
            height={900}
            priority
            className="h-full w-full object-contain pointer-events-none drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
          />
        </div>
      </main>

      {/* ── Bottom Controls & Hint Bar ── */}
      <footer className="relative z-20 flex flex-col items-center gap-2 pb-5 pt-2 px-4 w-full bg-gradient-to-t from-black/90 to-transparent">
        {/* Helper Hint */}
        <p className="text-[11px] sm:text-xs text-slate-400 font-medium tracking-wide">
          Double-tap or pinch to zoom · Drag to pan
        </p>

        {/* Floating Controls Bar */}
        <div className="flex items-center gap-2 rounded-full border border-[rgba(212,177,93,0.35)] bg-[rgba(13,18,25,0.92)] px-3 py-1.5 shadow-2xl backdrop-blur-md">
          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
            aria-label="Zoom out"
            title="Zoom Out (-)"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          {/* Scale Indicator */}
          <span className="px-2 font-mono text-xs font-bold text-[#d4b15d] min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 3.5}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
            aria-label="Zoom in"
            title="Zoom In (+)"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <div className="h-4 w-[1px] bg-white/20 mx-1" />

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-300 hover:text-amber-200 hover:bg-white/10 transition cursor-pointer"
            aria-label="Reset zoom"
            title="Reset to 100%"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
