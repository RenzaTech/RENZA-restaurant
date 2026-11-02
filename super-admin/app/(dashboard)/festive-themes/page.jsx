'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  Flame,
  Store,
  RefreshCw,
  Sliders,
  Check,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react'
import { apiFetch } from '@/lib/api'
import toast from 'react-hot-toast'

export default function FestiveThemesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'enabled' | 'disabled'
  
  // Timing state (in seconds)
  const [durationSeconds, setDurationSeconds] = useState(5)
  const [previewPlaying, setPreviewPlaying] = useState(false)

  // Fetch current festive configuration
  const loadConfig = async () => {
    try {
      setLoading(true)
      const data = await apiFetch('/api/admin/festive/config')
      if (data?.restaurants) {
        setRestaurants(data.restaurants)
        if (data.defaultDuration) {
          setDurationSeconds(data.defaultDuration)
        }
      }
    } catch (err) {
      console.error('Error fetching festive config:', err)
      toast.error('Failed to load festival configuration')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  // Filtered restaurants
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.city && r.city.toLowerCase().includes(search.toLowerCase())) ||
        r.slug.toLowerCase().includes(search.toLowerCase())

      if (!matchSearch) return false

      if (statusFilter === 'enabled') return r.festiveThemeEnabled
      if (statusFilter === 'disabled') return !r.festiveThemeEnabled
      return true
    })
  }, [restaurants, search, statusFilter])

  const totalEnabled = useMemo(
    () => restaurants.filter((r) => r.festiveThemeEnabled).length,
    [restaurants]
  )

  // Toggle single restaurant selection
  const toggleRestaurant = (id) => {
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, festiveThemeEnabled: !r.festiveThemeEnabled } : r
      )
    )
  }

  // Select all visible or all restaurants
  const handleSelectAll = (select = true) => {
    setRestaurants((prev) =>
      prev.map((r) => ({ ...r, festiveThemeEnabled: select }))
    )
    toast.success(select ? 'Selected all restaurants' : 'Deselected all restaurants')
  }

  // Save changes to backend
  const handleSave = async () => {
    try {
      setSaving(true)
      const selectedIds = restaurants
        .filter((r) => r.festiveThemeEnabled)
        .map((r) => r.id)

      const payload = {
        restaurantIds: selectedIds,
        durationSeconds: durationSeconds,
        themeName: 'diwali',
      }

      const res = await apiFetch('/api/admin/festive/save', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (res?.restaurants) {
        setRestaurants(res.restaurants)
      }
      toast.success(
        `Diwali theme applied to ${selectedIds.length} restaurants (${durationSeconds}s duration)!`
      )
    } catch (err) {
      console.error('Error saving festive settings:', err)
      toast.error('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Trigger mini preview animation
  const runPreviewAnimation = () => {
    setPreviewPlaying(true)
    setTimeout(() => {
      setPreviewPlaying(false)
    }, durationSeconds * 1000)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header & Active Festival Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 border border-amber-500/30 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Pilot Trial • Diwali 2026 (Live in 4 Days)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Festival Theme Control</span>
              <span className="text-amber-400">🪔</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Select which restaurants will display the Diwali theme on their customer menu.
              Set the animation duration for cracker bursts and the timed &quot;Happy Diwali&quot; greeting.
            </p>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 shrink-0">
            <div className="text-center px-2">
              <p className="text-2xl font-black text-amber-400">{totalEnabled}</p>
              <p className="text-[11px] font-semibold text-slate-400">Active Theme</p>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div className="text-center px-2">
              <p className="text-2xl font-black text-white">{restaurants.length}</p>
              <p className="text-[11px] font-semibold text-slate-400">Total Restaurants</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Controls Grid: Timing + Live Mini Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card A: Set Timing of Animation */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Animation Timing</h3>
                <p className="text-xs text-slate-400">
                  Configure how long cracker bursts &amp; the &quot;Happy Diwali&quot; greeting remain on screen.
                </p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black text-sm">
              {durationSeconds} Seconds
            </div>
          </div>

          {/* Timing Slider & Preset Pills */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400">2s (Subtle)</span>
              <input
                type="range"
                min="2"
                max="15"
                step="1"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(parseInt(e.target.value, 10))}
                className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-xs font-bold text-slate-400">15s (Grand)</span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-slate-400 mr-2">Quick Presets:</span>
              {[
                { label: '3s (Quick)', val: 3 },
                { label: '5s (Recommended)', val: 5 },
                { label: '8s (Extended)', val: 8 },
                { label: '10s (Grand)', val: 10 },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setDurationSeconds(p.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    durationSeconds === p.val
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700/60'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Hanging oil lamps along both margins stay fixed while diners scroll.</span>
            </span>
            <span className="text-emerald-400 font-semibold">Touch-safe (Zero ordering lag)</span>
          </div>
        </div>

        {/* Card B: Interactive Live Preview Card */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Menu Experience</span>
              <button
                onClick={runPreviewAnimation}
                disabled={previewPlaying}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
              >
                {previewPlaying ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>{previewPlaying ? 'Playing...' : 'Test Play'}</span>
              </button>
            </div>
            <h4 className="text-sm font-bold text-white">Live Customer Preview</h4>
          </div>

          {/* Miniature Phone Mockup Display */}
          <div className="relative my-4 w-full h-36 bg-[#FFFCF7] rounded-2xl border border-amber-500/30 overflow-hidden flex flex-col justify-between p-3 select-none">
            {/* Hanging Lamps Representation */}
            <div className="absolute top-0 left-1 w-3 flex flex-col items-center">
              <div className="w-0.5 h-8 bg-amber-400"></div>
              <div className="w-3 h-2 rounded-b-full bg-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
            </div>
            <div className="absolute top-0 right-1 w-3 flex flex-col items-center">
              <div className="w-0.5 h-8 bg-amber-400"></div>
              <div className="w-3 h-2 rounded-b-full bg-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
            </div>

            {/* Menu Header Simulation */}
            <div className="text-center pt-1">
              <span className="text-[9px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                Anbu&apos;de Cafe • Table 04
              </span>
            </div>

            {/* Timed Greeting Simulation */}
            <div className="text-center py-2 flex flex-col items-center justify-center">
              {previewPlaying ? (
                <div className="animate-bounce">
                  <p className="text-base font-serif italic font-black text-amber-600 drop-shadow-md">
                    Happy Diwali
                  </p>
                  <p className="text-[10px] text-amber-800 font-bold">✨ Bursting Crackers ({durationSeconds}s) ✨</p>
                </div>
              ) : (
                <div className="text-slate-400 text-xs flex flex-col items-center">
                  <Sparkles className="w-5 h-5 text-amber-400 mb-0.5" />
                  <span className="text-[11px] font-medium text-slate-500">Tap &quot;Test Play&quot; above to preview</span>
                </div>
              )}
            </div>

            <div className="text-[9px] text-slate-400 text-center border-t border-slate-200 pt-1">
              Scrollable Customer Menu View
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            Greets diners once per visit session. Disappears cleanly after {durationSeconds} seconds.
          </p>
        </div>

      </div>

      {/* 3. Restaurant Selection Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        
        {/* Section Header & Bulk Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400" />
              <span>Select Restaurants for Diwali Theme</span>
            </h3>
            <p className="text-xs text-slate-400">
              Only selected restaurants will display the Diwali lamps &amp; cracker animation.
            </p>
          </div>

          {/* Quick Selection Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleSelectAll(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700/60 flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Select All</span>
            </button>
            <button
              onClick={() => handleSelectAll(false)}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-400 rounded-xl text-xs font-bold transition-all border border-slate-700/60 flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Deselect All</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search restaurant or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'all', label: `All (${restaurants.length})` },
              { id: 'enabled', label: `Active (${totalEnabled})` },
              { id: 'disabled', label: `Disabled (${restaurants.length - totalEnabled})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-850'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurant List / Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Enable</th>
                <th className="py-3 px-4">Restaurant</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Diwali Theme Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Customer Menu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    <span>Loading restaurants...</span>
                  </td>
                </tr>
              ) : filteredRestaurants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No restaurants match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRestaurants.map((restaurant) => (
                  <tr
                    key={restaurant.id}
                    className={`hover:bg-slate-850/60 transition-colors ${
                      restaurant.festiveThemeEnabled ? 'bg-amber-500/[0.03]' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={restaurant.festiveThemeEnabled}
                        onChange={() => toggleRestaurant(restaurant.id)}
                        className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 focus:ring-amber-500 cursor-pointer"
                      />
                    </td>

                    {/* Restaurant Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{restaurant.name}</span>
                        {restaurant.festiveThemeEnabled && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                            Diwali
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        /{restaurant.slug}
                      </div>
                    </td>

                    {/* City */}
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {restaurant.city || '—'}
                    </td>

                    {/* Theme Status Badge */}
                    <td className="py-3.5 px-4">
                      {restaurant.festiveThemeEnabled ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Active on Menu</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          <span>Theme OFF</span>
                        </span>
                      )}
                    </td>

                    {/* Configured Duration */}
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {restaurant.festiveThemeEnabled ? `${durationSeconds}s` : '—'}
                    </td>

                    {/* Customer Menu Link */}
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`https://scan.renza.in/${restaurant.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all"
                        title="Open customer menu in new tab"
                      >
                        <span>Preview Menu</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Sticky Bottom Save Bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            <span>Configuring </span>
            <strong className="text-amber-400 font-bold">{totalEnabled}</strong>
            <span> of {restaurants.length} restaurants with </span>
            <strong className="text-white font-bold">{durationSeconds}s</strong>
            <span> Diwali cracker animation duration.</span>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{saving ? 'Applying Changes...' : 'Save & Apply Changes'}</span>
          </button>
        </div>

      </div>
    </div>
  )
}
