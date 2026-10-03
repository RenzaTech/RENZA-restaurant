'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  QrCode,
  TrendingUp,
  Store,
  AlertCircle,
  LockKeyhole,
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
  const [errorMessage, setErrorMessage] = useState('')

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
    setErrorMessage('')
    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { token, user } = response.data

      if (user?.role !== 'superadmin') {
        const roleMsg = 'Access restricted to Super Administrators only.'
        toast.error(roleMsg)
        setErrorMessage(roleMsg)
        setLoading(false)
        return
      }

      setToken(token)
      toast.success(`Welcome back, ${user?.name || 'Administrator'}!`)
      router.replace('/dashboard')
    } catch (error) {
      const rawMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        ''

      let message = 'Incorrect password'
      if (rawMsg) {
        if (rawMsg.toLowerCase().includes('user not found') || rawMsg.toLowerCase().includes('email')) {
          message = rawMsg
        } else {
          message = 'Incorrect password'
        }
      }

      setErrorMessage(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col lg:flex-row font-sans text-slate-100 selection:bg-teal-500 selection:text-slate-950 overflow-hidden">
      {/* ── LEFT SHOWCASE PANEL (Desktop 55%) ── */}
      <div className="relative hidden lg:flex lg:w-7/12 flex-col justify-between p-8 xl:p-12 h-full overflow-hidden border-r border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Ambient glow orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        {/* Top brand — Perfectly aligned with larger logo & elegant lockup */}
        <div className="relative z-10 flex items-center gap-3.5">
          <img
            src="/scanzaa-horizontal-logo.png"
            alt="SCANZAA"
            className="h-10 xl:h-11 w-auto object-contain drop-shadow-[0_4px_24px_rgba(14,208,186,0.25)]"
          />
          <div className="h-6 w-[1.5px] bg-slate-700/60 rounded-full" />
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-400">
              Super Admin
            </span>
            <span className="text-xs font-medium text-slate-400 tracking-wide">
              powered by <strong className="text-white font-semibold">Renza</strong>
            </span>
          </div>
        </div>

        {/* Center showcase & value propositions */}
        <div className="relative z-10 my-auto py-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-300 mb-3 backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Super Admin Governance Portal
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-[1.18] mb-3">
            Command Center for the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-teal-400">
              Smart Dining Ecosystem
            </span>
          </h1>

          <p className="text-slate-300 text-sm xl:text-base leading-relaxed mb-5">
            Orchestrate partner restaurants, monitor live QR dining traffic, oversee instant stock availability, and manage digital menus across all locations.
          </p>

          {/* Feature Highlights */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/20 flex items-center justify-center text-teal-400 flex-shrink-0 mt-0.5 shadow-sm">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Multi-Tenant Restaurant Onboarding</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Spin up restaurant accounts and custom QR destinations in seconds.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5 shadow-sm">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">High-Resolution QR Studio</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Production URL management and high-DPI table QR asset generation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5 shadow-sm">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Live Dining Intelligence</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Aggregate scan counts, peak meal hours, and customer dish engagement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Platform Status */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-slate-800/60 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200 font-medium">All Cloud Services Operational</span>
          </div>
          <span>v2.4 Enterprise</span>
        </div>
      </div>

      {/* ── RIGHT LOGIN PANEL (Mobile 100% / Desktop 45%) ── */}
      <div className="w-full lg:w-5/12 flex flex-col justify-between p-6 sm:p-8 xl:p-12 h-full bg-slate-900/90 relative overflow-y-auto lg:overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <img
              src="/scanzaa-horizontal-logo.png"
              alt="SCANZAA"
              className="h-7 w-auto object-contain"
            />
          </div>
          <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/30">
            Super Admin
          </span>
        </div>

        {/* Center Form Card — Fixed, no scroll, clean modern proportions */}
        <div className="my-auto max-w-sm w-full mx-auto">
          {/* Header */}
          <div className="mb-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign In
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Enter your master platform credentials to access the Super Admin environment.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errorMessage) setErrorMessage('')
                  }}
                  placeholder="admin@scanzaa.gmail.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/25 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Master Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errorMessage) setErrorMessage('')
                  }}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className={`w-full pl-10 pr-11 py-2.5 bg-slate-950/80 rounded-xl text-sm text-white placeholder-slate-500 transition-all shadow-inner focus:outline-none border ${
                    errorMessage
                      ? 'border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-slate-700/80 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/25'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Inline Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500/20"
                />
                <span className="text-xs text-slate-400">Keep session active on this device</span>
              </label>
            </div>

            {/* Submit Button — High-Contrast Teal Gradient */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 bg-gradient-to-r from-teal-400 via-teal-500 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-2 tracking-wide"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Super Admin</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice — Clean Lock Icon, No Shield */}
          <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-start gap-2.5">
            <LockKeyhole className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Authorized personnel only. All access attempts, IP addresses, and authentication events are logged for enterprise auditing.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 text-center text-xs text-slate-500">
          SCANZAA &copy; {new Date().getFullYear()} · Powered by Renza
        </div>
      </div>
    </div>
  )
}
