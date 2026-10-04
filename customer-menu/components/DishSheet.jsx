'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { UtensilsCrossed, Share2, Check } from 'lucide-react';
import { getDishBlurDataUrl } from '../utils/image';
import { DietaryTags, parsePortions, parsePreparationPrices } from './DishCard';

function DetailCard({ label, children, warning = false }) {
  if (!children) return null;
  return (
    <div
      className={`rounded border p-3 ${
        warning
          ? 'border-amber-400/40 bg-amber-500/10 text-amber-200'
          : 'border-[rgba(200,167,93,0.2)] bg-[#0d131b] text-slate-200'
      }`}
    >
      <span
        className={`mb-1 block text-[10px] font-bold uppercase tracking-wider ${
          warning ? 'text-amber-300' : 'text-[#d4b15d]'
        }`}
      >
        {label}
      </span>
      <div className="text-xs leading-relaxed text-slate-300 font-medium">
        {children}
      </div>
    </div>
  );
}

export default function DishSheet({
  item,
  initialAngle = 'front',
  initialPortion = null,
  initialPrep = null,
  onClose,
  resolveImageUrl,
}) {
  const itemId = item?.id || item?._id || '';
  const portionPricesStr = typeof item?.portionPrices === 'string' ? item.portionPrices : JSON.stringify(item?.portionPrices || null);
  const prepPricesStr = typeof item?.preparationPrices === 'string' ? item.preparationPrices : JSON.stringify(item?.preparationPrices || null);
  const prepType = item?.preparationType || '';

  const portions = useMemo(() => parsePortions(item), [portionPricesStr]);
  const prepPrices = useMemo(() => parsePreparationPrices(item), [prepPricesStr]);
  const [activeAngle, setActiveAngle] = useState(initialAngle || 'front');
  const [frontFailed, setFrontFailed] = useState(false);
  const [topFailed, setTopFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(() => {
    if (initialPrep) return initialPrep;
    return prepPrices && prepPrices.length > 0 ? prepPrices[0].key : (prepType === 'gravy' ? 'gravy' : 'dry');
  });
  const [selectedPortionKey, setSelectedPortionKey] = useState(() => {
    if (initialPortion) return initialPortion;
    return portions && portions.length > 0 ? portions[0].key : null;
  });

  useEffect(() => {
    if (initialPrep) {
      setSelectedStyle(initialPrep);
    } else if (prepPrices && prepPrices.length > 0) {
      setSelectedStyle(prepPrices[0].key);
    } else {
      setSelectedStyle(prepType === 'gravy' ? 'gravy' : 'dry');
    }
  }, [itemId, initialPrep, prepPrices, prepType]);

  useEffect(() => {
    if (initialPortion) {
      setSelectedPortionKey(initialPortion);
    } else if (portions && portions.length > 0) {
      setSelectedPortionKey(portions[0].key);
    } else {
      setSelectedPortionKey(null);
    }
  }, [itemId, initialPortion, portions]);

  useEffect(() => {
    setActiveAngle(initialAngle || 'front');
    setFrontFailed(false);
    setTopFailed(false);
  }, [item?.id, item?.name, initialAngle]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const isVeg = item.isVeg !== false && item.foodType !== 'non-veg';
  const frontImageUrl = resolveImageUrl ? resolveImageUrl(item.imageUrl) : item.imageUrl;
  const topViewImageUrl = resolveImageUrl
    ? resolveImageUrl(item.topViewImageUrl || item.top_view_image_url)
    : (item.topViewImageUrl || item.top_view_image_url);

  const hasFrontView = Boolean(frontImageUrl);
  const hasTopView = Boolean(topViewImageUrl);
  const hasBothViews = hasFrontView && hasTopView;

  let currentImageUrl = null;
  if (activeAngle === 'top') {
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

  let spiceLevel = 0;
  if (typeof item.spicyLevel === 'number') {
    spiceLevel = Math.max(0, Math.min(5, item.spicyLevel));
  } else if (item.spicyLevel === 'mild') spiceLevel = 1;
  else if (item.spicyLevel === 'medium') spiceLevel = 2;
  else if (item.spicyLevel === 'hot' || item.spicyLevel === 'high') spiceLevel = 4;

  const activePortion = portions?.find((p) => p.key === selectedPortionKey) || portions?.[0] || null;
  const activePrep = prepPrices?.find((p) => p.key === selectedStyle) || prepPrices?.[0] || null;

  let priceNum = 0;
  if (activePortion) {
    priceNum = activePortion.price;
  } else if (activePrep) {
    priceNum = activePrep.price;
  } else {
    priceNum = Number(item.price) || 0;
  }
  const priceDisplay = `₹${priceNum.toFixed(2)}`;
  const categoryName = item.category?.name || item.categoryName || 'House Special';

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          text: `Check out ${item.name} on the menu!`,
          url,
        });
        return;
      } catch (e) {}
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop-fixed"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Editorial Card Modal */}
      <div
        className="modal-editorial-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dishModalTitle"
      >
        {/* Top-Right Corner Controls: Veg/Non-Veg indicator cleanly aligned with close button */}
        <div className="modal-top-actions">
          <div
            className={`type-dot ${isVeg ? 'veg' : 'nonveg'}`}
            title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
          />
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Hero Photo Wrap */}
        <div className="modal-hero-wrap">
          {hasAnyImage ? (
            <Image
              key={currentImageUrl}
              src={currentImageUrl}
              alt={item.name}
              fill
              placeholder="blur"
              blurDataURL={getDishBlurDataUrl(item.name)}
              className="modal-hero"
              onError={() => {
                if (activeAngle === 'top') setTopFailed(true);
                else setFrontFailed(true);
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1219] text-amber-200">
              <UtensilsCrossed className="mb-2 h-10 w-10 text-amber-300/70" strokeWidth={1.5} />
              <span className="font-display text-4xl text-amber-100">{item.name?.slice(0, 2)}</span>
            </div>
          )}
          <div className="modal-photo-shade" />

          {/* Dual Angle Switcher on Photo */}
          {hasBothViews && (
            <div
              className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 rounded bg-black/85 p-1 border border-white/20 text-[10px]"
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
                className={`px-2 py-0.5 rounded font-bold uppercase transition ${
                  activeAngle === 'front'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Front View
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTopFailed(false);
                  setActiveAngle('top');
                }}
                className={`px-2 py-0.5 rounded font-bold uppercase transition ${
                  activeAngle === 'top'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Top Overhead
              </button>
            </div>
          )}
        </div>

        {/* Modal Content Body */}
        <div className="modal-body">
          <div className="modal-top-row flex items-center justify-between gap-2">
            <span className="modal-cat-badge">{categoryName}</span>
            {item.specialTags && (
              <span className="dish-tag !static text-[10px] font-bold py-0.5 px-2.5 rounded-sm">
                {item.specialTags}
              </span>
            )}
          </div>

          <h2 id="dishModalTitle" className="modal-name">
            {item.name}
          </h2>

          <p className="modal-desc">
            {item.description || 'Prepared fresh with high quality ingredients and traditional culinary craft.'}
          </p>

          <div className="mb-4">
            <DietaryTags item={item} />
          </div>

          {/* Spice Level Row */}
          {spiceLevel > 0 && (
            <div className="spice-row">
              <span className="spice-label">SPICE LEVEL:</span>
              <div className="spice-icons">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`spice-icon ${lvl <= spiceLevel ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Deep Detail Cards (Ingredients, Allergens, Calories, Portion, Prep time) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
            {Boolean(item.portionSize) && (
              <DetailCard label="Portion Size">{item.portionSize}</DetailCard>
            )}
            {Boolean(item.prepTime) && (
              <DetailCard label="Prep Time">{item.prepTime}</DetailCard>
            )}
            {Boolean(item.calories && Number(item.calories) > 0) && (
              <DetailCard label="Calories">{item.calories} kcal</DetailCard>
            )}
            {Boolean(item.spices) && (
              <DetailCard label="Key Spices">{item.spices}</DetailCard>
            )}
            {Boolean(
              item.ingredients &&
                (Array.isArray(item.ingredients)
                  ? item.ingredients.length > 0
                  : String(item.ingredients).trim())
            ) && (
              <DetailCard label="Ingredients">
                {Array.isArray(item.ingredients) ? item.ingredients.join(', ') : item.ingredients}
              </DetailCard>
            )}
            {Boolean(
              item.allergens &&
                (Array.isArray(item.allergens)
                  ? item.allergens.length > 0
                  : String(item.allergens).trim())
            ) && (
              <DetailCard label="Allergen Notice" warning>
                {Array.isArray(item.allergens) ? item.allergens.join(', ') : item.allergens}
              </DetailCard>
            )}
            {!prepPrices && Boolean(item.preparationType) && (
              <DetailCard label="Style / Consistency">
                {item.preparationType === 'dry' && '🍗 Dry (Crispy / Pan Tossed)'}
                {item.preparationType === 'gravy' && '🍲 Gravy (Rich Curry / Sauce)'}
                {item.preparationType === 'semi-gravy' && '🥘 Semi-Gravy (Thick Masala)'}
                {item.preparationType === 'both' && '🔄 Available in Both Dry & Gravy'}
              </DetailCard>
            )}
          </div>

          {/* Preparation Style Selector when available */}
          {prepPrices && prepPrices.length > 0 ? (
            <div className="my-3 p-3 rounded-xl bg-[rgba(13,18,25,0.7)] border border-[rgba(200,167,93,0.3)] shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-sans font-bold tracking-wider uppercase text-[#d4b15d]">
                  Select Preparation Style
                </span>
                {activePrep && (
                  <span className="text-[11px] text-slate-300 font-sans">
                    Selected: <strong className="text-[#f0d68f]">{activePrep.emoji} {activePrep.name}</strong>
                  </span>
                )}
              </div>
              <div className={`grid gap-2 ${prepPrices.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {prepPrices.map((p) => {
                  const isSelected = p.key === (selectedStyle || prepPrices[0]?.key);
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setSelectedStyle(p.key)}
                      className={`py-2 px-2 rounded-lg text-center transition flex flex-col items-center justify-center border cursor-pointer ${
                        isSelected
                          ? 'bg-[rgba(212,177,93,0.22)] border-[#d4b15d] text-[#faecc8] shadow-[0_0_12px_rgba(212,177,93,0.2)] ring-1 ring-[#d4b15d]/50'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{p.emoji}</span>
                        <span className="text-xs font-bold">{p.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#f0d68f] mt-0.5">₹{p.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : item.preparationType === 'both' ? (
            <div className="my-3 p-3 rounded-xl bg-[rgba(13,18,25,0.7)] border border-[rgba(200,167,93,0.3)] shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-sans font-bold tracking-wider uppercase text-[#d4b15d]">
                  Select Preparation Style
                </span>
                <span className="text-[11px] text-slate-300 font-sans">
                  Preference: <strong className="text-[#f0d68f]">{selectedStyle === 'dry' ? '🍗 Dry' : '🍲 Gravy'}</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStyle('dry')}
                  className={`py-2 px-3 rounded-lg text-center font-bold text-xs transition flex items-center justify-center gap-2 border cursor-pointer ${
                    selectedStyle === 'dry'
                      ? 'bg-[rgba(212,177,93,0.22)] border-[#d4b15d] text-[#faecc8] shadow-[0_0_12px_rgba(212,177,93,0.2)] ring-1 ring-[#d4b15d]/50'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <span className="text-sm">🍗</span>
                  <span>Dry</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStyle('gravy')}
                  className={`py-2 px-3 rounded-lg text-center font-bold text-xs transition flex items-center justify-center gap-2 border cursor-pointer ${
                    selectedStyle === 'gravy'
                      ? 'bg-[rgba(212,177,93,0.22)] border-[#d4b15d] text-[#faecc8] shadow-[0_0_12px_rgba(212,177,93,0.2)] ring-1 ring-[#d4b15d]/50'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <span className="text-sm">🍲</span>
                  <span>Gravy</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* Portion Pricing Selector (Quarter, Half, Full) */}
          {portions && portions.length > 0 && (
            <div className="my-3.5 p-3 rounded-xl bg-[rgba(13,18,25,0.7)] border border-[rgba(200,167,93,0.3)] shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-sans font-bold tracking-wider uppercase text-[#d4b15d]">
                  Select Portion Size
                </span>
                {activePortion && (
                  <span className="text-[11px] text-slate-300 font-sans">
                    Selected: <strong className="text-[#f0d68f]">{activePortion.name}</strong>
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {portions.map((p) => {
                  const isSelected = p.key === (selectedPortionKey || portions[0]?.key);
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setSelectedPortionKey(p.key)}
                      className={`py-2 px-1.5 rounded-lg text-center transition flex flex-col items-center justify-center border cursor-pointer ${
                        isSelected
                          ? 'bg-[rgba(212,177,93,0.22)] border-[#d4b15d] text-[#faecc8] shadow-[0_0_12px_rgba(212,177,93,0.2)] ring-1 ring-[#d4b15d]/50'
                          : 'bg-[rgba(255,255,255,0.03)] border-white/10 text-slate-300 hover:border-white/25 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-[11px] font-bold tracking-tight">{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">({p.short})</span>
                      <span className="text-xs font-mono font-bold text-[#f0d68f] mt-0.5">₹{p.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price & Share */}
          <div className="price-row">
            <div>
              <div className="modal-price">{priceDisplay}</div>
              <div className="modal-price-note">
                {activePortion
                  ? `${activePortion.name} portion (${activePortion.short}) · All taxes included`
                  : activePrep
                  ? `${activePrep.emoji} ${activePrep.name} preparation · All taxes included`
                  : 'All taxes included · Prepared fresh to order'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded border border-[rgba(200,167,93,0.35)] px-4 py-2 text-xs font-bold text-[#d4b15d] hover:bg-[#d4b15d]/10 transition"
              title="Share this dish"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share Dish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}