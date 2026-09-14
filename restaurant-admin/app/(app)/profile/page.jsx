'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, User, UtensilsCrossed, Phone, MapPin, Sparkles, Store, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    cuisineType: '',
    address: '',
    phone: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    api.get('/api/restaurant/profile')
      .then((res) => {
        const r = res.data?.restaurant || res.data || {};
        setForm({
          name: r.name || '',
          description: r.description || '',
          cuisineType: r.cuisineType || '',
          address: r.address || '',
          phone: r.phone || '',
        });
        const logo = r.logoUrl || r.logo;
        if (logo) {
          setLogoPreview(logo.startsWith('http') ? logo : `${API_URL}${logo}`);
        }
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [API_URL]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Restaurant name is required');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (logoFile) {
        formData.append('image', logoFile);
        formData.append('logo', logoFile);
      }

      await api.put('/api/restaurant/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Restaurant profile saved to cloud!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <div className="flex flex-col items-center gap-3 py-6">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-4 sm:space-y-6 pb-16">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Restaurant Profile</h2>
        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
          Brand logo, cuisine specialty, contact details, and location displayed on your digital menu.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 lg:p-8 shadow-xs space-y-4 sm:space-y-6">
        {/* Logo Upload Zone */}
        <div className="flex flex-col items-center py-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group focus:outline-none"
          >
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-slate-100 bg-slate-50 shadow-md transition-all group-hover:border-orange-200 sm:h-28 sm:w-28">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Restaurant logo"
                  fill
                  sizes="112px"
                  unoptimized={logoPreview.startsWith('blob:')}
                  className="object-cover"
                />
              ) : (
                <Store className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-9 sm:h-9 bg-orange-500 hover:bg-orange-600 rounded-2xl flex items-center justify-center shadow-md border-2 border-white transition-transform group-hover:scale-110">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </button>
          <p className="text-xs font-bold text-slate-700 mt-2.5">Restaurant Brand Logo</p>
          <p className="text-[10px] sm:text-[11px] text-slate-400">Tap to upload / change (Cloudinary WebP)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
        </div>

        <div className="space-y-3.5 sm:space-y-4 pt-2 border-t border-slate-100">
          {/* Restaurant Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Restaurant Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Royal Spice Garden"
              value={form.name}
              onChange={set('name')}
              required
              className="rounded-xl border-slate-200 text-xs h-11"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Description & Dining Tagline
            </Label>
            <Textarea
              id="description"
              placeholder="Tell diners what makes your restaurant special..."
              value={form.description}
              onChange={set('description')}
              rows={3}
              className="rounded-xl border-slate-200 text-xs resize-none"
            />
          </div>

          {/* Cuisine Type */}
          <div className="space-y-1.5">
            <Label htmlFor="cuisineType" className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Cuisine Specialty
            </Label>
            <Input
              id="cuisineType"
              placeholder="e.g. North Indian, Tandoori, Mughlai"
              value={form.cuisineType}
              onChange={set('cuisineType')}
              className="rounded-xl border-slate-200 text-xs h-11"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Contact Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={set('phone')}
              className="rounded-xl border-slate-200 text-xs h-11"
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Dining Address
            </Label>
            <Textarea
              id="address"
              placeholder="Full restaurant location for diners..."
              value={form.address}
              onChange={set('address')}
              rows={2}
              className="rounded-xl border-slate-200 text-xs resize-none"
            />
          </div>
        </div>

        {/* Save button */}
        <Button
          type="submit"
          className="w-full h-12 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 gap-2"
          disabled={saving}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving Profile...
            </span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Profile Changes
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
