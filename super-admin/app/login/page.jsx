'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Eye,
  EyeOff,
  Shield,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  QrCode,
  TrendingUp,
  Store,
  CheckCircle2,
} from 'lucide-react'
import api from '../../lib/api'
import { setToken, isAuthenticated } from '../../lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard')
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter both email and password')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { token, user } = response.data

      if (user?.role !== 'superadmin') {
        toast.error('Access restricted to Super Administrators only.')
        setLoading(false)
        return
      }

      setToken(token)
      toast.success(`Welcome back, ${user?.name || 'Administrator'}!`)
      router.replace('/dashboard')
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Invalid credentials. Please verify and try again.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col lg:flex-row font-sans text-slate-100 selection:bg-orange-500 selection:text-white">
      {/* ── LEFT SHOWCASE PANEL (Desktop 55%) ── */}
      <div className="relative hidden lg:flex lg:w-7/12 flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Ambient glow orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        {/* Top brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-teal-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <span className="text-2xl font-black text-white tracking-tight">R</span>
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">Renza</span>
            <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-semibold border border-orange-500/20">
              Enterprise Suite
            </span>
          </div>
        </div>

        {/* Center showcase & value propositions */}
        <div className="relative z-10 my-auto py-8 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-orange-400 mb-6 backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            Super Admin Governance Portal
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-5">
            Command Center for the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-teal-300 to-orange-500">
              Smart Dining Ecosystem
            </span>
          </h1>

          <p className="text-slate-400 text-base xl:text-lg leading-relaxed mb-8">
            Orchestrate partner restaurants, monitor live QR dining traffic, oversee instant stock availability, and manage digital menus across all locations.
          </p>

          {/* Feature Highlights */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 flex-shrink-0 mt-0.5">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Multi-Tenant Restaurant Onboarding</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Spin up restaurant accounts and custom QR destinations in seconds.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 flex-shrink-0 mt-0.5">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">High-Resolution QR Studio</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Production URL management and high-DPI table QR asset generation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Live Dining Intelligence</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Aggregate scan counts, peak meal hours, and customer dish engagement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Platform Status */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-slate-800/60 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-medium">All Cloud Services Operational</span>
          </div>
          <span>v2.4 Enterprise</span>
        </div>
      </div>

      {/* ── RIGHT LOGIN PANEL (Mobile 100% / Desktop 45%) ── */}
      <div className="w-full lg:w-5/12 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-slate-900/90 relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-teal-600 flex items-center justify-center shadow-md">
              <span className="text-xl font-black text-white">R</span>
            </div>
            <span className="text-lg font-bold text-white">Renza</span>
          </div>
          <span className="text-[11px] font-semibold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
            Super Admin
          </span>
        </div>

        {/* Center Form Card */}
        <div className="my-auto max-w-md w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Sign In
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Enter your master platform credentials to access the Super Admin environment.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@renza.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Master Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner"
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

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-orange-500/20"
                />
                <span className="text-xs text-slate-400">Keep session active on this device</span>
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
                  Authenticating...
                </>
              ) : (
                <>
                  <span>Sign In to Super Admin</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <Shield className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Authorized personnel only. All access attempts, IP addresses, and authentication events are logged for enterprise auditing.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 text-center text-xs text-slate-500">
          Renza Hospitality Technologies &copy; {new Date().getFullYear()} · All rights reserved
        </div>
      </div>
    </div>
  )
}
