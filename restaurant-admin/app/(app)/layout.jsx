'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, clearToken } from '@/lib/auth';
import {
  LayoutDashboard,
  UtensilsCrossed,
  LayoutList,
  User,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Store,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Menu & Stock', href: '/menu', icon: UtensilsCrossed },
  { label: 'Categories', href: '/categories', icon: LayoutList },
  { label: 'Profile', href: '/profile', icon: User },
];

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [restaurant, setRestaurant] = useState({ name: '', slug: '', cuisineType: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    api.get('/api/restaurant/profile')
      .then((res) => {
        const data = res.data?.restaurant || res.data || {};
        if (data.name) {
          setRestaurant({
            name: data.name,
            slug: data.slug || '',
            cuisineType: data.cuisineType || '',
          });
        }
      })
      .catch(() => {});
  }, [router]);

  const handleLogout = () => {
    clearToken();
    toast.success('Logged out successfully');
    router.replace('/login');
  };

  const getActiveNav = () => {
    if (pathname.startsWith('/menu')) return '/menu';
    if (pathname.startsWith('/categories')) return '/categories';
    if (pathname.startsWith('/profile')) return '/profile';
    return '/dashboard';
  };

  const activeNav = getActiveNav();
  const customerBaseUrl = process.env.NEXT_PUBLIC_CUSTOMER_URL || 'http://localhost:3003';
  const customerMenuUrl = restaurant.slug ? `${customerBaseUrl}/menu/${restaurant.slug}` : '';

  const getPageTitle = () => {
    if (pathname.startsWith('/menu/new')) return 'Add Dish';
    if (pathname.includes('/edit')) return 'Edit Dish';
    if (pathname.startsWith('/menu')) return 'Menu & Stock';
    if (pathname.startsWith('/categories')) return 'Categories';
    if (pathname.startsWith('/profile')) return 'Profile';
    return 'Dashboard';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* ── DESKTOP SIDEBAR (lg+) ── */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-slate-950 z-40 border-r border-slate-850 select-none">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/70">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none">Renza Partner</p>
            <p className="text-sm font-bold text-white truncate mt-1">{restaurant.name || 'Kitchen Portal'}</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto sidebar-scroll">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            Workspace
          </p>
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = activeNav === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all group',
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                )}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')} />
                <span className="flex-1">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer: Customer Menu Link + Logout */}
        <div className="p-3 border-t border-slate-800/70 space-y-2">
          {customerMenuUrl && (
            <a
              href={customerMenuUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-850 hover:text-white transition-all border border-slate-800"
            >
              <span className="flex items-center gap-2">
                <Store className="w-4 h-4 text-orange-400" />
                Live Diner Menu
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE OVERLAY SIDEBAR ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-72 max-w-[85vw] bg-slate-950 h-full shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                  <UtensilsCrossed className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Renza Partner</p>
                  <p className="text-xs font-bold text-white truncate">{restaurant.name || 'Kitchen'}</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map(({ label, href, icon: Icon }) => {
                const isActive = activeNav === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all',
                      isActive
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-slate-800 space-y-2">
              {customerMenuUrl && (
                <a
                  href={customerMenuUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-orange-400" />
                    Live Diner Menu
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT WRAPPER ── */}
      <div className="flex flex-col flex-1 lg:pl-64 min-h-screen w-full">

        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between px-3 sm:px-6 lg:px-8 h-14 sm:h-16 gap-2">
            <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <h1 className="font-extrabold text-slate-900 text-sm sm:text-base md:text-lg tracking-tight truncate">
                {getPageTitle()}
              </h1>
            </div>

            {/* Live status badge + Quick customer menu link */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Menu Live</span>
              </div>

              {customerMenuUrl && (
                <a
                  href={customerMenuUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 text-xs font-bold transition-colors border border-orange-200/60 shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline">Diner Menu</span>
                  <span className="sm:hidden text-[11px]">Menu</span>
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-28 sm:pb-24 lg:pb-10 overflow-y-auto bg-slate-50 w-full">
          {children}
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV (hidden on lg+) ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-3px_16px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = activeNav === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative flex-1 min-h-[48px]',
                  isActive ? 'text-orange-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                  isActive && 'bg-orange-50 text-orange-600'
                )}>
                  <Icon className={cn('w-4 h-4 transition-transform', isActive && 'scale-110 text-orange-600')} />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                  {label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-4 h-0.5 bg-orange-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
