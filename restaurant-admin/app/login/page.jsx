'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Eye,
  EyeOff,
  UtensilsCrossed,
  Mail,
  Lock,
  ArrowRight,
  Store,
  Sparkles,
  QrCode,
  Shield,
  TrendingUp,
  ChefHat,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import api from '@/lib/api';
import { setToken, isAuthenticated } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { token, user } = res.data;

      if (user?.role !== 'restaurant_admin') {
        const roleMsg = 'Access restricted. Restaurant manager credentials required.';
        toast.error(roleMsg);
        setErrorMessage(roleMsg);
        setLoading(false);
        return;
      }

      setToken(token);
      toast.success(`Welcome back, ${user?.name || 'Manager'}!`);
      router.replace('/dashboard');
    } catch (err) {
      const rawMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        '';

      let msg = 'Incorrect password';
      if (rawMsg) {
        if (rawMsg.toLowerCase().includes('user not found') || rawMsg.toLowerCase().includes('email')) {
          msg = rawMsg;
        } else {
          msg = 'Incorrect password';
        }
      }

      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col lg:flex-row font-sans text-slate-100 selection:bg-orange-500 selection:text-white">
      {/* ── LEFT SHOWCASE PANEL (Desktop 58%) ── */}
      <div className="relative hidden lg:flex lg:w-7/12 flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Ambient glow orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        {/* Top Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-teal-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">Renza</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-semibold border border-orange-500/20 uppercase tracking-wider">
                Partner Hub
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Digital Dining & Kitchen Portal</p>
          </div>
        </div>

        {/* Center Showcase & Value Propositions */}
        <div className="relative z-10 my-auto py-8 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-orange-400 mb-6 backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            Kitchen Operations & Digital QR Suite
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-5">
            Command Your Kitchen &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-teal-300 to-orange-500">
              Live Dining Menus
            </span>
          </h1>

          <p className="text-slate-400 text-base xl:text-lg leading-relaxed mb-8">
            Keep your digital menu synchronized, toggle out-of-stock items in real time, generate high-definition table QR stands, and deliver seamless contactless dining.
          </p>

          {/* Feature Showcase Cards */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition-all">
              <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 flex-shrink-0 mt-0.5">
                <ChefHat className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Instant Stock & 86-Item Control</p>
                  <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live sync
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Mark sold-out dishes in a single tap to instantly prevent diner disappointment across all active tables.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 flex-shrink-0 mt-0.5">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Table & Counter QR Code Studio</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Generate crisp, print-ready SVG & PNG QR stands for each dining table and billing counter.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition-all">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-400 flex-shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Live Diner Menu Intelligence</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Gain instant visibility into diner menu scans, popular dish views, and peak meal rush hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Platform Status Strip */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-slate-800/60 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-medium">Kitchen POS & QR Network Active</span>
          </div>
          <span>v2.4 Partner Edition</span>
        </div>
      </div>

      {/* ── RIGHT LOGIN PANEL (Mobile 100% / Desktop 42%) ── */}
      <div className="w-full lg:w-5/12 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-slate-900/90 relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-teal-600 flex items-center justify-center shadow-md">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">Renza</span>
              <span className="text-[10px] ml-1.5 text-slate-400">Partner Hub</span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
            Restaurant Admin
          </span>
        </div>

        {/* Center Form Card */}
        <div className="my-auto max-w-md w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4 shadow-inner">
              <Store className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Restaurant Sign In
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Enter your manager credentials to access your restaurant kitchen portal.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Manager Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="admin@restaurant.com"
                  autoComplete="email"
                  autoFocus
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className={`w-full pl-10 pr-11 py-3 bg-slate-950/80 rounded-xl text-sm text-white placeholder-slate-500 transition-all shadow-inner focus:outline-none font-mono text-xs border ${
                    errorMessage
                      ? 'border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Inline Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Remember Device */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-orange-500/20"
                />
                <span className="text-xs text-slate-400">Remember this POS / Device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-orange-500 to-teal-600 hover:from-orange-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Entering Kitchen Portal...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Security & Isolation Notice */}
          <div className="mt-8 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <Shield className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Secure Restaurant Environment · Real-time 86-item stock availability sync and multi-tenant data isolation active.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 text-center text-xs text-slate-500">
          Renza &copy; {new Date().getFullYear()} · All rights reserved
        </div>
      </div>
    </div>
  );
}
