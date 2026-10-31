'use client';

import { useState, useEffect } from 'react';
import { BookOpen, MessageSquareHeart, Star } from 'lucide-react';
import PortalHeader from './PortalHeader';
import ActionCard from './ActionCard';
import FeedbackPage from './FeedbackPage';
import ReviewModal from './ReviewModal';
import PortalFooter from './PortalFooter';
import CategoryList from './CategoryList';
import CategoryDishes from './CategoryDishes';
import DishDetailModal from './DishDetailModal';
import SplashScreen from './SplashScreen';
import { trackEvent } from '../utils/analytics';
import fallbackMenuData from '../data/anbude-cafe-menu.json';
import { getApiUrl } from '../utils/api';

function resolveTableInfo(tableData, initialTable, slug) {
  if (tableData && (tableData.label || tableData.name || tableData.number)) {
    const raw = String(tableData.label || tableData.name || tableData.number).trim();
    const numMatch = raw.match(/(\d+)/);
    return {
      ...tableData,
      label: numMatch ? `Table ${parseInt(numMatch[1], 10)}` : raw,
      number: numMatch ? parseInt(numMatch[1], 10) : null,
    };
  }

  // Check initialTable prop or query params (?table=, ?t=, ?tableNumber=)
  let candidate = initialTable;
  if (!candidate && typeof window !== 'undefined') {
    try {
      const sp = new URLSearchParams(window.location.search);
      candidate =
        sp.get('table') ||
        sp.get('t') ||
        sp.get('tableNumber') ||
        sp.get('tableno') ||
        sp.get('tbl');
    } catch (_) {}
  }

  if (candidate) {
    const raw = String(candidate).trim();
    const numMatch = raw.match(/(\d+)/);
    return {
      label: numMatch ? `Table ${parseInt(numMatch[1], 10)}` : raw,
      number: numMatch ? parseInt(numMatch[1], 10) : null,
    };
  }

  // Check slug suffix (e.g. anbude-cafe-t1 or anbude-cafe-table-5)
  if (slug) {
    const slugMatch = String(slug).match(/-(?:t|table-?)(\d+)$/i);
    if (slugMatch) {
      const num = parseInt(slugMatch[1], 10);
      return {
        label: `Table ${num}`,
        number: num,
      };
    }
  }

  return null;
}

export function resolveGoogleReviewUrl(restaurant) {
  const customUrl = restaurant?.googleReviewUrl?.trim();
  if (customUrl) {
    const match = customUrl.match(/[?&]placeid=([a-zA-Z0-9_-]+)/i);
    if (match) {
      return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(match[1])}`;
    }
    if (customUrl.startsWith('ChIJ') || (!customUrl.includes('/') && customUrl.length > 20)) {
      return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(customUrl)}`;
    }
    if (customUrl.includes('g.page') && !customUrl.includes('/review')) {
      return `${customUrl.replace(/\/+$/, '')}/review`;
    }
    if (!customUrl.startsWith('http://') && !customUrl.startsWith('https://')) {
      return `https://${customUrl}`;
    }
    return customUrl;
  }
  const query = `${restaurant?.name || "Anbu'de Cafe"} ${restaurant?.address || ''} write a review`.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export default function PortalClient({
  params,
  initialView = 'hub',
  initialCategoryName = null,
  initialDishId = null,
  initialAngle = 'front',
  initialTable = null,
  searchParams = {},
}) {
  const slug = params?.slug || 'anbude-cafe';

  const [restaurant, setRestaurant] = useState(() => {
    const base = { ...(fallbackMenuData.restaurant || fallbackMenuData) };
    const t = resolveTableInfo(base.table, initialTable, slug);
    if (t) base.table = t;
    return base;
  });
  const [categories, setCategories] = useState(() => fallbackMenuData.categories || []);
  const [currentView, setCurrentView] = useState(() => (initialView === 'splash' ? 'hub' : initialView)); // 'hub' | 'categories' | 'dishes' | 'feedback'
  const [showSplash, setShowSplash] = useState(() => {
    // SSR-safe query check: ensures server HTML and client hydration match 100%
    if (searchParams?.nosplash === '1' || searchParams?.skipSplash === '1') return false;
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('nosplash') === '1' || sp.get('skipSplash') === '1') return false;
      if (sp.get('category') || sp.get('dish') || sp.get('view') === 'feedback') return false;
    }
    // Deep links to category/dish/feedback bypass splash
    if (initialCategoryName || initialDishId || initialView === 'feedback' || initialView === 'dishes') {
      return false;
    }
    // Default for Main Dining Hub: ALWAYS show splash on initial load & refresh!
    return true;
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (!initialCategoryName) return null;
    const allCats = fallbackMenuData.categories || [];
    return (
      allCats.find(
        (c) =>
          c.name.toLowerCase() === initialCategoryName.toLowerCase() ||
          String(c.id || c._id) === initialCategoryName
      ) || null
    );
  });
  const [deepLinkedDish, setDeepLinkedDish] = useState(() => {
    if (!initialDishId) return null;
    const allDishes = (fallbackMenuData.categories || []).flatMap(
      (cat) => cat.foodItems || cat.items || []
    );
    return (
      allDishes.find(
        (d) => String(d.id || d._id) === initialDishId || d.name === initialDishId
      ) || null
    );
  });
  const [deepLinkedAngle, setDeepLinkedAngle] = useState(initialAngle);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);

  // Analytics QR scan & Menu view tracking (strictly paused in Setup Mode to avoid skewing metrics)
  useEffect(() => {
    if (!restaurant) return;
    if (restaurant?.isSetupMode || restaurant?.status === 'setup') return;
    const tableId = restaurant?.table?.label || restaurant?.table?.name || initialTable;
    trackEvent(slug, 'qr_scan', null, tableId);
    trackEvent(slug, 'menu_view', null, tableId);
  }, [restaurant, slug, initialTable]);

  // Deep linking to dishes (?dish=<id>&angle=<angle>) or categories (?category=<name>)
  useEffect(() => {
    if (categories.length === 0) return;
    try {
      const url = new URL(window.location.href);
      const catParam = initialCategoryName || url.searchParams.get('category');
      if (catParam) {
        const foundCat = categories.find(
          (c) => c.name.toLowerCase() === catParam.toLowerCase() || String(c.id || c._id) === catParam
        );
        if (foundCat) {
          setSelectedCategory(foundCat);
          setCurrentView('dishes');
        }
      }

      const dishId = url.searchParams.get('dish');
      if (dishId) {
        const allDishes = categories.flatMap((cat) => cat.foodItems || cat.items || []);
        const match = allDishes.find((d) => String(d.id || d._id) === dishId || d.name === dishId);
        if (match) {
          setDeepLinkedDish(match);
          setDeepLinkedAngle(url.searchParams.get('angle') === 'top' ? 'top' : 'front');
        }
      }
    } catch (_) {}
  }, [categories]);

  useEffect(() => {
    let isMounted = true;

    async function fetchRestaurantData() {
      try {
        const queryTable =
          initialTable ||
          (typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('table') ||
              new URLSearchParams(window.location.search).get('t') ||
              new URLSearchParams(window.location.search).get('tableNumber')
            : null);

        const apiUrl = getApiUrl();
        const fetchUrl = queryTable
          ? `${apiUrl}/api/menu/${slug}?table=${encodeURIComponent(queryTable)}`
          : `${apiUrl}/api/menu/${slug}`;

        const res = await fetch(fetchUrl, {
          cache: 'no-store',
        });

        if (res.status === 403) {
          if (isMounted) setIsSuspended(true);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.status === 'suspended' || data.restaurant?.status === 'suspended') {
            if (isMounted) setIsSuspended(true);
            return;
          }
          if (isMounted && data) {
            const rData = { ...(data.restaurant || data) };
            const resolvedTable = resolveTableInfo(data.table || rData.table, initialTable, slug);
            if (resolvedTable) {
              rData.table = resolvedTable;
            }
            setRestaurant(rData);
            const sortedCategories = (data.categories || []).sort(
              (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
            );
            setCategories(sortedCategories);
            return;
          }
        }
      } catch (err) {
        // Fallback silently if offline or API is down
      }

      // Use local fallback data
      if (isMounted) {
        const rData = { ...(fallbackMenuData.restaurant || fallbackMenuData) };
        const resolvedTable = resolveTableInfo(rData.table, initialTable, slug);
        if (resolvedTable) {
          rData.table = resolvedTable;
        }
        setRestaurant(rData);
        const sortedFallbackCategories = (fallbackMenuData.categories || []).sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
        );
        setCategories(sortedFallbackCategories);
      }
    }

    fetchRestaurantData();

    return () => {
      isMounted = false;
    };
  }, [slug, initialTable]);

  const restaurantName = restaurant?.name || "Anbu'de Cafe";
  const googleReviewUrl = resolveGoogleReviewUrl(restaurant);

  // Navigation handlers with mobile hardware back button support
  const handleOpenMenu = () => {
    setCurrentView('categories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'categories');
      url.searchParams.delete('category');
      url.searchParams.delete('dish');
      if (window.history.state?.view !== 'categories') {
        window.history.pushState({ view: 'categories' }, '', url.toString());
      }
    } catch (_) {}
  };

  const handleOpenFeedback = () => {
    setCurrentView('feedback');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'feedback');
      url.searchParams.delete('category');
      url.searchParams.delete('dish');
      if (window.history.state?.view !== 'feedback') {
        window.history.pushState({ view: 'feedback' }, '', url.toString());
      }
    } catch (_) {}
  };

  const handleEnterFromSplash = () => {
    setShowSplash(false);
    setCurrentView('hub');
    try {
      const url = new URL(window.location.href);
      if (url.pathname.endsWith('/splash')) {
        const table = url.searchParams.get('table') || url.searchParams.get('t') || '';
        const target = table ? `/menu/${slug}?table=${table}` : `/menu/${slug}`;
        window.location.href = target;
        return;
      }
      url.searchParams.delete('view');
      url.searchParams.delete('splash');
      if (window.history.state?.view !== 'hub') {
        window.history.replaceState({ view: 'hub' }, '', url.toString());
      }
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSplash = () => {
    setShowSplash(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setCurrentView('dishes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('category', category.name || category.id || category._id);
      url.searchParams.delete('view');
      url.searchParams.delete('dish');
      const catKey = category.name || category.id;
      if (window.history.state?.view !== 'dishes' || window.history.state?.category !== catKey) {
        window.history.pushState(
          { view: 'dishes', category: catKey },
          '',
          url.toString()
        );
      }
    } catch (_) {}
  };

  const handleBackToCategories = () => {
    if (typeof window !== 'undefined' && window.history.state?.view === 'dishes') {
      window.history.back();
    } else {
      setSelectedCategory(null);
      setCurrentView('categories');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('view', 'categories');
        url.searchParams.delete('category');
        url.searchParams.delete('dish');
        window.history.replaceState({ view: 'categories' }, '', url.toString());
      } catch (_) {}
    }
  };

  const handleBackToHub = () => {
    if (
      typeof window !== 'undefined' &&
      (window.history.state?.view === 'categories' || window.history.state?.view === 'feedback')
    ) {
      window.history.back();
    } else {
      setCurrentView('hub');
      setSelectedCategory(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('view');
        url.searchParams.delete('category');
        url.searchParams.delete('dish');
        window.history.replaceState({ view: 'hub' }, '', url.toString());
      } catch (_) {}
    }
  };

  // Mobile browser hardware / gesture back button handler
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const sp = new URLSearchParams(window.location.search);
        const currentV = sp.get('category') ? 'dishes' : (sp.get('view') || initialView || 'hub');
        if (currentV !== 'hub' && (!window.history.state || !window.history.state.view)) {
          // If customer landed directly on a sub-view (e.g. ?view=feedback),
          // seed a base 'hub' history entry so pressing back navigates to Hub instead of exiting
          const hubUrl = new URL(window.location.href);
          hubUrl.searchParams.delete('view');
          hubUrl.searchParams.delete('category');
          hubUrl.searchParams.delete('dish');
          window.history.replaceState({ view: 'hub' }, '', hubUrl.toString());
          window.history.pushState(
            sp.get('category')
              ? { view: 'dishes', category: sp.get('category') }
              : { view: currentV },
            '',
            window.location.href
          );
        } else if (!window.history.state || !window.history.state.view) {
          window.history.replaceState({ view: currentV }, '', window.location.href);
        }
      } catch (_) {}
    }

    const handlePopState = (event) => {
      // 1. If deep-linked dish modal is open, close it
      if (deepLinkedDish) {
        setDeepLinkedDish(null);
        return;
      }

      // 2. If review modal is open, close it
      if (reviewOpen) {
        setReviewOpen(false);
        return;
      }

      const sp = new URLSearchParams(window.location.search);
      const catParam = sp.get('category');
      const viewParam = sp.get('view');
      const state = event?.state;

      // If this pop event is within or to a modal (dish detail or zoom), do not change the view
      if (state?.modal === 'dish' || state?.modal === 'zoom') {
        return;
      }

      if (catParam) {
        const found = categories.find(
          (c) =>
            c.name.toLowerCase() === catParam.toLowerCase() ||
            String(c.id || c._id) === catParam
        );
        if (found) {
          setSelectedCategory(found);
          setCurrentView('dishes');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      if (viewParam === 'splash' || state?.view === 'splash') {
        setSelectedCategory(null);
        setCurrentView('splash');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (viewParam === 'categories' || state?.view === 'categories') {
        setSelectedCategory(null);
        setCurrentView('categories');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (viewParam === 'feedback' || state?.view === 'feedback') {
        setSelectedCategory(null);
        setCurrentView('feedback');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Default back to hub
      setSelectedCategory(null);
      setCurrentView('hub');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [categories, deepLinkedDish, reviewOpen, initialView]);

  if (isSuspended) {
    return (
      <div className="min-h-screen w-full bg-[#FFFCF7] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="max-w-[360px] w-full bg-white border border-[#E8EAF0] rounded-3xl p-8 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto text-2xl font-bold">
            🍽️
          </div>
          <h2 className="text-xl font-bold text-[#101B35] font-ancizar">Menu Currently Unavailable</h2>
          <p className="text-xs text-[#718096] leading-relaxed">
            This digital menu is temporarily offline or undergoing maintenance. Please speak with restaurant staff for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FFFCF7] sm:bg-[#F6F3EC] sm:py-6 sm:px-4 flex justify-center items-start text-[#101B35] font-sans selection:bg-[#FFB800]/30 selection:text-amber-950 overflow-x-hidden">
      {/* Mobile Device Viewport Mockup on Desktop, 100% Full-bleed on Mobile */}
      <div
        className="w-full max-w-[430px] min-w-0 mx-auto bg-[#FFFCF7] min-h-screen sm:min-h-[850px] sm:rounded-[32px] sm:shadow-[0_16px_50px_rgba(0,0,0,0.08)] overflow-hidden border-0 sm:border sm:border-[#E8EAF0] flex flex-col justify-between transition-all relative"
        style={{ maxWidth: '430px' }}
      >
        <div className="w-full">
          {/* Owner Setup Mode Banner */}
          {(restaurant?.isSetupMode || restaurant?.status === 'setup') && (
            <div className="w-full bg-[#FFF8E1] border-b border-[#FFE082] px-3 py-1.5 text-center flex items-center justify-center gap-1.5 text-[#8B4513] text-[11px] font-bold z-30">
              <span className="w-2 h-2 rounded-full bg-[#FFB800] animate-pulse" />
              <span>SETUP MODE</span>
              <span className="text-[10px] text-[#A16207] font-normal">— Analytics Paused</span>
            </div>
          )}

          {/* VIEW 1: Main Dining Hub */}
          {currentView === 'hub' && (
            <>
              <PortalHeader
                restaurant={restaurant}
                googleReviewUrl={googleReviewUrl}
                onOpenSplash={handleOpenSplash}
              />

              <main className="w-full px-4 sm:px-5 pt-2 pb-6 space-y-3">
                {/* Action Card 1: View Menu */}
                <ActionCard
                  icon={BookOpen}
                  variant="yellow"
                  title="View Menu"
                  subtitle="Browse categories & freshly prepared dishes"
                  illustration="/hub/card-noodle-bowl.png"
                  onClick={handleOpenMenu}
                />

                {/* Action Card 2: Leave Anonymous Feedback */}
                <ActionCard
                  icon={MessageSquareHeart}
                  variant="blue"
                  title="Leave Anonymous Feedback"
                  subtitle="Direct & private note to the manager"
                  illustration="/hub/card-notepad.png"
                  onClick={handleOpenFeedback}
                />

                {/* Action Card 3: Leave a Google Review (Direct redirect on mobile) */}
                <ActionCard
                  icon={Star}
                  variant="green"
                  title="Leave a Google Review"
                  subtitle="Rate us 5 stars on Google Maps"
                  illustration="/hub/card-map-pin.png"
                  href={googleReviewUrl}
                />
              </main>

              {/* Scanzaa Footer: ONLY on first page (Hub) */}
              <PortalFooter restaurant={restaurant} />
            </>
          )}

          {/* VIEW 2: All Restaurant Categories */}
          {currentView === 'categories' && (
            <CategoryList
              categories={categories}
              restaurantName={restaurantName}
              onSelectCategory={handleSelectCategory}
              onBack={handleBackToHub}
              restaurantSlug={slug}
              table={restaurant?.table}
            />
          )}

          {/* VIEW 3: Dishes of Selected Category Alone */}
          {currentView === 'dishes' && selectedCategory && (
            <CategoryDishes
              category={selectedCategory}
              onBackToCategories={handleBackToCategories}
              restaurantSlug={slug}
              table={restaurant?.table}
            />
          )}

          {/* VIEW 4: Dedicated Anonymous Feedback Page */}
          {currentView === 'feedback' && (
            <FeedbackPage
              restaurant={restaurant}
              onBackToHub={handleBackToHub}
              onViewMenu={handleOpenMenu}
            />
          )}
        </div>

        {/* INTEGRATED BRANDED SPLASH SCREEN: App-like intro that comes WITH the Dining Hub */}
        {showSplash && (
          <div className="splash-overlay fixed inset-0 z-40 bg-[#FFFCF7] flex flex-col justify-between overflow-hidden">
            <SplashScreen
              restaurant={restaurant}
              onEnter={handleEnterFromSplash}
            />
          </div>
        )}
      </div>

      {/* Deep-Linked Dish Modal */}
      {deepLinkedDish && (
        <DishDetailModal
          dish={deepLinkedDish}
          initialAngle={deepLinkedAngle}
          onClose={() => setDeepLinkedDish(null)}
          restaurantSlug={slug}
        />
      )}

      {/* Google Review Prompt */}
      <ReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        restaurant={restaurant}
      />
    </div>
  );
}
