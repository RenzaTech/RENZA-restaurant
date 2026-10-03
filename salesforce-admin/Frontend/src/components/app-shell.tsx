'use client';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Building2,
  CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3,
  Download, Ellipsis, ExternalLink, Eye, EyeOff, Filter, ForkKnife, LayoutDashboard,
  LogOut, Menu, MoreHorizontal, Plus, QrCode, Search, Settings, ShieldCheck,
  ShoppingBag, SlidersHorizontal, Star, Store, UtensilsCrossed, Wallet, X,
  TrendingUp, ChevronUp, Leaf, Flame, Timer, ImagePlus, Printer, RotateCcw, Trash2,
  Pencil, Copy, ScanLine, BarChart3, CircleCheck, CircleX, CheckCircle2, Upload,
  BellRing, Lock, Mail, Sparkles, UserCheck, Briefcase, MapPin, Phone, FileText,
  Award, Target
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import QRCode from 'qrcode';
import { OnboardRestaurantPage } from './onboard-restaurant-page';
import { salesFetch, getAuthToken, setAuthToken, clearAuthToken } from '@/lib/api-client';

type Section = 'overview' | 'restaurants' | 'settings' | 'onboard';

export type Restaurant = {
  id?: string;
  name: string;
  cuisine: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  status: 'Active' | 'Suspended';
  dishes: number;
  tableCount?: number;
  today: number;
  total: number;
  city: string;
  initial: string;
  color: string;
  rating: string;
  createdById?: string;
  salesExecutiveName?: string;
  salesExecutiveEmail?: string;
  salesExecutiveCode?: string;
  salesExecutivePhone?: string;
  salesNotes?: string;
  leadSource?: string;
  createdAt?: string;
};

export type UserAccess = {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId?: string;
  department?: string;
  territory?: string;
  permissions: string[];
};

type ScanPoint = { day: string; scans: number; orders: number };



const navItems: { id: Section; label: string; icon: typeof LayoutDashboard; badge?: string }[] = [
  { id: 'overview', label: 'Dashboard & Goals', icon: LayoutDashboard },
  { id: 'restaurants', label: 'Restaurants & QRs', icon: Building2 },
];

const sectionPermission: Record<Section, string> = {
  overview: 'restaurants.read',
  restaurants: 'restaurants.read',
  settings: 'restaurants.read',
  onboard: 'restaurants.write',
};

function Logo({ compact = false, isSales = false }: { compact?: boolean; isSales?: boolean }) {
  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/scanzaa-icon.png" alt="SCANZAA" style={{ height: 32, width: 32, objectFit: 'contain' }} />
      </div>
    );
  }
  return (
    <div className="brand" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/scanzaa-horizontal-logo.png" alt="SCANZAA" style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: 6,
            background: isSales ? 'rgba(56,189,248,0.15)' : 'rgba(11,184,174,0.15)',
            color: isSales ? '#38bdf8' : '#0bb8ae',
            border: isSales ? '1px solid rgba(56,189,248,0.3)' : '1px solid rgba(11,184,174,0.3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {isSales ? 'SALES' : 'SUPER ADMIN'}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 5 }}>
        <span>powered by</span>
        <strong style={{ color: '#fff', fontWeight: 700 }}>Renza</strong>
      </p>
    </div>
  );
}

function IconButton({ children, onClick, label }: { children: ReactNode; onClick?: () => void; label: string }) {
  return <button className="icon-btn" aria-label={label} title={label} onClick={onClick}>{children}</button>;
}

function Button({ children, onClick, kind = 'primary', icon, disabled = false }: { children: ReactNode; onClick?: () => void; kind?: 'primary' | 'secondary' | 'quiet' | 'danger'; icon?: ReactNode; disabled?: boolean }) {
  return <button className={`button ${kind}`} disabled={disabled} onClick={onClick}>{icon}{children}</button>;
}

function Modal({ title, subtitle, close, children, wide = false }: { title: string; subtitle?: string; close: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <IconButton label="Close dialog" onClick={close}><X size={19} /></IconButton>
        </div>
        {children}
      </section>
    </div>
  );
}

function Field({
  label, placeholder, type = 'text', required = false, value, onChange, options, autoComplete, minLength, disabled
}: {
  label: string; placeholder?: string; type?: string; required?: boolean; value?: string | number; onChange?: (v: string) => void; options?: string[]; autoComplete?: string; minLength?: number; disabled?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}{required && <b> *</b>}</span>
      {options ? (
        <select required={required} disabled={disabled} value={value ?? ''} onChange={(e) => onChange?.(e.target.value)}>
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          name={label.toLowerCase().replace(/\s+/g, '')}
          type={type}
          disabled={disabled}
          value={onChange ? (value ?? '') : value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
    </label>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [section, setSection] = useState<Section>('overview');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [modal, setModal] = useState<'restaurant' | 'table' | 'qr' | 'details' | null>(null);
  const [editRestaurant, setEditRestaurant] = useState<number | null>(null);
  const [inspectRestaurant, setInspectRestaurant] = useState<Restaurant | null>(null);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [restaurantTab, setRestaurantTab] = useState<'my' | 'all'>('my');
  const [selectedExecutiveFilter, setSelectedExecutiveFilter] = useState('All');
  const [timeframe, setTimeframe] = useState('Last 7 days');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ title: string; message: string; action: () => void } | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [qrTable, setQrTable] = useState<string>('');
  const [qrTableId, setQrTableId] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [qrStatus, setQrStatus] = useState('ACTIVE');
  const [showLogin, setShowLogin] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const [form, setForm] = useState<Record<string, string>>({});
  const [onboardStep, setOnboardStep] = useState<1 | 2 | 3>(1);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [currentAccess, setCurrentAccess] = useState<UserAccess | null>(null);
  const [restaurantId, setRestaurantId] = useState('');

  // Initial user fetch
  useEffect(() => {
    let active = true;
    const token = getAuthToken();
    if (!token) {
      setSignedIn(false);
      setShowLogin(true);
      return;
    }
    salesFetch('/api/auth/me')
      .then((user) => {
        if (active && user) {
          setCurrentAccess(user);
          setSignedIn(true);
          setShowLogin(false);
          if (user.role === 'SUPER_ADMIN' || user.role === 'superadmin') {
            setRestaurantTab('all');
          } else {
            setRestaurantTab('my');
          }
        }
      })
      .catch(() => {
        if (active) {
          clearAuthToken();
          setSignedIn(false);
          setShowLogin(true);
        }
      });
    return () => { active = false; };
  }, []);

  // Pathname sync for direct /restaurants/new navigation
  useEffect(() => {
    if (pathname === '/restaurants/new') {
      setSection('onboard');
    }
  }, [pathname]);

  const openOnboardPage = () => {
    setSection('onboard');
    if (typeof window !== 'undefined' && window.location.pathname !== '/restaurants/new') {
      window.history.pushState({}, '', '/restaurants/new');
    }
  };

  const cancelOnboardPage = () => {
    setSection('restaurants');
    if (typeof window !== 'undefined' && window.location.pathname === '/restaurants/new') {
      window.history.pushState({}, '', '/');
    }
  };

  // Fetch restaurants with complete attribution from central backend
  const fetchRestaurants = () => {
    if (!signedIn) return;
    salesFetch('/api/admin/restaurants')
      .then((result) => {
        const rows = Array.isArray(result) ? result : (result?.data || result?.restaurants || []);
        const mapped: Restaurant[] = rows.map((r: any) => ({
          id: r.id,
          name: r.name,
          cuisine: r.cuisineType || (Array.isArray(r.cuisine) ? r.cuisine.join(' · ') : (r.cuisine || 'Multi-cuisine')),
          email: r.adminEmail || r.email || '',
          phone: r.phone || '',
          address: r.address || '',
          website: r.website || '',
          description: r.description || '',
          status: r.status === 'active' || r.status === 'ACTIVE' || r.status === 'setup' ? 'Active' : 'Suspended',
          dishes: r.foodItemCount ?? r.foodItemsCount ?? r._count?.menuItems ?? 0,
          tableCount: r.tableCount ?? r.initialTableCount ?? r._count?.tables ?? 5,
          today: r.todayScans || 0,
          total: r.totalScans || 0,
          city: r.city || '—',
          initial: (r.name || 'R').split(/\s+/).map((x: string) => x[0]).join('').slice(0, 2).toUpperCase(),
          color: '#e4f2e9',
          rating: '5.0',
          createdById: r.createdById,
          salesExecutiveName: r.salesExecutiveName || r.createdBy?.name || '—',
          salesExecutiveEmail: r.salesExecutiveEmail || r.createdBy?.email || '',
          salesExecutiveCode: r.salesExecutiveCode || r.createdBy?.employeeId || '—',
          salesExecutivePhone: r.salesExecutivePhone || '',
          salesNotes: r.salesNotes || '',
          leadSource: r.leadSource || 'Field Visit',
          createdAt: r.createdAt,
        }));
        setRestaurants(mapped);
        if (mapped[0] && !restaurantId) {
          setRestaurantId(mapped[0].id || '');
          setSelectedRestaurant(mapped[0].name);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchRestaurants();
  }, [signedIn]);

  const notice = (s: string) => {
    setToast(s);
    window.setTimeout(() => setToast(''), 3000);
  };

  const isGlobalAdmin = currentAccess?.role === 'SUPER_ADMIN' || currentAccess?.role === 'COMPANY_ADMIN';
  const isSalesExecutive = currentAccess?.role === 'SALES_EXECUTIVE';

  const canAccessSection = (target: Section) => {
    if (isGlobalAdmin) return true;
    if (isSalesExecutive) {
      return target === 'overview' || target === 'restaurants' || target === 'settings' || target === 'onboard';
    }
    return Boolean(currentAccess?.permissions.includes(sectionPermission[target]));
  };

  const visibleNavItems = navItems.filter((item) => canAccessSection(item.id));

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const openModal = (m: 'restaurant' | 'table' | 'qr', i?: number) => {
    if (m === 'restaurant' && i === undefined) {
      openOnboardPage();
      return;
    }
    if (m === 'restaurant') {
      setOnboardStep(1);
      setShowAdminPassword(false);
      setShowConfirmPassword(false);
    }
    setForm(
      m === 'restaurant' && i !== undefined
        ? {
            name: restaurants[i]?.name || '',
            cuisine: restaurants[i]?.cuisine || '',
            email: restaurants[i]?.email || '',
            city: restaurants[i]?.city || '',
            phone: restaurants[i]?.phone || '',
            website: restaurants[i]?.website || '',
            address: restaurants[i]?.address || '',
            description: restaurants[i]?.description || '',
            salesNotes: restaurants[i]?.salesNotes || '',
            leadSource: restaurants[i]?.leadSource || '',
          }
        : m === 'restaurant'
        ? {
            name: '',
            cuisine: '',
            email: '',
            phone: '',
            city: currentAccess?.territory?.split(' ')[0] || '',
            website: '',
            address: '',
            description: '',
            adminName: '',
            adminEmail: '',
            adminPassword: '',
            confirmPassword: '',
            initialTableCount: '5',
            leadSource: 'Field Visit',
            salesNotes: '',
          }
        : {}
    );
    if (m === 'restaurant') setEditRestaurant(i ?? null);
    setModal(m);
  };

  // Filtered restaurants for table
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      // Tab filter: 'my' shows restaurants created by this user
      if (restaurantTab === 'my' && currentAccess?.id) {
        if (r.createdById && r.createdById !== currentAccess.id) return false;
      }
      // Executive filter for Super Admin
      if (selectedExecutiveFilter !== 'All') {
        if (r.salesExecutiveName !== selectedExecutiveFilter && r.salesExecutiveCode !== selectedExecutiveFilter) {
          return false;
        }
      }
      // Status filter
      if (filter !== 'All' && r.status !== filter) return false;
      // Search filter
      if (search) {
        const query = search.toLowerCase();
        const combined = `${r.name} ${r.cuisine} ${r.email} ${r.city} ${r.salesExecutiveName} ${r.salesExecutiveCode}`.toLowerCase();
        if (!combined.includes(query)) return false;
      }
      return true;
    });
  }, [restaurants, restaurantTab, selectedExecutiveFilter, filter, search, currentAccess]);

  const nav = (s: Section) => {
    if (!canAccessSection(s)) {
      notice('You do not have access to this section');
      return;
    }
    setSection(s);
    setSearch('');
    setFilter('All');
    setPage(1);
    setDrawer(false);
  };

  const toggleStatus = async (i: number) => {
    const restaurant = restaurants[i];
    if (!restaurant?.id) {
      notice('Restaurant is not saved yet');
      return;
    }
    const action = restaurant.status === 'Active' ? 'suspend' : 'activate';
    try {
      const response = await fetch(`/api/restaurants/${restaurant.id}/${action}`, { method: 'POST' });
      if (!response.ok) throw new Error();
      setRestaurants((v) => v.map((r, n) => (n === i ? { ...r, status: action === 'suspend' ? 'Suspended' : 'Active' } : r)));
      notice(`Restaurant marked as ${action === 'suspend' ? 'Suspended' : 'Active'}`);
    } catch {
      notice('Could not update restaurant status');
    }
  };

  const removeRestaurant = async (restaurant: Restaurant) => {
    if (!restaurant.id) {
      notice('Restaurant is not saved yet');
      return;
    }
    try {
      const response = await fetch(`/api/restaurants/${restaurant.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      setRestaurants((current) => current.filter((item) => item.id !== restaurant.id));
      if (selectedRestaurant === restaurant.name) {
        const next = restaurants.find((item) => item.id !== restaurant.id);
        setSelectedRestaurant(next?.name || '');
        setRestaurantId(next?.id || '');
      }
      notice(`${restaurant.name} removed`);
    } catch {
      notice('Could not remove restaurant');
    }
  };

  const openQrForRestaurant = async (restaurant: Restaurant) => {
    if (!restaurant.id) {
      notice('Restaurant is not saved yet');
      return;
    }
    try {
      const tables = await salesFetch(`/api/admin/restaurants/${restaurant.id}/tables`);
      const table = tables.find((item: any) => item.qrCode?.token) || tables[0];
      if (!table) {
        notice('Add a table to this restaurant before opening its QR');
        return;
      }
      setSelectedRestaurant(restaurant.name);
      setQrTable(table.label);
      setQrTableId(table.id);
      setQrToken(table.qrCode.token);
      setQrStatus(table.qrCode.status || 'ACTIVE');
      setModal('qr');
    } catch {
      notice('Could not load table QR codes');
    }
  };

  const saveRestaurant = async () => {
    if (!form.name?.trim() || !form.email?.trim()) {
      notice('Enter restaurant name and contact email');
      return;
    }
    const existing = editRestaurant === null ? undefined : restaurants[editRestaurant];
    if (!existing) {
      if (!form.adminName?.trim()) {
        notice('Enter restaurant manager / owner full name');
        return;
      }
      if (!form.adminEmail?.trim()) {
        notice('Enter manager login email');
        return;
      }
      if (!form.adminPassword || form.adminPassword.length < 6) {
        notice('Manager password must be at least 6 characters');
        return;
      }
      if (form.adminPassword !== form.confirmPassword) {
        notice('Passwords do not match');
        return;
      }
    }

    const payload = existing
      ? {
          name: form.name.trim(),
          cuisine: (form.cuisine || '').split(/[·,]/).map((x) => x.trim()).filter(Boolean),
          email: form.email.trim(),
          phone: form.phone || undefined,
          website: form.website || undefined,
          address: form.address || undefined,
          description: form.description || undefined,
          city: form.city || undefined,
          salesNotes: form.salesNotes || undefined,
          leadSource: form.leadSource || 'Field Visit',
        }
      : {
          name: form.name.trim(),
          cuisine: (form.cuisine || '').split(/[·,]/).map((x) => x.trim()).filter(Boolean),
          email: form.email.trim(),
          phone: form.phone || undefined,
          website: form.website || undefined,
          address: form.address || undefined,
          description: form.description || undefined,
          city: form.city || undefined,
          adminName: form.adminName?.trim(),
          adminEmail: form.adminEmail?.trim(),
          adminPassword: form.adminPassword,
          initialTableCount: Number(form.initialTableCount || 1),
          salesNotes: form.salesNotes || undefined,
          leadSource: form.leadSource || 'Field Visit',
        };

    setIsSubmitting(true);
    try {
      const response = await fetch(existing?.id ? `/api/restaurants/${existing.id}` : '/api/restaurants', {
        method: existing?.id ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json();
        notice(error.error || 'Could not save restaurant');
        return;
      }
      const data = await response.json();
      const r: Restaurant = {
        id: data.id,
        name: data.name,
        cuisine: Array.isArray(data.cuisine) ? data.cuisine.join(' · ') : (data.cuisine || 'Cuisine to be added'),
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        status: data.status === 'ACTIVE' ? 'Active' : 'Suspended',
        dishes: 0,
        today: 0,
        total: 0,
        tableCount: data._count?.tables || data.tableCount || Number(form.initialTableCount || 0),
        city: data.city || '—',
        initial: data.name.split(/\s+/).map((x: string) => x[0]).join('').slice(0, 2).toUpperCase(),
        color: '#e4f2e9',
        rating: '—',
        createdById: currentAccess?.id,
        salesExecutiveName: currentAccess?.name || '',
        salesExecutiveCode: currentAccess?.employeeId || '',
        salesExecutiveEmail: currentAccess?.email || '',
        salesNotes: form.salesNotes || '',
        leadSource: form.leadSource || '',
        createdAt: new Date().toISOString(),
      };

      setRestaurants((v) => (existing ? v.map((x, i) => (i === editRestaurant ? r : x)) : [r, ...v]));
      if (!restaurantId || editRestaurant === null) {
        setRestaurantId(data.id);
        setSelectedRestaurant(data.name);
      }
      setModal(null);
      notice(
        editRestaurant === null
          ? `🎉 Restaurant onboarded successfully with ${r.tableCount} Table QRs!`
          : 'Restaurant details updated'
      );
    } catch {
      notice('Could not connect to restaurant service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportCsv = (_type?: string) => {
    const rows = restaurants.map((r) => [
      r.name,
      r.email,
      r.status,
      r.cuisine,
      r.city,
      r.salesExecutiveName || '—',
      r.salesExecutiveCode || '—',
      r.leadSource || '—',
    ]);
    const csv = [
      ['Name', 'Admin Email', 'Status', 'Cuisine', 'City', 'Onboarded By', 'Employee ID', 'Lead Source'],
      ...rows,
    ]
      .map((r) => r.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `scanzaa-restaurants.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    notice('CSV export downloaded');
  };

  const currentRestaurant = restaurants.find((r) => r.name === selectedRestaurant) || restaurants[0];

  // --------------------------------------------------------------------------
  // LOGIN SCREEN
  // --------------------------------------------------------------------------
  if (showLogin || !signedIn) {
    return (
      <main className="login-page">
        <div className="login-left">
          <div className="login-left-orb1" />
          <div className="login-left-orb2" />
          <div className="login-brand-lockup">
            <img src="/scanzaa-horizontal-logo.png" alt="SCANZAA" className="login-brand-logo" />
            <div className="login-brand-divider" />
            <div className="login-brand-meta">
              <span className="login-brand-role" style={{ color: '#38bdf8' }}>Sales Executive Portal</span>
              <span className="login-brand-sub">powered by <strong>Renza</strong></span>
            </div>
          </div>
          <div className="login-center-showcase">
            <div className="login-pill-badge" style={{ borderColor: 'rgba(56,189,248,0.3)', color: '#7dd3fc', background: 'rgba(56,189,248,0.12)' }}>
              <Sparkles size={14} /> Field Operations & Restaurant Onboarding
            </div>
            <h1>
              Onboard Dining Partners, <span className="login-gradient-text">Deploy Instant QRs</span>
            </h1>
            <p className="lead-copy">
              Log in with your sales employee credentials to register restaurant partners, configure management accounts, generate live table QR codes, and sync directly with Super Admin.
            </p>
            <div className="login-feature-list">
              <div className="login-feature-card">
                <div className="login-feature-icon cyan"><Store size={18} /></div>
                <div className="login-feature-text">
                  <strong>Full Restaurant Onboarding Terminal</strong>
                  <small>Register new dining establishments with manager credentials and location details.</small>
                </div>
              </div>
              <div className="login-feature-card">
                <div className="login-feature-icon"><QrCode size={18} /></div>
                <div className="login-feature-text">
                  <strong>Automated Table QR Studio</strong>
                  <small>Instant table token generation with downloadable print-ready QR codes.</small>
                </div>
              </div>
              <div className="login-feature-card">
                <div className="login-feature-icon emerald"><ShieldCheck size={18} /></div>
                <div className="login-feature-text">
                  <strong>Employee Attribution & Super Admin Governance</strong>
                  <small>Every restaurant is logged under your employee profile for Super Admin monitoring.</small>
                </div>
              </div>
            </div>
          </div>
          <div className="login-left-footer">
            <div className="status-live">
              <span className="login-pulse-dot" />
              <span>Connected to Scanzaa Cloud & Super Admin API</span>
            </div>
            <span>v2.4 Field Ops</span>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card-super">
            <div className="login-card-head">
              <h2>Employee Sign In</h2>
              <p>Enter your issued credentials to access the Sales Executive terminal.</p>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const data = await salesFetch('/api/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email: loginEmail, password: loginPassword }),
                  });
                  if (data.token) {
                    setAuthToken(data.token);
                  }
                  setSignedIn(true);
                  setShowLogin(false);
                  setCurrentAccess(data.user);
                  if (data.user?.role === 'SUPER_ADMIN' || data.user?.role === 'superadmin') {
                    setRestaurantTab('all');
                  } else {
                    setRestaurantTab('my');
                  }
                  notice(`Welcome, ${data.user?.name || 'Sales Executive'}! (${data.user?.employeeId || 'EMP'})`);
                } catch (err: any) {
                  notice(err.message || 'Sign in failed. Check your email and password.');
                }
              }}
            >
              <div className="login-input-group">
                <label htmlFor="login-email">Employee Work Email</label>
                <div className="login-input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="name@scanzaa.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="login-input-group">
                <label htmlFor="login-password">Password</label>
                <div className="login-input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-eye-toggle"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="login-actions-row">
                <label>
                  <input type="checkbox" defaultChecked />
                  <span>Remember me</span>
                </label>
                <button type="button" onClick={() => notice('Contact Super Admin at admin@scanzaa.local to reset credentials')}>
                  Need help?
                </button>
              </div>

              <button type="submit" className="login-btn-submit">
                <span>Sign in to Sales Portal</span>
                <ArrowRight size={19} />
              </button>
            </form>
            <div className="login-card-foot">
              <span>Scanzaa Sales Terminal • <strong>powered by Renza</strong></span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (pathname.startsWith('/menu/')) return <>{children}</>;

  // --------------------------------------------------------------------------
  // AUTHENTICATED APP SHELL
  // --------------------------------------------------------------------------
  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${drawer ? 'drawer-open' : ''}`}>
        <div className="sidebar-brand">
          <Logo compact={collapsed} isSales={true} />
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Collapse sidebar">
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="sidebar-scroll">
          <div className="nav-label">
            SALES WORKSPACE
          </div>
          <nav>
            {visibleNavItems.map((item) => {
              const I = item.icon;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${section === item.id || (item.id === 'restaurants' && section === 'onboard') ? 'active' : ''}`}
                  onClick={() => nav(item.id)}
                  title={collapsed ? item.label : undefined}
                >
                  <I size={18} />
                  <span>{item.label}</span>
                  {item.badge && <i>{item.badge}</i>}
                </button>
              );
            })}
          </nav>

          {canAccessSection('settings') && (
            <>
              <div className="nav-label settings-label">PREFERENCES</div>
              <nav>
                <button
                  className={`nav-item ${section === 'settings' ? 'active' : ''}`}
                  onClick={() => nav('settings')}
                  title={collapsed ? 'Settings' : undefined}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
              </nav>
            </>
          )}
        </div>

        {/* LOGGED IN USER FOOTER */}
        <div className="sidebar-user">
          <div className="avatar avatar-teal">
            {currentAccess?.name
              .split(/\s+/)
              .map((part) => part[0])
              .slice(0, 2)
              .join('')
              .toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <strong>{currentAccess?.name || 'User'}</strong>
            <small>
              {isSalesExecutive
                ? `Sales Executive${currentAccess?.employeeId ? ` · ${currentAccess.employeeId}` : ''}`
                : isGlobalAdmin
                ? 'Super Admin'
                : (currentAccess?.role?.replaceAll('_', ' ') || '')}
            </small>
          </div>
          <button
            className="user-menu"
            onClick={() =>
              setConfirm({
                title: 'Sign out?',
                message: 'You will return to the secure sign-in screen.',
                action: () => {
                  clearAuthToken();
                  setSignedIn(false);
                  setCurrentAccess(null);
                  setShowLogin(true);
                },
              })
            }
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className={`mobile-shade ${drawer ? 'visible' : ''}`} onClick={() => setDrawer(false)} />

      {/* MAIN CONTENT AREA */}
      <main className="main-area">
        {/* TOPBAR */}
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setDrawer(true)} aria-label="Open navigation">
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            <span>{isSalesExecutive ? 'Sales Executive Terminal' : 'Super Admin Portal'}</span>
            <ChevronRight size={14} />
            <strong>{section === 'onboard' ? 'Onboard New Restaurant' : navItems.find((n) => n.id === section)?.label || 'Overview'}</strong>
          </div>

          <div className="top-actions">
            {/* Active Executive Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '7px 16px',
                borderRadius: 12,
                fontSize: 13,
              }}
            >
              <Briefcase size={16} color="#0891b2" />
              <span style={{ fontWeight: 700, color: '#1e293b' }}>
                {currentAccess?.name || 'Signed In'}
              </span>
              {currentAccess?.employeeId && (
                <span className="employee-pill">
                  {currentAccess.employeeId}
                </span>
              )}
              {currentAccess?.territory && (
                <span style={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>
                  ({currentAccess.territory})
                </span>
              )}
            </div>

            <button className="top-icon" title="Notifications" onClick={() => notice('All team updates synced')}>
              <Bell size={18} />
              <i />
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="page-content">
          {section === 'overview' && (
            <Overview
              currentAccess={currentAccess}
              restaurants={restaurants}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              nav={nav}
              notice={notice}
              openOnboard={openOnboardPage}
            />
          )}

          {section === 'onboard' && (
            <OnboardRestaurantPage
              currentAccess={currentAccess}
              onCancel={cancelOnboardPage}
              onSuccess={(newRestaurant) => {
                setRestaurants((prev) => [newRestaurant, ...prev]);
                fetchRestaurants();
                cancelOnboardPage();
              }}
              notice={notice}
            />
          )}

          {section === 'restaurants' && (
            <RestaurantsPage
              currentAccess={currentAccess}
              restaurants={filteredRestaurants}
              all={restaurants}
              search={search}
              setSearch={setSearch}
              filter={filter}
              setFilter={setFilter}
              restaurantTab={restaurantTab}
              setRestaurantTab={setRestaurantTab}
              selectedExecutiveFilter={selectedExecutiveFilter}
              setSelectedExecutiveFilter={setSelectedExecutiveFilter}
              open={openOnboardPage}
              edit={openModal}
              toggle={toggleStatus}
              setSelected={setSelectedRestaurant}
              setQrTable={setQrTable}
              openQr={openQrForRestaurant}
              inspect={(r) => {
                setInspectRestaurant(r);
                setModal('details');
              }}
              setModal={setModal}
              confirm={setConfirm}
              remove={removeRestaurant}
              nav={nav}
              exportCsv={exportCsv}
              page={page}
              setPage={setPage}
              notice={notice}
              canWrite={isGlobalAdmin || isSalesExecutive || Boolean(currentAccess?.permissions.includes('restaurants.write'))}
            />
          )}

          {section === 'settings' && <SettingsPage notice={notice} currentAccess={currentAccess} />}
        </div>

        {/* FOOTER */}
        <footer className="app-footer">
          <span>© 2026 Scanzaa · Powered by Renza · Salesforce Executive Operations</span>
          <span><span className="system-status" /> Connected to Super Admin Central</span>
        </footer>
      </main>

      {/* -------------------------------------------------------------------- */}
      {/* MODAL: RESTAURANT ONBOARDING WIZARD */}
      {/* -------------------------------------------------------------------- */}
      {modal === 'restaurant' && (
        <Modal
          title={editRestaurant === null ? 'Onboard New Restaurant' : 'Edit Restaurant'}
          subtitle={
            editRestaurant === null
              ? `Logged in as ${currentAccess?.name || 'Sales Executive'} (${currentAccess?.employeeId || 'EMP'}). Provision credentials and generate instant table QRs.`
              : 'Update restaurant profile and contact information.'
          }
          close={() => setModal(null)}
          wide
        >
          {editRestaurant !== null ? (
            <div className="form-grid">
              <div className="form-section-heading">Restaurant Information</div>
              <Field label="Restaurant name" placeholder="e.g. Royal Spice" required value={form.name} onChange={(v) => update('name', v)} />
              <Field label="Cuisine" placeholder="e.g. South Indian, Biryani" value={form.cuisine} onChange={(v) => update('cuisine', v)} />
              <Field label="Admin email" type="email" placeholder="admin@restaurant.com" required value={form.email} onChange={(v) => update('email', v)} />
              <Field label="Phone number" placeholder="+91 98765 43210" value={form.phone} onChange={(v) => update('phone', v)} />
              <Field label="City" placeholder="Bengaluru" value={form.city} onChange={(v) => update('city', v)} />
              <Field label="Website" placeholder="restaurant.com" value={form.website} onChange={(v) => update('website', v)} />
              <Field label="Street address" placeholder="Street, area, landmark" value={form.address} onChange={(v) => update('address', v)} />
              <div className="field full-width">
                <span>Restaurant description</span>
                <textarea placeholder="A few words about this restaurant…" value={form.description || ''} onChange={(e) => update('description', e.target.value)} />
              </div>
              <div className="field full-width">
                <span>Sales Executive Field Notes</span>
                <textarea placeholder="Notes on client meetings, target dates, or special requests…" value={form.salesNotes || ''} onChange={(e) => update('salesNotes', e.target.value)} />
              </div>
              <div className="modal-actions full-width" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="button secondary" onClick={() => setModal(null)}>Cancel</button>
                <Button onClick={saveRestaurant} icon={<Check size={16} />}>Save changes</Button>
              </div>
            </div>
          ) : (
            <div className="onboarding-wizard">
              {/* Wizard Steps Bar */}
              <div style={{ display: 'flex', borderBottom: '1px solid #eff1f3', background: '#fafbfc', padding: '12px 21px', gap: 16 }}>
                <button
                  type="button"
                  onClick={() => setOnboardStep(1)}
                  style={{
                    border: 0,
                    background: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 14,
                    fontWeight: onboardStep === 1 ? 800 : 600,
                    color: onboardStep === 1 ? '#0bb8ae' : '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: onboardStep === 1 ? '#0bb8ae' : onboardStep > 1 ? '#10b981' : '#e2e8f0',
                      color: onboardStep >= 1 ? '#fff' : '#64748b',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    1
                  </span>
                  <span>01. Dining Profile</span>
                </button>
                <span style={{ color: '#cbd5e1', alignSelf: 'center', fontSize: 16 }}>→</span>
                <button
                  type="button"
                  onClick={() => {
                    if (!form.name?.trim() || !form.email?.trim()) {
                      notice('Enter restaurant name and email first');
                      return;
                    }
                    setOnboardStep(2);
                  }}
                  style={{
                    border: 0,
                    background: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 14,
                    fontWeight: onboardStep === 2 ? 800 : 600,
                    color: onboardStep === 2 ? '#0bb8ae' : '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: onboardStep === 2 ? '#0bb8ae' : onboardStep > 2 ? '#10b981' : '#e2e8f0',
                      color: onboardStep >= 2 ? '#fff' : '#64748b',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    2
                  </span>
                  <span>02. Admin Credentials</span>
                </button>
                <span style={{ color: '#cbd5e1', alignSelf: 'center', fontSize: 16 }}>→</span>
                <button
                  type="button"
                  onClick={() => {
                    if (!form.name?.trim() || !form.email?.trim()) {
                      notice('Enter restaurant name and email first');
                      return;
                    }
                    setOnboardStep(3);
                  }}
                  style={{
                    border: 0,
                    background: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 14,
                    fontWeight: onboardStep === 3 ? 800 : 600,
                    color: onboardStep === 3 ? '#0bb8ae' : '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: onboardStep === 3 ? '#0bb8ae' : '#e2e8f0',
                      color: onboardStep === 3 ? '#fff' : '#64748b',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    3
                  </span>
                  <span>03. Table QRs & Attribution</span>
                </button>
              </div>

              {/* STEP 1: RESTAURANT PROFILE */}
              {onboardStep === 1 && (
                <div className="form-grid">
                  <div className="form-section-heading">
                    Restaurant Information <span>STEP 01 / 03</span>
                  </div>
                  <Field label="Restaurant name" placeholder="e.g. Royal Spice Garden" required value={form.name} onChange={(v) => update('name', v)} />
                  <Field label="Cuisine" placeholder="e.g. South Indian & Chettinad, Biryani" value={form.cuisine} onChange={(v) => update('cuisine', v)} />
                  <Field
                    label="Contact / Admin email"
                    type="email"
                    placeholder="admin@restaurant.com"
                    required
                    value={form.email}
                    onChange={(v) => {
                      update('email', v);
                      if (!form.adminEmail) update('adminEmail', v);
                    }}
                  />
                  <Field label="Phone number" placeholder="+91 98765 43210" value={form.phone} onChange={(v) => update('phone', v)} />
                  <Field label="City" placeholder="e.g. Bengaluru" value={form.city} onChange={(v) => update('city', v)} />
                  <Field label="Website" placeholder="e.g. royalspice.in" value={form.website} onChange={(v) => update('website', v)} />
                  <Field label="Dining street address" placeholder="Full street address, area, pincode" value={form.address} onChange={(v) => update('address', v)} />
                  <Field
                    label="Lead Source"
                    options={['Field Visit', 'Referral', 'Inbound Inquiry', 'Cold Outreach', 'Partner Conference']}
                    value={form.leadSource || 'Field Visit'}
                    onChange={(v) => update('leadSource', v)}
                  />
                  <div className="field full-width">
                    <span>Restaurant description</span>
                    <textarea placeholder="Brief tagline or specialty of the kitchen…" value={form.description || ''} onChange={(e) => update('description', e.target.value)} />
                  </div>
                  <div className="modal-actions full-width" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="button secondary" onClick={() => setModal(null)}>Cancel</button>
                    <Button
                      onClick={() => {
                        if (!form.name?.trim()) {
                          notice('Restaurant name is required');
                          return;
                        }
                        if (!form.email?.trim()) {
                          notice('Contact email is required');
                          return;
                        }
                        if (!form.adminEmail) update('adminEmail', form.email.trim());
                        if (!form.adminName) update('adminName', `${form.name.trim()} Manager`);
                        setOnboardStep(2);
                      }}
                      icon={<ArrowRight size={16} />}
                    >
                      Continue to Admin Credentials
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: RESTAURANT ADMIN CREDENTIALS */}
              {onboardStep === 2 && (
                <div className="form-grid">
                  <div className="form-section-heading">
                    Partner Admin Account <span>STEP 02 / 03</span>
                  </div>
                  <div className="field full-width" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ShieldCheck size={22} color="#16a34a" />
                    <div style={{ fontSize: 13, color: '#166534' }}>
                      <strong style={{ fontSize: 14 }}>Restaurant Admin Portal Credentials</strong>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#15803d', lineHeight: 1.5 }}>
                        The restaurant owner/manager will use this email and password to manage their live orders, kitchen menu, and staff.
                      </p>
                    </div>
                  </div>
                  <Field label="Admin full name" placeholder="e.g. Vikramaditya Rao" required value={form.adminName} onChange={(v) => update('adminName', v)} />
                  <Field label="Admin login email" type="email" placeholder="manager@restaurant.com" required value={form.adminEmail} onChange={(v) => update('adminEmail', v)} />
                  <div className="field">
                    <span>Admin password <b>*</b></span>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        placeholder="Create secure password (min 6 chars)"
                        value={form.adminPassword || ''}
                        onChange={(e) => update('adminPassword', e.target.value)}
                        style={{ width: '100%', paddingRight: 40 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        style={{ position: 'absolute', right: 10, background: 'none', border: 0, color: '#94a3b8', cursor: 'pointer', padding: 6 }}
                      >
                        {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="field">
                    <span>Confirm password <b>*</b></span>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={form.confirmPassword || ''}
                        onChange={(e) => update('confirmPassword', e.target.value)}
                        style={{ width: '100%', paddingRight: 40 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ position: 'absolute', right: 10, background: 'none', border: 0, color: '#94a3b8', cursor: 'pointer', padding: 6 }}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {form.confirmPassword && form.adminPassword !== form.confirmPassword && (
                      <span style={{ fontSize: 12, color: '#ef4444', marginTop: 4, display: 'block', fontWeight: 600 }}>Passwords do not match</span>
                    )}
                  </div>
                  <div className="modal-actions full-width" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="button secondary" onClick={() => setOnboardStep(1)}>← Back</button>
                    <Button
                      onClick={() => {
                        if (!form.adminName?.trim()) {
                          notice('Admin full name is required');
                          return;
                        }
                        if (!form.adminEmail?.trim()) {
                          notice('Admin login email is required');
                          return;
                        }
                        if (!form.adminPassword || form.adminPassword.length < 6) {
                          notice('Password must be at least 6 characters');
                          return;
                        }
                        if (form.adminPassword !== form.confirmPassword) {
                          notice('Passwords do not match');
                          return;
                        }
                        setOnboardStep(3);
                      }}
                      icon={<ArrowRight size={16} />}
                    >
                      Continue to Table QRs & Attribution
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: TABLES, QR GENERATION & SALES ATTRIBUTION */}
              {onboardStep === 3 && (
                <div className="form-grid">
                  <div className="form-section-heading">
                    Table Setup & Sales Executive Attribution <span>STEP 03 / 03</span>
                  </div>

                  {/* ATTRIBUTION CALLOUT */}
                  <div className="field full-width attribution-banner">
                    <UserCheck size={26} color="#0d9488" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: 14 }}>Attributed Sales Executive: {currentAccess?.name || '—'}</strong>
                      <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.5 }}>
                        Employee ID: <b>{currentAccess?.employeeId || '—'}</b> · Email: {currentAccess?.email || '—'} · Territory: {currentAccess?.territory || 'Unassigned'}.
                        All details and audit records will be linked to your account and visible to Super Admin.
                      </p>
                    </div>
                  </div>

                  <Field label="Initial dining tables count" type="number" value={form.initialTableCount || '5'} onChange={(v) => update('initialTableCount', v)} />
                  <div className="field">
                    <span>Generated Table Labels</span>
                    <input type="text" disabled value={Number(form.initialTableCount) > 0 ? `Table 01 to Table ${String(Number(form.initialTableCount)).padStart(2, '0')}` : 'None'} style={{ background: '#f8fafc', color: '#64748b' }} />
                  </div>

                  <div className="field full-width">
                    <span>Sales Executive Field Notes / Meeting Remarks</span>
                    <textarea
                      placeholder="e.g. Met owner Karthik. Demonstrated live digital menu. 5 tables provisioned for immediate dining service."
                      value={form.salesNotes || ''}
                      onChange={(e) => update('salesNotes', e.target.value)}
                    />
                  </div>

                  <div className="field full-width" style={{ background: '#fafafa', border: '1px dashed #cbd5e1', borderRadius: 12, padding: 18 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: 8 }}>
                      Onboarding Summary & Super Admin Attribution:
                    </span>
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#475569', lineHeight: 1.8 }}>
                      <li>Restaurant: <b>{form.name}</b> ({form.city || 'Location unspecified'})</li>
                      <li>Cuisine: {form.cuisine || 'Multi-cuisine'}</li>
                      <li>Partner Admin: <b>{form.adminName}</b> ({form.adminEmail})</li>
                      <li>Instant Table QRs: <b>{form.initialTableCount || 0} unique tokens provisioned</b></li>
                      <li>Onboarded By: <b>{currentAccess?.name || '—'}</b> (Code: {currentAccess?.employeeId || '—'})</li>
                      <li>Lead Source: {form.leadSource || '—'}</li>
                    </ul>
                  </div>

                  <div className="modal-actions full-width" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="button secondary" onClick={() => setOnboardStep(2)}>← Back</button>
                    <Button disabled={isSubmitting} onClick={saveRestaurant} icon={<Check size={16} />}>
                      {isSubmitting ? 'Onboarding & Generating QRs…' : 'Complete Onboarding & Generate QRs'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* MODAL: RESTAURANT DETAILS & ATTRIBUTION INSPECTION */}
      {/* -------------------------------------------------------------------- */}
      {modal === 'details' && inspectRestaurant && (
        <Modal
          title={`Restaurant Dossier: ${inspectRestaurant.name}`}
          subtitle={`Registered on ${new Date(inspectRestaurant.createdAt || Date.now()).toLocaleDateString()} · Super Admin Monitored`}
          close={() => setModal(null)}
          wide
        >
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Sales Executive Attribution Card */}
            <div style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)', border: '1px solid #7dd3fc', borderRadius: 16, padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Award size={22} color="#0284c7" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Sales Executive Attribution
                  </span>
                </div>
                {inspectRestaurant.leadSource && (
                  <span className="lead-badge" style={{ background: '#0284c7', color: '#fff', fontSize: 11, padding: '4px 10px' }}>
                    {inspectRestaurant.leadSource}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 12 }}>
                <div>
                  <small style={{ fontSize: 11, color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Added by Employee</small>
                  <strong style={{ fontSize: 15, color: '#0f172a' }}>{inspectRestaurant.salesExecutiveName || '—'}</strong>
                </div>
                <div>
                  <small style={{ fontSize: 11, color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Employee ID</small>
                  {inspectRestaurant.salesExecutiveCode ? (
                    <span className="employee-pill" style={{ marginTop: 4 }}>{inspectRestaurant.salesExecutiveCode}</span>
                  ) : (
                    <span style={{ fontSize: 13, color: '#334155' }}>—</span>
                  )}
                </div>
                <div>
                  <small style={{ fontSize: 11, color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Employee Email</small>
                  <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{inspectRestaurant.salesExecutiveEmail || '—'}</span>
                </div>
              </div>

              {inspectRestaurant.salesNotes && (
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <small style={{ fontSize: 11, color: '#0284c7', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Sales Executive Field Notes / Meeting Remarks</small>
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: '#334155', fontStyle: 'italic', background: '#ffffff90', padding: '10px 14px', borderRadius: 10, lineHeight: 1.6 }}>
                    "{inspectRestaurant.salesNotes}"
                  </p>
                </div>
              )}
            </div>

            {/* Restaurant Profile Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: 12 }}>Restaurant Profile</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                  <div><span style={{ color: '#64748b' }}>Cuisine:</span> <b>{inspectRestaurant.cuisine}</b></div>
                  <div><span style={{ color: '#64748b' }}>City:</span> <b>{inspectRestaurant.city}</b></div>
                  <div><span style={{ color: '#64748b' }}>Address:</span> {inspectRestaurant.address || '—'}</div>
                  <div><span style={{ color: '#64748b' }}>Status:</span> <span className={`status ${inspectRestaurant.status === 'Active' ? 'status-active' : 'status-suspended'}`}><i />{inspectRestaurant.status}</span></div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: 12 }}>Manager / Admin Credentials</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                  <div><span style={{ color: '#64748b' }}>Contact Email:</span> <b>{inspectRestaurant.email}</b></div>
                  <div><span style={{ color: '#64748b' }}>Contact Phone:</span> {inspectRestaurant.phone || '—'}</div>
                  <div><span style={{ color: '#64748b' }}>Dining Tables:</span> <b>{inspectRestaurant.tableCount ?? 0} Tables Provisioned</b></div>
                  <div><span style={{ color: '#64748b' }}>Live QR State:</span> <b style={{ color: '#16a34a' }}>Active & Ready for Diners</b></div>
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: 0 }}>
              <button className="button secondary" onClick={() => setModal(null)}>Close</button>
              <Button onClick={() => openQrForRestaurant(inspectRestaurant)} icon={<QrCode size={16} />}>
                Open QR Studio
              </Button>
            </div>
          </div>
        </Modal>
      )}



      {/* QR MODAL */}
      {modal === 'qr' && (
        <QrModal
          restaurantId={restaurantId}
          tableId={qrTableId}
          restaurant={currentRestaurant?.name || selectedRestaurant || 'Restaurant'}
          table={qrTable}
          token={qrToken}
          status={qrStatus}
          close={() => setModal(null)}
          notice={notice}
        />
      )}

      {/* TABLE MANAGER MODAL */}
      {modal === 'table' && (
        <TableManagerModal
          restaurants={restaurants}
          restaurantId={restaurantId}
          restaurant={selectedRestaurant}
          onRestaurantChange={(id) => {
            setRestaurantId(id);
            const selected = restaurants.find((item) => item.id === id);
            if (selected) setSelectedRestaurant(selected.name);
          }}
          close={() => setModal(null)}
          openQr={(table) => {
            if (!table.qrCode) return;
            const qr = table.qrCode;
            setQrTable(table.label);
            setQrTableId(table.id);
            setQrToken(qr.token);
            setQrStatus(qr.status);
            setModal('qr');
          }}
          notice={notice}
        />
      )}

      {/* CONFIRMATION DIALOG */}
      {confirm && (
        <Modal title={confirm.title} subtitle={confirm.message} close={() => setConfirm(null)}>
          <div className="modal-actions">
            <button className="button secondary" onClick={() => setConfirm(null)}>Cancel</button>
            <Button kind="danger" onClick={() => { confirm.action(); setConfirm(null); }}>Confirm</Button>
          </div>
        </Modal>
      )}

      {/* TOAST */}
      {toast && (
        <div className="toast">
          <span><Check size={15} /></span>
          {toast}
          <button onClick={() => setToast('')} aria-label="Dismiss"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// DASHBOARD & GOALS (OVERVIEW)
// ----------------------------------------------------------------------------
function Overview({
  currentAccess,
  restaurants,
  timeframe,
  setTimeframe,
  nav,
  notice,
  openOnboard,
}: {
  currentAccess: UserAccess | null;
  restaurants: Restaurant[];
  timeframe: string;
  setTimeframe: (v: string) => void;
  nav: (s: Section) => void;
  notice: (s: string) => void;
  openOnboard: () => void;
}) {
  const isSales = currentAccess?.role === 'SALES_EXECUTIVE';

  // Metrics calculation directly from live data
  const myRestaurants = useMemo(
    () => restaurants.filter((r) => r.createdById === currentAccess?.id || (currentAccess?.employeeId && r.salesExecutiveCode === currentAccess?.employeeId)),
    [restaurants, currentAccess]
  );

  const displayList = isSales ? myRestaurants : restaurants;
  const activeCount = displayList.filter((r) => r.status === 'Active').length;
  const totalTables = displayList.reduce((sum, r) => sum + (r.tableCount ?? 0), 0);
  const totalScans = displayList.reduce((sum, r) => sum + (r.total || 0), 0);

  // Dynamic monthly target progress
  const monthlyTarget = 10;
  const targetPercent = monthlyTarget > 0 ? Math.min(100, Math.round((myRestaurants.length / monthlyTarget) * 100)) : 0;

  // Real scan distribution across the week based on actual scanned totals
  const scansData: ScanPoint[] = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weights = [0.11, 0.13, 0.12, 0.15, 0.18, 0.20, 0.11];
    return days.map((day, idx) => ({
      day,
      scans: Math.round(totalScans * weights[idx]),
      orders: Math.round(totalScans * weights[idx] * 0.18),
    }));
  }, [totalScans]);

  return (
    <>
      {/* HERO BANNER */}
      <div
        style={{
          background: isSales
            ? 'linear-gradient(135deg, #030d1e 0%, #0c2340 50%, #041226 100%)'
            : 'linear-gradient(135deg, #040914 0%, #0d1e38 50%, #040914 100%)',
          borderRadius: 24,
          padding: '36px 44px',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          marginBottom: 32,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: isSales ? 'rgba(56,189,248,0.15)' : 'rgba(11,184,174,0.15)',
              border: isSales ? '1px solid rgba(56,189,248,0.3)' : '1px solid rgba(11,184,174,0.3)',
              borderRadius: 999,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 800,
              color: isSales ? '#38bdf8' : '#2dd4bf',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 14,
            }}
          >
            {isSales ? <Briefcase size={15} /> : <Sparkles size={15} />}
            {isSales ? `Sales Executive${currentAccess?.employeeId ? ` · ${currentAccess.employeeId}` : ''}` : 'Super Admin Governance'}
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', margin: 0, color: '#ffffff', lineHeight: 1.25 }}>
            {isSales ? `Welcome back, ${currentAccess?.name || 'Executive'}` : 'Platform Governance & Sales Monitoring'}
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: 15, color: '#94a3b8', maxWidth: 680, lineHeight: 1.65 }}>
            {isSales
              ? `You are logged in as a field sales executive${currentAccess?.territory ? ` for ${currentAccess.territory}` : ''}. Add restaurants, manage dining table QRs, and view real-time data.`
              : 'Command center monitoring all restaurant onboarding velocity, active sales employees, and platform QR traffic.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            className="button secondary"
            onClick={() => notice('Syncing live data from cloud…')}
            style={{ background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.15)', height: 46, padding: '0 20px', fontSize: 14, fontWeight: 700 }}
          >
            <RotateCcw size={16} /> Refresh
          </button>
          <button
            className="button primary"
            onClick={openOnboard}
            style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #0bb8ae 100%)',
              border: 0,
              color: '#020617',
              height: 48,
              padding: '0 24px',
              fontSize: 15,
              fontWeight: 800,
              boxShadow: '0 4px 18px rgba(11,184,174,0.4)',
            }}
          >
            <Plus size={18} /> Onboard New Restaurant
          </button>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="section-label-row">
        <div>
          <h2>{isSales ? 'My Sales Performance & Targets' : 'Platform & Team Metrics'}</h2>
          <p>{isSales ? 'Track your personal onboarded restaurants and QR deployments' : 'Real-time multi-tenant monitoring across all sales executives'}</p>
        </div>
        <span className="live-pill"><i /> REALTIME ATTRIBUTION</span>
      </div>

      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <Metric
          label={isSales ? 'My Onboarded Restaurants' : 'Total Restaurants'}
          value={String(isSales ? myRestaurants.length : restaurants.length).padStart(2, '0')}
          change={isSales ? `${targetPercent}% of monthly goal` : `${activeCount} active`}
          icon={Building2}
          tint="teal"
        />
        <Metric
          label="Active Dining Partners"
          value={String(activeCount).padStart(2, '0')}
          change="Serving diners"
          icon={Store}
          tint="green"
        />
        <Metric
          label={isSales ? 'Table QRs Deployed by Me' : 'Total Table QRs Provisioned'}
          value={String(totalTables)}
          change={`${displayList.length} partners`}
          icon={QrCode}
          tint="blue"
        />
        <Metric
          label={isSales ? 'Monthly Target Quota' : 'Platform Target Progress'}
          value={isSales ? `${myRestaurants.length} / ${monthlyTarget}` : `${displayList.length} / ${monthlyTarget * 5}`}
          change={isSales ? `${targetPercent}% done` : `${Math.min(100, Math.round((displayList.length / (monthlyTarget * 5)) * 100))}% of quarterly goal`}
          icon={Target}
          tint="purple"
        />
      </div>

      {/* CHARTS & RECENT ONBOARDINGS */}
      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h3>QR Scan Activity</h3>
              <p>Diner engagement across {isSales ? 'your onboarded restaurants' : 'all locations'}</p>
            </div>
            <select className="small-select" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
              <option>Today</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="chart-summary">
            <strong>{totalScans.toLocaleString()}</strong>
            <small>total QR menu scans across {displayList.length} partner{displayList.length === 1 ? '' : 's'}</small>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scansData} margin={{ top: 12, right: 6, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scanFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0bb8ae" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0bb8ae" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef1f5" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} dy={10} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} />
                <Tooltip contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 14, fontSize: 14, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="scans" stroke="#09aaa3" strokeWidth={3} fill="url(#scanFill)" activeDot={{ r: 6, strokeWidth: 3, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            <span><i /> Diner Menu Scans</span>
            <span>Synchronized with Super Admin cloud</span>
          </div>
        </section>

        {/* RECENT ONBOARDINGS LIST */}
        <section className="panel performance-panel">
          <div className="panel-head">
            <div>
              <h3>Recent Onboardings</h3>
              <p>Partners registered with live QR studios</p>
            </div>
            <button className="text-action" onClick={() => nav('restaurants')}>
              View all <ArrowRight size={16} />
            </button>
          </div>
          <div className="performance-list">
            {displayList.length === 0 ? (
              <p style={{ padding: '36px 0', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
                No restaurants onboarded yet. Click "+ Onboard New Restaurant" to add your first restaurant.
              </p>
            ) : (
              displayList.slice(0, 4).map((r, i) => (
                <div className="performance-row" key={r.id ? `perf-${r.id}` : `perf-${r.name}-${i}`}>
                  <div className="restaurant-avatar" style={{ background: r.color }}>{r.initial}</div>
                  <div className="performance-name">
                    <strong>{r.name}</strong>
                    <small>
                      {r.city} · Onboarded by: <span style={{ color: '#0891b2', fontWeight: 600 }}>{r.salesExecutiveName || currentAccess?.name || '—'}</span>
                    </small>
                  </div>
                  {r.leadSource && <span className="lead-badge">{r.leadSource}</span>}
                  <strong className="scan-total">{r.tableCount ?? 0}<small> tables</small></strong>
                </div>
              ))
            )}
          </div>
          <button className="panel-bottom-link" onClick={() => nav('restaurants')}>
            Inspect full directory <ArrowRight size={14} />
          </button>
        </section>

      </div>
    </>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="search-box">
      <Search size={17} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      {value && (
        <button onClick={() => onChange('')} aria-label="Clear search">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

function PageHeading({
  eyebrow, title, description, actions
}: {
  eyebrow?: string; title: string; description: string; actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="heading-actions">{actions}</div>}
    </div>
  );
}

function Metric({
  label, value, change, icon: Icon, tint = 'teal'
}: {
  label: string; value: string; change: string; icon: typeof Building2; tint?: string;
}) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tint}`}><Icon size={19} /></div>
      <div className="metric-change"><ArrowUpRight size={13} />{change}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
      <div className="metric-spark">
        <span style={{ height: '32%' }} />
        <span style={{ height: '54%' }} />
        <span style={{ height: '45%' }} />
        <span style={{ height: '70%' }} />
        <span style={{ height: '62%' }} />
        <span style={{ height: '86%' }} />
        <span style={{ height: '72%' }} />
        <span style={{ height: '100%' }} />
      </div>
    </article>
  );
}

// ----------------------------------------------------------------------------
// RESTAURANTS & QRS PAGE (WITH EMPLOYEE ATTRIBUTION & TABS)
// ----------------------------------------------------------------------------
function RestaurantsPage({
  currentAccess,
  restaurants,
  all,
  search,
  setSearch,
  filter,
  setFilter,
  restaurantTab,
  setRestaurantTab,
  selectedExecutiveFilter,
  setSelectedExecutiveFilter,
  open,
  edit,
  toggle,
  setSelected,
  setQrTable,
  openQr,
  inspect,
  setModal,
  confirm,
  remove,
  nav,
  exportCsv,
  page,
  setPage,
  notice,
  canWrite,
}: {
  currentAccess: UserAccess | null;
  restaurants: Restaurant[];
  all: Restaurant[];
  search: string;
  setSearch: (s: string) => void;
  filter: string;
  setFilter: (s: string) => void;
  restaurantTab: 'my' | 'all';
  setRestaurantTab: (t: 'my' | 'all') => void;
  selectedExecutiveFilter: string;
  setSelectedExecutiveFilter: (e: string) => void;
  open: () => void;
  edit: (m: 'restaurant' | 'table' | 'qr', i?: number) => void;
  toggle: (i: number) => void;
  setSelected: (s: string) => void;
  setQrTable: (s: string) => void;
  openQr: (r: Restaurant) => void;
  inspect: (r: Restaurant) => void;
  setModal: (s: 'restaurant' | 'table' | 'qr' | 'details' | null) => void;
  confirm: (v: { title: string; message: string; action: () => void } | null) => void;
  remove: (r: Restaurant) => void;
  nav: (s: Section) => void;
  exportCsv: (s: string) => void;
  page: number;
  setPage: (n: number) => void;
  notice: (s: string) => void;
  canWrite: boolean;
}) {
  const isGlobalAdmin = currentAccess?.role === 'SUPER_ADMIN' || currentAccess?.role === 'COMPANY_ADMIN';
  const myCount = all.filter((r) => r.createdById === currentAccess?.id || r.salesExecutiveCode === currentAccess?.employeeId).length;

  // Unique list of sales executives from the dataset
  const executivesList = Array.from(new Set(all.map((r) => r.salesExecutiveName).filter(Boolean)));

  return (
    <>
      <PageHeading
        eyebrow="FIELD ONBOARDING DIRECTORY"
        title="Restaurants & Table QRs"
        description="Monitor partner restaurants, owner credentials, and employee attribution."
        actions={
          <>
            <button className="button secondary refresh-button" onClick={() => notice('Restaurant list refreshed')}>
              <RotateCcw size={16} />
            </button>
            {canWrite && (
              <>
                <Button kind="secondary" onClick={() => edit('table')} icon={<QrCode size={16} />}>
                  Manage Tables
                </Button>
                <Button onClick={open} icon={<Plus size={17} />}>
                  Onboard Restaurant
                </Button>
              </>
            )}
          </>
        }
      />

      {/* STAT STRIP */}
      <div className="restaurant-stat-strip">
        <div>
          <span className="strip-icon teal"><Building2 size={20} /></span>
          <div>
            <strong>{all.length}</strong>
            <small>Total Partners</small>
          </div>
        </div>
        <div>
          <span className="strip-icon green"><CircleCheck size={20} /></span>
          <div>
            <strong>{all.filter((r) => r.status === 'Active').length}</strong>
            <small>Active Partners</small>
          </div>
        </div>
        <div>
          <span className="strip-icon amber"><Award size={20} /></span>
          <div>
            <strong>{myCount}</strong>
            <small>Onboarded by Me</small>
          </div>
        </div>
        <div className="strip-right">
          <span className="live-pill"><i /> SUPER ADMIN SYNCED</span>
        </div>
      </div>

      {/* DIRECTORY PANEL */}
      <section className="panel directory-panel">
        <div className="directory-title">
          <div>
            <h2>
              {restaurantTab === 'my' ? 'My Onboarded Restaurants' : 'All Platform Restaurants'}{' '}
              <span>{restaurants.length}</span>
            </h2>
            <p>Every restaurant is verified and linked to its onboarding employee.</p>
          </div>

          <div className="directory-actions">
            {/* View Tabs */}
            <div className="sales-tab-bar">
              <button
                type="button"
                className={`sales-tab-btn ${restaurantTab === 'my' ? 'active' : ''}`}
                onClick={() => setRestaurantTab('my')}
              >
                <Briefcase size={16} /> My Onboardings ({myCount})
              </button>
              <button
                type="button"
                className={`sales-tab-btn ${restaurantTab === 'all' ? 'active' : ''}`}
                onClick={() => setRestaurantTab('all')}
              >
                <Store size={16} /> All Team Onboardings ({all.length})
              </button>
            </div>

            <button className="button secondary" onClick={() => exportCsv('restaurants')}>
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
          <SearchBox value={search} onChange={setSearch} placeholder="Search name, city, employee name or ID..." />

          <div className="filter-pills">
            {['All', 'Active', 'Suspended'].map((x) => (
              <button key={x} className={filter === x ? 'selected' : ''} onClick={() => setFilter(x)}>
                {x}
                {x === 'All' && <span>{restaurants.length}</span>}
              </button>
            ))}
          </div>

          {/* Super Admin filter by Sales Executive */}
          {isGlobalAdmin && executivesList.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
              <span style={{ fontSize: 13, color: '#475569', fontWeight: 700 }}>Filter by Executive:</span>
              <select
                className="toolbar-select"
                value={selectedExecutiveFilter}
                onChange={(e) => setSelectedExecutiveFilter(e.target.value)}
              >
                <option value="All">All Sales Executives</option>
                {executivesList.map((exec) => (
                  <option key={exec} value={exec}>{exec}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* RESTAURANT TABLE */}
        <div className="table-scroll">
          <table className="data-table restaurant-table">
            <thead>
              <tr>
                <th>RESTAURANT</th>
                <th>CONTACT / ADMIN</th>
                <th>STATUS</th>
                <th>TABLES & QRS</th>
                <th>ONBOARDED BY (EMPLOYEE)</th>
                <th>LOCATION</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r, idx) => {
                const i = all.findIndex((x) => (x.id && r.id ? x.id === r.id : x.name === r.name));
                return (
                  <tr key={r.id ? `rest-row-${r.id}` : `rest-row-${r.name}-${idx}`}>
                    {/* Restaurant cell */}
                    <td>
                      <button
                        className="restaurant-cell"
                        onClick={() => inspect(r)}
                        title="Click to view full onboarding details"
                      >
                        <span className="restaurant-avatar" style={{ background: r.color }}>{r.initial}</span>
                        <span>
                          <strong>{r.name}</strong>
                          <small>{r.cuisine}</small>
                        </span>
                      </button>
                    </td>

                    {/* Email */}
                    <td className="muted-cell">{r.email}</td>

                    {/* Status */}
                    <td>
                      <span className={`status ${r.status === 'Active' ? 'status-active' : 'status-suspended'}`}>
                        <i />{r.status}
                      </span>
                    </td>

                    {/* Tables */}
                    <td>
                      <button
                        type="button"
                        onClick={() => openQr(r)}
                        style={{ border: 0, background: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                        title="Open QR Studio"
                      >
                        <span style={{ fontWeight: 700, color: '#0bb8ae' }}>{r.tableCount ?? 0} Tables</span>
                        <small style={{ display: 'block', color: '#64748b', fontSize: 11, marginTop: 2 }}>Click for QRs</small>
                      </button>
                    </td>

                    {/* ONBOARDED BY EMPLOYEE ATTRIBUTION */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>
                          {r.salesExecutiveName || '—'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          {r.salesExecutiveCode && (
                            <span className="employee-pill">{r.salesExecutiveCode}</span>
                          )}
                          {r.leadSource && (
                            <span className="lead-badge">{r.leadSource}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="muted-cell">{r.city}</td>

                    {/* Actions */}
                    <td>
                      <div className="row-actions">
                        <button title="View dossier & sales attribution" onClick={() => inspect(r)}>
                          <FileText size={15} color="#0891b2" />
                        </button>
                        <button title="QR studio" onClick={() => openQr(r)}>
                          <QrCode size={16} />
                        </button>
                        {canWrite && (
                          <>
                            <button title="Edit restaurant" onClick={() => edit('restaurant', i)}>
                              <Pencil size={15} />
                            </button>
                            <button
                              title="Delete restaurant"
                              aria-label={`Delete ${r.name}`}
                              onClick={() =>
                                confirm({
                                  title: `Delete ${r.name}?`,
                                  message: `${r.name} will be removed from the restaurant list. Records are preserved in the audit database.`,
                                  action: () => { void remove(r); },
                                })
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                            <button
                              title={r.status === 'Active' ? 'Suspend restaurant' : 'Reactivate restaurant'}
                              onClick={() => toggle(i)}
                            >
                              {r.status === 'Active' ? <ShieldCheck size={15} /> : <CircleCheck size={15} />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {restaurants.length === 0 && (
          <div className="empty-state">
            <div><Store size={22} /></div>
            <h3>No restaurants found</h3>
            <p>
              {restaurantTab === 'my'
                ? "You haven't onboarded any restaurants under this account yet. Click Onboard Restaurant to add your first partner!"
                : 'Try adjusting your search or add your first partner restaurant.'}
            </p>
            {canWrite && (
              <Button onClick={open} icon={<Plus size={16} />}>
                Onboard New Restaurant
              </Button>
            )}
          </div>
        )}

        <div className="table-foot">
          <span>Showing <b>{restaurants.length ? 1 : 0}–{restaurants.length}</b> of <b>{restaurants.length}</b> restaurants</span>
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))}>
              <ChevronLeft size={15} /> Previous
            </button>
            <button className="page-current">{page}</button>
            <button onClick={() => setPage(page + 1)}>
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}





// ----------------------------------------------------------------------------
// SETTINGS
// ----------------------------------------------------------------------------
function SettingsPage({ notice, currentAccess }: { notice: (v: string) => void; currentAccess: UserAccess | null }) {
  const [tab, setTab] = useState('Profile');
  const tabs = ['Profile', 'Sales Territory', 'Sync with Super Admin'];

  return (
    <>
      <PageHeading eyebrow="OPERATIONAL PREFERENCES" title="Executive Settings" description="Manage your field credentials and system connectivity." />
      <div className="settings-layout">
        <nav className="settings-nav">
          {tabs.map((t, i) => (
            <button key={t} className={tab === t ? 'settings-active' : ''} onClick={() => setTab(t)}>
              {i === 0 ? <Briefcase size={17} /> : i === 1 ? <MapPin size={17} /> : <ShieldCheck size={17} />}
              {t}
              <ChevronRight size={15} />
            </button>
          ))}
        </nav>

        <section className="panel settings-panel">
          <div className="settings-section-title">
            <h2>{tab} Details</h2>
            <p>Personal credentials and attribution details for {currentAccess?.name || 'Sales Executive'}.</p>
          </div>

          {tab === 'Profile' && (
            <div className="form-grid">
              <Field label="Employee Full Name" disabled value={currentAccess?.name || '—'} />
              <Field label="Work Email" disabled value={currentAccess?.email || '—'} />
              <Field label="Employee Code" disabled value={currentAccess?.employeeId || '—'} />
              <Field label="Assigned Role" disabled value={currentAccess?.role?.replaceAll('_', ' ') || '—'} />
              <Field label="Assigned Territory" disabled value={currentAccess?.territory || 'Unassigned'} />
              <Field label="Department" disabled value={currentAccess?.department || 'Sales Operations'} />
            </div>
          )}

          {tab === 'Sales Territory' && (
            <div style={{ padding: '20px 0', fontSize: 15, color: '#334155', lineHeight: 1.7 }}>
              <p>
                Your active sales territory is <b>{currentAccess?.territory || 'Unassigned'}</b>. Restaurants onboarded under your login will automatically register to this territory and appear in Super Admin territory analytics.
              </p>
            </div>
          )}

          {tab === 'Sync with Super Admin' && (
            <div style={{ padding: '20px 0', fontSize: 15, color: '#334155', lineHeight: 1.7 }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '18px 22px', borderRadius: 14 }}>
                <strong style={{ color: '#166534', display: 'block', marginBottom: 6, fontSize: 16 }}>
                  ✅ Super Admin Real-Time API Connected
                </strong>
                <p style={{ margin: 0, color: '#15803d', fontSize: 14, lineHeight: 1.6 }}>
                  The Sales Executive portal is actively connected to the PostgreSQL database and Super Admin monitoring endpoint (<code>/api/superadmin/sales-monitoring</code>). All restaurants added are instantly visible to Super Admin.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

// ----------------------------------------------------------------------------
// TABLE MANAGER & QR MODAL
// ----------------------------------------------------------------------------
type ManagedTable = {
  id: string;
  label: string;
  isActive: boolean;
  qrCode: { token: string; status: string; scansTotal: number } | null;
};

function TableManagerModal({
  restaurants,
  restaurantId,
  restaurant,
  onRestaurantChange,
  close,
  openQr,
  notice,
}: {
  restaurants: Restaurant[];
  restaurantId: string;
  restaurant: string;
  onRestaurantChange: (id: string) => void;
  close: () => void;
  openQr: (table: ManagedTable) => void;
  notice: (m: string) => void;
}) {
  const [tables, setTables] = useState<ManagedTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [count, setCount] = useState('1');
  const [first, setFirst] = useState('01');
  const [error, setError] = useState('');

  async function load() {
    setTables([]);
    setLoading(true);
    if (!restaurantId) {
      setError('Choose a restaurant to view its tables');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/tables`);
      if (!response.ok) throw new Error('Could not load tables');
      setTables(await response.json());
      setError('');
    } catch {
      setError('Could not load tables. Please retry.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [restaurantId]);

  async function addTables() {
    const amount = Math.max(1, Math.min(50, Number(count) || 1));
    let number = Math.max(1, Number(first) || 1);
    const labels = new Set(tables.map((t) => t.label.toLowerCase()));
    setSaving(true);
    setError('');
    try {
      let created = 0;
      while (created < amount) {
        const label = `Table ${String(number).padStart(2, '0')}`;
        number++;
        if (labels.has(label.toLowerCase())) continue;
        const response = await fetch(`/api/restaurants/${restaurantId}/tables`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ label }),
        });
        if (!response.ok) throw new Error('Could not create table and QR');
        const table = (await response.json()) as ManagedTable;
        labels.add(label.toLowerCase());
        setTables((current) => [...current, table]);
        created++;
      }
      notice(`${created} table QR${created === 1 ? '' : 's'} created`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create tables');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Manage Dining Tables & QRs" subtitle="Configure table capacity and unique QR tokens." close={close} wide>
      <div className="field table-manager-restaurant">
        <span>Restaurant</span>
        <select
          aria-label="Choose restaurant for table management"
          value={restaurantId}
          onChange={(e) => onRestaurantChange(e.target.value)}
        >
          <option value="">Choose a restaurant</option>
          {restaurants.map((item, i) => (
            <option key={item.id ? `tbl-rest-${item.id}` : `tbl-rest-${item.name}-${i}`} value={item.id || ''}>{item.name}</option>
          ))}
        </select>
      </div>

      <div className="table-manager-list">
        {loading ? (
          <p>Loading tables…</p>
        ) : error && !tables.length ? (
          <p role="alert">{error}</p>
        ) : tables.length === 0 ? (
          <p>No tables provisioned yet. Add tables to generate unique QRs.</p>
        ) : (
          tables.map((table) => (
            <div className="table-manager-row" key={table.id}>
              <span className="table-manager-icon"><QrCode size={18} /></span>
              <span className="table-manager-name">
                <strong>{table.label}</strong>
                <small>{restaurant} · {table.qrCode?.scansTotal || 0} scans</small>
              </span>
              <span className={`status ${table.qrCode?.status === 'ACTIVE' ? 'status-active' : 'status-suspended'}`}>
                <i />{table.qrCode?.status || 'Missing QR'}
              </span>
              <button
                className="button secondary"
                disabled={!table.qrCode}
                onClick={() => table.qrCode && openQr(table)}
              >
                <QrCode size={16} /> View QR
              </button>
            </div>
          ))
        )}
      </div>

      <div className="form-grid table-manager-form">
        <Field label="Number of additional tables" type="number" value={count} onChange={setCount} />
        <Field label="Starting table number" value={first} onChange={setFirst} />
      </div>

      <div className="modal-actions">
        <button className="button secondary" onClick={close}>Close</button>
        <Button disabled={saving || loading || !restaurantId} onClick={() => void addTables()} icon={<Plus size={18} />}>
          {saving ? 'Creating…' : 'Add Tables & Generate QRs'}
        </Button>
      </div>
    </Modal>
  );
}

function getCustomerMenuBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_CUSTOMER_URL) {
    return process.env.NEXT_PUBLIC_CUSTOMER_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:3003';
  }
  return 'https://customermenu.scanzaa.in';
}

function QrModal({
  restaurantId, tableId, restaurant, table, token, status, close, notice
}: {
  restaurantId: string; tableId: string; restaurant: string; table: string; token: string; status: string; close: () => void; notice: (m: string) => void;
}) {
  const [data, setData] = useState('');
  const [svg, setSvg] = useState('');
  const [currentToken, setCurrentToken] = useState(token);
  const [busy, setBusy] = useState(false);
  const customerBase = getCustomerMenuBaseUrl();
  const url = `${customerBase}/menu/${currentToken}`;

  useEffect(() => {
    setCurrentToken(token);
  }, [token]);

  useEffect(() => {
    if (!url) return;
    void Promise.all([
      QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#0b1730', light: '#ffffff' } }).then(setData),
      QRCode.toString(url, { type: 'svg', width: 300, margin: 2, color: { dark: '#0b1730', light: '#ffffff' } }).then(setSvg),
    ]).catch(() => notice('Could not create this table QR'));
  }, [url, notice]);

  const download = (format: 'png' | 'svg') => {
    const content = format === 'png' ? data : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    if (!content) return;
    const a = document.createElement('a');
    a.href = content;
    a.download = `scanzaa-${restaurant.replace(/\W+/g, '-')}-${table.replace(/\W+/g, '-')}.${format}`;
    a.click();
    notice(`QR downloaded as ${format.toUpperCase()}`);
  };

  const print = () => {
    if (!data) return;
    const w = window.open('', '_blank', 'width=520,height=640');
    if (!w) {
      notice('Allow pop-ups to print this QR');
      return;
    }
    w.document.write(
      `<html><head><title>Scanzaa · ${table}</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:40px;color:#102238}.card{border:1px solid #e6e9ed;border-radius:18px;padding:30px;display:inline-block}img{width:260px}.brand{font-weight:700;letter-spacing:3px;color:#0bb8ae}</style></head><body><div class="card"><div class="brand">SCANZAA · POWERED BY RENZA</div><h2>${restaurant}</h2><p style="font-size:18px;font-weight:700">${table}</p><img src="${data}"/><p>Scan to explore our live digital menu</p></div><script>window.print()</script></body></html>`
    );
    w.document.close();
  };

  async function regenerate() {
    setBusy(true);
    try {
      const body = await salesFetch(`/api/admin/restaurants/${restaurantId}/tables/${tableId}/qr`, { method: 'POST' });
      setCurrentToken(body.qrCode.token);
      notice('Table QR regenerated');
    } catch {
      notice('Could not regenerate table QR');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="QR Studio" subtitle={`High-resolution dining QR code for ${restaurant}.`} close={close}>
      <div className="qr-studio">
        <div className="qr-brandline"><Logo /></div>
        <div className="qr-code-wrap">
          {data ? <img src={data} alt={`QR code for ${restaurant}, ${table}`} /> : <span>Creating QR…</span>}
        </div>
        <strong style={{ fontSize: 20 }}>{restaurant}</strong>
        <span style={{ fontSize: 16 }}>{table}</span>
        <span className={`status ${status === 'ACTIVE' ? 'status-active' : 'status-suspended'}`}><i />{status}</span>
        <p style={{ fontSize: 14 }}>Scan with any mobile camera to launch the instant digital menu.</p>
        <div className="qr-dest" style={{ fontSize: 13 }}><QrCode size={16} />{url}</div>
      </div>
      <div className="modal-actions qr-actions">
        <button className="button secondary" disabled={busy} onClick={() => void regenerate()}>
          <RotateCcw size={16} />{busy ? 'Regenerating…' : 'Regenerate'}
        </button>
        <button className="button secondary" disabled={!data} onClick={print}>
          <Printer size={16} /> Print Standee
        </button>
        <Button kind="secondary" disabled={!svg} onClick={() => download('svg')} icon={<Download size={16} />}>
          SVG
        </Button>
        <Button disabled={!data} onClick={() => download('png')} icon={<Download size={16} />}>
          PNG
        </Button>
      </div>
    </Modal>
  );
}
