'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
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
  Check,
  Play,
  RotateCcw,
  BookOpen,
  MessageSquareHeart,
  Star,
} from 'lucide-react'
import { apiFetch } from '@/lib/api'
import toast from 'react-hot-toast'

// Hanging side lamps coordinates
const HANGING_LAMPS = [
  { xPercent: 0.05, chainLength: 60, phase: 0 },
  { xPercent: 0.08, chainLength: 120, phase: 1.2 },
  { xPercent: 0.05, chainLength: 180, phase: 2.4 },
  { xPercent: 0.08, chainLength: 240, phase: 3.6 },

  { xPercent: 0.95, chainLength: 70, phase: 0.6 },
  { xPercent: 0.92, chainLength: 130, phase: 1.8 },
  { xPercent: 0.95, chainLength: 190, phase: 3.0 },
  { xPercent: 0.92, chainLength: 250, phase: 4.2 },
]

/**
 * Real Scrollable Customer Menu Phone Simulator
 * Renders the genuine Anbu'de Cafe customer menu with fixed hanging lamps,
 * slower weeping willow fireworks, and neatly placed 'Happy Diwali' text
 * that stays for 1.8s and then disappears.
 */
function RealCustomerMenuPreview({ durationSeconds = 5 }) {
  const canvasRef = useRef(null)
  const flashRef = useRef(null)
  const [greetingVisible, setGreetingVisible] = useState(false)
  const [greetingOpacity, setGreetingOpacity] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  const triggerCelebration = () => {
    setIsPlaying(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height

    let animId
    let animStartTime = null
    let rockets = []
    let particles = []
    let flashTimeout = null
    let textShowTimeout = null
    let textHideTimeout = null

    const triggerFlash = (intensity = 0.3) => {
      if (!flashRef.current) return
      flashRef.current.style.opacity = intensity
      if (flashTimeout) clearTimeout(flashTimeout)
      flashTimeout = setTimeout(() => {
        if (flashRef.current) flashRef.current.style.opacity = '0'
      }, 70)
    }

    class RealisticSlowRocket {
      constructor(startX, targetX, targetY, delayMs) {
        this.x = startX
        this.y = h + 10
        this.targetX = targetX
        this.targetY = targetY
        this.delay = delayMs
        this.exploded = false
        this.trail = []
        this.speed = 5.2
      }

      update(elapsed) {
        if (elapsed < this.delay || this.exploded) return
        const dx = this.targetX - this.x
        const dy = this.targetY - this.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 10 || this.y <= this.targetY) {
          this.explode()
          this.exploded = true
          return
        }

        const angle = Math.atan2(dy, dx)
        this.x += Math.cos(angle) * this.speed
        this.y += Math.sin(angle) * this.speed

        this.trail.push({ x: this.x, y: this.y })
        if (this.trail.length > 10) this.trail.shift()
      }

      draw() {
        if (this.exploded) return
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        for (let i = 0; i < this.trail.length; i++) {
          const pt = this.trail[i]
          const a = (i / this.trail.length) * 0.7
          ctx.strokeStyle = `rgba(251, 191, 36, ${a})`
          ctx.lineWidth = 1.8
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 1, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      explode() {
        triggerFlash(0.25)
        for (let i = 0; i < 90; i++) {
          const angle = Math.random() * Math.PI * 2
          const spd = 0.9 + Math.random() * 2.8
          particles.push({
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            drag: 0.978,
            gravity: 0.038,
            alpha: 1,
            decay: 0.007 + Math.random() * 0.005,
            size: 1.8,
            trailLength: 6,
            color: Math.random() > 0.35 ? '#fbbf24' : '#f97316',
            history: [],
            twinkle: true,
          })
        }
      }
    }

    const drawPermanentSideLamps = (elapsed) => {
      HANGING_LAMPS.forEach((lamp) => {
        const originX = w * lamp.xPercent
        const originY = 0

        const swayAngle = Math.sin(elapsed * 0.002 + lamp.phase) * 0.035
        const targetX = originX + Math.sin(swayAngle) * lamp.chainLength
        const targetY = originY + Math.cos(swayAngle) * lamp.chainLength

        ctx.save()

        // 1. Golden Beaded Chain
        ctx.strokeStyle = '#ca8a04'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(originX, originY)
        ctx.lineTo(targetX, targetY)
        ctx.stroke()

        ctx.fillStyle = '#eab308'
        const numBeads = Math.floor(lamp.chainLength / 12)
        for (let b = 1; b < numBeads; b++) {
          const t = b / numBeads
          const bx = originX + (targetX - originX) * t
          const by = originY + (targetY - originY) * t
          ctx.beginPath()
          ctx.arc(bx, by, 1, 0, Math.PI * 2)
          ctx.fill()
        }

        // 2. Brass Diya Bowl
        ctx.translate(targetX, targetY)
        ctx.rotate(swayAngle)

        ctx.strokeStyle = '#ca8a04'
        ctx.lineWidth = 0.8
        ctx.beginPath()
        ctx.moveTo(0, 2)
        ctx.lineTo(-8, 10)
        ctx.moveTo(0, 2)
        ctx.lineTo(8, 10)
        ctx.moveTo(0, 2)
        ctx.lineTo(0, 10)
        ctx.stroke()

        ctx.fillStyle = '#9a3412'
        ctx.beginPath()
        ctx.ellipse(0, 11, 10, 5, 0, 0, Math.PI)
        ctx.fill()
        ctx.strokeStyle = '#d97706'
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.fillStyle = '#f59e0b'
        ctx.beginPath()
        ctx.ellipse(0, 11, 8, 2.5, 0, 0, Math.PI * 2)
        ctx.fill()

        // 3. Flickering Flame
        const flicker = Math.sin(elapsed * 0.018 + lamp.phase * 3) * 1.2
        const flameHeight = 12 + flicker

        ctx.globalCompositeOperation = 'lighter'
        const glow = ctx.createRadialGradient(0, 10 - flameHeight * 0.4, 1.5, 0, 10 - flameHeight * 0.4, 18)
        glow.addColorStop(0, 'rgba(251, 191, 36, 0.45)')
        glow.addColorStop(1, 'transparent')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(0, 10 - flameHeight * 0.4, 18, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#f59e0b'
        ctx.beginPath()
        ctx.moveTo(-3, 11)
        ctx.bezierCurveTo(-5, 11 - flameHeight * 0.4, 0, 11 - flameHeight, 0, 11 - flameHeight)
        ctx.bezierCurveTo(0, 11 - flameHeight, 5, 11 - flameHeight * 0.4, 3, 11)
        ctx.closePath()
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.moveTo(-1.2, 11)
        ctx.bezierCurveTo(-2, 11 - flameHeight * 0.3, 0, 11 - flameHeight * 0.65, 0, 11 - flameHeight * 0.65)
        ctx.bezierCurveTo(0, 11 - flameHeight * 0.65, 2, 11 - flameHeight * 0.3, 1.2, 11)
        ctx.closePath()
        ctx.fill()

        ctx.restore()
      })
    }

    // Launch 3 staggered slow rockets
    rockets.push(new RealisticSlowRocket(w * 0.3, w * 0.32, h * 0.22, 100))
    rockets.push(new RealisticSlowRocket(w * 0.7, w * 0.68, h * 0.26, 450))
    rockets.push(new RealisticSlowRocket(w * 0.5, w * 0.5, h * 0.17, 850))

    // Reveal "Happy Diwali" neatly at burst (~1.3s)
    textShowTimeout = setTimeout(() => {
      setGreetingVisible(true)
      setGreetingOpacity(1)

      // Disappear strictly after 1.8 seconds (between 1 and 2 seconds as requested)
      textHideTimeout = setTimeout(() => {
        setGreetingOpacity(0)
        setTimeout(() => {
          setGreetingVisible(false)
          setIsPlaying(false)
        }, 500)
      }, 1800)
    }, 1300)

    const renderLoop = (timestamp) => {
      if (!animStartTime) animStartTime = timestamp
      const elapsed = timestamp - animStartTime

      ctx.clearRect(0, 0, w, h)

      // Draw Permanent Side Hanging Lamps
      drawPermanentSideLamps(timestamp)

      // Draw Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        rockets[i].update(elapsed)
        rockets[i].draw()
        if (rockets[i].exploded) rockets.splice(i, 1)
      }

      // Draw Sparks
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.vx *= p.drag
        p.vy = p.vy * p.drag + p.gravity
        p.x += p.vx
        p.y += p.vy

        p.history.push({ x: p.x, y: p.y })
        if (p.history.length > p.trailLength) p.history.shift()
        p.alpha -= p.decay

        if (p.alpha <= 0) {
          particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        let a = p.alpha
        if (p.twinkle && Math.random() > 0.45) a *= 0.35
        ctx.globalAlpha = Math.max(0, a)
        ctx.strokeStyle = p.color
        ctx.fillStyle = p.color
        ctx.lineWidth = p.size
        ctx.lineCap = 'round'

        if (p.history.length >= 2) {
          ctx.beginPath()
          ctx.moveTo(p.history[0].x, p.history[0].y)
          for (let j = 1; j < p.history.length; j++) ctx.lineTo(p.history[j].x, p.history[j].y)
          ctx.stroke()
        }
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      animId = requestAnimationFrame(renderLoop)
    }

    animId = requestAnimationFrame(renderLoop)

    return () => {
      cancelAnimationFrame(animId)
      if (flashTimeout) clearTimeout(flashTimeout)
      if (textShowTimeout) clearTimeout(textShowTimeout)
      if (textHideTimeout) clearTimeout(textHideTimeout)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerCelebration()
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative w-full max-w-[340px] mx-auto">
      {/* Import Refined Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,500;1,600;1,700&family=Cinzel:wght@500;600&display=swap');
      `}</style>

      {/* Realistic Mobile Phone Mockup Frame */}
      <div className="relative bg-slate-950 p-2 sm:p-2.5 rounded-[40px] shadow-2xl border-2 border-slate-700/80 select-none">
        {/* Dynamic Island Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-black rounded-full z-50 flex items-center justify-end px-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Inner Phone Screen Container (Scrollable) */}
        <div className="relative w-full h-[500px] bg-[#FFFCF7] rounded-[32px] overflow-hidden flex flex-col justify-between">
          
          {/* ========================================================= */}
          {/* FIXED FESTIVE OVERLAY (CANVAS + TIMED 1.8s GREETING)      */}
          {/* ========================================================= */}
          <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
            {/* Sky Flash Layer */}
            <div
              ref={flashRef}
              className="absolute inset-0 bg-white pointer-events-none z-10 opacity-0 transition-opacity duration-100"
            />

            {/* Canvas for Hanging Lamps & Fireworks */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-20" />

            {/* Pure Floating 'Happy Diwali' Typography (Crisp, High-Contrast & Clearly Visible) */}
            {greetingVisible && (
              <div
                style={{
                  opacity: greetingOpacity,
                  transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: greetingOpacity === 1 ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(-8px)',
                }}
                className="absolute top-28 left-0 right-0 z-30 flex items-center justify-center text-center pointer-events-none px-4"
              >
                <h2
                  style={{
                    fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif",
                    fontStyle: 'italic',
                    fontWeight: 600,
                    color: '#FFF9E6',
                    textShadow:
                      '0 2px 4px rgba(0, 0, 0, 0.95), 0 4px 14px rgba(0, 0, 0, 0.85), 0 0 16px rgba(251, 191, 36, 0.9), 0 0 32px rgba(245, 158, 11, 0.65)',
                  }}
                  className="text-2xl sm:text-[28px] tracking-wide select-none m-0"
                >
                  Happy Diwali
                </h2>
              </div>
            )}

            {/* Quick Interactive Replay Pill inside phone */}
            <button
              onClick={triggerCelebration}
              disabled={isPlaying}
              className="pointer-events-auto absolute bottom-4 right-3 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 active:scale-95 text-slate-950 font-extrabold text-[10px] rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-1 border border-amber-300/40 z-50 transition-all disabled:opacity-50"
            >
              <span>🪔</span>
              <span>{isPlaying ? 'Bursting...' : 'Replay'}</span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* REAL SCROLLABLE CUSTOMER MENU CONTENT (ANBU'DE CAFE)       */}
          {/* ========================================================= */}
          <div className="w-full flex-1 overflow-y-auto overflow-x-hidden pb-12 text-[#101B35] font-sans">
            
            {/* 1. Cafe Cover Banner */}
            <div className="relative w-full h-32 bg-gradient-to-br from-amber-950 via-[#261c14] to-black flex items-center justify-center text-center px-2">
              <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest bg-black/50 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Digital Dining Menu
              </span>

              {/* Scalloped Wave Cutout */}
              <svg viewBox="0 0 500 80" preserveAspectRatio="none" className="absolute -bottom-1 left-0 w-full h-6 text-[#FFFCF7] fill-current pointer-events-none">
                <path d="M0,45 C100,75 160,25 250,55 C340,85 400,35 500,50 L500,85 L0,85 Z" />
              </svg>

              {/* Circular Cafe Logo */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 w-14 h-14 rounded-full bg-white p-1 shadow-lg border-2 border-[#FFB800] flex items-center justify-center z-10">
                <div className="w-full h-full rounded-full bg-amber-50 flex items-center justify-center text-lg font-bold text-amber-900 border border-amber-200">
                  ☕
                </div>
              </div>
            </div>

            {/* 2. Cafe Info */}
            <div className="pt-8 px-4 text-center flex flex-col items-center">
              <div className="inline-flex items-center gap-1 bg-[#FEF3C7] border border-[#FDE68A] text-[#8B4513] text-[9px] font-bold px-2 py-0.5 rounded-full mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFB800] animate-pulse" />
                <span>Table 04</span>
              </div>
              <h2 className="text-base font-extrabold text-[#101B35]">Anbu&apos;de Cafe</h2>
              <p className="text-[10px] text-slate-500 mt-0.5 max-w-[200px] leading-tight">
                Authentic South Indian &amp; Continental
              </p>
            </div>

            {/* 3. Three Action Cards */}
            <div className="grid grid-cols-3 gap-1.5 px-3 mt-3">
              <div className="bg-[#FFFDF9] border border-[#F0EBE1] rounded-xl p-2 text-center shadow-xs flex flex-col items-center">
                <div className="w-6 h-6 rounded-lg bg-amber-100/80 text-amber-900 flex items-center justify-center mb-1">
                  <BookOpen className="w-3 h-3" />
                </div>
                <span className="text-[9px] font-bold text-slate-800">Menu</span>
              </div>
              <div className="bg-[#FFFDF9] border border-[#F0EBE1] rounded-xl p-2 text-center shadow-xs flex flex-col items-center">
                <div className="w-6 h-6 rounded-lg bg-rose-100/80 text-rose-800 flex items-center justify-center mb-1">
                  <MessageSquareHeart className="w-3 h-3" />
                </div>
                <span className="text-[9px] font-bold text-slate-800">Feedback</span>
              </div>
              <div className="bg-[#FFFDF9] border border-[#F0EBE1] rounded-xl p-2 text-center shadow-xs flex flex-col items-center">
                <div className="w-6 h-6 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center mb-1">
                  <Star className="w-3 h-3 fill-emerald-700 text-emerald-700" />
                </div>
                <span className="text-[9px] font-bold text-slate-800">Review</span>
              </div>
            </div>

            {/* 4. Category Pills */}
            <div className="flex items-center gap-1.5 px-3 mt-3 overflow-x-auto no-scrollbar">
              <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-[9px] rounded-full whitespace-nowrap">
                Chef&apos;s Picks
              </span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-[9px] rounded-full whitespace-nowrap">
                Snacks
              </span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-[9px] rounded-full whitespace-nowrap">
                Beverages
              </span>
            </div>

            {/* 5. Real Dishes */}
            <div className="px-3 mt-3 space-y-2">
              <div className="p-2.5 bg-white border border-[#EBE7DF] rounded-xl shadow-xs flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs border border-rose-600 flex items-center justify-center">
                      <span className="w-1 h-1 rounded-full bg-rose-600" />
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate">Bread Omelette</h4>
                  </div>
                  <p className="text-[9px] text-slate-500 truncate">Fluffy eggs with green chillies &amp; toasted bread</p>
                  <p className="text-xs font-extrabold text-amber-900 mt-0.5">₹45</p>
                </div>
                <button
                  onClick={() => setCartCount((c) => c + 1)}
                  className="px-2.5 py-1 bg-amber-500 active:scale-95 text-slate-950 font-bold text-[10px] rounded-lg shrink-0"
                >
                  ADD +
                </button>
              </div>

              <div className="p-2.5 bg-white border border-[#EBE7DF] rounded-xl shadow-xs flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs border border-emerald-600 flex items-center justify-center">
                      <span className="w-1 h-1 rounded-full bg-emerald-600" />
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate">Veg Club Sandwich</h4>
                  </div>
                  <p className="text-[9px] text-slate-500 truncate">Triple-layered fresh vegetable sandwich</p>
                  <p className="text-xs font-extrabold text-amber-900 mt-0.5">₹55</p>
                </div>
                <button
                  onClick={() => setCartCount((c) => c + 1)}
                  className="px-2.5 py-1 bg-amber-500 active:scale-95 text-slate-950 font-bold text-[10px] rounded-lg shrink-0"
                >
                  ADD +
                </button>
              </div>

              <div className="p-2.5 bg-white border border-[#EBE7DF] rounded-xl shadow-xs flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs border border-emerald-600 flex items-center justify-center">
                      <span className="w-1 h-1 rounded-full bg-emerald-600" />
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate">Filter Coffee</h4>
                  </div>
                  <p className="text-[9px] text-slate-500 truncate">Traditional Kumbakonam degree decoction</p>
                  <p className="text-xs font-extrabold text-amber-900 mt-0.5">₹30</p>
                </div>
                <button
                  onClick={() => setCartCount((c) => c + 1)}
                  className="px-2.5 py-1 bg-amber-500 active:scale-95 text-slate-950 font-bold text-[10px] rounded-lg shrink-0"
                >
                  ADD +
                </button>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="text-center py-3 text-[9px] text-slate-400 font-medium">
              ↕ Scroll to browse dishes while lamps stay fixed
            </div>

          </div>

          {/* Bottom Cart Bar */}
          {cartCount > 0 && (
            <div className="absolute bottom-2 left-3 right-3 bg-slate-950 text-white rounded-xl px-3 py-1.5 flex items-center justify-between shadow-lg z-30">
              <span className="text-[10px] font-bold">{cartCount} Item(s) in Cart</span>
              <span className="text-[10px] font-extrabold text-amber-400">View Cart →</span>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default function FestiveThemesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'enabled' | 'disabled'
  
  // Timing state (in seconds)
  const [durationSeconds, setDurationSeconds] = useState(5)

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

      {/* 2. Top Controls Grid: Timing + Real Customer Menu Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Card A: Set Timing of Animation */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
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

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold mb-0.5">Fixed Hanging Side Lamps</strong>
                <span>Authentic brass oil lamps (*Agal Vilakku*) sway continuously along the left and right margins as diners scroll through categories and dishes.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <Sparkles className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold mb-0.5">Timed &quot;Happy Diwali&quot; Greeting</strong>
                <span>Appears at cracker burst in elegant Playfair Display typography, stays for 1.8 seconds, then gracefully fades out with zero ordering lag.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% Non-blocking touch &amp; instant ordering</span>
            </span>
            <a
              href="https://scan.renza.in/anbude-cafe"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 font-bold"
            >
              <span>Open Full Live Menu</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Card B: Real Customer Menu Phone Simulator */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block">
                Real Customer Menu
              </span>
              <h4 className="text-sm font-bold text-white">Live Phone Simulation</h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Scroll &amp; Test Inside
            </span>
          </div>

          {/* Real Phone Simulator Component */}
          <RealCustomerMenuPreview durationSeconds={durationSeconds} />

          <p className="text-[11px] text-slate-400 text-center leading-snug">
            Scroll inside the phone to see the fixed side lamps stay in view. Tap &quot;Replay&quot; to test the 1.8s greeting.
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
