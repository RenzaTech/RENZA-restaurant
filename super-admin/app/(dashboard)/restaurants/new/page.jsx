'use client'

import Link from 'next/link'
import {
  ChevronLeft,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Lock,
  Sparkles,
  QrCode,
  FileSpreadsheet,
} from 'lucide-react'

export default function CreateRestaurantPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* ── BREADCRUMB ── */}
      <Link
        href="/restaurants"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Restaurants Directory</span>
      </Link>

      {/* ── MAIN GOVERNANCE CARD ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xs relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-teal-500 to-emerald-500" />

        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center flex-shrink-0 shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              Monitoring & Governance Mode Active
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Restaurant Onboarding is Delegated to Sales Executives
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              In accordance with platform security and operational governance, restaurant tenant creation is exclusively managed by field <strong>Sales Executives</strong>. Super Administrator accounts operate in <strong>monitoring, auditing, and status governance mode</strong> only.
            </p>

            {/* Workflow steps card */}
            <div className="mt-6 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6 space-y-4">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                How Field Onboarding & Monitoring Works
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white border border-slate-200/60 shadow-2xs space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">Field Executive Entry</h3>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Sales executives input merchant profile, admin credentials, and initial table setup in their portal.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200/60 shadow-2xs space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">Employee Attribution</h3>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    The employee&apos;s name and unique ID are permanently timestamped and linked to the restaurant tenant.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200/60 shadow-2xs space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">Super Admin Oversight</h3>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    The restaurant immediately syncs to this Super Admin console for QR download, review, and live status management.
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/restaurants"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-teal-600 hover:from-orange-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all"
              >
                <Building2 className="w-4 h-4" />
                <span>View All Restaurants</span>
              </Link>

              <a
                href="http://localhost:3000/restaurants/new"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-xs"
              >
                <ExternalLink className="w-4 h-4 text-slate-400" />
                <span>Open Sales Executive Onboarding (localhost:3000)</span>
              </a>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors"
              >
                <span>Platform Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
