'use client';

import Image from 'next/image';
import { forwardRef, useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { getDishBlurDataUrl } from '../utils/image';

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

  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 pt-0.5">
      {tags.map((tag) => (
        <DietaryBadge key={tag.label} {...tag} />
      ))}
    </div>
  );
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
  const [frontFailed, setFrontFailed] = useState(false);
  const [topFailed, setTopFailed] = useState(false);

  const isUnavailable = !item.isAvailable;
  const isVeg = item.isVeg !== false && item.foodType !== 'non-veg';
  const frontImageUrl = resolveImageUrl ? resolveImageUrl(item.imageUrl) : item.imageUrl;
  const topViewImageUrl = resolveImageUrl
    ? resolveImageUrl(item.topViewImageUrl || item.top_view_image_url)
    : (item.topViewImageUrl || item.top_view_image_url);

  const hasFrontView = Boolean(frontImageUrl && !frontFailed);
  const hasTopView = Boolean(topViewImageUrl && !topFailed);
  const hasBothViews = hasFrontView && hasTopView;

  const currentImageUrl =
    activeAngle === 'top'
      ? hasTopView ? topViewImageUrl : frontImageUrl
      : hasFrontView ? frontImageUrl : topViewImageUrl;

  const hasAnyImage = Boolean(currentImageUrl && (activeAngle === 'top' ? !topFailed : !frontFailed));
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

function parsePortions(item) {
  if (!item?.portionPrices) return null;
  try {
    const raw = typeof item.portionPrices === 'string' ? JSON.parse(item.portionPrices) : item.portionPrices;
    if (raw && typeof raw === 'object') {
      const list = [];
      if (raw.quarter !== undefined && raw.quarter !== null && Number(raw.quarter) > 0) {
        list.push({ key: 'quarter', name: 'Quarter', short: '1/4', price: Number(raw.quarter) });
      }
      if (raw.half !== undefined && raw.half !== null && Number(raw.half) > 0) {
        list.push({ key: 'half', name: 'Half', short: '1/2', price: Number(raw.half) });
      }
      if (raw.full !== undefined && raw.full !== null && Number(raw.full) > 0) {
        list.push({ key: 'full', name: 'Full', short: 'Full', price: Number(raw.full) });
      }
      if (list.length > 0) return list;
    }
  } catch {}
  return null;
}

  const portions = parsePortions(item);
  let priceDisplay = '';
  if (portions && portions.length > 0) {
    const prices = portions.map((p) => p.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    priceDisplay = minP === maxP ? `₹${minP.toFixed(0)}` : `₹${minP.toFixed(0)} – ₹${maxP.toFixed(0)}`;
  } else {
    const priceNum = Number(item.price) || 0;
    priceDisplay = `₹${priceNum.toFixed(0)}`;
  }

  const handleCardClick = (e) => {
    if (isUnavailable) return;
    onSelect(item, ref?.current || e.currentTarget, activeAngle);
  };

  return (
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
      <div className="dish-photo-wrap">
        {hasAnyImage ? (
          <Image
            key={currentImageUrl}
            src={currentImageUrl}
            alt={item.name}
            fill
            sizes="(min-width: 900px) 33vw, 50vw"
            placeholder="blur"
            blurDataURL={getDishBlurDataUrl(item.name)}
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            className="dish-photo"
            onError={() => {
              if (activeAngle === 'top') setTopFailed(true);
              else setFrontFailed(true);
            }}
          />
        ) : (
          placeholder
        )}
        <div className="dish-photo-overlay" />

        {/* Tag / Sold Out */}
        {isUnavailable ? (
          <div className="dish-tag border-rose-500 text-rose-300">Sold Out</div>
        ) : item.specialTags ? (
          <div className="dish-tag">{item.specialTags}</div>
        ) : null}

        {/* Veg / Non-Veg Indicator */}
        <div className={`type-dot ${isVeg ? 'veg' : 'nonveg'}`} />

        {/* Dual Angle Toggle */}
        {hasBothViews && !isUnavailable && (
          <div
            className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded bg-black/85 p-0.5 border border-white/20 text-[9px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveAngle('front')}
              className={`px-1.5 py-0.5 rounded font-bold uppercase transition ${
                activeAngle === 'front'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Front
            </button>
            <button
              type="button"
              onClick={() => setActiveAngle('top')}
              className={`px-1.5 py-0.5 rounded font-bold uppercase transition ${
                activeAngle === 'top'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Top
            </button>
          </div>
        )}
      </div>

      <div className="dish-info">
        <h3 className="dish-name">{item.name}</h3>
        <div className="dish-price">{priceDisplay}</div>

        {portions && portions.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {portions.map((p) => (
              <span
                key={p.key}
                className="inline-flex items-center text-[10px] font-sans font-semibold tracking-wider px-1.5 py-0.5 rounded bg-[rgba(212,177,93,0.12)] text-[#e8c879] border border-[rgba(212,177,93,0.25)]"
              >
                {p.short}: ₹{p.price}
              </span>
            ))}
          </div>
        )}

        {item.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-400 mb-2">
            {item.description}
          </p>
        )}

        <DietaryTags item={item} />

        <button type="button" className="view-btn mt-3">
          View Dish
        </button>
      </div>
    </article>
  );
});

export default DishCard;