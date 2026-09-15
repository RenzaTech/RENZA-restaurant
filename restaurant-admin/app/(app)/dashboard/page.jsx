'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Eye,
  QrCode,
  CheckCircle2,
  XCircle,
  Plus,
  Settings,
  TrendingUp,
  ExternalLink,
  Utensils,
  FolderTree,
  Sparkles,
  Download,
  Copy,
  Check,
  Globe,
  Store,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import api from '@/lib/api';
import toast from 'react-hot-toast';

function StatCard({ label, value, icon: Icon, color, bgColor, loading, subtitle }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs hover:shadow-md transition-all">
      {loading ? (
        <div className="space-y-2 sm:space-y-3">
          <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
          <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 truncate">{label}</p>
            <p className={`text-2xl sm:text-3xl font-black ${color} tracking-tight`}>{value ?? 0}</p>
            {subtitle && <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 font-medium truncate">{subtitle}</p>}
          </div>
          <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${bgColor}`}>
            <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${color}`} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/api/restaurant/dashboard').catch(() => ({ data: null })),
      api.get('/api/restaurant/profile').catch(() => ({ data: null })),
      api.get('/api/restaurant/qr').catch(() => ({ data: null })),
    ])
      .then(([dashRes, profRes, qrRes]) => {
        if (dashRes.data) setDashboardData(dashRes.data);
        if (profRes.data) setProfile(profRes.data);
        if (qrRes.data) setQrData(qrRes.data);
      })
      .catch((err) => {
        if (err.response?.status !== 401) {
          toast.error('Failed to load dashboard data');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const today = dashboardData?.today || {};
  const foodItems = dashboardData?.foodItems || {};
  const topItems = dashboardData?.topItems || [];
  const restaurantName = profile?.name || 'Kitchen Dashboard';
  const cuisineType = profile?.cuisineType || '';
  const slug = profile?.slug || '';
  const customerBaseUrl = process.env.NEXT_PUBLIC_CUSTOMER_URL || 'http://localhost:3003';
  const customerMenuUrl = qrData?.menuUrl || profile?.customMenuUrl || (slug ? `${customerBaseUrl}/menu/${slug}` : '');
  const qrImage = qrData?.qrDataUrl || qrData?.qrCodeUrl;

  const handleDownloadQr = () => {
    if (!qrImage) {
      toast.error('QR code not available');
      return;
    }
    const a = document.createElement('a');
    a.href = qrImage;
    a.download = `${restaurantName.toLowerCase().replace(/\s+/g, '-')}-table-qr.png`;
    a.click();
    toast.success('Table QR Code downloaded!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customerMenuUrl);
    setCopied(true);
    toast.success('Diner Menu URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── TOP HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-orange-500 via-orange-600 to-teal-700 text-white p-5 sm:p-8 shadow-lg shadow-orange-500/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-5">
          <div className="space-y-1 sm:space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 text-orange-50 text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Kitchen Operations
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight truncate">
              {restaurantName}
            </h2>
            <p className="text-orange-100 text-xs sm:text-sm flex items-center gap-2 font-medium flex-wrap">
              {cuisineType && <span>★ {cuisineType}</span>}
              {cuisineType && <span>•</span>}
              <span className="bg-white/25 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">Menu Live</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 pt-1 sm:pt-2 md:pt-0 w-full sm:w-auto">
            {/* Get Table QR Button */}
            <Button
              onClick={() => setQrModalOpen(true)}
              className="bg-white text-orange-600 hover:bg-orange-50 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs gap-1.5 h-auto flex-1 sm:flex-none justify-center"
            >
              <QrCode className="w-4 h-4 flex-shrink-0" />
              <span>Table QR</span>
            </Button>

            {customerMenuUrl && (
              <a
                href={customerMenuUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-orange-700/60 hover:bg-orange-700 text-white font-bold text-xs transition-all border border-white/20 shadow-xs flex-1 sm:flex-none"
              >
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                <span>View Menu</span>
              </a>
            )}

            <Button
              onClick={() => router.push('/menu/new')}
              className="col-span-2 sm:col-span-1 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs gap-1.5 h-auto justify-center"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span>Add Dish</span>
            </Button>
          </div>
        </div>

        {/* Ambient glow accent */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* ── 4 STAT CARDS ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Operations</h2>
          <span className="text-xs text-slate-400 font-semibold">Real-time sync</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Today's Menu Views"
            value={today.menuViews}
            icon={Eye}
            color="text-blue-600"
            bgColor="bg-blue-50"
            loading={loading}
            subtitle={`${today.uniqueVisitors || 0} unique diners`}
          />
          <StatCard
            label="Today's QR Scans"
            value={today.qrScans}
            icon={QrCode}
            color="text-purple-600"
            bgColor="bg-purple-50"
            loading={loading}
            subtitle="Camera scan events"
          />
          <StatCard
            label="Available Dishes"
            value={foodItems.available}
            icon={CheckCircle2}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
            loading={loading}
            subtitle="Visible on table menu"
          />
          <StatCard
            label="Sold Out Dishes"
            value={foodItems.unavailable}
            icon={XCircle}
            color="text-rose-600"
            bgColor="bg-rose-50"
            loading={loading}
            subtitle="Hidden / Sold out"
          />
        </div>
      </div>

      {/* ── 2-COLUMN SECTION: QUICK MANAGEMENT + TOP DISHES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quick Action Tiles */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Management</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Tile 1: Table QR Code */}
            <div
              onClick={() => setQrModalOpen(true)}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group flex items-start gap-3.5 sm:gap-4"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors text-sm">
                  Table QR Code
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Download high-res printable QR code for table stands and billing counters.
                </p>
              </div>
            </div>

            {/* Tile 2: Add New Dish */}
            <div
              onClick={() => router.push('/menu/new')}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group flex items-start gap-3.5 sm:gap-4"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors text-sm">
                  Add New Dish
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Add photos, Rupee pricing, veg/non-veg tags, allergens, and spices.
                </p>
              </div>
            </div>

            {/* Tile 3: Manage Menu & Stock */}
            <div
              onClick={() => router.push('/menu')}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group flex items-start gap-3.5 sm:gap-4"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors text-sm">
                  Manage Menu & Stock
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Instantly toggle dishes between Available and Sold Out in 1-click.
                </p>
              </div>
            </div>

            {/* Tile 4: Organize Categories */}
            <div
              onClick={() => router.push('/categories')}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group flex items-start gap-3.5 sm:gap-4"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <FolderTree className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">
                  Organize Categories
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Arrange sections like Starters, Main Course, Biryani, and Beverages.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Top Dishes Today */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Most Viewed Dishes Today</h2>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topItems.length === 0 ? (
              <div className="py-6 sm:py-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                </div>
                <p className="font-bold text-slate-800 text-sm">No dish clicks recorded yet</p>
                <p className="text-slate-400 text-xs mt-1 max-w-xs leading-relaxed">
                  As diners browse and tap dishes on their phones, popularity rankings will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {topItems.slice(0, 5).map((item, i) => (
                  <div key={item.id || item._id || i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                      i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-700' : 'bg-orange-50 text-orange-600'
                    }`}>
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.viewCount || item.views || 1} clicks today</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="font-extrabold text-slate-900 text-sm">₹{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── TABLE QR CODE MODAL ── */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 text-center">
              Table QR Code
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500">
              Customers scan this code with their phone camera to view your live digital menu instantly.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-3 sm:gap-4 py-2 sm:py-4">
            {/* QR Image */}
            {qrImage ? (
              <div className="p-3 sm:p-4 bg-white border-2 border-orange-100 rounded-2xl sm:rounded-3xl shadow-md flex items-center justify-center">
                <Image
                  src={qrImage}
                  alt={`${restaurantName} QR Code`}
                  width={224}
                  height={224}
                  unoptimized
                  className="h-44 w-44 object-contain sm:h-56 sm:w-56"
                />
              </div>
            ) : (
              <div className="w-44 h-44 sm:w-56 sm:h-56 border-2 border-dashed border-slate-200 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-slate-400">
                <QrCode className="w-10 h-10 text-slate-300 animate-pulse" />
                <span className="text-xs mt-2 font-medium">Generating QR code...</span>
              </div>
            )}

            <div className="text-center">
              <p className="font-bold text-slate-900 text-sm sm:text-base">{restaurantName}</p>
              <p className="text-[11px] sm:text-xs text-orange-600 font-semibold mt-0.5">Never expires • Syncs automatically</p>
            </div>

            {/* Menu Destination Link */}
            <div className="w-full space-y-1.5">
              <span className="text-xs text-slate-700 font-bold px-0.5">Menu Link</span>
              <div className="w-full flex items-center gap-2 p-2 sm:p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <p className="flex-1 text-xs text-slate-700 truncate font-mono">{customerMenuUrl}</p>
                <a
                  href={customerMenuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-orange-600 transition-colors"
                  title="Open menu"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-1">
            <Button
              onClick={handleDownloadQr}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl gap-2 h-11 text-xs"
            >
              <Download className="w-4 h-4" />
              Download Printable PNG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
