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
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Eye,
  Plus,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function NfcCardsPage() {
  const [cards, setCards] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [restaurantFilter, setRestaurantFilter] = useState('ALL')

  const REVIEW_WEBSITE_URL = process.env.NEXT_PUBLIC_REVIEW_WEBSITE_URL || 'http://localhost:3005'

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
    try {
      const res = await api.patch(`/api/nfc/cards/${card.id}/toggle`, {
        isActive: nextState,
      })
      if (res.data?.success) {
        toast.success(`Card ${card.uniqueCode} switched ${nextState ? 'ON' : 'OFF'}`)
        setCards((prev) =>
          prev.map((c) => (c.id === card.id ? { ...c, isActive: nextState } : c))
        )
      }
    } catch (err) {
      console.error('[Super Admin] Error toggling status:', err)
      toast.error('Failed to update card status')
    }
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse" />
            Hardware & Review Control
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            NFC Review Cards Remote Control
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Instantly turn Google Reviews ON or OFF for any restaurant&apos;s physical NFC cards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-400' : ''}`} />
            Refresh
          </button>

          <a
            href={`${REVIEW_WEBSITE_URL}/admin`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Generate New Card
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total NFC Cards</p>
          <p className="text-2xl font-extrabold text-white mt-1">{totalCards}</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
          <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Active (ON)</p>
          <p className="text-2xl font-extrabold text-emerald-300 mt-1">{activeCards}</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
          <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Paused (OFF)</p>
          <p className="text-2xl font-extrabold text-rose-300 mt-1">{pausedCards}</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
          <p className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider">Total Taps Recorded</p>
          <p className="text-2xl font-extrabold text-teal-300 mt-1">{totalTaps}</p>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by restaurant or code..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">Filter:</span>
            <select
              value={restaurantFilter}
              onChange={(e) => setRestaurantFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Restaurants</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Restaurant</th>
                <th className="py-3 px-3">Card Code</th>
                <th className="py-3 px-3">Card Label</th>
                <th className="py-3 px-3">Target Google Link</th>
                <th className="py-3 px-3 text-center">Taps</th>
                <th className="py-3 px-3 text-center">Master Switch</th>
                <th className="py-3 px-3 text-right">Card URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredCards.length > 0 ? (
                filteredCards.map((card) => {
                  const cardTapUrl = `${REVIEW_WEBSITE_URL}/c/${card.uniqueCode}`
                  return (
                    <tr key={card.id} className="hover:bg-slate-900/80 transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                          <span>{card.restaurant?.name || 'Unknown'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-teal-300">
                        <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                          {card.uniqueCode}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-400">
                        {card.label || 'Counter'}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                        <a
                          href={card.targetGoogleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-teal-300 hover:underline flex items-center gap-1"
                        >
                          <span className="truncate">{card.targetGoogleUrl}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60" />
                        </a>
                      </td>

                      <td className="py-3.5 px-3 text-center font-bold text-white">
                        {card.totalTaps}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(card)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            card.isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {card.isActive ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-emerald-400" />
                              <span>ON</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 text-rose-400" />
                              <span>OFF</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <a
                          href={cardTapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 hover:underline"
                        >
                          <span>Test Tap</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500 text-xs">
                    {loading ? 'Loading cards...' : 'No NFC Review Cards found.'}
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
