'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated, clearToken } from '@/lib/auth'
import api from '@/lib/api'
import {
  LayoutDashboard,
  Building2,
  FileSpreadsheet,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Shield,
  Activity,
  ExternalLink,
  UserCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/dashboard',
    label: 'Platform Overview',
    icon: LayoutDashboard,
  },
  {
    href: '/restaurants',
    label: 'Restaurants & QRs',
    icon: Building2,
  },
  {
    href: '/employees',
    label: 'Sales Executives',
    icon: UserCheck,
  },
  {
    href: '/reports',
    label: 'Reports & Exports',
    icon: FileSpreadsheet,
  },
]

function Sidebar({ onClose, user }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    clearToken()
    router.replace('/login')
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white w-64 border-r border-slate-850 select-none">
      {/* Logo & Platform Info */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/70">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <img
              src="/scanzaa-horizontal-logo.png"
              alt="SCANZAA"
              className="h-7 w-auto object-contain"
            />
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30 uppercase tracking-wider">
              ADMIN
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-400 pl-0.5 tracking-wide flex items-center gap-1">
            <span>powered by</span>
            <span className="text-white font-semibold">Renza</span>
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto sidebar-scroll">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          Management
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group',
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-teal-600 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')} />
              <span className="flex-1">{label}</span>
              {isActive ? (
                <ChevronRight className="w-4 h-4 opacity-80" />
              ) : null}
            </Link>
          )
        })}
      </nav>

      {/* Bottom user section */}
      <div className="p-3 border-t border-slate-800/70">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
            <img src="/scanzaa-icon.png" alt="SCANZAA" className="w-4 h-4 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {user?.name === 'Renza Admin' ? 'Scanzaa Admin' : (user?.name || 'Scanzaa Admin')}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || 'renzaa.technical@gmail.com'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [adminUser, setAdminUser] = useState(null)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.replace('/login')
      return
    }

    // Verify session validity with backend. If email/password changed, 401 triggers clean logout
    api.get('/api/auth/me')
      .then((res) => {
        setAdminUser(res.data)
      })
      .catch(() => {
        clearToken()
        router.replace('/login')
      })
  }, [router])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated()) {
    return null
  }

  const getPageTitle = () => {
    if (pathname.startsWith('/employees')) return 'Sales Executives & Field Team'
    if (pathname.startsWith('/reports')) return 'Restaurant Reports & Excel Exports'
    if (pathname.startsWith('/restaurants/new')) return 'Monitoring & Governance'
    if (pathname.includes('/edit')) return 'Edit Restaurant Profile'
    if (pathname.startsWith('/restaurants/')) return 'Restaurant & QR Analytics'
    if (pathname.startsWith('/restaurants')) return 'Partner Restaurants'
    return 'Platform Governance'
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 h-screen overflow-hidden">
        <Sidebar user={adminUser} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 flex flex-col w-64 h-full shadow-2xl">
            <Sidebar user={adminUser} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar Header */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* SCANZAA powered by Renza Brand Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-white shadow-xs">
              <img
                src="/scanzaa-icon.png"
                alt="SCANZAA"
                className="w-4 h-4 object-contain"
              />
              <span className="font-extrabold tracking-tight text-white text-xs">SCANZAA</span>
              <span className="text-[10px] text-slate-400 font-medium border-l border-slate-700 pl-2">
                powered by <span className="text-teal-400 font-semibold">Renza</span>
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  )
}
