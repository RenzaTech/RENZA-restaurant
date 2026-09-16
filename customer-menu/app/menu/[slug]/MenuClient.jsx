'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { trackEvent } from '../../../utils/analytics';
import MenuHero from '../../../components/MenuHero';
import CategoryRail from '../../../components/CategoryRail';
import SearchBar from '../../../components/SearchBar';
import DishCard from '../../../components/DishCard';
import DishSheet from '../../../components/DishSheet';
import EmptyState from '../../../components/EmptyState';
import { SkeletonPage } from '../../../components/Skeletons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const FILTER_IDS = ['veg', 'non-veg', 'vegan', 'jain', 'gluten-free', 'available'];

function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_URL}${url}`;
  return url;
}

function NotFoundState() {
  return <EmptyState variant="notFound" />;
}

function SuspendedState() {
  return <EmptyState variant="suspended" />;
}

function ErrorState({ onRetry }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-renza-cream px-6 text-center text-renza-ink">
      <div className="mx-auto max-w-sm rounded-3xl border border-white/80 bg-white/75 p-8 text-center shadow-glass backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-600 shadow-glow">
          <UtensilsCrossed className="h-8 w-8" />
        </div>
        <h2 className="mb-2 font-serif text-2xl font-bold tracking-tight text-renza-ink">Connection Issue</h2>
        <p className="mb-6 text-xs leading-relaxed text-renza-charcoal/70">
          Could not connect to the dining network. Check your phone signal and tap below to retry.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 rounded-full bg-gradient-to-r from-renza-gold to-amber-600 px-6 py-2.5 text-xs font-bold text-renza-ink shadow-gold transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-renza-gold focus:ring-offset-2 active:scale-95"
        >
          Retry Loading Menu
        </button>
      </div>
    </div>
  );
}

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

export default function MenuPage({ params }) {
  const { slug } = params;

  const [state, setState] = useState('loading');
  const [restaurant, setRestaurant] = useState(null);
  const [categoryGroups, setCategoryGroups] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [urlReady, setUrlReady] = useState(false);
  const sectionRefs = useRef({});
  const searchInputRef = useRef(null);
  const triggerCardRef = useRef(null);
  const trackedItemRef = useRef(null);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const restoredFilters = (url.searchParams.get('filters') || '').split(',').filter((filter) => FILTER_IDS.includes(filter));
    setSearchQuery(url.searchParams.get('q') || '');
    setActiveFilters(restoredFilters);
    setUrlReady(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!urlReady) return;
    const url = new URL(window.location.href);
    if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
    else url.searchParams.delete('q');
    if (activeFilters.length > 0) url.searchParams.set('filters', activeFilters.join(','));
    else url.searchParams.delete('filters');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, [activeFilters, searchQuery, urlReady]);

  const fetchMenu = useCallback(async () => {
    setState('loading');
    try {
      const res = await fetch(`${API_URL}/api/menu/${slug}`);
      if (res.status === 404) {
        setState('notfound');
        return;
      }
      if (res.status === 403) {
        setState('suspended');
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
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const isFromQr = searchParams.get('source') === 'qr' || searchParams.get('src') === 'qr';

      if (isFromQr) {
        const scanKey = `renza_scanned_${slug}`;
        if (!sessionStorage.getItem(scanKey)) {
          sessionStorage.setItem(scanKey, 'true');
          trackEvent(slug, 'qr_scan');
        }
      }
    } catch {
      // Ignore browser storage restrictions
    }

    trackEvent(slug, 'menu_view');
  }, [slug, state]);

  useEffect(() => {
    if (state !== 'ready' || selectedItem) return;
    const deepLinkedId = new URLSearchParams(window.location.search).get('dish');
    if (!deepLinkedId) return;
    const deepLinkedItem = categoryGroups.flatMap((group) => group.items).find((item) => String(item.id || item._id) === deepLinkedId);
    if (deepLinkedItem) setSelectedItem(deepLinkedItem);
  }, [categoryGroups, selectedItem, state]);

  useEffect(() => {
    if (!selectedItem) {
      trackedItemRef.current = null;
      return;
    }
    const itemId = selectedItem.id || selectedItem._id;
    const trackingKey = String(itemId || selectedItem.name);
    if (trackedItemRef.current === trackingKey) return;
    trackedItemRef.current = trackingKey;
    trackEvent(slug, 'item_view', itemId);
  }, [selectedItem, slug]);

  const handleCategorySelect = (catId) => {
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    isProgrammaticScroll.current = true;
    setActiveCategory(catId);

    if (catId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = sectionRefs.current[catId] || document.querySelector(`[data-category-id="${catId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 700);
  };

  const handleActiveCategoryChange = useCallback((catId) => {
    if (isProgrammaticScroll.current) return;
    setActiveCategory((prev) => (prev === catId ? prev : catId));
  }, []);

  const handleItemSelect = (item, triggerElement) => {
    triggerCardRef.current = triggerElement;
    setSelectedItem(item);
    const url = new URL(window.location.href);
    url.searchParams.set('dish', item.id || item._id);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const handleToggleFilter = (filterId) => {
    setActiveFilters((current) => {
      let next = current.includes(filterId)
        ? current.filter((filter) => filter !== filterId)
        : [...current, filterId];

      if (filterId === 'veg' && next.includes('veg')) {
        next = next.filter((f) => f !== 'non-veg');
      } else if (filterId === 'non-veg' && next.includes('non-veg')) {
        next = next.filter((f) => f !== 'veg');
      }
      return next;
    });
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setActiveFilters([]);
  };

  const handleSheetClose = useCallback(() => {
    setSelectedItem(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('dish');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    const triggerElement = triggerCardRef.current;
    triggerCardRef.current = null;
    requestAnimationFrame(() => triggerElement?.focus());
  }, []);

  // Filter items based on search and dietary choice
  const filteredGroups = useMemo(() => {
    return categoryGroups.map((group) => {
      const items = group.items.filter((item) => {
        const normalizedIngredients = Array.isArray(item.ingredients) ? item.ingredients.join(' ') : item.ingredients || '';
        const matchesSearch = debouncedSearch
          ? item.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            item.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            group.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            item.categoryName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            item.category?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            (typeof item.specialTags === 'string' && item.specialTags.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
            normalizedIngredients.toLowerCase().includes(debouncedSearch.toLowerCase())
          : true;

        const isVeg =
          item.isVeg === true ||
          item.isVeg === 'true' ||
          item.foodType === 'veg' ||
          item.isVegan === true ||
          item.isVegan === 'true' ||
          item.isJain === true ||
          item.isJain === 'true';

        const isVegan =
          item.isVegan === true ||
          item.isVegan === 'true' ||
          (typeof item.specialTags === 'string' && /vegan/i.test(item.specialTags));

        const isJain =
          item.isJain === true ||
          item.isJain === 'true' ||
          (typeof item.specialTags === 'string' && /jain/i.test(item.specialTags));

        const isGlutenFree =
          item.isGlutenFree === true ||
          item.isGlutenFree === 'true' ||
          (typeof item.specialTags === 'string' && /gluten[- ]?free/i.test(item.specialTags)) ||
          (typeof item.allergens === 'string' && /gluten[- ]?free/i.test(item.allergens));

        const isAvailable = item.isAvailable === true || item.isAvailable === 'true' || item.isAvailable === undefined;

        const matchesDiet = activeFilters.every((filter) => {
          if (filter === 'veg') return isVeg;
          if (filter === 'non-veg') return !isVeg;
          if (filter === 'vegan') return isVegan;
          if (filter === 'jain') return isJain;
          if (filter === 'gluten-free') return isGlutenFree;
          if (filter === 'available') return isAvailable;
          return true;
        });

        return matchesSearch && matchesDiet;
      });

      return { ...group, items };
    }).filter((g) => g.items.length > 0);
  }, [categoryGroups, debouncedSearch, activeFilters]);

  const allCategories = useMemo(
    () => filteredGroups.map((g) => ({ id: g.id, name: g.name })),
    [filteredGroups]
  );

  if (state === 'loading') return <SkeletonPage />;
  if (state === 'notfound') return <NotFoundState />;
  if (state === 'suspended') return <SuspendedState />;
  if (state === 'error') return <ErrorState onRetry={fetchMenu} />;

  const resultCount = filteredGroups.reduce((total, group) => total + group.items.length, 0);
  const emptyVariant = categoryGroups.length === 0 ? 'category' : 'search';
  let cardIndex = 0;

  return (
    <div className="min-h-screen bg-renza-cream font-sans selection:bg-renza-gold selection:text-renza-ink">
      <MenuHero restaurant={restaurant} resolveImageUrl={resolveImageUrl} onSearch={() => searchInputRef.current?.focus()} />
      <div className="border-b border-renza-ink/10 bg-renza-cream/80">
        <SearchBar ref={searchInputRef} searchQuery={searchQuery} setSearchQuery={setSearchQuery} activeFilters={activeFilters} onToggleFilter={handleToggleFilter} onClearAll={handleClearAll} resultCount={resultCount} />
      </div>
      <CategoryRail categories={allCategories} activeCategory={activeCategory} onSelect={handleCategorySelect} onActiveChange={handleActiveCategoryChange} />

      <main className="mx-auto max-w-[1200px] space-y-8 px-4 pb-24 pt-4 sm:space-y-10 sm:pt-6">
        {filteredGroups.length === 0 ? (
          <EmptyState variant={emptyVariant} onReset={handleClearAll} />
        ) : (
          filteredGroups.map((group) => (
            <section
              key={group.id}
              ref={(el) => { sectionRefs.current[group.id] = el; }}
              data-category-id={group.id}
              className="scroll-mt-28"
            >
              <div className="mb-3.5 flex items-center gap-2.5">
                <h2 className="font-serif text-xl font-bold tracking-tight text-renza-ink sm:text-2xl">
                  {group.name}
                </h2>
                <span className="flex h-5 items-center justify-center rounded-full bg-renza-gold/20 px-2 text-[11px] font-bold text-amber-700">
                  {group.items.length}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-renza-gold/40 via-renza-gold/20 to-transparent" />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <DishCard
                    key={item.id || item._id || item.name}
                    item={item}
                    priority={cardIndex++ < 4}
                    onSelect={handleItemSelect}
                    resolveImageUrl={resolveImageUrl}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {selectedItem && <DishSheet item={selectedItem} onClose={handleSheetClose} resolveImageUrl={resolveImageUrl} triggerRef={triggerCardRef} />}
    </div>
  );
}
