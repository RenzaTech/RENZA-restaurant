'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  QrCode,
  Eye,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Sparkles,
  Store,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
} from 'lucide-react'
import api from '@/lib/api'
import { formatNumber, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

function StatCard({ label, value, icon: Icon, color, bgGradient, loading, hint }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          {loading ? (
            <div className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse mt-2" />
          ) : (
            <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
              {formatNumber(value)}
            </p>
          )}
          {hint && <p className="text-xs text-slate-400 mt-1.5 font-medium">{hint}</p>}
        </div>
        <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${bgGradient}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  )
}

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
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          isActive ? 'bg-emerald-500' : 'bg-rose-500'
        }`}
      />
      {isActive ? 'Active' : 'Suspended'}
    </span>
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
          Are you sure you want to permanently delete <strong className="text-slate-900">{restaurant.name}</strong>? This will permanently remove its dishes, categories, admin accounts, and analytics history.
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

export default function DashboardPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await api.get('/api/admin/restaurants')
      setRestaurants(res.data?.restaurants || res.data || [])
    } catch (err) {
      if (!silent) toast.error('Failed to load platform data')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => {
      fetchData(true)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const id = deleteTarget._id || deleteTarget.id
    setDeleting(true)
    try {
      await api.delete(`/api/admin/restaurants/${id}`)
      toast.success(`Restaurant "${deleteTarget.name}" deleted successfully`)
      setRestaurants((prev) => prev.filter((r) => (r._id || r.id) !== id))
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to delete restaurant')
    } finally {
      setDeleting(false)
    }
  }

  const totalRestaurants = restaurants.length
  const activeRestaurants = restaurants.filter((r) => r.status === 'active').length
  const totalScans = restaurants.reduce(
    (sum, r) => sum + (r.totalScans ?? r.total_scans ?? r.analytics?.allTime?.qrScans ?? 0),
    0
  )
  const totalViews = restaurants.reduce(
    (sum, r) => sum + (r.totalMenuViews ?? r.total_menu_views ?? r.analytics?.allTime?.menuViews ?? 0),
    0
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Master Governance
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Platform Overview
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Monitor active restaurant tenants, table QR scan velocity, customer dining engagement, and cloud data synchronization in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold border border-slate-700 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <Link
              href="/restaurants/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-teal-600 hover:from-orange-600 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" />
              Onboard Restaurant
            </Link>
          </div>
        </div>

        {/* Ambient glow accent */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── 4 STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Restaurants"
          value={totalRestaurants}
          icon={Building2}
          color="text-blue-600"
          bgGradient="bg-blue-50"
          loading={loading}
          hint="Registered partners"
        />
        <StatCard
          label="Active Restaurants"
          value={activeRestaurants}
          icon={TrendingUp}
          color="text-emerald-600"
          bgGradient="bg-emerald-50"
          loading={loading}
          hint="Publicly accessible menus"
        />
        <StatCard
          label="Total QR Scans"
          value={totalScans}
          icon={QrCode}
          color="text-orange-600"
          bgGradient="bg-orange-50"
          loading={loading}
          hint="Diner camera scan events"
        />
        <StatCard
          label="Total Menu Views"
          value={totalViews}
          icon={Eye}
          color="text-purple-600"
          bgGradient="bg-purple-50"
          loading={loading}
          hint="Digital menu impressions"
        />
      </div>

      {/* ── RESTAURANTS TABLE CARD ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Partner Restaurants</h2>
            <p className="text-xs text-slate-400 mt-0.5">Quick overview of onboarded dining locations</p>
          </div>
          <Link
            href="/restaurants"
            className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-bold hover:underline"
          >
            <span>All Restaurants</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-3">
              <Store className="w-8 h-8 text-orange-400" />
            </div>
            <p className="text-slate-800 font-bold text-base">No restaurants onboarded yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Get started by creating your first restaurant tenant and generating their table QR code.
            </p>
            <Link
              href="/restaurants/new"
              className="mt-4 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              + Onboard First Restaurant
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Restaurant</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Account</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Dishes</th>
                  <th className="text-right px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Scans</th>
                  <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Onboarded</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {restaurants.map((r) => {
                  const id = r._id || r.id
                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/restaurants/${id}`} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm border border-orange-100 flex-shrink-0">
                            {r.name?.charAt(0) || 'R'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                              {r.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {r.cuisineType || r.cuisine_type || 'Culinary'}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs font-medium">
                        {r.adminEmail || r.admin_email || r.adminUsers?.[0]?.email || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800 text-xs">
                        {formatNumber(r.foodItemsCount ?? r.food_items_count ?? r.foodItemCount ?? r._count?.foodItems ?? 0)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800 text-xs">
                        {formatNumber(r.totalScans ?? r.total_scans ?? r.analytics?.allTime?.qrScans ?? 0)}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {formatDate(r.createdAt || r.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/restaurants/${id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold transition-colors border border-orange-200/60"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>QR & Details</span>
                          </Link>

                          {r.status === 'suspended' && (
                            <button
                              onClick={() => setDeleteTarget(r)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors border border-rose-200/60"
                              title="Delete suspended restaurant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        restaurant={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </div>
  )
}
