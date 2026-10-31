'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Share2,
  Check,
  ZoomIn,
  Clock,
  Sparkles,
} from 'lucide-react';
import DishImageZoomModal from './DishImageZoomModal';
import { trackEvent } from '../utils/analytics';
import { resolveImageUrl } from '../utils/image';

// Curated high quality food photography for cafe categories
export const FOOD_IMAGE_PAIRS = {
  omelette: {
    side: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    top: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80',
    desc: 'Fluffy eggs beaten with diced red onions, fresh green chillies, aromatic coriander, and served hot with golden toasted bread.',
  },
  sandwich: {
    side: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    top: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    desc: 'Crisp toasted bread layered with fresh garden vegetables, creamy spread, herbs, and melted cheese toasted to golden perfection.',
  },
  toast: {
    side: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80',
    top: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    desc: 'Thick sliced artisan bread toasted with buttery spread, herbs, and rich melted cheese.',
  },
  fries: {
    side: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
    top: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    desc: 'Golden crisp hand-cut potato fries lightly salted and seasoned with cafe spices.',
  },
  maggi: {
    side: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    top: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    desc: 'Classic masala noodles tossed with seasoned vegetables, butter, and cafe spice mix.',
  },
  momos: {
    side: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=800&q=80',
    top: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    desc: 'Delicate steamed dumplings stuffed with finely minced fillings and served with fiery red chutney.',
  },
  juice: {
    side: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
    top: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
    desc: '100% freshly pressed seasonal fruit juice served chilled with zero artificial preservatives.',
  },
  shake: {
    side: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
    top: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
    desc: 'Thick, creamy blend of rich ice cream, whole milk, and decadent flavor syrups.',
  },
  lassi: {
    side: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    top: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
    desc: 'Traditional chilled churned yogurt beverage flavored with cardamom and sweet cream.',
  },
  mojito: {
    side: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    top: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    desc: 'Refreshing muddled mint leaves, zesty lime wedges, sparkling soda, and crushed ice.',
  },
  iceCream: {
    side: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    top: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80',
    desc: 'Velvety artisanal ice cream crafted with fresh dairy and natural flavors.',
  },
  falooda: {
    side: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
    top: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
    desc: 'Royal dessert beverage layered with rose syrup, vermicelli, sabja seeds, chilled milk, and ice cream.',
  },
  default: {
    side: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    top: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    desc: 'Freshly prepared specialty dish crafted with premium ingredients and authentic cafe recipe.',
  },
};

export function getDishImagePair(dish = {}) {
  const name = (dish.name || '').toLowerCase();
  const desc = (dish.description || '').toLowerCase();
  const combined = `${name} ${desc}`;

  let pair = FOOD_IMAGE_PAIRS.default;

  if (combined.includes('omelette') || combined.includes('egg')) pair = FOOD_IMAGE_PAIRS.omelette;
  else if (combined.includes('sandwich')) pair = FOOD_IMAGE_PAIRS.sandwich;
  else if (combined.includes('toast')) pair = FOOD_IMAGE_PAIRS.toast;
  else if (combined.includes('fries') || combined.includes('nugget')) pair = FOOD_IMAGE_PAIRS.fries;
  else if (combined.includes('maggi') || combined.includes('noodle')) pair = FOOD_IMAGE_PAIRS.maggi;
  else if (combined.includes('momo')) pair = FOOD_IMAGE_PAIRS.momos;
  else if (combined.includes('juice') || combined.includes('lime')) pair = FOOD_IMAGE_PAIRS.juice;
  else if (combined.includes('shake')) pair = FOOD_IMAGE_PAIRS.shake;
  else if (combined.includes('lassi')) pair = FOOD_IMAGE_PAIRS.lassi;
  else if (combined.includes('mojito')) pair = FOOD_IMAGE_PAIRS.mojito;
  else if (combined.includes('falooda')) pair = FOOD_IMAGE_PAIRS.falooda;
  else if (combined.includes('ice cream')) pair = FOOD_IMAGE_PAIRS.iceCream;

  const rawTop = dish.topViewImageUrl || dish.top_view_image_url || pair.top;
  const rawSide = dish.sideImageUrl || dish.side_view_image_url || dish.imageUrl || pair.side;
  const rawMain = dish.imageUrl || rawSide || rawTop;
  const topView = resolveImageUrl(rawTop) || rawTop;
  const sideView = resolveImageUrl(rawSide) || rawSide;
  const imageUrl = resolveImageUrl(rawMain) || rawMain;
  const description = dish.description || pair.desc;

  return { topView, sideView, imageUrl, description };
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
        list.push({ key: 'quarter', name: 'Quarter', short: '1/4', price: Number(raw.quarter), imageUrl: resolveImageUrl(portionImages?.quarter) || portionImages?.quarter || null });
      }
      if (raw.half !== undefined && raw.half !== null && Number(raw.half) > 0) {
        list.push({ key: 'half', name: 'Half', short: '1/2', price: Number(raw.half), imageUrl: resolveImageUrl(portionImages?.half) || portionImages?.half || null });
      }
      if (raw.full !== undefined && raw.full !== null && Number(raw.full) > 0) {
        list.push({ key: 'full', name: 'Full', short: 'Full', price: Number(raw.full), imageUrl: resolveImageUrl(portionImages?.full) || portionImages?.full || null });
      }
      if (raw.regular !== undefined && raw.regular !== null && Number(raw.regular) > 0) {
        list.push({ key: 'regular', name: 'Regular', short: 'Regular', price: Number(raw.regular), imageUrl: resolveImageUrl(portionImages?.regular) || portionImages?.regular || null });
      }
      if (raw.special !== undefined && raw.special !== null && Number(raw.special) > 0) {
        list.push({ key: 'special', name: 'Special', short: 'Special', price: Number(raw.special), imageUrl: resolveImageUrl(portionImages?.special) || portionImages?.special || null });
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


function formatPrice(price) {
  if (price === undefined || price === null) return '';
  const num = Number(price);
  if (isNaN(num)) return price;
  return num % 1 === 0 ? `₹${num}` : `₹${num.toFixed(2)}`;
}

export default function DishDetailModal({
  dish,
  initialAngle = 'front',
  initialPortion = null,
  initialPrep = null,
  onClose,
  restaurantSlug = 'anbude-cafe',
}) {
  const portions = useMemo(() => parsePortions(dish), [dish]);
  const prepPrices = useMemo(() => parsePreparationPrices(dish), [dish]);

  const [activeAngle, setActiveAngle] = useState(initialAngle || 'front');
  const [selectedPortionKey, setSelectedPortionKey] = useState(initialPortion || portions?.[0]?.key || null);
  const [selectedStyle, setSelectedStyle] = useState(
    initialPrep || prepPrices?.[0]?.key || (dish?.preparationType === 'gravy' ? 'gravy' : 'dry')
  );
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync angle and options on dish change
  useEffect(() => {
    setActiveAngle(initialAngle || 'front');
    if (initialPortion) setSelectedPortionKey(initialPortion);
    else if (portions && portions.length > 0) setSelectedPortionKey(portions[0].key);
    else setSelectedPortionKey(null);

    if (initialPrep) setSelectedStyle(initialPrep);
    else if (prepPrices && prepPrices.length > 0) setSelectedStyle(prepPrices[0].key);
    else setSelectedStyle(dish?.preparationType === 'gravy' ? 'gravy' : 'dry');
  }, [dish?.id, dish?.name, initialAngle, initialPortion, initialPrep, portions, prepPrices]);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const isZoomOpenRef = useRef(isZoomOpen);
  useEffect(() => {
    isZoomOpenRef.current = isZoomOpen;
  }, [isZoomOpen]);

  // Unified dismissal: cleanly pops modal history if active, otherwise calls onClose
  const handleDismiss = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.state?.modal === 'dish') {
      window.history.back();
    } else {
      onCloseRef.current?.();
    }
  }, []);

  // Safe dismiss for fullscreen zoom modal
  const handleCloseZoom = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.state?.modal === 'zoom') {
      window.history.back();
    } else {
      setIsZoomOpen(false);
      isZoomOpenRef.current = false;
    }
  }, []);

  // URL sync & Mobile hardware/gesture back button support for Dish Detail Modal
  useEffect(() => {
    if (!dish) return;

    const foodItemId = dish.id || dish._id || null;
    trackEvent(restaurantSlug, 'item_view', foodItemId);

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('dish', dish.name || dish.id || dish._id);
      if (activeAngle && activeAngle !== 'front') {
        url.searchParams.set('angle', activeAngle);
      } else {
        url.searchParams.delete('angle');
      }
      const dishIdentifier = dish.name || dish.id;
      if (window.history.state?.modal !== 'dish' || window.history.state?.dish !== dishIdentifier) {
        window.history.pushState(
          { modal: 'dish', dish: dishIdentifier },
          '',
          url.toString()
        );
      }
    } catch (_) {}

    const handlePop = (event) => {
      // If back button was pressed to close the fullscreen zoom modal, do NOT close dish modal
      if (isZoomOpenRef.current) {
        return;
      }
      onCloseRef.current?.();
    };

    window.addEventListener('popstate', handlePop);

    return () => {
      window.removeEventListener('popstate', handlePop);
    };
  }, [dish?.id, dish?._id, dish?.name, restaurantSlug]);

  // Sync angle toggle without polluting history
  useEffect(() => {
    if (!dish || typeof window === 'undefined') return;
    if (window.history.state?.modal === 'dish') {
      try {
        const url = new URL(window.location.href);
        if (activeAngle && activeAngle !== 'front') {
          url.searchParams.set('angle', activeAngle);
        } else {
          url.searchParams.delete('angle');
        }
        window.history.replaceState(window.history.state, '', url.toString());
      } catch (_) {}
    }
  }, [activeAngle, dish]);

  // Mobile hardware/gesture back button support for Image Zoom Modal
  useEffect(() => {
    if (!isZoomOpen) return;
    try {
      if (window.history.state?.modal !== 'zoom') {
        window.history.pushState({ modal: 'zoom' }, '', window.location.href);
      }
    } catch (_) {}

    const handleZoomPop = () => {
      setIsZoomOpen(false);
      isZoomOpenRef.current = false;
    };

    window.addEventListener('popstate', handleZoomPop);

    return () => {
      window.removeEventListener('popstate', handleZoomPop);
    };
  }, [isZoomOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isZoomOpen) {
          handleCloseZoom();
        } else {
          handleDismiss();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomOpen, handleCloseZoom, handleDismiss]);

  if (!dish || !mounted) return null;

  const isVeg = dish.isVeg === true || dish.isVeg === 1 || dish.dietary === 'veg';
  const { topView, sideView, imageUrl: defaultImg, description } = getDishImagePair(dish);

  const activePortion = portions?.find((p) => p.key === selectedPortionKey) || portions?.[0] || null;
  const activePrep = prepPrices?.find((p) => p.key === selectedStyle) || prepPrices?.[0] || null;

  // Only show angle toggle if the images are genuinely distinct
  const hasDistinctAngles = Boolean(
    topView &&
    sideView &&
    topView !== sideView &&
    (dish.topViewImageUrl || (dish.name && (dish.name.includes('Omelette') || dish.name.includes('Sandwich'))))
  );

  let currentImageUrl = defaultImg;
  if (activePortion?.imageUrl) {
    currentImageUrl = activePortion.imageUrl;
  } else if (activeAngle === 'top' && topView) {
    currentImageUrl = topView;
  } else if (sideView) {
    currentImageUrl = sideView;
  }

  // Active price calculation
  let priceDisplay = '';
  if (activePortion) {
    priceDisplay = formatPrice(activePortion.price);
  } else if (activePrep) {
    priceDisplay = formatPrice(activePrep.price);
  } else {
    priceDisplay = formatPrice(dish.price);
  }

  // Spice level
  let spiceLevel = 0;
  if (typeof dish.spicyLevel === 'number') {
    spiceLevel = Math.max(0, Math.min(5, dish.spicyLevel));
  } else if (dish.spicyLevel === 'mild' || dish.spicyLevel === 1) spiceLevel = 1;
  else if (dish.spicyLevel === 'medium' || dish.spicyLevel === 2) spiceLevel = 2;
  else if (dish.spicyLevel === 'hot' || dish.spicyLevel === 'high' || dish.spicyLevel >= 3) spiceLevel = 4;

  // Smart Combo detection
  const isComboDish = Boolean(
    dish.isCombo ||
    dish.categoryName?.toLowerCase().includes('combo') ||
    (dish.name && dish.name.includes('+'))
  );

  // Share dish
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: dish.name,
          text: `Check out ${dish.name} on the menu!`,
          url,
        });
        return;
      } catch (_) {}
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  return createPortal(
    <>
      {/* Dimmed & Frosted Modal Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={handleDismiss}
      >
        {/* Modal Dialog Card */}
        <div
          className="relative w-full max-w-[calc(100vw-32px)] sm:max-w-[460px] bg-[#FFFCF7] rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-[0_25px_70px_rgba(16,27,53,0.35)] border-2 border-[#FFE082]/70 text-[#101B35] animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col my-auto box-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Drag Indicator Bar */}
          <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="w-10 h-1.2 rounded-full bg-white/70 shadow-xs" />
          </div>

          {/* Top Hero Showcase Photo */}
          <div className="relative w-full h-56 sm:h-64 bg-[#F6F3EC] shrink-0 overflow-hidden group">
            <img
              src={currentImageUrl}
              alt={dish.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 cursor-zoom-in"
              onClick={() => setIsZoomOpen(true)}
            />

            {/* Subtle Gradient Overlays for optimal contrast */}
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

            {/* Glassmorphic Tap to Zoom Pill */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="absolute top-3 left-3 sm:left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 hover:bg-black/70 text-white text-[11px] font-bold backdrop-blur-md border border-white/25 transition active:scale-95 shadow-md"
              title="Click to zoom image"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Tap to zoom</span>
            </button>

            {/* Circular Close Button with Glassmorphism */}
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-3 right-3 sm:right-4 z-20 w-9 h-9 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-md border border-white/25 transition active:scale-95 shadow-md"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Bottom-Right Floating Price Badge on Image */}
            <div className="absolute bottom-3 right-3 sm:right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-white/95 backdrop-blur-md border border-[#FFE082] shadow-xl text-[#101B35]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A5700]">Price</span>
              <span className="text-lg sm:text-xl font-black font-sans leading-none text-[#101B35]">
                {priceDisplay}
              </span>
            </div>

            {/* Dual Angle Switcher (Only shown when distinct views exist) */}
            {hasDistinctAngles && !activePortion?.imageUrl && (
              <div
                className="absolute bottom-3 left-3.5 z-20 flex items-center gap-1 rounded-full bg-black/70 p-1 border border-white/20 text-[10.5px] backdrop-blur-md shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setActiveAngle('front')}
                  className={`px-2.5 py-0.5 rounded-full font-bold uppercase transition ${
                    activeAngle === 'front'
                      ? 'bg-[#FFB800] text-[#101B35] shadow-xs'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Front
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAngle('top')}
                  className={`px-2.5 py-0.5 rounded-full font-bold uppercase transition ${
                    activeAngle === 'top'
                      ? 'bg-[#FFB800] text-[#101B35] shadow-xs'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Top View
                </button>
              </div>
            )}

            {/* Active Portion Image Tag */}
            {activePortion?.imageUrl && (
              <div className="absolute bottom-3 left-3.5 z-20 flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1 border border-amber-400/40 text-[11px] font-bold text-amber-200 backdrop-blur-xs">
                <span>📷</span>
                <span>{activePortion.name} Serving ({activePortion.short})</span>
              </div>
            )}
          </div>

          {/* Dish Content Body (Scrollable with smooth padding) */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-left">
            {/* Header: Title & Badges */}
            <div>
              <div className="flex items-start gap-2.5">
                {/* Official Veg / Non-Veg Indicator */}
                <span
                  title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                  className={`w-4.5 h-4.5 mt-1 rounded-xs border-2 flex items-center justify-center shrink-0 bg-white shadow-2xs ${
                    isVeg ? 'border-emerald-600' : 'border-rose-600'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                  />
                </span>

                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-black text-[#101B35] tracking-tight font-sans leading-snug">
                    {dish.name}
                  </h2>
                </div>
              </div>

              {/* Sub-pills: Combo value, Bestseller, Dietary */}
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                {isComboDish ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#FFF5D9] text-[#8A5700] border border-[#FFBB17]/50 shadow-2xs">
                    <span>🍱</span> Combo Value Deal
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF8E7] text-[#92400E] border border-[#FFBB17]/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFBB17]" />
                    Freshly Prepared on Order
                  </span>
                )}

                {dish.isBestseller && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                    ★ Bestseller
                  </span>
                )}
                {dish.isVegan && (
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    🥗 Vegan
                  </span>
                )}
                {dish.isJain && (
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    🪔 Jain
                  </span>
                )}
                {dish.isGlutenFree && (
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                    🌾 Gluten-Free
                  </span>
                )}
              </div>
            </div>

            {/* Spice Level Row when defined */}
            {spiceLevel > 0 && (
              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#FFF8E7] border border-[#FFE3A0]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8A5700]">
                  Spice Level
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <span
                      key={lvl}
                      className={`text-sm transition-opacity ${
                        lvl <= spiceLevel ? 'opacity-100 scale-110' : 'opacity-20 grayscale'
                      }`}
                    >
                      🌶
                    </span>
                  ))}
                  <span className="ml-1 text-[11px] font-bold text-[#A16207]">
                    {spiceLevel === 1 ? 'Mild' : spiceLevel === 2 ? 'Medium' : 'Hot'}
                  </span>
                </div>
              </div>
            )}

            {/* Preparation Style Selector when available */}
            {prepPrices && prepPrices.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-white border-2 border-[#FFE082] shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-[#8A5700] uppercase tracking-wide">
                  <span>Select Preparation Style</span>
                  {activePrep && (
                    <span className="text-[11px] text-[#A16207]">
                      {activePrep.emoji} {activePrep.name}
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
                        className={`py-2 px-2 rounded-xl text-center transition flex flex-col items-center justify-center border cursor-pointer ${
                          isSelected
                            ? 'bg-[#FFF5D9] border-[#FFB800] text-[#8A5700] shadow-xs ring-2 ring-[#FFB800]/40 font-bold'
                            : 'bg-white border-[#E8EAF0] text-[#718096] hover:border-[#FFB800]/50'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{p.emoji}</span>
                          <span className="text-xs font-bold">{p.name}</span>
                        </div>
                        <span className="text-xs font-mono font-extrabold text-[#101B35] mt-0.5">
                          ₹{p.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Portion Pricing Selector (Quarter, Half, Full) */}
            {portions && portions.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-white border-2 border-[#FFE082] shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-[#8A5700] uppercase tracking-wide">
                  <span>Select Portion Size</span>
                  {activePortion && (
                    <span className="text-[11px] text-[#A16207]">
                      Selected: <strong>{activePortion.name}</strong>
                    </span>
                  )}
                </div>
                <div className={`grid gap-2 ${portions.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {portions.map((p) => {
                    const isSelected = p.key === (selectedPortionKey || portions[0]?.key);
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setSelectedPortionKey(p.key)}
                        className={`py-2 px-1.5 rounded-xl text-center transition flex flex-col items-center justify-center border cursor-pointer ${
                          isSelected
                            ? 'bg-[#FFF5D9] border-[#FFB800] text-[#8A5700] shadow-xs ring-2 ring-[#FFB800]/40 font-bold'
                            : 'bg-white border-[#E8EAF0] text-[#718096] hover:border-[#FFB800]/50'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold">{p.name}</span>
                          {p.imageUrl && <span className="text-[10px]" title="Serving photo available">📷</span>}
                        </div>
                        <span className="text-[10px] text-[#718096]">({p.short})</span>
                        <span className="text-xs font-mono font-extrabold text-[#101B35] mt-0.5">
                          ₹{p.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description Section */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8EAF0] shadow-2xs">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A5700] block mb-1.5 font-sans">
                About this dish
              </span>
              <p className="text-xs sm:text-[13px] text-[#4A5568] leading-relaxed font-sans">
                {description}
              </p>
            </div>


            {/* Quality & Freshness Guarantee Card */}
            <div className="p-3 rounded-2xl bg-[#FFFDF7] border border-[#FFE3A0] text-[#714300] shadow-2xs">
              <span className="text-xs font-semibold leading-relaxed font-sans block text-center sm:text-left">
                Made to order with fresh ingredients, signature spices, and strict kitchen hygiene standards.
              </span>
            </div>
          </div>

          {/* Luxury Sticky Action Bar & Close Button Footer */}
          <div className="p-4 sm:p-5 bg-white border-t border-[#E8EAF0] shadow-[0_-4px_16px_rgba(24,34,56,0.04)] shrink-0 flex items-center justify-between gap-3">
            {/* Share Dish Button */}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl border-2 border-[#FFE082] bg-[#FFFDF9] hover:bg-[#FFF5D9] px-4 py-3 text-xs font-bold text-[#8A5700] transition active:scale-95 shrink-0 shadow-xs"
              title="Share dish"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
                  <span className="text-emerald-700 font-extrabold">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 stroke-[2.2]" />
                  <span>Share</span>
                </>
              )}
            </button>

            {/* Primary Action Button: Back to Menu */}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-5 rounded-2xl bg-[#101B35] hover:bg-[#FFB800] text-white hover:text-[#101B35] text-xs sm:text-sm font-extrabold transition-all duration-200 active:scale-98 shadow-md flex items-center justify-center gap-2 group font-sans"
            >
              <span>Back to Menu</span>
              <span className="text-[#FFB800] group-hover:text-[#101B35] transition-colors">✕</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Zoom Modal */}
      {isZoomOpen && currentImageUrl && (
        <DishImageZoomModal
          isOpen={isZoomOpen}
          onClose={handleCloseZoom}
          imageUrl={currentImageUrl}
          dishName={dish.name}
          subtitle={
            activePortion?.imageUrl
              ? `${activePortion.name} Serving (${activePortion.short})`
              : activeAngle === 'top'
              ? 'Top Overhead View'
              : 'Front View'
          }
        />
      )}
    </>,
    document.body
  );
}
