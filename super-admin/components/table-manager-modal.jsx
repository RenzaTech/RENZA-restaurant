'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  X,
  QrCode,
  Plus,
  Trash2,
  Building2,
  RefreshCw,
  Eye,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Hash,
} from 'lucide-react'
import api, { apiFetch } from '@/lib/api'
import toast from 'react-hot-toast'

export default function TableManagerModal({
  isOpen,
  onClose,
  restaurants = [],
  initialRestaurantId = '',
  onOpenQr,
  onTableCountChange,
}) {
  const [selectedId, setSelectedId] = useState(initialRestaurantId || '')
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)
  const [count, setCount] = useState('1')
  const [first, setFirst] = useState('01')

  const loadTables = useCallback(async (idToLoad) => {
    const id = idToLoad || selectedId
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const raw = await apiFetch(`/api/admin/restaurants/${id}/tables`)
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.tables)
        ? raw.tables
        : Array.isArray(raw?.data)
        ? raw.data
        : []
      setTables(list)

      // Calculate next table number based on max existing numeric suffix
      let maxNum = 0
      list.forEach((t) => {
        const match = (t.label || '').match(/(\d+)/)
        if (match) {
          const n = parseInt(match[1], 10)
          if (!isNaN(n) && n > maxNum) maxNum = n
        }
      })
      const nextNum = (maxNum > 0 ? maxNum : list.length) + 1
      setFirst(String(nextNum).padStart(2, '0'))
    } catch (err) {
      console.error('[TableManager] Failed to load dining tables:', err)
      const errorMsg = err?.message || 'Failed to load dining tables'
      setError(errorMsg)
      toast.error(errorMsg)
      setTables([])
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  // Synchronize selectedId and fetch tables when modal opens or initialRestaurantId changes
  useEffect(() => {
    if (!isOpen) return
    const target = initialRestaurantId || selectedId || (restaurants[0]?._id || restaurants[0]?.id || '')
    if (target) {
      setSelectedId(target)
      loadTables(target)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialRestaurantId])

  if (!isOpen) return null

  const selectedRestaurant = restaurants.find(
    (r) => (r._id || r.id) === selectedId
  )

  const handleRestaurantChange = (e) => {
    const newId = e.target.value
    setSelectedId(newId)
    if (newId) {
      loadTables(newId)
    }
  }

  const handleAddTables = async (customCount, customFirst) => {
    if (!selectedId) {
      toast.error('Please choose a restaurant first')
      return
    }

    const amount = Math.max(1, Math.min(50, Number(customCount !== undefined ? customCount : count) || 1))
    let num = Math.max(1, Number(customFirst !== undefined ? customFirst : first) || 1)
    const existingLabels = new Set(tables.map((t) => (t.label || '').toLowerCase()))

    setSaving(true)
    try {
      const newlyCreated = []
      for (let i = 0; i < amount; i++) {
        let label = `Table ${String(num).padStart(2, '0')}`
        num++
        while (existingLabels.has(label.toLowerCase())) {
          label = `Table ${String(num).padStart(2, '0')}`
          num++
        }

        const createdTable = await apiFetch(`/api/admin/restaurants/${selectedId}/tables`, {
          method: 'POST',
          body: JSON.stringify({ label }),
        })
        existingLabels.add(label.toLowerCase())
        newlyCreated.push(createdTable)
      }

      const updated = [...tables, ...newlyCreated]
      setTables(updated)
      if (onTableCountChange) {
        onTableCountChange(selectedId, updated.length)
      }

      toast.success(`${newlyCreated.length} dining table QR${newlyCreated.length === 1 ? '' : 's'} provisioned!`)
      setCount('1')
      setFirst(String(num).padStart(2, '0'))
    } catch (err) {
      console.error('[TableManager] Failed to create dining tables:', err)
      toast.error(err.message || 'Failed to create dining tables')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTable = async (table) => {
    if (!window.confirm(`Delete "${table.label}"? Any customer scanning its QR code will no longer be directed to this table.`)) {
      return
    }

    setDeletingId(table.id)
    try {
      await apiFetch(`/api/admin/restaurants/${selectedId}/tables/${table.id}`, {
        method: 'DELETE',
      })
      toast.success(`${table.label} deleted`)
      const updated = tables.filter((t) => t.id !== table.id)
      setTables(updated)
      if (onTableCountChange) {
        onTableCountChange(selectedId, updated.length)
      }
    } catch (err) {
      console.error('[TableManager] Failed to delete table:', err)
      toast.error(err.message || 'Failed to delete table')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-200/80 flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Manage Dining Tables & QRs
              </h2>
              <p className="text-xs text-slate-500">
                Configure dining tables and launch high-DPI table QR codes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Restaurant Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Restaurant
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedId}
                onChange={handleRestaurantChange}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs"
              >
                {restaurants.map((r) => {
                  const id = r._id || r.id
                  return (
                    <option key={id} value={id}>
                      {r.name} ({r.city || 'Platform'})
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          {/* Tables List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Provisioned Tables</span>
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-50 text-teal-700 border border-teal-200">
                  {tables.length}
                </span>
              </span>

              <button
                type="button"
                onClick={() => loadTables(selectedId)}
                disabled={loading}
                className="text-xs font-semibold text-slate-500 hover:text-teal-600 inline-flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 max-h-64 overflow-y-auto divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading dining tables...
                </div>
              ) : error ? (
                <div className="p-6 text-center text-xs">
                  <AlertCircle className="w-7 h-7 text-rose-500 mx-auto mb-2" />
                  <p className="font-bold text-slate-800">Could not load dining tables</p>
                  <p className="text-[11px] text-rose-500 mt-1 mb-3">{error}</p>
                  <button
                    type="button"
                    onClick={() => loadTables(selectedId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                </div>
              ) : tables.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <QrCode className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No dining tables provisioned yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Use the quick generator below to add tables.</p>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleAddTables(selectedRestaurant?.initialTableCount || 5, 1)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 font-bold text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Quick Provision {selectedRestaurant?.initialTableCount || 5} Tables</span>
                  </button>
                </div>
              ) : (
                tables.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 flex items-center justify-between hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 border border-teal-200/80 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">
                          {t.label}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Token: {t.qrCode?.token || t.qrToken || t.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs" title="Total customer QR views for this table">
                        <Eye className="w-3 h-3 text-blue-600" />
                        <span>{t.views ?? t.scansTotal ?? t.qrCode?.scansTotal ?? 0} views</span>
                      </span>

                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full mr-1 bg-emerald-500" />
                        ACTIVE
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenQr) {
                            onOpenQr(t, selectedRestaurant)
                          }
                        }}
                        className="px-2.5 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200 inline-flex items-center gap-1"
                        title="Open QR Studio"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View QR</span>
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === t.id}
                        onClick={() => handleDeleteTable(t)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Table"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bulk Generation Form */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-teal-600" />
              <span>Add Additional Tables</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Number of additional tables
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Starting table number
                </label>
                <input
                  type="text"
                  value={first}
                  onChange={(e) => setFirst(e.target.value)}
                  placeholder="01"
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={saving || loading || !selectedId}
              onClick={() => handleAddTables()}
              className="w-full mt-2 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-xl transition-all shadow-sm shadow-teal-500/20 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Provisioning Tables...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Tables & Generate QRs</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
