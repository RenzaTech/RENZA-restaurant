'use client'

import { useState } from 'react'
import {
  X,
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
  AlertCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function OnboardRestaurantModal({ isOpen, onClose, onSuccess }) {
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

  if (!isOpen) return null

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

      const res = await api.post('/api/admin/restaurants', payload)
      const created = res.data?.restaurant || res.data

      toast.success(`🚀 Restaurant "${form.name.trim()}" onboarded with ${payload.initialTableCount} tables!`)
      if (onSuccess) {
        onSuccess(created)
      }
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to onboard restaurant'
      toast.error(msg)
    } finally {
      setLoading(false)
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
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Onboard New Restaurant
              </h2>
              <p className="text-xs text-slate-500">
                Register a dining partner and generate initial table QR codes instantly.
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Restaurant Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Restaurant Details</span>
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
                  placeholder="e.g. North Indian, Continental, Biryani"
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
                  placeholder="e.g. Bengaluru, Chennai, Mumbai"
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
                  Description / Story
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={handleChange('description')}
                  placeholder="Authentic handcrafted dining experience..."
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Dining Table Capacity & Instant QR Studio Provisioning */}
          <div className="bg-teal-50/60 border border-teal-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                Initial Table QRs Provisioning
              </h3>
            </div>
            <p className="text-xs text-teal-700/90 leading-relaxed">
              SCANZAA will automatically create table entries (Table 01, Table 02…) and assign unique digital menu QR codes for instant printing.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <div className="w-40">
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
              <span className="text-xs text-slate-500 mt-5">
                Tables will be generated from Table 01 to Table {String(Number(form.initialTableCount) || 5).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Section 3: Primary Restaurant Administrator */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Primary Restaurant Administrator</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Full Name <span className="text-rose-500">*</span>
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
                  Admin Login Email <span className="text-rose-500">*</span>
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

          {/* Section 4: Operational Attribution */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Attribution & Notes</span>
            </div>

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
                  Internal Notes
                </label>
                <input
                  type="text"
                  value={form.salesNotes}
                  onChange={handleChange('salesNotes')}
                  placeholder="Onboarded via Super Admin Console"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-xl transition-all shadow-md shadow-teal-500/20 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Onboarding Partner...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Onboard Restaurant & Provision QRs</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
