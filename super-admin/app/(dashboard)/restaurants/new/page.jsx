'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  Building2,
  UtensilsCrossed,
  MapPin,
  Phone,
  Globe,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  QrCode,
  Sparkles,
  FileText,
} from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function CreateRestaurantPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState({
    name: '',
    cuisineType: '',
    description: '',
    address: '',
    city: 'Bengaluru',
    phone: '',
    website: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    initialTableCount: '5',
    leadSource: 'Direct Platform',
    salesNotes: '',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const getPasswordStrength = () => {
    if (!form.adminPassword) return 0
    let score = 0
    if (form.adminPassword.length >= 6) score += 1
    if (form.adminPassword.length >= 8) score += 1
    if (/[A-Z]/.test(form.adminPassword)) score += 1
    if (/[0-9]/.test(form.adminPassword)) score += 1
    if (/[^A-Za-z0-9]/.test(form.adminPassword)) score += 1
    return score
  }

  const strength = getPasswordStrength()

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Restaurant name is required'
    if (!form.adminName.trim()) errs.adminName = 'Admin full name is required'
    if (!form.adminEmail.trim()) {
      errs.adminEmail = 'Admin email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.adminEmail)) {
      errs.adminEmail = 'Invalid email address'
    }
    if (!form.adminPassword) {
      errs.adminPassword = 'Password is required'
    } else if (form.adminPassword.length < 6) {
      errs.adminPassword = 'Password must be at least 6 characters'
    }
    if (form.adminPassword !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast.error('Please fix the indicated form errors')
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        cuisineType: form.cuisineType.trim() || undefined,
        description: form.description.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        phone: form.phone.trim() || undefined,
        website: form.website.trim() || undefined,
        adminName: form.adminName.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword,
        initialTableCount: Math.max(1, Math.min(50, Number(form.initialTableCount) || 5)),
        leadSource: form.leadSource || 'Direct Platform',
        salesNotes: form.salesNotes.trim() || undefined,
        salesExecutiveName: 'Super Admin',
        salesExecutiveCode: 'ADMIN-DIR',
      }

      await api.post('/api/admin/restaurants', payload)
      toast.success(`🚀 Restaurant "${form.name.trim()}" onboarded successfully with ${payload.initialTableCount} tables!`)
      router.push('/restaurants')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to onboard restaurant'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

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

      {/* ── CARD ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600" />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Onboard Dining Partner Restaurant
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create restaurant tenant credentials, initial dining tables, and QR codes instantly.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Restaurant Identity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Restaurant Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder="e.g. Royal Spice Bistro"
                  className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${
                    errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cuisine Type
                </label>
                <input
                  type="text"
                  value={form.cuisineType}
                  onChange={handleChange('cuisineType')}
                  placeholder="e.g. North Indian, Continental"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={handleChange('city')}
                  placeholder="e.g. Bengaluru, Chennai"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={handleChange('address')}
                  placeholder="e.g. 45 Indiranagar 100ft Road"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={handleChange('website')}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={handleChange('description')}
                  placeholder="Handcrafted dining and gourmet menu..."
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Table Provisioning */}
          <div className="bg-teal-50/60 border border-teal-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                Initial Table QRs Provisioning
              </h3>
            </div>
            <p className="text-xs text-teal-700/90 leading-relaxed">
              Tables (Table 01 to Table {String(Number(form.initialTableCount) || 5).padStart(2, '0')}) and unique QR tokens will be provisioned instantly.
            </p>
            <div className="w-44 pt-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Table Count
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={form.initialTableCount}
                onChange={handleChange('initialTableCount')}
                className="w-full px-3.5 py-2 text-xs font-bold bg-white border border-teal-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Section 3: Admin User */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Primary Administrator Account</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.adminName}
                  onChange={handleChange('adminName')}
                  placeholder="e.g. Rajesh Kumar"
                  className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${
                    errors.adminName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
                {errors.adminName && <p className="text-[11px] text-rose-500 mt-1">{errors.adminName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.adminEmail}
                  onChange={handleChange('adminEmail')}
                  placeholder="admin@restaurant.com"
                  className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${
                    errors.adminEmail ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
                {errors.adminEmail && <p className="text-[11px] text-rose-500 mt-1">{errors.adminEmail}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  {form.adminPassword && (
                    <span
                      className={`text-[10px] font-bold ${
                        strength <= 2 ? 'text-rose-500' : strength <= 3 ? 'text-amber-500' : 'text-emerald-600'
                      }`}
                    >
                      {strength <= 2 ? 'Weak' : strength <= 3 ? 'Good' : 'Strong'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.adminPassword}
                    onChange={handleChange('adminPassword')}
                    placeholder="Min. 6 characters"
                    className={`w-full pl-3.5 pr-10 py-2.5 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${
                      errors.adminPassword ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.adminPassword && <p className="text-[11px] text-rose-500 mt-1">{errors.adminPassword}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    placeholder="Re-enter password"
                    className={`w-full pl-3.5 pr-10 py-2.5 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all ${
                      errors.confirmPassword ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-[11px] text-rose-500 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {/* Section 4: Lead Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lead Source
              </label>
              <select
                value={form.leadSource}
                onChange={handleChange('leadSource')}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              >
                <option value="Direct Platform">Direct Platform</option>
                <option value="Field Visit">Field Visit</option>
                <option value="Referral">Referral</option>
                <option value="Inbound">Inbound</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sales Notes
              </label>
              <input
                type="text"
                value={form.salesNotes}
                onChange={handleChange('salesNotes')}
                placeholder="Super Admin Direct Onboarding"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Link
              href="/restaurants"
              className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-xl transition-all shadow-md shadow-teal-500/20 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Onboarding Restaurant...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Onboard Restaurant & Provision QRs</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
