'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { trackEvent } from '../../../utils/analytics';
import {
  Search,
  MapPin,
  Sparkles,
  Flame,
  Clock,
  UtensilsCrossed,
  X,
  AlertTriangle,
  ChevronRight,
  Share2,
  Check,
  Leaf,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_URL}${url}`;
  return url;
}

// ─────────────────────────────────────────────
// Skeleton loaders
// ─────────────────────────────────────────────

function SkeletonBar({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 mb-3 shadow-xs border border-slate-100">
      <div className="flex gap-3.5">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <SkeletonBar className="w-3.5 h-3.5 rounded-xs" />
            <SkeletonBar className="h-4 w-2/3" />
          </div>
          <SkeletonBar className="h-3 w-1/4" />
          <SkeletonBar className="h-3 w-full" />
          <SkeletonBar className="h-3 w-3/4" />
          <div className="flex gap-2 pt-2">
            <SkeletonBar className="h-5 w-16 rounded-full" />
            <SkeletonBar className="h-5 w-12 rounded-full" />
          </div>
        </div>
        <SkeletonBar className="w-24 h-24 rounded-2xl flex-shrink-0" />
      </div>
    </div>
  );
}

function SkeletonHeader() {
  return (
    <div className="bg-white px-5 pt-12 pb-6 text-center border-b border-slate-100">
      <SkeletonBar className="h-20 w-20 rounded-3xl mx-auto mb-4" />
      <SkeletonBar className="h-7 w-48 mx-auto mb-2" />
      <SkeletonBar className="h-4 w-32 mx-auto mb-2" />
      <SkeletonBar className="h-3 w-56 mx-auto" />
    </div>
  );
}

function SkeletonPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SkeletonHeader />
      <div className="h-14 bg-white border-b border-slate-100 flex items-center px-4 gap-2.5">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBar key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
        ))}
      </div>
      <div className="px-4 pt-4 pb-20 max-w-2xl mx-auto">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Veg / Non-veg FSSAI indicator square
// ─────────────────────────────────────────────

function VegIndicator({ isVeg }) {
  const isVegetarian = isVeg !== false;
  return (
    <span
      className={`w-3.5 h-3.5 rounded-sm border-2 flex-shrink-0 flex items-center justify-center mt-0.5 ${
        isVegetarian ? 'border-emerald-600' : 'border-rose-600'
      }`}
      title={isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isVegetarian ? 'bg-emerald-600' : 'bg-rose-600'
        }`}
      />
    </span>
  );
}

// ─────────────────────────────────────────────
// Dietary badge tags
// ─────────────────────────────────────────────

function DietaryBadge({ label, emoji, color }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${color}`}
    >
      {emoji && <span>{emoji}</span>}
      <span>{label}</span>
    </span>
  );
}

function DietaryTags({ item }) {
  const tags = [];
  if (item.spicyLevel === 1 || item.spicyLevel === 'mild') {
    tags.push({ emoji: '🌶', label: 'Mild', color: 'bg-orange-50 text-orange-700 border border-orange-200/60' });
  } else if (item.spicyLevel === 2 || item.spicyLevel === 'medium') {
    tags.push({ emoji: '🌶🌶', label: 'Spicy', color: 'bg-rose-50 text-rose-700 border border-rose-200/60' });
  } else if (item.spicyLevel >= 3 || item.spicyLevel === 'hot') {
    tags.push({ emoji: '🌶🌶🌶', label: 'Extra Spicy', color: 'bg-red-100 text-red-800 font-black' });
  }

  if (item.isJain) tags.push({ emoji: '🪔', label: 'Jain', color: 'bg-purple-50 text-purple-700 border border-purple-200/60' });
  if (item.isVegan) tags.push({ emoji: '🥗', label: 'Vegan', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' });
  if (item.isGlutenFree) tags.push({ emoji: '🌾', label: 'Gluten-Free', color: 'bg-amber-50 text-amber-800 border border-amber-200/60' });

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <DietaryBadge key={t.label} {...t} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Food Item Card
// ─────────────────────────────────────────────

function FoodItemCard({ item, onSelect }) {
  const isUnavailable = !item.isAvailable;
  const isVeg = item.isVeg !== false && item.foodType !== 'non-veg';

  return (
    <div
      className={`bg-white rounded-3xl p-4 mb-3.5 shadow-xs border border-slate-200/80 cursor-pointer active:scale-[0.99] transition-all hover:shadow-md hover:border-orange-200 ${
        isUnavailable ? 'opacity-65 bg-slate-50/80' : ''
      }`}
      onClick={() => onSelect(item)}
    >
      <div className="flex gap-3.5">
        {/* Left content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Indicator + Dish Name */}
            <div className="flex items-start gap-2 mb-1">
              <VegIndicator isVeg={isVeg} />
              <div className="flex-1 min-w-0">
                <h3 className={`text-base font-bold tracking-tight leading-snug ${
                  isUnavailable ? 'text-slate-500' : 'text-slate-900'
                }`}>
                  {item.name}
                </h3>
              </div>
            </div>

            {/* Price in INR */}
            <p className="text-base font-black text-slate-900 ml-5">
              ₹{item.price}
            </p>

            {/* Description */}
            {item.description && (
              <p className="text-xs text-slate-500 ml-5 mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          {/* Bottom row: availability + tags */}
          <div className="flex items-center gap-2 mt-3 ml-5 flex-wrap">
            {isUnavailable ? (
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/60">
                Sold Out
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Available
              </span>
            )}
            <DietaryTags item={item} />
          </div>
        </div>

        {/* Right: food image */}
        {item.imageUrl && (
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200/80 relative">
            <img
              src={resolveImageUrl(item.imageUrl)}
              alt={item.name}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.parentElement.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Bottom Sheet (dish detail modal)
// ─────────────────────────────────────────────

function ItemBottomSheet({ item, onClose }) {
  const overlayRef = useRef(null);

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const isUnavailable = !item.isAvailable;
  const isVeg = item.isVeg !== false && item.foodType !== 'non-veg';

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-xs fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg mx-auto bg-white rounded-t-3xl slide-up max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Full Image */}
        {item.imageUrl && (
          <div className="w-full h-64 bg-slate-100 overflow-hidden relative">
            <img
              src={resolveImageUrl(item.imageUrl)}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
            />
          </div>
        )}

        <div className="p-6 pb-10 space-y-5">
          {/* Header row */}
          <div>
            <div className="flex items-start gap-2.5 mb-1.5">
              <VegIndicator isVeg={isVeg} />
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {item.name}
                </h2>
                {item.categoryName && (
                  <p className="text-xs font-semibold text-orange-600 mt-1">{item.categoryName}</p>
                )}
              </div>
              <span className="text-2xl font-black text-slate-900 flex-shrink-0">
                ₹{item.price}
              </span>
            </div>

            {/* Availability */}
            <div className="mt-2.5 flex items-center gap-2">
              {isUnavailable ? (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  Currently Sold Out
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />
                  Available to Order
                </span>
              )}
            </div>
          </div>

          {/* Dietary tags */}
          <div>
            <DietaryTags item={item} />
          </div>

          {/* Description */}
          {item.description && (
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">About this dish</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* Quick Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {item.portionSize && (
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Portion</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block truncate">{item.portionSize}</span>
              </div>
            )}
            {item.prepTime && (
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prep Time</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block truncate">{item.prepTime}</span>
              </div>
            )}
            {item.calories && (
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Calories</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block font-mono">{item.calories} kcal</span>
              </div>
            )}
            {item.spicyLevel !== undefined && item.spicyLevel !== 0 && (
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Spice Level</span>
                <span className="text-xs font-bold text-orange-600 mt-0.5 block">
                  {item.spicyLevel === 1 ? '🌶 Mild' : item.spicyLevel === 2 ? '🌶🌶 Medium' : '🌶🌶🌶 Hot'}
                </span>
              </div>
            )}
          </div>

          {/* Ingredients */}
          {item.ingredients && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Ingredients</h3>
              <div className="flex flex-wrap gap-1.5">
                {(typeof item.ingredients === 'string'
                  ? item.ingredients.split(',').map((s) => s.trim()).filter(Boolean)
                  : Array.isArray(item.ingredients) ? item.ingredients : []
                ).map((ing, i) => (
                  <span key={i} className="text-xs bg-slate-100 text-slate-700 font-medium px-3 py-1 rounded-xl">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergens Warning */}
          {item.allergens && (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900">Allergen Information</p>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">{item.allergens}</p>
              </div>
            </div>
          )}

          {/* Spices */}
          {item.spices && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Signature Spices</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.spices}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Category Navigation Pill Bar
// ─────────────────────────────────────────────

function CategoryNav({ categories, activeCategory, onSelect }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    const active = scrollRef.current.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategory]);

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2.5 max-w-2xl mx-auto"
      >
        {/* "All" pill */}
        <button
          data-active={activeCategory === 'all'}
          onClick={() => onSelect('all')}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeCategory === 'all'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Dishes
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id || cat.name}
            data-active={activeCategory === (cat.id || cat.name)}
            onClick={() => onSelect(cat.id || cat.name)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === (cat.id || cat.name)
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Restaurant Header
// ─────────────────────────────────────────────

function RestaurantHeader({ restaurant }) {
  return (
    <div className="bg-gradient-to-b from-orange-50/70 via-white to-white relative pb-6 pt-8 px-5 text-center border-b border-slate-100">
      {/* Renza badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-4">
        <Sparkles className="w-3 h-3 text-orange-500" />
        Digital Dining Menu
      </div>

      {/* Restaurant logo */}
      {restaurant.logoUrl ? (
        <img
          src={resolveImageUrl(restaurant.logoUrl)}
          alt={restaurant.name}
          className="w-20 h-20 rounded-3xl object-cover mx-auto mb-3.5 shadow-md border-2 border-white"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-500 mx-auto mb-3.5 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-3xl">
          {restaurant.name?.charAt(0) || 'R'}
        </div>
      )}

      {/* Restaurant name */}
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 leading-tight tracking-tight">
        {restaurant.name}
      </h1>

      {/* Cuisine */}
      {restaurant.cuisineType && (
        <p className="text-xs font-bold text-orange-600 mb-1.5">
          ★ {restaurant.cuisineType}
        </p>
      )}

      {/* Address */}
      {restaurant.address && (
        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed flex items-center justify-center gap-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span>{restaurant.address}</span>
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Error states
// ─────────────────────────────────────────────

function NotFoundState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-slate-950 text-white text-center">
      <div className="w-16 h-16 rounded-3xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-4">
        <UtensilsCrossed className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold mb-2">Restaurant Not Found</h2>
      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
        We couldn&apos;t locate this restaurant. Please double check the QR code or request assistance from your server.
      </p>
    </div>
  );
}

function SuspendedState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-slate-950 text-white text-center">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
        <UtensilsCrossed className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold mb-2">Menu Temporarily Unavailable</h2>
      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
        This menu is currently offline. Please request a physical menu card from your server.
      </p>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-slate-50 text-slate-900 text-center">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 mb-4">
        <UtensilsCrossed className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold mb-2">Connection Issue</h2>
      <p className="text-xs text-slate-500 max-w-xs mb-6">
        Could not connect to the dining network. Check your phone signal and tap below to retry.
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-500/20"
      >
        Retry Loading Menu
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Helpers — group and build category list
// ─────────────────────────────────────────────

function groupItemsByCategory(items, categories = []) {
  const groups = {};
  const order = [];

  if (Array.isArray(categories)) {
    for (const cat of categories) {
      const catId = cat.id || cat._id;
      groups[catId] = { id: catId, name: cat.name, items: [] };
      order.push(catId);
    }
  }

  for (const item of items) {
    const catId = item.categoryId || item.category?.id || item.categoryName || 'Other';
    const catName = item.category?.name || item.categoryName || 'Other';
    if (!groups[catId]) {
      groups[catId] = { id: catId, name: catName, items: [] };
      order.push(catId);
    }
    groups[catId].items.push({
      ...item,
      categoryName: item.categoryName || item.category?.name || catName,
    });
  }

  return order.map((k) => groups[k]).filter((g) => g && g.items && g.items.length > 0);
}

// ─────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────

export default function MenuPage({ params }) {
  const { slug } = params;

  const [state, setState] = useState('loading');
  const [restaurant, setRestaurant] = useState(null);
  const [categoryGroups, setCategoryGroups] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('all'); // all | veg | non-veg | spicy
  const sectionRefs = useRef({});

  const fetchMenu = useCallback(async () => {
    setState('loading');
    try {
      const res = await fetch(`${API_URL}/api/menu/${slug}`);
      if (res.status === 404) {
        setState('notfound');
        return;
      }
      if (!res.ok) {
        setState('error');
        return;
      }
      const data = await res.json();

      if (data.restaurant?.status === 'suspended' || data.suspended) {
        setState('suspended');
        return;
      }

      setRestaurant(data.restaurant || data);

      let items = data.foodItems || data.items || data.menuItems || [];
      if (items.length === 0 && data.categories && Array.isArray(data.categories)) {
        items = data.categories.flatMap((cat) =>
          (cat.items || cat.foodItems || []).map((item) => ({
            ...item,
            categoryId: cat.id || cat._id,
            categoryName: item.categoryName || cat.name,
          }))
        );
      }

      const groups = groupItemsByCategory(items, data.categories || []);
      setCategoryGroups(groups);
      setState('ready');
    } catch (err) {
      setState('error');
    }
  }, [slug]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Non-blocking analytics
  useEffect(() => {
    if (state !== 'ready') return;
    trackEvent(slug, 'qr_scan');
    trackEvent(slug, 'menu_view');
  }, [slug, state]);

  // Intersection observer for sticky category tracking
  useEffect(() => {
    if (state !== 'ready' || categoryGroups.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.dataset.categoryId);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [state, categoryGroups]);

  const handleCategorySelect = (catId) => {
    if (catId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveCategory('all');
      return;
    }
    setActiveCategory(catId);
    const el = sectionRefs.current[catId];
    if (el) {
      const navHeight = 52;
      const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    trackEvent(slug, 'item_view', item.id || item._id);
  };

  if (state === 'loading') return <SkeletonPage />;
  if (state === 'notfound') return <NotFoundState />;
  if (state === 'suspended') return <SuspendedState />;
  if (state === 'error') return <ErrorState onRetry={fetchMenu} />;

  const allCategories = categoryGroups.map((g) => ({ id: g.id, name: g.name }));

  // Filter items based on search and dietary choice
  const filteredGroups = categoryGroups.map((group) => {
    const items = group.items.filter((item) => {
      const matchesSearch = searchQuery
        ? item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.ingredients?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const isVeg = item.isVeg !== false && item.foodType !== 'non-veg';
      const matchesDiet =
        dietaryFilter === 'all'
          ? true
          : dietaryFilter === 'veg'
          ? isVeg
          : dietaryFilter === 'non-veg'
          ? !isVeg
          : dietaryFilter === 'spicy'
          ? item.spicyLevel > 0
          : true;

      return matchesSearch && matchesDiet;
    });

    return { ...group, items };
  }).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-500 selection:text-white">
      {/* Restaurant Header */}
      <RestaurantHeader restaurant={restaurant} />

      {/* Search & Dietary Filters Container */}
      <div className="bg-white px-4 pt-3 pb-3 border-b border-slate-100 max-w-2xl mx-auto space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes or ingredients..."
            className="w-full pl-10 pr-8 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dietary Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
          {[
            { id: 'all', label: 'All' },
            { id: 'veg', label: '🌱 Pure Veg' },
            { id: 'non-veg', label: '🍗 Non-Veg' },
            { id: 'spicy', label: '🌶 Spicy' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setDietaryFilter(id)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                dietaryFilter === id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Sticky Category Navigation */}
      <CategoryNav
        categories={allCategories}
        activeCategory={activeCategory}
        onSelect={handleCategorySelect}
      />

      {/* Menu sections */}
      <main className="px-4 pt-3 pb-24 max-w-2xl mx-auto">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-16">
            <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No dishes match your filter</h3>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or dietary filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setDietaryFilter('all'); }}
              className="mt-3 px-4 py-1.5 bg-orange-500 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <section
              key={group.id}
              ref={(el) => { sectionRefs.current[group.id] = el; }}
              data-category-id={group.id}
              className="mt-6 first:mt-3"
            >
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  {group.name}
                </h2>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                  {group.items.length}
                </span>
                <div className="flex-1 h-px bg-slate-200/80 ml-2" />
              </div>

              {/* Items */}
              {group.items.map((item) => (
                <FoodItemCard
                  key={item.id || item._id || item.name}
                  item={item}
                  onSelect={handleItemSelect}
                />
              ))}
            </section>
          ))
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 py-2.5 text-center z-20 shadow-xs">
        <p className="text-[11px] text-slate-400">
          Powered by{' '}
          <span className="text-orange-500 font-bold">Renza</span>
          {' '}· Digital Menu Platform
        </p>
      </footer>

      {/* Item Detail Bottom Sheet */}
      {selectedItem && (
        <ItemBottomSheet
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
