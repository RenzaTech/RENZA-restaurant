'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  Save,
  UtensilsCrossed,
  Sparkles,
  MapPin,
  Phone,
  Info,
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

function Skeleton({ className }) {
  return <div className={`bg-slate-100 animate-pulse rounded-xl ${className}`} />
}

export default function EditRestaurantPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    cuisineType: '',
    description: '',
    address: '',
    phone: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/api/admin/restaurants/${id}`)
        const data = res.data?.restaurant || res.data
        setForm({
          name: data.name || '',
          cuisineType: data.cuisineType || data.cuisine_type || '',
          description: data.description || '',
          address: data.address || '',
          phone: data.phone || '',
        })
      } catch {
        toast.error('Failed to load restaurant details')
      } finally {
        setLoading(false)
      }
    }
    fetchRestaurant()
  }, [id])

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Restaurant name is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Please fix the errors below')
      return
    }

    setSaving(true)
    try {
      await api.put(`/api/admin/restaurants/${id}`, {
        name: form.name.trim(),
        cuisineType: form.cuisineType.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
      })
      toast.success('Restaurant profile updated successfully!')
      router.push(`/restaurants/${id}`)
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update restaurant'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-48" />
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href={`/restaurants/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Restaurant Studio</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Dining Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Update restaurant brand info, cuisine classifications, and location.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Restaurant Information</h2>
              <p className="text-xs text-slate-400">Changes reflect immediately on the live digital menu</p>
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

            <FormField label="Cuisine Type" icon={Sparkles} hint="Separated by commas">
              <input
                type="text"
                value={form.cuisineType}
                onChange={set('cuisineType')}
                placeholder="e.g. South Indian, Chettinad, Biryani"
                className={inputCls}
              />
            </FormField>

            <FormField label="Description">
              <textarea
                value={form.description}
                onChange={set('description')}
                placeholder="Brief description of culinary offerings..."
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </FormField>

            <FormField label="Address" icon={MapPin}>
              <textarea
                value={form.address}
                onChange={set('address')}
                placeholder="Full restaurant address"
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </FormField>

            <FormField label="Phone Number" icon={Phone}>
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

        {/* Security Notice */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>Admin Account Security:</strong> The restaurant manager&apos;s email address and master password cannot be altered from this profile form.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href={`/restaurants/${id}`}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-teal-600 hover:from-orange-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
