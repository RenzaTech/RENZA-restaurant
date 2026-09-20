'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
const FILTER_IDS = ['veg', 'vegan', 'jain', 'gluten-free', 'available'];

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
  return <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-900"><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-500"><UtensilsCrossed className="h-8 w-8" /></div><h2 className="mb-2 text-xl font-bold">Connection Issue</h2><p className="mb-6 max-w-xs text-xs text-slate-500">Could not connect to the dining network. Check your phone signal and tap below to retry.</p><button onClick={onRetry} className="min-h-11 rounded-xl bg-orange-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">Retry Loading Menu</button></div>;
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
    trackEvent(slug, 'qr_scan');
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

  const handleItemSelect = (item, triggerElement) => {
    triggerCardRef.current = triggerElement;
    setSelectedItem(item);
    const url = new URL(window.location.href);
    url.searchParams.set('dish', item.id || item._id);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const handleToggleFilter = (filterId) => {
    setActiveFilters((current) => current.includes(filterId) ? current.filter((filter) => filter !== filterId) : [...current, filterId]);
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

  if (state === 'loading') return <SkeletonPage />;
  if (state === 'notfound') return <NotFoundState />;
  if (state === 'suspended') return <SuspendedState />;
  if (state === 'error') return <ErrorState onRetry={fetchMenu} />;

  const allCategories = categoryGroups.map((g) => ({ id: g.id, name: g.name }));

  // Filter items based on search and dietary choice
  const filteredGroups = categoryGroups.map((group) => {
    const items = group.items.filter((item) => {
      const normalizedIngredients = Array.isArray(item.ingredients) ? item.ingredients.join(' ') : item.ingredients || '';
      const matchesSearch = debouncedSearch
        ? item.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          item.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          normalizedIngredients.toLowerCase().includes(debouncedSearch.toLowerCase())
        : true;

      const isVeg = item.isVeg !== false && item.foodType !== 'non-veg';
      const matchesDiet = activeFilters.every((filter) => {
        if (filter === 'veg') return isVeg;
        if (filter === 'vegan') return item.isVegan;
        if (filter === 'jain') return item.isJain;
        if (filter === 'gluten-free') return item.isGlutenFree;
        if (filter === 'available') return item.isAvailable;
        return true;
      });

      return matchesSearch && matchesDiet;
    });

    return { ...group, items };
  }).filter((g) => g.items.length > 0);

  const resultCount = filteredGroups.reduce((total, group) => total + group.items.length, 0);
  const emptyVariant = categoryGroups.length === 0 ? 'category' : 'search';
  let cardIndex = 0;

  return (
    <div className="min-h-screen bg-[#05070b] font-sans text-slate-50 selection:bg-amber-300 selection:text-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(217,179,108,0.06),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.04),_transparent_24%)]" aria-hidden="true" />
      <MenuHero restaurant={restaurant} resolveImageUrl={resolveImageUrl} onSearch={() => searchInputRef.current?.focus()} />
      <div className="border-b border-white/10 bg-[#0a1018]/80 backdrop-blur-xl">
        <SearchBar ref={searchInputRef} searchQuery={searchQuery} setSearchQuery={setSearchQuery} activeFilters={activeFilters} onToggleFilter={handleToggleFilter} onClearAll={handleClearAll} resultCount={resultCount} />
      </div>
      <CategoryRail categories={allCategories} activeCategory={activeCategory} onSelect={handleCategorySelect} onActiveChange={setActiveCategory} />

      <main className="relative mx-auto max-w-[1280px] space-y-14 px-4 pb-24 pt-8 sm:px-6 lg:space-y-20">
        {filteredGroups.length === 0 ? <div className="md:col-span-2 xl:col-span-3"><EmptyState variant={emptyVariant} onReset={handleClearAll} /></div> : filteredGroups.map((group) => (
          <section key={group.id} ref={(el) => { sectionRefs.current[group.id] = el; }} data-category-id={group.id} className="[contain-intrinsic-size:0_480px] [content-visibility:auto]">
            <div className="mb-6 flex items-end gap-4 px-1">
              <div>
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.28em] text-amber-200/70">The menu</p>
                <h2 className="font-display text-3xl leading-none tracking-[-0.04em] text-white sm:text-4xl">{group.name}</h2>
              </div>
              <span className="mb-0.5 rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">{group.items.length}</span>
              <div className="mb-2 ml-1 h-px flex-1 bg-gradient-to-r from-amber-200/25 via-white/10 to-transparent" />
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{group.items.map((item) => <DishCard key={item.id || item._id || item.name} item={item} priority={cardIndex++ < 4} onSelect={handleItemSelect} resolveImageUrl={resolveImageUrl} />)}</div>
          </section>
        ))}
      </main>

      {selectedItem && <DishSheet item={selectedItem} onClose={handleSheetClose} resolveImageUrl={resolveImageUrl} triggerRef={triggerCardRef} />}
    </div>
  );
}
