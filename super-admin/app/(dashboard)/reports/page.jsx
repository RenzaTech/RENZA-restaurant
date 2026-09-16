'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileSpreadsheet,
  Download,
  Search,
  RefreshCw,
  Building2,
  UtensilsCrossed,
  Eye,
  Scan,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowDownToLine,
  Store,
} from 'lucide-react'
import api from '@/lib/api'
import { formatNumber, formatDate } from '@/lib/utils'
import { exportRestaurantReport, exportAllRestaurantsReport } from '@/lib/excelExport'
import toast from 'react-hot-toast'

function StatusBadge({ status }) {
  const isActive = status === 'active'
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
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

export default function ReportsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all | active | suspended
  const [exportingId, setExportingId] = useState(null)
  const [exportingAll, setExportingAll] = useState(false)

  const fetchRestaurants = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/restaurants')
      setRestaurants(res.data?.restaurants || res.data || [])
    } catch {
      toast.error('Failed to load restaurants for reporting')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const filtered = restaurants.filter((r) => {
    const adminEmail = (r.adminEmail || r.admin_email || r.adminUsers?.[0]?.email || '').toLowerCase()
    const matchesSearch =
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.slug?.toLowerCase().includes(search.toLowerCase()) ||
      adminEmail.includes(search.toLowerCase()) ||
      (r.cuisineType || r.cuisine_type || '').toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ? true : r.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Export a single restaurant with full deep details
  const handleExportSingle = async (restaurantSummary) => {
    const id = restaurantSummary._id || restaurantSummary.id
    setExportingId(id)
    try {
      // Fetch full restaurant object (with categories & foodItems) and analytics
      const [detailsRes, analyticsRes] = await Promise.allSettled([
        api.get(`/api/admin/restaurants/${id}`),
        api.get(`/api/admin/restaurants/${id}/analytics`),
      ])

      const fullRestaurant =
        detailsRes.status === 'fulfilled'
          ? (detailsRes.value.data?.restaurant || detailsRes.value.data || restaurantSummary)
          : restaurantSummary

      const analytics =
        analyticsRes.status === 'fulfilled'
          ? (analyticsRes.value.data?.analytics || analyticsRes.value.data || {})
          : {}

      exportRestaurantReport(fullRestaurant, analytics)
      toast.success(`Excel report downloaded for "${fullRestaurant.name}"!`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate Excel report')
    } finally {
      setExportingId(null)
    }
  }

  // Export master report of all restaurants
  const handleExportAll = () => {
    if (restaurants.length === 0) {
      toast.error('No restaurants available to export')
      return
    }
    setExportingAll(true)
    try {
      exportAllRestaurantsReport(restaurants)
      toast.success(`Master platform Excel report generated with ${restaurants.length} restaurants!`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to export master report')
    } finally {
      setExportingAll(false)
    }
  }

  // Calculate platform totals
  const totalDishes = restaurants.reduce(
    (sum, r) => sum + (r.foodItemCount ?? r.foodItemsCount ?? r.food_items_count ?? r._count?.foodItems ?? 0),
    0
  )
  const totalScans = restaurants.reduce(
    (sum, r) => sum + (r.totalScans ?? r.total_scans ?? r.analytics?.allTime?.qrScans ?? 0),
    0
  )
  const totalViews = restaurants.reduce(
    (sum, r) => sum + (r.totalMenuViews ?? r.analytics?.allTime?.menuViews ?? 0),
    0
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── TOP HERO HEADER CARD ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RENZA Operational Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Restaurant Reports & Excel Exports
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Export comprehensive operational reports in standard Microsoft Excel (.xlsx) format.
              Each report begins with the official <span className="font-bold text-orange-400">RENZA</span> platform header, followed by the restaurant name, credentials, live traffic performance, and complete menu dishes & stock inventory.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <button
              onClick={handleExportAll}
              disabled={loading || exportingAll || restaurants.length === 0}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {exportingAll ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              <span>Export All Restaurants (Master Excel)</span>
            </button>

            <button
              onClick={fetchRestaurants}
              disabled={loading}
              className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 transition-colors disabled:opacity-50 self-start sm:self-auto"
              title="Refresh restaurants list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── METRIC TILES ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80 relative z-10">
          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Restaurants</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">{formatNumber(restaurants.length)}</p>
          </div>
          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dishes in Stock</p>
            <p className="text-xl sm:text-2xl font-black text-orange-400 mt-1">{formatNumber(totalDishes)}</p>
          </div>
          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Scans</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{formatNumber(totalScans)}</p>
          </div>
          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Menu Views</p>
            <p className="text-xl sm:text-2xl font-black text-teal-400 mt-1">{formatNumber(totalViews)}</p>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by restaurant name, slug, cuisine, or admin email..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-xs"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs w-full sm:w-auto">
          {['all', 'active', 'suspended'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-1 sm:flex-none py-1.5 px-3 rounded-lg text-xs font-bold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ── RESTAURANTS REPORTS LIST / TABLE ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Individual Restaurant Reports</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click &quot;Export Excel Report&quot; on any restaurant to download its full report workbook (.xlsx).
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {filtered.length} {filtered.length === 1 ? 'Restaurant' : 'Restaurants'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Dishes
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Total Scans
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Total Views
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Admin Email
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 px-4">
                    <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-800 font-bold text-base">
                      {search ? 'No restaurants matched your search' : 'No restaurants registered yet'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Reports will appear here once partner restaurants are onboarded.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const id = r._id || r.id
                  const isExporting = exportingId === id
                  const dishCount = r.foodItemCount ?? r.foodItemsCount ?? r.food_items_count ?? r._count?.foodItems ?? 0
                  const scans = r.totalScans ?? r.total_scans ?? r.analytics?.allTime?.qrScans ?? 0
                  const views = r.totalMenuViews ?? r.analytics?.allTime?.menuViews ?? 0

                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-teal-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
                            {r.name?.charAt(0) || 'R'}
                          </div>
                          <div>
                            <Link
                              href={`/restaurants/${id}`}
                              className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-1.5"
                            >
                              <span>{r.name}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <p className="text-xs text-slate-400">
                              <span className="font-semibold text-orange-600/80">{r.cuisineType || r.cuisine_type || 'General Dining'}</span>
                              <span className="mx-1.5">•</span>
                              <span className="font-mono">/{r.slug}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={r.status} />
                      </td>

                      <td className="px-6 py-4 text-right font-bold text-slate-800 text-xs">
                        {formatNumber(dishCount)}
                      </td>

                      <td className="px-6 py-4 text-right font-semibold text-slate-700 text-xs">
                        {formatNumber(scans)}
                      </td>

                      <td className="px-6 py-4 text-right font-semibold text-slate-700 text-xs">
                        {formatNumber(views)}
                      </td>

                      <td className="px-6 py-4 text-slate-600 text-xs font-mono">
                        {r.adminEmail || r.admin_email || r.adminUsers?.[0]?.email || '—'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleExportSingle(r)}
                            disabled={isExporting}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                            title="Download full Excel report (.xlsx)"
                          >
                            {isExporting ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                                <span>Generating...</span>
                              </>
                            ) : (
                              <>
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                <span>Export Excel Report</span>
                              </>
                            )}
                          </button>

                          <Link
                            href={`/restaurants/${id}`}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="View Restaurant Details & QR Studio"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
