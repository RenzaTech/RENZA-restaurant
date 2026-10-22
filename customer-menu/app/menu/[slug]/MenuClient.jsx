'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { trackEvent } from '../../../utils/analytics';
import MenuHero from '../../../components/MenuHero';
import { DietaryFilters } from '../../../components/SearchBar';
import CategoryRail from '../../../components/CategoryRail';
import DishCard from '../../../components/DishCard';
import DishSheet from '../../../components/DishSheet';
import ReviewSection from '../../../components/ReviewSection';
import Footer from '../../../components/Footer';
import EmptyState from '../../../components/EmptyState';
import RateUsModal from '../../../components/RateUsModal';
import { SkeletonPage } from '../../../components/Skeletons';
import SplashScreen from '../../../components/SplashScreen';
import SearchSuggestions from '../../../components/SearchSuggestions';
import fallbackMenuData from '../../../data/anbude-cafe-menu.json';

function getApiUrl() {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  if (typeof window === 'undefined') return envUrl;
  const { hostname, protocol } = window.location;
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    if (envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      return `${protocol}//${hostname}:5000`;
    }
  }
  return envUrl;
}

const FILTER_IDS = ['veg', 'non-veg', 'vegan', 'jain', 'gluten-free', 'available'];

function resolveImageUrl(url) {
  if (!url) return null;
  const apiUrl = getApiUrl();
  let resolved = url;
  if (typeof resolved === 'string' && (resolved.includes('localhost:5000') || resolved.includes('127.0.0.1:5000'))) {
    resolved = resolved.replace(/https?:\/\/(localhost|127\.0\.0\.1):5000/, apiUrl);
  }
  if (resolved.startsWith('http://') || resolved.startsWith('https://')) return resolved;
  if (resolved.startsWith('/')) return `${apiUrl}${resolved}`;
  return resolved;
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

export default function MenuClient({ params }) {
  const { slug } = params;

  const [state, setState] = useState('loading');
  const [restaurant, setRestaurant] = useState(null);
  const [diningTable, setDiningTable] = useState(null);
  const [categoryGroups, setCategoryGroups] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedAngle, setSelectedAngle] = useState('front');
  const [selectedPortionOption, setSelectedPortionOption] = useState(null);
  const [selectedPrepOption, setSelectedPrepOption] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [urlReady, setUrlReady] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);

  const sectionRefs = useRef({});
  const searchInputRef = useRef(null);
  const stickySearchInputRef = useRef(null);
  const triggerCardRef = useRef(null);
  const trackedItemRef = useRef(null);
  const heroRef = useRef(null);

  const [heroVisible, setHeroVisible] = useState(true);

  // Search suggestions (autocomplete dropdown)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const suggestionsRef = useRef(null);  // wraps sticky bar for click-outside detection

  // Restore query params from URL
  useEffect(() => {
    const url = new URL(window.location.href);
    const restoredFilters = (url.searchParams.get('filters') || '')
      .split(',')
      .filter((filter) => FILTER_IDS.includes(filter));
    setSearchQuery(url.searchParams.get('q') || '');
    setActiveFilters(restoredFilters);
    setSortBy(url.searchParams.get('sort') || 'default');
    setUrlReady(true);
  }, []);

  // Sync state back to URL
  useEffect(() => {
    if (!urlReady) return;
    const url = new URL(window.location.href);
    if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());
    else url.searchParams.delete('q');
    if (activeFilters.length > 0) url.searchParams.set('filters', activeFilters.join(','));
    else url.searchParams.delete('filters');
    if (sortBy && sortBy !== 'default') url.searchParams.set('sort', sortBy);
    else url.searchParams.delete('sort');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, [activeFilters, searchQuery, sortBy, urlReady]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Hero visibility — controls sticky search bar
  useEffect(() => {
    if (!heroRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // Keyboard: '/' focus, Escape close/clear, ↑↓ navigate suggestions, Enter select
  useEffect(() => {
    const handleKey = (e) => {
      const tag = document.activeElement?.tagName;
      const inSearch =
        document.activeElement === searchInputRef.current ||
        document.activeElement === stickySearchInputRef.current;

      // '/' to open search when not already in an input
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        if (heroVisible) {
          searchInputRef.current?.focus();
          searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          stickySearchInputRef.current?.focus();
        }
        return;
      }

      if (!inSearch) return;

      // Escape: close dropdown first; if already closed, clear query
      if (e.key === 'Escape') {
        if (suggestionsOpen) {
          setSuggestionsOpen(false);
          setSuggestionIndex(-1);
        } else {
          setSearchQuery('');
          document.activeElement.blur();
        }
        return;
      }

      // Arrow navigation (only when dropdown is open)
      if (!suggestionsOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        // +1 for the "Search for …" commit row
        setSuggestionIndex((i) => Math.min(i + 1, 6)); // max 6 dish rows + 1 commit
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionIndex((i) => Math.max(i - 1, -1));
        return;
      }

      // Enter: select highlighted row
      if (e.key === 'Enter') {
        e.preventDefault();
        // suggestionIndex === -1 means no highlight → commit plain search
        if (suggestionIndex === -1) {
          setSuggestionsOpen(false);
          return;
        }
        // The "Search for …" row is always index === suggestions length
        // We don't know the count here, but handleEnterFromKeyboard below handles it
        setSuggestionIndex((i) => {
          // Signal to SearchSuggestions that Enter was pressed — handled via
          // the onKeyboardEnter prop pattern; use a ref flag instead
          return i;
        });
        // Trigger commit via a custom event the component listens to
        window.dispatchEvent(new CustomEvent('suggestion:enter', { detail: { index: suggestionIndex } }));
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [heroVisible, suggestionsOpen, suggestionIndex]);

  // Click-outside → close suggestions
  useEffect(() => {
    const handler = (e) => {
      // Hero bar area is handled via onBlur; this covers the sticky bar
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setSuggestionsOpen(false);
        setSuggestionIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);


  // Search analytics — fire when query is >= 3 chars, debounced 1s
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 3) return;
    const timer = setTimeout(() => {
      trackEvent(slug, 'search', null);
    }, 1000);
    return () => clearTimeout(timer);
  }, [debouncedSearch, slug]);

  const applyMenuData = useCallback((data) => {
    const restData = data.restaurant || data;
    const tableData = data.table || restData?.table || null;
    setRestaurant(restData);
    if (tableData) {
      setDiningTable(tableData);
    } else {
      const match = slug?.match(/-t(\d+)$/i);
      if (match) {
        setDiningTable({ label: `Table ${parseInt(match[1], 10)}` });
      } else {
        setDiningTable(null);
      }
    }
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
  }, [slug]);

  // Fetch menu
  const fetchMenu = useCallback(async () => {
    setState('loading');
    const apiUrl = getApiUrl();
    try {
      const res = await fetch(`${apiUrl}/api/menu/${slug}`);
      if (res.status === 404) {
        if ((slug === 'anbude-cafe' || !slug) && fallbackMenuData) {
          applyMenuData(fallbackMenuData);
          return;
        }
        setState('notfound');
        return;
      }
      if (res.status === 403) {
        setState('suspended');
        return;
      }
      if (!res.ok) {
        if ((slug === 'anbude-cafe' || !slug) && fallbackMenuData) {
          applyMenuData(fallbackMenuData);
          return;
        }
        setState('error');
        return;
      }
      const data = await res.json();

      if (data.restaurant?.status === 'suspended' || data.suspended) {
        setState('suspended');
        return;
      }

      applyMenuData(data);
    } catch (err) {
      console.warn('[MenuClient] Error fetching menu from backend:', err?.message);
      if ((slug === 'anbude-cafe' || !slug) && fallbackMenuData) {
        applyMenuData(fallbackMenuData);
      } else {
        setState('error');
      }
    }
  }, [slug, applyMenuData]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Analytics (strictly paused when in Setup Mode)
  useEffect(() => {
    if (state !== 'ready') return;
    if (restaurant?.isSetupMode || restaurant?.status === 'setup') return;
    trackEvent(slug, 'qr_scan');
    trackEvent(slug, 'menu_view');
  }, [slug, state, restaurant?.isSetupMode, restaurant?.status]);

  // Deep-linking
  useEffect(() => {
    if (state !== 'ready' || selectedItem) return;
    const searchParams = new URLSearchParams(window.location.search);
    const deepLinkedId = searchParams.get('dish');
    if (!deepLinkedId) return;
    const deepLinkedItem = categoryGroups
      .flatMap((group) => group.items)
      .find((item) => String(item.id || item._id) === deepLinkedId);
    if (deepLinkedItem) {
      setSelectedItem(deepLinkedItem);
      const angleParam = searchParams.get('angle');
      if (angleParam === 'top') setSelectedAngle('top');
    }
  }, [categoryGroups, selectedItem, state]);

  // Track dish view (paused in Setup Mode)
  useEffect(() => {
    if (!selectedItem) {
      trackedItemRef.current = null;
      return;
    }
    if (restaurant?.isSetupMode || restaurant?.status === 'setup') return;
    const itemId = selectedItem.id || selectedItem._id;
    const trackingKey = String(itemId || selectedItem.name);
    if (trackedItemRef.current === trackingKey) return;
    trackedItemRef.current = trackingKey;
    trackEvent(slug, 'item_view', itemId);
  }, [selectedItem, slug, restaurant?.isSetupMode, restaurant?.status]);

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      const el = document.getElementById('menuSection');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const el = sectionRefs.current[catId];
    if (el) {
      const navHeight = 90;
      const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleItemSelect = (item, triggerElement, angle = 'front', options = {}) => {
    triggerCardRef.current = triggerElement;
    setSelectedItem(item);
    setSelectedAngle(angle || 'front');
    setSelectedPortionOption(options?.portionKey || null);
    setSelectedPrepOption(options?.prepKey || null);
    const url = new URL(window.location.href);
    url.searchParams.set('dish', item.id || item._id);
    if (angle && angle !== 'front') {
      url.searchParams.set('angle', angle);
    } else {
      url.searchParams.delete('angle');
    }
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const handleSheetClose = useCallback(() => {
    setSelectedItem(null);
    setSelectedAngle('front');
    setSelectedPortionOption(null);
    setSelectedPrepOption(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('dish');
    url.searchParams.delete('angle');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const handleToggleFilter = (filterId) => {
    setActiveFilters((current) =>
      current.includes(filterId)
        ? current.filter((filter) => filter !== filterId)
        : [...current, filterId]
    );
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setActiveFilters([]);
    setSortBy('default');
  };
  // Flat pool of all items — used by the suggestion scoring engine
  const allFlatItems = useMemo(
    () =>
      categoryGroups.flatMap((g) =>
        g.items.map((item) => ({
          ...item,
          categoryName: item.categoryName || g.name,
          categoryId: item.categoryId || g.id,
        }))
      ),
    [categoryGroups]
  );

  // Suggestion: user clicked a dish row → open DishSheet directly
  const handleSuggestionSelect = useCallback(
    (item) => {
      setSearchQuery(item.name);
      setSuggestionsOpen(false);
      setSuggestionIndex(-1);
      setSelectedItem(item);
      setSelectedAngle('front');
      setSelectedPortionOption(null);
      setSelectedPrepOption(null);
      const url = new URL(window.location.href);
      url.searchParams.set('dish', item.id || item._id);
      url.searchParams.delete('angle');
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
      trackEvent(slug, 'search_suggestion_select', item.id || item._id);
    },
    [slug]
  );

  // Suggestion: user clicked "Search for …" row → close dropdown, grid filters naturally
  const handleCommitSearch = useCallback(() => {
    setSuggestionsOpen(false);
    setSuggestionIndex(-1);
    if (heroVisible) {
      const el = document.getElementById('menuSection');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [heroVisible]);

  // Filter groups
  const filteredGroups = useMemo(() => {
    return categoryGroups
      .map((group) => {
        let items = group.items.filter((item) => {
          const normalizedIngredients = Array.isArray(item.ingredients)
            ? item.ingredients.join(' ')
            : item.ingredients || '';

          const matchesSearch = debouncedSearch
            ? item.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              item.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              normalizedIngredients.toLowerCase().includes(debouncedSearch.toLowerCase())
            : true;

          const isVeg = item.isVeg !== false && item.foodType !== 'non-veg';
          const matchesDiet = activeFilters.every((filter) => {
            if (filter === 'veg') return isVeg;
            if (filter === 'non-veg') return !isVeg;
            if (filter === 'vegan') return item.isVegan;
            if (filter === 'jain') return item.isJain;
            if (filter === 'gluten-free') return item.isGlutenFree;
            if (filter === 'available') return item.isAvailable;
            return true;
          });

          return matchesSearch && matchesDiet;
        });

        if (sortBy === 'price-asc') {
          items = [...items].sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortBy === 'price-desc') {
          items = [...items].sort((a, b) => Number(b.price) - Number(a.price));
        }

        return { ...group, items };
      })
      .filter((g) => g.items.length > 0);
  }, [categoryGroups, debouncedSearch, activeFilters, sortBy]);

  const resultCount = filteredGroups.reduce((total, group) => total + group.items.length, 0);

  const allCategories = categoryGroups.map((g) => ({ id: g.id, name: g.name }));
  let cardIndex = 0;

  return (
    <div className="min-h-screen bg-[#06090d] font-sans text-[#f6f2eb]">
      {!splashFinished && (
        <SplashScreen
          isLoading={state === 'loading'}
          restaurant={restaurant}
          minDuration={2300}
          onFinish={() => setSplashFinished(true)}
        />
      )}

      {state === 'loading' ? (
        <SkeletonPage />
      ) : state === 'notfound' ? (
        <EmptyState variant="notFound" />
      ) : state === 'suspended' ? (
        <EmptyState variant="suspended" />
      ) : state === 'error' ? (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#06090d] px-6 text-center text-slate-100">
          <h2 className="mb-2 font-display text-2xl font-bold text-amber-200">Connection Issue</h2>
          <p className="mb-6 max-w-xs text-xs text-slate-400">
            Could not connect to the dining network. Check your internet connection and retry.
          </p>
          <button
            onClick={fetchMenu}
            className="gold-accent-btn rounded px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
          >
            Retry Loading Menu
          </button>
        </div>
      ) : (
        <>
          {(restaurant?.isSetupMode || restaurant?.status === 'setup') && (
            <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-950/95 via-amber-900/95 to-amber-950/95 border-b border-amber-500/40 px-3 py-1.5 text-center backdrop-blur-md shadow-md">
              <span className="text-[11px] font-sans font-bold text-amber-200 tracking-wide flex items-center justify-center gap-1.5">
                🛠️ Menu Setup in Progress · Test Mode (Views are not counted)
              </span>
            </div>
          )}
          {/* ════ 1. CINEMATIC HERO ════ */}
          {/* ref div so IntersectionObserver can track hero exit */}
          <div ref={heroRef}>
            <MenuHero
              restaurant={restaurant}
              table={diningTable}
              resolveImageUrl={resolveImageUrl}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchInputRef={searchInputRef}
              onRateUs={() => setRateModalOpen(true)}
              allItems={allFlatItems}
              suggestionsOpen={suggestionsOpen && heroVisible}
              setSuggestionsOpen={setSuggestionsOpen}
              suggestionIndex={suggestionIndex}
              setSuggestionIndex={setSuggestionIndex}
              onSelectSuggestion={handleSuggestionSelect}
              onCommitSearch={handleCommitSearch}
            />
          </div>

          {/* ════ STICKY TABLE & SEARCH BAR (shown when hero scrolls out of view) ════ */}
          {diningTable && (
            <div className={`sticky top-0 z-40 bg-[#070a12]/95 border-b border-amber-500/30 px-3.5 py-1.5 flex items-center justify-between text-xs text-amber-200 backdrop-blur-md shadow-md transition-opacity duration-200 ${heroVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-extrabold tracking-wide text-amber-300 uppercase">
                  Dine-in • {(diningTable.label || 'Table 1').replace(/^Table 0(\d)$/i, 'Table $1')}
                </span>
                <span className="text-amber-200/50 text-[11px] truncate max-w-[140px]">• {restaurant?.name}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Active Table
              </span>
            </div>
          )}

          {/* ════ STICKY SEARCH BAR (shown when hero scrolls out of view) ════ */}
          <div
            ref={suggestionsRef}
            className={`sticky-search-bar ${heroVisible ? 'sticky-search-bar--hidden' : 'sticky-search-bar--visible'}`}
            role="search"
            aria-label="Search menu dishes"
          >
            <div
              className="sticky-search-inner"
              style={{ position: 'relative' }}
              role="combobox"
              aria-expanded={suggestionsOpen && !heroVisible}
              aria-haspopup="listbox"
              aria-owns="sticky-suggestion-list"
              aria-controls="sticky-suggestion-list"
            >
              <Search className="sticky-search-icon" aria-hidden="true" />
              <input
                ref={stickySearchInputRef}
                type="text"
                className="sticky-search-input"
                placeholder="Search dishes… (press / to focus)"
                value={searchQuery || ''}
                autoComplete="off"
                aria-autocomplete="list"
                aria-controls="sticky-suggestion-list"
                aria-activedescendant={
                  suggestionIndex >= 0 ? `suggestion-${suggestionIndex}` : undefined
                }
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSuggestionsOpen(true);
                  setSuggestionIndex(-1);
                }}
                onFocus={() => {
                  if (searchQuery) setSuggestionsOpen(true);
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setSuggestionsOpen(false);
                    setSuggestionIndex(-1);
                  }, 150);
                }}
                aria-label="Search dishes"
              />
              {debouncedSearch && !suggestionsOpen && (
                <span className="sticky-search-count" aria-live="polite">
                  {resultCount} {resultCount === 1 ? 'dish' : 'dishes'}
                </span>
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestionsOpen(false);
                  }}
                  className="sticky-search-clear"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {/* Keyboard hint — desktop only */}
              {!searchQuery && (
                <kbd className="sticky-search-kbd" aria-hidden="true">/</kbd>
              )}

              {/* Suggestions dropdown for sticky bar */}
              {suggestionsOpen && !heroVisible && (
                <SearchSuggestions
                  query={searchQuery}
                  allItems={allFlatItems}
                  activeIndex={suggestionIndex}
                  onSelectItem={handleSuggestionSelect}
                  onCommitSearch={handleCommitSearch}
                  resolveImageUrl={resolveImageUrl}
                  suggestionListId="sticky-suggestion-list"
                />
              )}
            </div>
          </div>

      {/* ════ 2. MENU INTRO HEADING ════ */}
      <section className="menu-intro" id="menuSection" aria-labelledby="menuHeading">
        <div>
          <span className="menu-intro-eyebrow">THE HOUSE MENU</span>
          <h2 id="menuHeading">
            Gather around <em>the table.</em>
          </h2>
        </div>
        <p>
          A thoughtful culinary selection curated by {restaurant?.name || 'our chefs'}, prepared fresh to order.
        </p>
      </section>

      {/* ════ 3. DIETARY FILTERS & SORTING BAR ════ */}
      <DietaryFilters
        activeFilters={activeFilters}
        onToggleFilter={handleToggleFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearAll={handleClearAll}
        resultCount={resultCount}
      />

      {/* ════ 4. STICKY CATEGORY NAVIGATION ════ */}
      <CategoryRail
        categories={allCategories}
        activeCategory={activeCategory}
        onSelect={handleCategorySelect}
        onActiveChange={setActiveCategory}
      />

      {/* ════ 5. DISH GRID MAIN SECTION ════ */}
      <main className="relative pb-24 pt-4">
        {filteredGroups.length === 0 ? (
          <div className="mx-auto max-w-[800px] px-4 py-16">
            <EmptyState variant="search" onReset={handleClearAll} />
          </div>
        ) : (
          filteredGroups.map((group) => (
            <section
              key={group.id}
              ref={(el) => {
                sectionRefs.current[group.id] = el;
              }}
              data-category-id={group.id}
              className="scroll-mt-24 mb-6"
            >
              <div className="mx-auto max-w-[780px] sm:max-w-[800px] px-4 sm:px-5 py-3 flex items-center justify-between border-b border-white/[0.08] mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-xl sm:text-2xl text-[#f6f2eb] font-semibold tracking-wide">
                    {group.name}
                  </h3>
                  <span className="text-[10px] tracking-widest text-[#d4b15d] font-bold uppercase border border-[#d4b15d]/40 px-2 py-0.5 rounded">
                    {group.items.length} {group.items.length === 1 ? 'ITEM' : 'ITEMS'}
                  </span>
                </div>
              </div>

              <div className="dish-grid">
                {group.items.map((item) => (
                  <DishCard
                    key={item.id || item._id || item.name}
                    item={item}
                    priority={cardIndex++ < 4}
                    onSelect={handleItemSelect}
                    resolveImageUrl={resolveImageUrl}
                    searchQuery={debouncedSearch}
                  />
                ))}
              </div>
            </section>
          ))
        )}

        {/* ════ 6. REVIEW & FEEDBACK SECTION ════ */}
        <ReviewSection
          restaurant={restaurant}
          onRateUs={() => setRateModalOpen(true)}
        />

        {/* ════ 7. FOOTER ════ */}
        <Footer restaurant={restaurant} />
      </main>

      {/* ════ 8. DISH DETAIL MODAL ════ */}
      {selectedItem && (
        <DishSheet
          item={selectedItem}
          initialAngle={selectedAngle}
          initialPortion={selectedPortionOption}
          initialPrep={selectedPrepOption}
          onClose={handleSheetClose}
          resolveImageUrl={resolveImageUrl}
        />
      )}

      {/* Rate Us Modal */}
      <RateUsModal
        isOpen={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        restaurant={restaurant}
      />
        </>
      )}
    </div>
  );
}
