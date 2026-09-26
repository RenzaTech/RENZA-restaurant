'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { UtensilsCrossed, Share2, Check } from 'lucide-react';
import { getDishBlurDataUrl } from '../utils/image';
import { DietaryTags } from './DishCard';

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
  onClose,
  resolveImageUrl,
}) {
  const [activeAngle, setActiveAngle] = useState(initialAngle || 'front');
  const [frontFailed, setFrontFailed] = useState(false);
  const [topFailed, setTopFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveAngle(initialAngle || 'front');
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

  const hasFrontView = Boolean(frontImageUrl && !frontFailed);
  const hasTopView = Boolean(topViewImageUrl && !topFailed);
  const hasBothViews = hasFrontView && hasTopView;

  const currentImageUrl =
    activeAngle === 'top'
      ? hasTopView ? topViewImageUrl : frontImageUrl
      : hasFrontView ? frontImageUrl : topViewImageUrl;

  const hasAnyImage = Boolean(currentImageUrl && (activeAngle === 'top' ? !topFailed : !frontFailed));

  let spiceLevel = 0;
  if (typeof item.spicyLevel === 'number') {
    spiceLevel = Math.max(0, Math.min(5, item.spicyLevel));
  } else if (item.spicyLevel === 'mild') spiceLevel = 1;
  else if (item.spicyLevel === 'medium') spiceLevel = 2;
  else if (item.spicyLevel === 'hot' || item.spicyLevel === 'high') spiceLevel = 4;

  const priceNum = Number(item.price) || 0;
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
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Hero Photo Wrap */}
        <div className="modal-hero-wrap">
          {hasAnyImage ? (
            <Image
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
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 rounded bg-black/85 p-1 border border-white/20 text-[10px]">
              <button
                type="button"
                onClick={() => setActiveAngle('front')}
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
                onClick={() => setActiveAngle('top')}
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
          <div className="modal-top-row">
            <span className="modal-cat-badge">{categoryName}</span>
            <div className={`type-dot ${isVeg ? 'veg' : 'nonveg'} !relative !top-0 !right-0`} />
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
            {item.portionSize && (
              <DetailCard label="Portion Size">{item.portionSize}</DetailCard>
            )}
            {item.prepTime && (
              <DetailCard label="Prep Time">{item.prepTime}</DetailCard>
            )}
            {item.calories && (
              <DetailCard label="Calories">{item.calories} kcal</DetailCard>
            )}
            {item.spices && (
              <DetailCard label="Key Spices">{item.spices}</DetailCard>
            )}
            {item.ingredients && (
              <DetailCard label="Ingredients">
                {Array.isArray(item.ingredients) ? item.ingredients.join(', ') : item.ingredients}
              </DetailCard>
            )}
            {item.allergens && (
              <DetailCard label="Allergen Notice" warning>
                {Array.isArray(item.allergens) ? item.allergens.join(', ') : item.allergens}
              </DetailCard>
            )}
          </div>

          {/* Price & Share */}
          <div className="price-row">
            <div>
              <div className="modal-price">{priceDisplay}</div>
              <div className="modal-price-note">
                All taxes included · Prepared fresh to order
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