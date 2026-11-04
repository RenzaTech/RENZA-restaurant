'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import {
  Radio,
  Building2,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  TrendingUp,
  Plus,
  Store,
  MapPin,
} from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function NfcCardsPage() {
  const [cards, setCards] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState(null)
  const [search, setSearch] = useState('')
  const [restaurantFilter, setRestaurantFilter] = useState('ALL')
  const [copiedCode, setCopiedCode] = useState(null)

  // Direct production URL requested
  const NFC_PORTAL_URL = 'https://nfc.scanzaa.in/'

  const loadData = async () => {
    setLoading(true)
    try {
      const [cardRes, restRes] = await Promise.all([
        api.get('/api/nfc/cards'),
        api.get('/api/nfc/restaurants'),
      ])
      if (cardRes.data?.success) {
        setCards(cardRes.data.data || [])
      }
      if (restRes.data?.success) {
        setRestaurants(restRes.data.data || [])
      }
    } catch (err) {
      console.error('[Super Admin] Error loading cards:', err)
      toast.error('Failed to load NFC review cards')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggle = async (card) => {
    const nextState = !card.isActive
    setTogglingId(card.id)
    try {
      const res = await api.patch(`/api/nfc/cards/${card.id}/toggle`, {
        isActive: nextState,
      })
      if (res.data?.success) {
        toast.success(
          `Card ${card.uniqueCode} is now ${nextState ? 'LIVE (ON)' : 'PAUSED (OFF)'}`,
          {
            icon: nextState ? '🟢' : '⏸️',
          }
        )
        setCards((prev) =>
          prev.map((c) => (c.id === card.id ? { ...c, isActive: nextState } : c))
        )
      }
    } catch (err) {
      console.error('[Super Admin] Error toggling status:', err)
      toast.error('Failed to update card status')
    } finally {
      setTogglingId(null)
    }
  }

  const handleCopyLink = (code) => {
    const url = `https://nfc.scanzaa.in/c/${code}`
    navigator.clipboard.writeText(url)
    setCopiedCode(code)
    toast.success('Tap URL copied to clipboard!')
    setTimeout(() => setCopiedCode(null), 2500)
  }

  const totalCards = cards.length
  const activeCards = cards.filter((c) => c.isActive).length
  const pausedCards = totalCards - activeCards
  const totalTaps = cards.reduce((sum, c) => sum + (c.totalTaps || 0), 0)

  const filteredCards = cards.filter((c) => {
    const matchSearch =
      c.restaurant?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.uniqueCode?.toLowerCase().includes(search.toLowerCase()) ||
      c.label?.toLowerCase().includes(search.toLowerCase())

    const matchRest =
      restaurantFilter === 'ALL' || c.restaurantId === restaurantFilter

    return matchSearch && matchRest
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse text-teal-500" />
            <span>Hardware & Review Controller</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            NFC Review Cards Remote Control
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Manage Google Review NFC cards, track live customer taps, and remotely toggle reviews ON or OFF for any restaurant.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
            title="Refresh card list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <a
            href={NFC_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Generate New Card</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cards */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total NFC Cards</p>
              {loading ? (
                <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse mt-2" />
              ) : (
                <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
                  {formatNumber(totalCards)}
                </p>
              )}
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Registered hardware cards</p>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-teal-50 text-teal-600 shadow-inner">
              <Radio className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Active Cards (ON) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active (ON)</p>
              {loading ? (
                <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse mt-2" />
              ) : (
                <p className="text-3xl font-black text-emerald-600 mt-1 tracking-tight">
                  {formatNumber(activeCards)}
                </p>
              )}
              <p className="text-[11px] text-emerald-700/80 mt-1 font-medium">Redirecting to Google</p>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Paused Cards (OFF) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Paused (OFF)</p>
              {loading ? (
                <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse mt-2" />
              ) : (
                <p className="text-3xl font-black text-rose-600 mt-1 tracking-tight">
                  {formatNumber(pausedCards)}
                </p>
              )}
              <p className="text-[11px] text-rose-700/80 mt-1 font-medium">Reviews blocked (Unpaid)</p>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-50 text-rose-600 shadow-inner">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Customer Taps */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Customer Taps</p>
              {loading ? (
                <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse mt-2" />
              ) : (
                <p className="text-3xl font-black text-indigo-900 mt-1 tracking-tight">
                  {formatNumber(totalTaps)}
                </p>
              )}
              <p className="text-[11px] text-indigo-600/80 mt-1 font-medium">All-time scan interactions</p>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600 shadow-inner">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by restaurant name, card code, or location..."
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Restaurant:
            </span>
            <select
              value={restaurantFilter}
              onChange={(e) => setRestaurantFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs transition-all"
            >
              <option value="ALL">All Restaurants ({restaurants.length})</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.city ? `(${r.city})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Restaurant</th>
                <th className="py-3.5 px-4">Card Code</th>
                <th className="py-3.5 px-4">Placement / Label</th>
                <th className="py-3.5 px-4">Destination Google Review URL</th>
                <th className="py-3.5 px-4 text-center">Taps</th>
                <th className="py-3.5 px-6 text-center">Remote Control Switch</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded-lg animate-pulse w-36" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-slate-100 rounded-lg animate-pulse w-20" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-slate-100 rounded-lg animate-pulse w-24" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-slate-100 rounded-lg animate-pulse w-48" />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="h-4 bg-slate-100 rounded-lg animate-pulse w-8 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="h-6 bg-slate-100 rounded-full animate-pulse w-20 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-4 bg-slate-100 rounded-lg animate-pulse w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredCards.length > 0 ? (
                filteredCards.map((card) => {
                  const cardTapUrl = `https://nfc.scanzaa.in/c/${card.uniqueCode}`
                  const isToggling = togglingId === card.id

                  return (
                    <tr key={card.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Restaurant */}
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 border border-teal-100">
                            <Store className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {card.restaurant?.name || 'Unknown Restaurant'}
                            </p>
                            {card.restaurant?.city && (
                              <p className="text-[11px] font-medium text-slate-400 flex items-center gap-0.5 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {card.restaurant.city}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Unique Code */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-900">
                        <span className="bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg text-slate-800 tracking-wide text-xs">
                          {card.uniqueCode}
                        </span>
                      </td>

                      {/* Card Label */}
                      <td className="py-4 px-4 text-slate-600 font-medium">
                        <span className="inline-block bg-slate-50 border border-slate-200/60 px-2.5 py-0.5 rounded-md text-xs">
                          {card.label || 'Counter'}
                        </span>
                      </td>

                      {/* Target Link */}
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-500 max-w-xs truncate">
                        <a
                          href={card.targetGoogleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-teal-600 hover:underline inline-flex items-center gap-1 group truncate"
                          title={card.targetGoogleUrl}
                        >
                          <span className="truncate">{card.targetGoogleUrl}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60 group-hover:opacity-100" />
                        </a>
                      </td>

                      {/* Tap Count */}
                      <td className="py-4 px-4 text-center font-black text-slate-900 text-sm">
                        {formatNumber(card.totalTaps || 0)}
                      </td>

                      {/* The Remote Switch */}
                      <td className="py-4 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(card)}
                          disabled={isToggling}
                          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
                            card.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          } ${isToggling ? 'opacity-50 cursor-wait' : 'cursor-pointer active:scale-95'}`}
                          title={`Click to switch ${card.isActive ? 'OFF' : 'ON'}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              card.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                            }`}
                          />
                          <span>{card.isActive ? 'LIVE (ON)' : 'PAUSED (OFF)'}</span>
                          {card.isActive ? (
                            <ToggleRight className="w-4 h-4 text-emerald-600 ml-0.5" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-rose-500 ml-0.5" />
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(card.uniqueCode)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Copy Tap URL"
                          >
                            {copiedCode === card.uniqueCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <a
                            href={cardTapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/60 rounded-lg transition-colors"
                          >
                            <span>Test Tap</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                /* Clean Empty State */
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-14 h-14 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-3 shadow-inner">
                        <Radio className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-1">
                        No NFC Review Cards Found
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-5">
                        {search || restaurantFilter !== 'ALL'
                          ? 'No cards match your filter criteria. Try clearing filters.'
                          : 'You haven’t generated any NFC review cards yet. Click below to create your first card on Scanzaa NFC.'}
                      </p>
                      <a
                        href={NFC_PORTAL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20 active:scale-95"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Generate First Card on nfc.scanzaa.in</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </a>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
