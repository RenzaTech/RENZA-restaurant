'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  Building2,
  Eye,
  Pencil,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  QrCode,
  ChevronRight,
  Store,
  ExternalLink,
  Filter,
} from 'lucide-react'
import api from '@/lib/api'
import { formatNumber, formatDate } from '@/lib/utils'
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

function TableRowSkeleton() {
  return (
    <tr>
      {[...Array(8)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-100">
        <h3 className="text-base font-bold text-slate-900 mb-2">Confirm Status Change</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-sm"
          >
            Confirm Change
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RestaurantsPage() {
  const router = useRouter()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all | active | suspended
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, currentStatus: null })
  const [statusUpdating, setStatusUpdating] = useState(null)

  const fetchRestaurants = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/restaurants')
      setRestaurants(res.data?.restaurants || res.data || [])
    } catch {
      toast.error('Failed to load restaurants')
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
      adminEmail.includes(search.toLowerCase()) ||
      (r.cuisineType || r.cuisine_type || '').toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ? true : r.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleStatusToggle = (id, currentStatus) => {
    setConfirmDialog({ open: true, id, currentStatus })
  }

  const confirmStatusToggle = async () => {
    const { id, currentStatus } = confirmDialog
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    setConfirmDialog({ open: false, id: null, currentStatus: null })
    setStatusUpdating(id)
    try {
      await api.patch(`/api/admin/restaurants/${id}/status`, { status: newStatus })
      setRestaurants((prev) =>
        prev.map((r) => ((r._id || r.id) === id ? { ...r, status: newStatus } : r))
      )
      toast.success(`Restaurant ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`)
    } catch {
      toast.error('Failed to update restaurant status')
    } finally {
      setStatusUpdating(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Restaurants & Table QRs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {loading
              ? 'Loading platform directories...'
              : `${restaurants.length} restaurant${restaurants.length !== 1 ? 's' : ''} active on Renza cloud`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRestaurants}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/restaurants/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-teal-600 hover:from-orange-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Restaurant</span>
          </Link>
        </div>
      </div>

      {/* ── SEARCH & FILTER BAR ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by restaurant name, cuisine, or admin email..."
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

      {/* ── TABLE CARD ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Restaurant Name</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Admin Email</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Dishes</th>
                <th className="text-right px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Today Scans</th>
                <th className="text-right px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Total Scans</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                <th className="text-right px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(6)].map((_, i) => <TableRowSkeleton key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 px-4">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-800 font-bold text-base">
                      {search ? 'No restaurants match your search' : 'No restaurants registered yet'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {search ? 'Try clearing or searching for something else' : 'Start onboarding partner restaurants today'}
                    </p>
                    {!search && (
                      <Link
                        href="/restaurants/new"
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-all shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Onboard Restaurant
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const id = r._id || r.id
                  const isUpdating = statusUpdating === id
                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/restaurants/${id}`} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm border border-orange-100 flex-shrink-0">
                            {r.name?.charAt(0) || 'R'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-1.5">
                              {r.name}
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5" />
                            </p>
                            <p className="text-xs text-slate-400">{r.cuisineType || r.cuisine_type || '—'}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs font-medium">
                        {r.adminEmail || r.admin_email || r.adminUsers?.[0]?.email || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-6 py-4 text-right text-slate-800 font-bold text-xs">
                        {formatNumber(r.foodItemsCount ?? r.food_items_count ?? r.foodItemCount ?? r._count?.foodItems ?? 0)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700 text-xs font-semibold">
                        {formatNumber(r.todayScans ?? r.today_scans ?? r.analytics?.today?.qrScans ?? 0)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700 text-xs font-semibold">
                        {formatNumber(r.totalScans ?? r.total_scans ?? r.analytics?.allTime?.qrScans ?? 0)}
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs">
                        {formatDate(r.createdAt || r.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/restaurants/${id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200/60"
                            title="View QR code and analytics"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>QR Studio</span>
                          </Link>

                          <Link
                            href={`/restaurants/${id}/edit`}
                            title="Edit Restaurant"
                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleStatusToggle(id, r.status)}
                            disabled={isUpdating}
                            title={r.status === 'active' ? 'Suspend' : 'Activate'}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                              r.status === 'active'
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {isUpdating ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : r.status === 'active' ? (
                              <ToggleRight className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
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

      <ConfirmDialog
        open={confirmDialog.open}
        message={`Are you sure you want to ${
          confirmDialog.currentStatus === 'active' ? 'suspend' : 'activate'
        } this restaurant? ${
          confirmDialog.currentStatus === 'active'
            ? 'Customers will be greeted with a temporarily unavailable screen.'
            : 'Customers will instantly be able to view their digital menu again.'
        }`}
        onConfirm={confirmStatusToggle}
        onCancel={() => setConfirmDialog({ open: false, id: null, currentStatus: null })}
      />
    </div>
  )
}
