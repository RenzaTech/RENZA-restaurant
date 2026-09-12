'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  Eye,
  EyeOff,
  QrCode,
  UtensilsCrossed,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

function FormField({ label, required, children, hint, icon: Icon }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        <span>{label}</span>
        {required && <span className="text-red-500 font-bold">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

const inputCls =
  'w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white placeholder-slate-400 transition-all font-medium text-slate-900'

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
    phone: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({})

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Restaurant name is required'
    if (!form.adminName.trim()) errs.adminName = 'Admin name is required'
    if (!form.adminEmail.trim()) errs.adminEmail = 'Admin email is required'
    else if (!/\S+@\S+\.\S+/.test(form.adminEmail)) errs.adminEmail = 'Invalid email address'
    if (!form.adminPassword) errs.adminPassword = 'Password is required'
    else if (form.adminPassword.length < 6) errs.adminPassword = 'Password must be at least 6 characters'
    if (form.adminPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Please fix the errors indicated in the form')
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        cuisineType: form.cuisineType.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        adminName: form.adminName.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword,
        admin: {
          name: form.adminName.trim(),
          email: form.adminEmail.trim(),
          password: form.adminPassword,
        },
      }
      const res = await api.post('/api/admin/restaurants', payload)
      const newId = res.data?.id || res.data?.restaurant?.id || res.data?.restaurant?._id || res.data?._id
      toast.success('Restaurant created and Table QR provisioned!')
      if (newId) {
        router.push(`/restaurants/${newId}`)
      } else {
        router.push('/restaurants')
      }
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to create restaurant'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Quick password strength calculation
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb & Title */}
      <div>
        <Link
          href="/restaurants"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Restaurants</span>
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Onboard New Restaurant</h1>
        </div>
        <p className="text-xs text-slate-500">
          Provision a dedicated tenant workspace, assign partner administrator credentials, and generate instant table QR codes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── CARD 1: RESTAURANT PROFILE ── */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Dining Profile</h2>
                <p className="text-xs text-slate-400">Establish restaurant brand details</p>
              </div>
            </div>

            <div className="space-y-4">
              <FormField label="Restaurant Name" required icon={UtensilsCrossed}>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="e.g. Royal Spice Garden"
                  className={`${inputCls} ${errors.name ? 'border-red-300 focus:ring-red-400' : ''}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </FormField>

              <FormField label="Cuisine Type" icon={Sparkles} hint="Separated by commas, e.g. North Indian, Biryani, Tandoori">
                <input
                  type="text"
                  value={form.cuisineType}
                  onChange={set('cuisineType')}
                  placeholder="e.g. South Indian & Chettinad"
                  className={inputCls}
                />
              </FormField>

              <FormField label="Restaurant Description">
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Brief tagline or specialty of the kitchen..."
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </FormField>

              <FormField label="Dining Address" icon={MapPin}>
                <textarea
                  value={form.address}
                  onChange={set('address')}
                  placeholder="Full street address, area, city, and pincode"
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </FormField>

              <FormField label="Contact Phone" icon={Phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+91 98765 43210"
                  className={inputCls}
                />
              </FormField>
            </div>
          </div>

          {/* ── CARD 2: PARTNER ADMIN CREDENTIALS ── */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Partner Admin Account</h2>
                <p className="text-xs text-slate-400">Login credentials for the restaurant manager</p>
              </div>
            </div>

            <div className="space-y-4">
              <FormField label="Admin Full Name" required icon={User}>
                <input
                  type="text"
                  value={form.adminName}
                  onChange={set('adminName')}
                  placeholder="e.g. Vikramaditya Rao"
                  className={`${inputCls} ${errors.adminName ? 'border-red-300 focus:ring-red-400' : ''}`}
                />
                {errors.adminName && <p className="text-xs text-red-500 mt-1">{errors.adminName}</p>}
              </FormField>

              <FormField label="Admin Email" required icon={Mail} hint="Used to sign in at the Restaurant Admin Portal (port 3002)">
                <input
                  type="email"
                  value={form.adminEmail}
                  onChange={set('adminEmail')}
                  placeholder="manager@restaurant.com"
                  className={`${inputCls} ${errors.adminEmail ? 'border-red-300 focus:ring-red-400' : ''}`}
                />
                {errors.adminEmail && <p className="text-xs text-red-500 mt-1">{errors.adminEmail}</p>}
              </FormField>

              <FormField label="Admin Password" required icon={Lock}>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.adminPassword}
                    onChange={set('adminPassword')}
                    placeholder="Create a secure password"
                    className={`${inputCls} pr-10 font-mono ${errors.adminPassword ? 'border-red-300 focus:ring-red-400' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.adminPassword && <p className="text-xs text-red-500 mt-1">{errors.adminPassword}</p>}

                {/* Password strength indicator */}
                {form.adminPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${
                        strength <= 2 ? 'w-1/3 bg-rose-500' : strength <= 3 ? 'w-2/3 bg-amber-500' : 'w-full bg-emerald-500'
                      }`} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {strength <= 2 ? 'Weak password' : strength <= 3 ? 'Medium strength' : 'Strong password'}
                    </p>
                  </div>
                )}
              </FormField>

              <FormField label="Confirm Password" required icon={Lock}>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    placeholder="Re-enter password to verify"
                    className={`${inputCls} pr-10 font-mono ${errors.confirmPassword ? 'border-red-300 focus:ring-red-400' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
              </FormField>
            </div>

            {/* Instant Provisioning Info */}
            <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200/60 flex items-start gap-3">
              <QrCode className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-orange-900">Automatic QR Provisioning</p>
                <p className="text-[11px] text-orange-700/90 mt-0.5 leading-relaxed">
                  Upon creation, high-resolution QR codes and a dedicated diner menu slug will be generated automatically. You can customize the production domain at any time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── ACTION FOOTER ── */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80">
          <Link
            href="/restaurants"
            className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Onboarding & Generating QR...</span>
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                <span>Create Restaurant & Generate QR</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
