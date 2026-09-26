'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  Pencil,
  ToggleRight,
  ToggleLeft,
  QrCode,
  Download,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Eye,
  Users,
  Scan,
  BarChart3,
  UtensilsCrossed,
  Globe,
  RotateCcw,
  Check,
  Sparkles,
  Store,
  Clock,
  TrendingUp,
  Share2,
  RefreshCw,
  Trash2,
  FileSpreadsheet,
  MessageSquareText,
} from 'lucide-react'
import api from '@/lib/api'
import { formatDate, formatNumber } from '@/lib/utils'
import { exportRestaurantReport } from '@/lib/excelExport'
import toast from 'react-hot-toast'

// ─── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const isActive = status === 'active'
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      {isActive ? 'Active' : 'Suspended'}
    </span>
  )
}

// ─── Confirm Dialog ──────────────────────────────────────────────────────────
function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-100">
        <h3 className="text-base font-bold text-slate-900 mb-2">Confirm Status Change</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm">Confirm</button>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmDialog({ open, restaurant, onConfirm, onCancel, deleting }) {
  if (!open || !restaurant) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Delete Suspended Restaurant?</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Are you sure you want to permanently delete <strong className="text-slate-900">{restaurant.name}</strong>? This action cannot be undone and will delete all associated food items, categories, admin credentials, and analytics.
        </p>
        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {deleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Restaurant</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, icon: Icon, color = 'text-slate-600', bg = 'bg-slate-50' }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-xl font-black text-slate-900 mt-0.5">{formatNumber(value || 0)}</p>
      </div>
    </div>
  )
}

// ─── Hourly Bar Chart ─────────────────────────────────────────────────────────
function HourlyChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-36 text-slate-400 text-xs">
        No hourly traffic recorded today
      </div>
    )
  }

  const max = Math.max(...data.map((d) => d.count || d.scans || 0), 1)

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="flex items-end gap-1.5 h-36 pt-4">
          {Array.from({ length: 24 }, (_, hour) => {
            const item = data.find((d) => (d.hour ?? d._id) === hour)
            const val = item ? (item.count || item.scans || 0) : 0
            const pct = (val / max) * 100
            const isPeak = pct === 100 && val > 0
            return (
              <div key={hour} className="flex flex-col items-center flex-1 gap-1.5">
                <div className="w-full flex items-end justify-center h-28">
                  <div
                    title={`${hour}:00 — ${val} scans`}
                    style={{ height: `${Math.max(pct, val > 0 ? 6 : 0)}%` }}
                    className={`w-full rounded-t-lg transition-all cursor-pointer ${
                      isPeak
                        ? 'bg-gradient-to-t from-orange-500 to-teal-400 shadow-sm'
                        : val > 0
                        ? 'bg-orange-200 hover:bg-orange-400'
                        : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{hour}</span>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1 font-semibold">
          <span>12 AM (Midnight)</span>
          <span>6 AM</span>
          <span>12 PM (Lunch)</span>
          <span>6 PM</span>
          <span>11 PM (Dinner)</span>
        </div>
      </div>
    </div>
  )
}

// ─── Veg/Non-Veg indicator ──────────────────────────────────────────────────
function VegDot({ isVeg }) {
  return (
    <span
      className={`w-3.5 h-3.5 rounded-sm border-2 flex-shrink-0 flex items-center justify-center ${
        isVeg ? 'border-emerald-600' : 'border-rose-600'
      }`}
      title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
    </span>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`bg-slate-100 animate-pulse rounded-xl ${className}`} />
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RestaurantDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [tab, setTab] = useState('overview')
  const [restaurant, setRestaurant] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [customUrlInput, setCustomUrlInput] = useState('')
  const [savingUrl, setSavingUrl] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [exportingReport, setExportingReport] = useState(false)
  const analyticsLoadedRef = useRef(false)

  const handleExportReport = async () => {
    setExportingReport(true)
    try {
      // Ensure we have complete data with foodItems and categories
      let fullRestaurant = restaurant
      if (!restaurant?.foodItems || !restaurant?.categories) {
        const res = await api.get(`/api/admin/restaurants/${id}`)
        fullRestaurant = res.data?.restaurant || res.data || restaurant
      }
      let currentAnalytics = analytics
      if (!currentAnalytics) {
        const aRes = await api.get(`/api/admin/restaurants/${id}/analytics`)
        currentAnalytics = aRes.data?.analytics || aRes.data || {}
      }
      exportRestaurantReport(fullRestaurant, currentAnalytics)
      toast.success(`Excel report downloaded for "${fullRestaurant.name}"!`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to export Excel report')
    } finally {
      setExportingReport(false)
    }
  }

  const handleDeleteRestaurant = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/admin/restaurants/${id}`)
      toast.success(`Restaurant "${restaurant?.name || 'Restaurant'}" deleted permanently`)
      router.push('/restaurants')
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to delete restaurant')
      setDeleting(false)
    }
  }

  const handleStartEditUrl = () => {
    setCustomUrlInput(qrData?.customMenuUrl || qrData?.menuUrl || '')
    setIsEditingUrl(true)
  }

  const handleSaveUrl = async () => {
    if (!customUrlInput.trim()) {
      toast.error('Please enter a valid URL')
      return
    }
    setSavingUrl(true)
    try {
      const res = await api.patch(`/api/admin/restaurants/${id}/qr-url`, {
        customMenuUrl: customUrlInput.trim(),
      })
      setQrData(res.data)
      setIsEditingUrl(false)
      toast.success('QR Code regenerated for new target URL!')
    } catch {
      toast.error('Failed to update QR URL')
    } finally {
      setSavingUrl(false)
    }
  }

  const handleResetUrl = async () => {
    setSavingUrl(true)
    try {
      const res = await api.patch(`/api/admin/restaurants/${id}/qr-url`, {
        customMenuUrl: null,
      })
      setQrData(res.data)
      setCustomUrlInput(res.data?.menuUrl || '')
      setIsEditingUrl(false)
      toast.success('Reset back to platform default URL')
    } catch {
      toast.error('Failed to reset URL')
    } finally {
      setSavingUrl(false)
    }
  }

  const fetchRestaurant = useCallback(async () => {
    setLoading(true)
    try {
      const [resRes, qrRes] = await Promise.allSettled([
        api.get(`/api/admin/restaurants/${id}`),
        api.get(`/api/admin/restaurants/${id}/qr`),
      ])
      if (resRes.status === 'fulfilled') {
        setRestaurant(resRes.value.data?.restaurant || resRes.value.data)
      } else {
        toast.error('Failed to load restaurant')
      }
      if (qrRes.status === 'fulfilled') {
        setQrData(qrRes.value.data)
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchAnalytics = useCallback(async (silent = false) => {
    if (!silent) setAnalyticsLoading(true)
    setIsRefreshing(true)
    try {
      const res = await api.get(`/api/admin/restaurants/${id}/analytics`)
      setAnalytics(res.data?.analytics || res.data)
      setLastUpdated(new Date())
    } catch {
      if (!silent) toast.error('Failed to load analytics')
    } finally {
      if (!silent) setAnalyticsLoading(false)
      setIsRefreshing(false)
    }
  }, [id])

  useEffect(() => {
    fetchRestaurant()
  }, [fetchRestaurant])

  // Fetch immediately whenever switching to the analytics tab
  useEffect(() => {
    if (tab === 'analytics') {
      fetchAnalytics(analyticsLoadedRef.current)
      analyticsLoadedRef.current = true
    }
  }, [tab, fetchAnalytics])

  // Live real-time polling interval (every 10 seconds)
  useEffect(() => {
    if (tab !== 'analytics' || !autoRefresh) return
    const interval = setInterval(() => {
      fetchAnalytics(true)
    }, 10000)
    return () => clearInterval(interval)
  }, [tab, autoRefresh, fetchAnalytics])

  const handleStatusToggle = async () => {
    setConfirmOpen(false)
    setStatusUpdating(true)
    const newStatus = restaurant.status === 'active' ? 'suspended' : 'active'
    try {
      await api.patch(`/api/admin/restaurants/${id}/status`, { status: newStatus })
      setRestaurant((prev) => ({ ...prev, status: newStatus }))
      toast.success(`Restaurant ${newStatus === 'active' ? 'activated' : 'suspended'}`)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setStatusUpdating(false)
    }
  }

  const qrImageSrc = qrData?.qrDataUrl || qrData?.qrCodeUrl || qrData?.qr_code_url

  const handleDownloadQr = () => {
    if (!qrImageSrc) { toast.error('No QR code available'); return }
    const a = document.createElement('a')
    a.href = qrImageSrc
    a.download = `${restaurant?.name?.toLowerCase().replace(/\s+/g, '-') || 'restaurant'}-table-qr.png`
    a.click()
    toast.success('High-res Table QR downloaded!')
  }

  const tabs = [
    { id: 'overview', label: 'QR Studio & Overview', icon: QrCode },
    { id: 'analytics', label: 'Dining Analytics', icon: BarChart3 },
    { id: 'menu', label: 'Digital Menu Items', icon: UtensilsCrossed },
  ]

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-orange-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Restaurant Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">This restaurant might have been deleted or does not exist.</p>
        <Link href="/restaurants" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold">
          ← Return to Restaurants
        </Link>
      </div>
    )
  }

  const menuUrl =
    qrData?.menuUrl ||
    qrData?.menu_url ||
    `${process.env.NEXT_PUBLIC_CUSTOMER_URL || 'http://localhost:3003'}/menu/${restaurant.slug || id}`

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* ── BREADCRUMB ── */}
      <Link
        href="/restaurants"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to All Restaurants</span>
      </Link>

      {/* ── HERO RESTAURANT HEADER CARD ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-500/20 flex-shrink-0">
            {restaurant.name?.charAt(0) || 'R'}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {restaurant.name}
              </h1>
              <StatusBadge status={restaurant.status} />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
              <span className="font-semibold text-orange-600">★ {restaurant.cuisineType || restaurant.cuisine_type || 'Multi-Cuisine'}</span>
              <span>•</span>
              <span className="font-mono text-slate-400">/{restaurant.slug}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportReport}
            disabled={exportingReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            title="Download full operational & stock Excel report (.xlsx)"
          >
            {exportingReport ? (
              <div className="w-3.5 h-3.5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            <span>Export Excel Report</span>
          </button>

          <Link
            href={`/restaurants/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>

          <button
            onClick={() => setConfirmOpen(true)}
            disabled={statusUpdating}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 ${
              restaurant.status === 'active'
                ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80'
            }`}
          >
            {statusUpdating ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : restaurant.status === 'active' ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
            <span>{restaurant.status === 'active' ? 'Suspend Access' : 'Activate Access'}</span>
          </button>

          {restaurant.status === 'suspended' && (
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80"
              title="Permanently delete suspended restaurant"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Restaurant</span>
            </button>
          )}
        </div>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div className="flex gap-2 border-b border-slate-200/80 pb-px">
        {tabs.map(({ id: tid, label, icon: Icon }) => (
          <button
            key={tid}
            onClick={() => setTab(tid)}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              tab === tid
                ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: OVERVIEW & QR STUDIO ── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Restaurant Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Restaurant Profile & Admin
            </h2>

            <div className="space-y-4">
              {[
                { icon: UtensilsCrossed, label: 'Restaurant Name', value: restaurant.name },
                { icon: Mail, label: 'Admin Email', value: restaurant.adminEmail || restaurant.admin_email || restaurant.adminUsers?.[0]?.email },
                { icon: MapPin, label: 'Address', value: restaurant.address },
                { icon: Phone, label: 'Phone', value: restaurant.phone },
                {
                  icon: MessageSquareText,
                  label: 'Renza Platform Feedback Link',
                  value: restaurant.superAdminFeedbackUrl
                    ? `${restaurant.superAdminFeedbackUrl} (Active in Diner Footer)`
                    : 'Not Configured (Footer link hidden)',
                },
                { icon: Calendar, label: 'Created On', value: formatDate(restaurant.createdAt || restaurant.created_at) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-500">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5 break-words">{value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table QR Code Studio */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">Table QR Code Studio</h2>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
                  High-DPI Ready
                </span>
              </div>

              <div className="flex flex-col items-center gap-4 py-4">
                {qrImageSrc ? (
                  <div className="p-4 border-2 border-orange-100 rounded-3xl bg-white shadow-md relative group">
                    <img
                      src={qrImageSrc}
                      alt="Table QR Code"
                      className="w-52 h-52 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-52 h-52 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-400">
                    <QrCode className="w-10 h-10 animate-pulse text-orange-400" />
                    <p className="text-xs font-medium">Generating QR asset...</p>
                  </div>
                )}

                {/* ── CUSTOM URL / PRODUCTION DOMAIN EDITOR ── */}
                <div className="w-full space-y-1.5">
                  <div className="flex items-center justify-between px-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-700">QR Target Destination</span>
                      {qrData?.customMenuUrl && (
                        <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
                          Custom URL
                        </span>
                      )}
                    </div>
                    {!isEditingUrl && (
                      <button
                        onClick={handleStartEditUrl}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit URL
                      </button>
                    )}
                  </div>

                  {isEditingUrl ? (
                    <div className="bg-orange-50/60 border border-orange-200 rounded-2xl p-4 space-y-3 shadow-xs">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Production / Live Domain Menu URL:
                        </label>
                        <div className="relative">
                          <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="url"
                            value={customUrlInput}
                            onChange={(e) => setCustomUrlInput(e.target.value)}
                            placeholder={`https://renza.com/menu/${restaurant?.slug || id}`}
                            className="w-full pl-10 pr-3 py-2.5 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          The QR code image will regenerate immediately for this live link.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={handleSaveUrl}
                          disabled={savingUrl}
                          className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{savingUrl ? 'Updating...' : 'Save & Regenerate QR'}</span>
                        </button>

                        {qrData?.customMenuUrl && (
                          <button
                            onClick={handleResetUrl}
                            disabled={savingUrl}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                          </button>
                        )}

                        <button
                          onClick={() => setIsEditingUrl(false)}
                          disabled={savingUrl}
                          className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors ml-auto"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <p className="flex-1 text-xs text-slate-700 truncate font-mono">{menuUrl}</p>
                      <a
                        href={menuUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                        title="Test link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={handleDownloadQr}
                disabled={!qrImageSrc}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-xs font-bold transition-all shadow-sm shadow-orange-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download Printable PNG</span>
              </button>
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Live Menu</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: DINING ANALYTICS ── */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          {/* Live Data Stream Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/80 px-5 py-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                {autoRefresh && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${autoRefresh ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              </span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {autoRefresh ? 'Live Stream Active' : 'Live Stream Paused'}
              </span>
              {lastUpdated && (
                <span className="text-[11px] text-slate-400 font-medium">
                  • Last sync: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAutoRefresh((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  autoRefresh
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {autoRefresh ? 'Auto-Sync (10s)' : 'Resume Auto-Sync'}
              </button>
              <button
                type="button"
                onClick={() => fetchAnalytics(false)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-xs hover:bg-orange-600 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : analytics ? (
            <>
              {/* Today */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Today&apos;s Velocity</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <MetricCard label="QR Camera Scans" value={analytics.today?.qrScans ?? analytics.today?.scans ?? 0} icon={Scan} color="text-orange-600" bg="bg-orange-50" />
                  <MetricCard label="Unique Diners" value={analytics.today?.uniqueVisitors ?? analytics.today?.unique_visitors ?? 0} icon={Users} color="text-blue-600" bg="bg-blue-50" />
                  <MetricCard label="Menu Page Views" value={analytics.today?.menuViews ?? analytics.today?.menu_views ?? 0} icon={Eye} color="text-purple-600" bg="bg-purple-50" />
                </div>
              </div>

              {/* Aggregates: Week / Month / All-time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">This Week</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">QR Scans</span>
                      <span className="text-sm font-bold text-slate-800">{formatNumber(analytics.thisWeek?.qrScans ?? analytics.week?.qrScans ?? analytics.thisWeek?.scans ?? 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Unique Diners</span>
                      <span className="text-sm font-bold text-slate-800">{formatNumber(analytics.thisWeek?.uniqueVisitors ?? analytics.week?.uniqueVisitors ?? 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">This Month</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">QR Scans</span>
                      <span className="text-sm font-bold text-slate-800">{formatNumber(analytics.thisMonth?.qrScans ?? analytics.month?.qrScans ?? analytics.thisMonth?.scans ?? 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Unique Diners</span>
                      <span className="text-sm font-bold text-slate-800">{formatNumber(analytics.thisMonth?.uniqueVisitors ?? analytics.month?.uniqueVisitors ?? 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">All Time Total</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Total QR Scans</span>
                      <span className="text-sm font-bold text-orange-600">{formatNumber(analytics.allTime?.qrScans ?? analytics.allTime?.scans ?? analytics.total?.scans ?? 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Total Menu Views</span>
                      <span className="text-sm font-bold text-purple-600">{formatNumber(analytics.allTime?.menuViews ?? analytics.allTime?.menu_views ?? analytics.total?.menuViews ?? 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hourly Activity Bar Chart */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Today&apos;s Hourly QR Scan Distribution</h3>
                      <p className="text-[11px] text-slate-400">Peak dining times (24-hour clock)</p>
                    </div>
                  </div>
                </div>
                <HourlyChart data={analytics.hourlyToday || analytics.hourly || analytics.hourlyScans || []} />
              </div>

              {/* Top Viewed Dishes */}
              {Array.isArray(analytics.topItems) && analytics.topItems.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <span>Most Viewed Dishes Today</span>
                  </h3>
                  <div className="divide-y divide-slate-100">
                    {analytics.topItems.map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                            idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{item.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{item.viewCount} views</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No analytics data recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">Analytics populate as customers scan the table QR code.</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: DIGITAL MENU ITEMS ── */}
      {tab === 'menu' && <MenuTab restaurantId={id} />}

      <ConfirmDialog
        open={confirmOpen}
        message={`Are you sure you want to ${
          restaurant.status === 'active' ? 'suspend' : 'activate'
        } ${restaurant.name}?`}
        onConfirm={handleStatusToggle}
        onCancel={() => setConfirmOpen(false)}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        restaurant={restaurant}
        onConfirm={handleDeleteRestaurant}
        onCancel={() => setDeleteConfirmOpen(false)}
        deleting={deleting}
      />
    </div>
  )
}

// ─── Menu Tab Component ───────────────────────────────────────────────────────
function MenuTab({ restaurantId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/api/admin/restaurants/${restaurantId}`)
        setData(res.data?.restaurant || res.data || null)
      } catch {
        toast.error('Failed to load menu')
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [restaurantId])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
    )
  }

  const rawCategories = Array.isArray(data?.categories) ? data.categories : []
  const rawFoodItems = Array.isArray(data?.foodItems) ? data.foodItems : []

  // Build a structured category list
  const categoryMap = new Map()
  rawCategories.forEach((cat) => {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      items: Array.isArray(cat.foodItems) ? [...cat.foodItems] : [],
    })
  })

  // Distribute flat food items to categories if not already present
  const uncategorizedItems = []
  rawFoodItems.forEach((item) => {
    if (item.categoryId && categoryMap.has(item.categoryId)) {
      const cat = categoryMap.get(item.categoryId)
      if (!cat.items.some((i) => (i.id || i._id) === (item.id || item._id))) {
        cat.items.push(item)
      }
    } else {
      if (!uncategorizedItems.some((i) => (i.id || i._id) === (item.id || item._id))) {
        uncategorizedItems.push(item)
      }
    }
  })

  const displayCategories = []
  categoryMap.forEach((cat) => {
    displayCategories.push(cat)
  })

  if (uncategorizedItems.length > 0) {
    displayCategories.push({
      id: 'uncategorized',
      name: displayCategories.length > 0 ? 'Uncategorized Dishes' : 'Main Menu',
      items: uncategorizedItems,
    })
  }

  const allItems = displayCategories.flatMap((c) => c.items || [])

  if (allItems.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8">
        <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p className="font-bold text-slate-800 text-base">No menu items added yet</p>
        <p className="text-xs text-slate-400 mt-1">
          The restaurant admin can add categories and dishes from their portal.
        </p>
      </div>
    )
  }

  const availableCount = allItems.filter((i) => i.isAvailable !== false && i.available !== false).length
  const unavailableCount = allItems.length - availableCount

  return (
    <div className="space-y-5">
      {/* Summary Chips */}
      <div className="flex gap-3 flex-wrap">
        <div className="px-4 py-2 bg-emerald-50 border border-emerald-200/60 rounded-xl">
          <span className="text-xs font-bold text-emerald-800">{availableCount} Available Dishes</span>
        </div>
        <div className="px-4 py-2 bg-rose-50 border border-rose-200/60 rounded-xl">
          <span className="text-xs font-bold text-rose-800">{unavailableCount} Sold Out Dishes</span>
        </div>
        <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl">
          <span className="text-xs font-bold text-slate-700">{displayCategories.length} Categories</span>
        </div>
      </div>

      {/* Categories */}
      {displayCategories.map((cat, ci) => {
        const items = cat.items || []
        return (
          <div key={cat.id || ci} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/80 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
              <span className="text-xs text-slate-400 font-semibold">{items.length} {items.length === 1 ? 'dish' : 'dishes'}</span>
            </div>
            {items.length === 0 ? (
              <p className="px-6 py-4 text-xs text-slate-400">No dishes in this category</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {items.map((item, ii) => {
                  const available = item.isAvailable !== false && item.available !== false
                  const rawImage = item.imageUrl || item.image
                  return (
                    <div key={item.id || item._id || ii} className="flex items-center gap-3.5 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                      {rawImage ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                          <img
                            src={rawImage}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      ) : null}
                      <VegDot isVeg={item.isVeg ?? item.is_veg ?? true} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${available ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-extrabold text-slate-900">
                          ₹{item.price || 0}
                        </span>
                        {!available && (
                          <span className="text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-bold">
                            Sold Out
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
