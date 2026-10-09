'use client';

import Image from 'next/image';
import { forwardRef, useState, useEffect } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { getDishBlurDataUrl } from '../utils/image';
import DishImageZoomModal from './DishImageZoomModal';

export function VegIndicator({ isVeg }) {
  const isVegetarian = isVeg !== false;
  return (
    <div
      className={`type-dot ${isVegetarian ? 'veg' : 'nonveg'}`}
      title={isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
    />
  );
}

function DietaryBadge({ label, emoji }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-[rgba(200,167,93,0.3)] bg-black/50 px-2 py-0.5 text-[10px] font-bold text-amber-200">
      {emoji && <span>{emoji}</span>}
      <span>{label}</span>
    </span>
  );
}

export function DietaryTags({ item }) {
  const tags = [];
  if (item.spicyLevel === 1 || item.spicyLevel === 'mild') {
    tags.push({ emoji: '🌶', label: 'Mild' });
  } else if (item.spicyLevel === 2 || item.spicyLevel === 'medium') {
    tags.push({ emoji: '🌶🌶', label: 'Spicy' });
  } else if (item.spicyLevel >= 3 || item.spicyLevel === 'hot') {
    tags.push({ emoji: '🌶🌶🌶', label: 'Extra Spicy' });
  }
  if (item.isJain) tags.push({ emoji: '🪔', label: 'Jain' });
  if (item.isVegan) tags.push({ emoji: '🥗', label: 'Vegan' });
  if (item.isGlutenFree) tags.push({ emoji: '🌾', label: 'Gluten-Free' });

  const hasPrepPrices = Boolean(item.preparationPrices);
  if (!hasPrepPrices) {
    const prep = (item.preparationType || item.dishStyle || '').toLowerCase();
    if (prep === 'dry') {
      tags.push({ emoji: '🍗', label: 'Dry' });
    } else if (prep === 'gravy') {
      tags.push({ emoji: '🍲', label: 'Gravy' });
    } else if (prep === 'semi-gravy') {
      tags.push({ emoji: '🥘', label: 'Semi-Gravy' });
    } else if (prep === 'both') {
      tags.push({ emoji: '🔄', label: 'Dry & Gravy' });
    }
  }

  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 pt-0.5">
      {tags.map((tag) => (
        <DietaryBadge key={tag.label} {...tag} />
      ))}
    </div>
  );
}

export function parsePortions(item) {
  if (!item?.portionPrices) return null;
  try {
    const raw = typeof item.portionPrices === 'string' ? JSON.parse(item.portionPrices) : item.portionPrices;
    if (raw && typeof raw === 'object') {
      let portionImages = null;
      if (item.portionImages) {
        try {
          portionImages = typeof item.portionImages === 'string' ? JSON.parse(item.portionImages) : item.portionImages;
        } catch {}
      }
      const list = [];
      if (raw.quarter !== undefined && raw.quarter !== null && Number(raw.quarter) > 0) {
        list.push({
          key: 'quarter',
          name: 'Quarter',
          short: '1/4',
          price: Number(raw.quarter),
          imageUrl: portionImages?.quarter || null,
        });
      }
      if (raw.half !== undefined && raw.half !== null && Number(raw.half) > 0) {
        list.push({
          key: 'half',
          name: 'Half',
          short: '1/2',
          price: Number(raw.half),
          imageUrl: portionImages?.half || null,
        });
      }
      if (raw.full !== undefined && raw.full !== null && Number(raw.full) > 0) {
        list.push({
          key: 'full',
          name: 'Full',
          short: 'Full',
          price: Number(raw.full),
          imageUrl: portionImages?.full || null,
        });
      }
      if (raw.regular !== undefined && raw.regular !== null && Number(raw.regular) > 0) {
        list.push({ key: 'regular', name: 'Regular', short: 'Regular', price: Number(raw.regular), imageUrl: null });
      }
      if (raw.special !== undefined && raw.special !== null && Number(raw.special) > 0) {
        list.push({ key: 'special', name: 'Special', short: 'Special', price: Number(raw.special), imageUrl: null });
      }
      if (list.length > 0) return list;
    }
  } catch {}
  return null;
}

export function parsePreparationPrices(item) {
  if (!item?.preparationPrices) return null;
  try {
    const raw = typeof item.preparationPrices === 'string' ? JSON.parse(item.preparationPrices) : item.preparationPrices;
    if (raw && typeof raw === 'object') {
      const list = [];
      if (raw.dry !== undefined && raw.dry !== null && Number(raw.dry) > 0) {
        list.push({ key: 'dry', name: 'Dry', emoji: '🍗', price: Number(raw.dry) });
      }
      if (raw.gravy !== undefined && raw.gravy !== null && Number(raw.gravy) > 0) {
        list.push({ key: 'gravy', name: 'Gravy', emoji: '🍲', price: Number(raw.gravy) });
      }
      if (raw.semiGravy !== undefined && raw.semiGravy !== null && Number(raw.semiGravy) > 0) {
        list.push({ key: 'semiGravy', name: 'Semi-Gravy', emoji: '🥘', price: Number(raw.semiGravy) });
      }
      if (list.length > 0) return list;
    }
  } catch {}
  return null;
}

const DishCard = forwardRef(function DishCard(
  {
    item,
    onSelect,
    resolveImageUrl,
    priority = false,
  },
  ref
) {
  const [activeAngle, setActiveAngle] = useState('front');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [frontFailed, setFrontFailed] = useState(false);
  const [topFailed, setTopFailed] = useState(false);
  const [portionFailed, setPortionFailed] = useState(false);

  const isUnavailable = !item.isAvailable;
  const isVeg = item.isVeg !== false && item.foodType !== 'non-veg';
  const frontImageUrl = resolveImageUrl ? resolveImageUrl(item.imageUrl) : item.imageUrl;
  const topViewImageUrl = resolveImageUrl
    ? resolveImageUrl(item.topViewImageUrl || item.top_view_image_url)
    : (item.topViewImageUrl || item.top_view_image_url);

  const prepPrices = parsePreparationPrices(item);
  const portions = parsePortions(item);
  const [selectedPortionKey, setSelectedPortionKey] = useState(null);
  const [selectedPrepKey, setSelectedPrepKey] = useState(null);

  const activePortion = portions?.find((p) => p.key === selectedPortionKey) || null;
  const activePrep = prepPrices?.find((p) => p.key === selectedPrepKey) || null;

  const portionRawUrl = activePortion?.imageUrl || null;
  const portionImageUrl = portionRawUrl
    ? (resolveImageUrl ? resolveImageUrl(portionRawUrl) : portionRawUrl)
    : null;

  useEffect(() => {
    setFrontFailed(false);
    setTopFailed(false);
    setPortionFailed(false);
  }, [item?.id, item?.name, frontImageUrl, topViewImageUrl, portionImageUrl]);

  const hasFrontView = Boolean(frontImageUrl);
  const hasTopView = Boolean(topViewImageUrl);
  const hasBothViews = hasFrontView && hasTopView;

  let currentImageUrl = null;
  if (portionImageUrl && !portionFailed) {
    currentImageUrl = portionImageUrl;
  } else if (activeAngle === 'top') {
    if (hasTopView && !topFailed) {
      currentImageUrl = topViewImageUrl;
    } else if (hasFrontView && !frontFailed) {
      currentImageUrl = frontImageUrl;
    }
  } else {
    if (hasFrontView && !frontFailed) {
      currentImageUrl = frontImageUrl;
    } else if (hasTopView && !topFailed) {
      currentImageUrl = topViewImageUrl;
    }
  }

  const hasAnyImage = Boolean(currentImageUrl);
  const initials =
    item.name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'R';

  const placeholder = (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090e15] text-amber-200">
      <UtensilsCrossed className="mb-2 h-7 w-7 text-amber-300/70" strokeWidth={1.5} />
      <span className="font-display text-2xl tracking-wider text-amber-100/80">{initials}</span>
    </div>
  );

  let priceDisplay = '';
  if (activePortion) {
    priceDisplay = `₹${activePortion.price.toFixed(0)}`;
  } else if (activePrep) {
    priceDisplay = `₹${activePrep.price.toFixed(0)}`;
  } else if (prepPrices && prepPrices.length > 0) {
    const prices = prepPrices.map((p) => p.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    priceDisplay = minP === maxP ? `₹${minP.toFixed(0)}` : `₹${minP.toFixed(0)} – ₹${maxP.toFixed(0)}`;
  } else if (portions && portions.length > 0) {
    const prices = portions.map((p) => p.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    priceDisplay = minP === maxP ? `₹${minP.toFixed(0)}` : `₹${minP.toFixed(0)} – ₹${maxP.toFixed(0)}`;
  } else {
    const priceNum = Number(item.price) || 0;
    priceDisplay = priceNum > 0 ? `₹${priceNum.toFixed(0)}` : '';
  }

  const handleCardClick = (e, options = {}) => {
    if (isUnavailable) return;
    onSelect(item, ref?.current || e.currentTarget, activeAngle, {
      portionKey: options.portionKey !== undefined ? options.portionKey : selectedPortionKey,
      prepKey: options.prepKey !== undefined ? options.prepKey : selectedPrepKey,
    });
  };

  return (
    <>
      <article
        ref={ref}
      className={`dish-card ${isUnavailable ? 'opacity-70 cursor-not-allowed' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={isUnavailable ? -1 : 0}
      aria-label={`${item.name}, Price ${priceDisplay}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e);
        }
      }}
    >
      {/* ── Left Column: Dish Photo ── */}
      <div
        className={`dish-photo-wrap ${hasAnyImage && !isUnavailable ? 'cursor-zoom-in' : ''}`}
        onClick={(e) => {
          if (hasAnyImage && !isUnavailable) {
            e.stopPropagation();
            setIsZoomOpen(true);
          }
        }}
        title={hasAnyImage && !isUnavailable ? `Click to zoom photo of ${item.name}` : undefined}
      >
        {hasAnyImage ? (
          <Image
            key={currentImageUrl}
            src={currentImageUrl}
            alt={item.name}
            fill
            sizes="(min-width: 600px) 130px, 110px"
            placeholder="blur"
            blurDataURL={getDishBlurDataUrl(item.name)}
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            className="dish-photo"
            onError={() => {
              if (portionImageUrl && currentImageUrl === portionImageUrl) setPortionFailed(true);
              else if (activeAngle === 'top') setTopFailed(true);
              else setFrontFailed(true);
            }}
          />
        ) : (
          placeholder
        )}
        <div className="dish-photo-overlay" />

        {/* Veg / Non-Veg Indicator on Top-Left of Photo */}
        <div
          className={`type-dot ${isVeg ? 'veg' : 'nonveg'}`}
          title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
        />

        {/* Portion Serving Photo Indicator */}
        {portionImageUrl && currentImageUrl === portionImageUrl && (
          <div className="absolute bottom-1.5 left-1.5 z-10 flex items-center gap-1 rounded bg-black/85 px-1.5 py-0.5 border border-amber-400/40 text-[8px] font-bold text-amber-200 backdrop-blur-xs">
            <span>📷</span>
            <span>{activePortion.short}</span>
          </div>
        )}

        {/* Sold Out Overlay */}
        {isUnavailable && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 backdrop-blur-2xs">
            <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
              Sold Out
            </span>
          </div>
        )}

        {/* Dual Angle Toggle */}
        {hasBothViews && !isUnavailable && !portionImageUrl && (
          <div
            className="absolute bottom-1 right-1 z-10 flex items-center gap-0.5 rounded bg-black/85 p-0.5 border border-white/20 text-[8px]"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFrontFailed(false);
                setActiveAngle('front');
              }}
              className={`px-1 py-0.2 rounded font-bold uppercase transition ${
                activeAngle === 'front'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              1
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setTopFailed(false);
                setActiveAngle('top');
              }}
              className={`px-1 py-0.2 rounded font-bold uppercase transition ${
                activeAngle === 'top'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              2
            </button>
          </div>
        )}
      </div>

      {/* ── Right Column: Info & Price (No Add Button) ── */}
      <div className="dish-info">
        <div className="space-y-1">
          {/* Title & Special Tag Row */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="dish-name line-clamp-1">{item.name}</h3>
            {item.specialTags && (
              <span className="shrink-0 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30">
                {item.specialTags}
              </span>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="line-clamp-2 text-[11px] sm:text-xs leading-relaxed text-slate-400">
              {item.description}
            </p>
          )}

          {/* Portion Options Chips */}
          {portions && portions.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5" onClick={(e) => e.stopPropagation()}>
              {portions.map((p) => {
                const isSelected = selectedPortionKey === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextKey = isSelected ? null : p.key;
                      setSelectedPortionKey(nextKey);
                    }}
                    className={`inline-flex items-center gap-1 text-[9px] font-sans tracking-wide px-1.5 py-0.5 rounded transition cursor-pointer border ${
                      isSelected
                        ? 'bg-[rgba(212,177,93,0.32)] border-[#d4b15d] text-[#faecc8] font-bold shadow-[0_0_8px_rgba(212,177,93,0.3)] ring-1 ring-[#d4b15d]/40'
                        : 'bg-[rgba(212,177,93,0.12)] text-[#e8c879] border-[rgba(212,177,93,0.25)] hover:border-[#d4b15d]/60 hover:bg-[rgba(212,177,93,0.2)]'
                    }`}
                    title={`Select ${p.name} (₹${p.price})${p.imageUrl ? ' - Shows serving photo' : ''}`}
                  >
                    <span>{p.short}: ₹{p.price}</span>
                    {p.imageUrl && <span className="text-[8px] opacity-80">📷</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Preparation Style Chips */}
          {prepPrices && prepPrices.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5" onClick={(e) => e.stopPropagation()}>
              {prepPrices.map((p) => {
                const isSelected = selectedPrepKey === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextKey = isSelected ? null : p.key;
                      setSelectedPrepKey(nextKey);
                    }}
                    className={`inline-flex items-center gap-1 text-[9px] font-sans tracking-wide px-1.5 py-0.5 rounded transition cursor-pointer border ${
                      isSelected
                        ? 'bg-[rgba(212,177,93,0.32)] border-[#d4b15d] text-[#faecc8] font-bold shadow-[0_0_8px_rgba(212,177,93,0.3)] ring-1 ring-[#d4b15d]/40'
                        : 'bg-[rgba(212,177,93,0.12)] text-[#e8c879] border-[rgba(212,177,93,0.25)] hover:border-[#d4b15d]/60 hover:bg-[rgba(212,177,93,0.2)]'
                    }`}
                    title={`Select ${p.name} (₹${p.price})`}
                  >
                    <span>{p.emoji}</span>
                    <span>{p.name}: ₹{p.price}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Row: Price & Dietary Tags */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.06] mt-1.5">
          {priceDisplay ? (
            <div className="dish-price">{priceDisplay}</div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1">
            <DietaryTags item={item} />
          </div>
        </div>
      </div>
    </article>

    {/* Dish Food Image Full-Screen Zoom Modal */}
    {isZoomOpen && hasAnyImage && (
      <DishImageZoomModal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        imageUrl={currentImageUrl}
        dishName={item.name}
        subtitle={
          portionImageUrl && currentImageUrl === portionImageUrl
            ? `${activePortion.name} Serving (${activePortion.short})`
            : activeAngle === 'top'
            ? 'Top Overhead View'
            : 'Front View'
        }
      />
    )}
  </>
);
});

export default DishCard;