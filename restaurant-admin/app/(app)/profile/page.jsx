'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, User, UtensilsCrossed, Phone, MapPin, Sparkles, Store, Save, Star, ExternalLink, MessageSquareText, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

function formatUrl(url) {
  if (!url || !url.trim()) return '';
  const clean = url.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    return `https://${clean}`;
  }
  return clean;
}

function formatGoogleReviewUrl(url) {
  if (!url || !url.trim()) return '';
  const clean = url.trim();
  const match = clean.match(/[?&]placeid=([a-zA-Z0-9_-]+)/i);
  if (match) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(match[1])}`;
  }
  if (clean.startsWith('ChIJ') || (!clean.includes('/') && clean.length > 20)) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(clean)}`;
  }
  if (clean.includes('g.page') && !clean.includes('/review')) {
    return `${clean.replace(/\/+$/, '')}/review`;
  }
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    return `https://${clean}`;
  }
  return clean;
}

function validatePhoneNumber(phone) {
  if (!phone || !phone.trim()) return { valid: true };
  let digits = phone.trim().replace(/[\s\-()]/g, '');
  if (digits.startsWith('+91')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  if (!/^[6-9]\d{9}$/.test(digits)) {
    return {
      valid: false,
      error: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.',
    };
  }

  if (/^(\d)\1{9}$/.test(digits)) {
    return {
      valid: false,
      error: 'Phone number cannot have all identical digits.',
    };
  }

  return { valid: true, sanitized: digits };
}

export default function ProfilePage() {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [phoneError, setPhoneError] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    cuisineType: '',
    address: '',
    phone: '',
    googleReviewUrl: '',
    feedbackUrl: '',
  });
  const [overrideFeedbackUrl, setOverrideFeedbackUrl] = useState(false);

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
          googleReviewUrl: r.googleReviewUrl || '',
          feedbackUrl: r.feedbackUrl || '',
        });
        setOverrideFeedbackUrl(Boolean(r.overrideFeedbackUrl));
        const logo = r.logoUrl || r.logo;
        if (logo) {
          setLogoPreview(logo.startsWith('http') ? logo : `${API_URL}${logo}`);
        }
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [API_URL]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, phone: val }));
    if (phoneError) {
      const check = validatePhoneNumber(val);
      setPhoneError(check.valid ? '' : check.error);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('restaurant-profile-updated', {
          detail: { logo: previewUrl },
        })
      );
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Restaurant name is required');
      return;
    }

    if (form.phone?.trim()) {
      const phoneCheck = validatePhoneNumber(form.phone);
      if (!phoneCheck.valid) {
        setPhoneError(phoneCheck.error);
        toast.error(phoneCheck.error);
        return;
      }
      setPhoneError('');
    }

    setSaving(true);
    try {
      const formattedReviewUrl = formatGoogleReviewUrl(form.googleReviewUrl);
      const formattedFeedbackUrl = formatUrl(form.feedbackUrl);
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'googleReviewUrl') {
          formData.append(k, formattedReviewUrl);
        } else if (k === 'feedbackUrl') {
          formData.append(k, formattedFeedbackUrl);
        } else {
          formData.append(k, v);
        }
      });
      if (formattedReviewUrl !== form.googleReviewUrl) {
        setForm((f) => ({ ...f, googleReviewUrl: formattedReviewUrl }));
      }
      if (formattedFeedbackUrl !== form.feedbackUrl) {
        setForm((f) => ({ ...f, feedbackUrl: formattedFeedbackUrl }));
      }
      if (logoFile) {
        formData.append('image', logoFile);
        formData.append('logo', logoFile);
      }

      const res = await api.put('/api/restaurant/profile', formData);
      const updated = res.data?.restaurant || res.data || {};
      const savedLogo = updated.logoUrl || updated.logo;
      const fullLogoUrl = savedLogo
        ? (savedLogo.startsWith('http') || savedLogo.startsWith('blob:') ? savedLogo : `${API_URL}${savedLogo}`)
        : null;

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('restaurant-profile-updated', {
            detail: {
              name: updated.name || form.name,
              logo: fullLogoUrl,
            },
          })
        );
      }
      toast.success('Restaurant profile saved to cloud!');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-3.5 w-72" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <Skeleton className="w-28 h-28 rounded-3xl mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Restaurant Profile</h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Brand logo, cuisine specialty, contact details, and dining address displayed on your digital menu.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN: BRAND IDENTITY & LOGO (lg:col-span-4) ── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs text-center space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 text-left">
              Brand Identity
            </h3>

            {/* Logo Upload Button */}
            <div className="flex flex-col items-center py-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative group focus:outline-none"
              >
                <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border-4 border-slate-100 bg-slate-50 shadow-md transition-all group-hover:border-orange-300">
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
                    <Store className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-orange-500 hover:bg-orange-600 rounded-2xl flex items-center justify-center shadow-md border-2 border-white transition-transform group-hover:scale-110">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </button>
              <p className="text-xs font-bold text-slate-700 mt-3">Restaurant Brand Logo</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Square PNG, JPG, or WebP · max 5MB</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                Change Logo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>

            {/* Diner Menu Preview Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-2 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Live Diner Header Preview
              </p>
              <div className="bg-white rounded-xl p-3 border border-slate-200/60 shadow-xs flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden relative flex-shrink-0 flex items-center justify-center border border-slate-200/60">
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Preview"
                      fill
                      sizes="44px"
                      unoptimized={logoPreview.startsWith('blob:')}
                      className="object-cover"
                    />
                  ) : (
                    <Store className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 text-xs truncate">
                    {form.name || 'Restaurant Name'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {form.cuisineType || 'Cuisine Specialty'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: DETAILS FORM (lg:col-span-8) ── */}
        <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                General & Dining Information
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                These details will be shown to diners on the mobile menu header and footer.
              </p>
            </div>
          </div>

          <div className="space-y-4">
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
                className="rounded-xl border-slate-200 text-xs h-11 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            {/* 2-Col Grid: Cuisine & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cuisineType" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Cuisine Specialty
                </Label>
                <Input
                  id="cuisineType"
                  placeholder="e.g. North Indian, Tandoori, Mughlai"
                  value={form.cuisineType}
                  onChange={set('cuisineType')}
                  className="rounded-xl border-slate-200 text-xs h-11 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Contact Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  className={cn(
                    "rounded-xl text-xs h-11 focus:ring-orange-500/20 focus:border-orange-500",
                    phoneError ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20" : "border-slate-200"
                  )}
                />
                {phoneError && (
                  <p className="text-[11px] font-semibold text-rose-500 mt-1">
                    {phoneError}
                  </p>
                )}
              </div>
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
                className="rounded-xl border-slate-200 text-xs resize-none focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Dining Location & Address
              </Label>
              <Textarea
                id="address"
                placeholder="Full restaurant location and landmark for diners..."
                value={form.address}
                onChange={set('address')}
                rows={2}
                className="rounded-xl border-slate-200 text-xs resize-none focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            {/* Google Maps Review URL */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <Label htmlFor="googleReviewUrl" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Google Maps Review Link
                </Label>
                {form.googleReviewUrl?.trim() && (
                  <a
                    href={formatGoogleReviewUrl(form.googleReviewUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline"
                    title="Open this link to verify it opens the review prompt"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Test Review Link
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="googleReviewUrl"
                  type="url"
                  placeholder="https://g.page/r/.../review or Place ID (ChIJ...)"
                  value={form.googleReviewUrl}
                  onChange={set('googleReviewUrl')}
                  className="rounded-xl border-slate-200 text-xs h-11 focus:ring-orange-500/20 focus:border-orange-500"
                />
                {form.googleReviewUrl?.trim() && (
                  <a
                    href={formatGoogleReviewUrl(form.googleReviewUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 px-3 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test</span>
                  </a>
                )}
              </div>
              <div className="rounded-xl border border-amber-200/60 bg-amber-50/70 p-3 text-[11px] text-amber-900 leading-relaxed space-y-1">
                <p className="font-bold text-amber-950 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  How to get your direct 5-star Google Review link:
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-amber-900/90 text-[10.5px]">
                  <li>Open your <strong>Google Business Profile</strong> or search your restaurant on Google Maps.</li>
                  <li>Click <strong>&ldquo;Ask for reviews&rdquo;</strong> or <strong>&ldquo;Share review form&rdquo;</strong> to copy your review link.</li>
                  <li>Paste the link above (e.g., <code>https://g.page/r/.../review</code> or Place ID <code>ChIJ...</code>).</li>
                </ol>
              </div>
            </div>

            {/* Dining Feedback Form URL */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <Label htmlFor="feedbackUrl" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MessageSquareText className="w-3.5 h-3.5 text-orange-500" />
                  Customer Feedback Form Link (Google Form / Survey)
                </Label>
                {form.feedbackUrl?.trim() && (
                  <a
                    href={formatUrl(form.feedbackUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline"
                    title="Open your feedback form in a new tab"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Test Form Link
                  </a>
                )}
              </div>

              {overrideFeedbackUrl && (
                <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 flex items-start gap-3 shadow-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-amber-900 leading-relaxed">
                    <p className="font-bold text-amber-950">
                      Super Admin Master Override Active
                    </p>
                    <p className="mt-0.5 text-[11px] text-amber-800/90">
                      The Super Admin has enabled a master feedback form override for your restaurant. Your live customer menu will display the master form. The URL you enter below will remain saved as your fallback if the override is turned off.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Input
                  id="feedbackUrl"
                  type="url"
                  placeholder="https://forms.gle/xyz or https://docs.google.com/forms/..."
                  value={form.feedbackUrl}
                  onChange={set('feedbackUrl')}
                  className="rounded-xl border-slate-200 text-xs h-11 focus:ring-orange-500/20 focus:border-orange-500"
                />
                {form.feedbackUrl?.trim() && (
                  <a
                    href={formatUrl(form.feedbackUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 px-3 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test</span>
                  </a>
                )}
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-[11px] text-slate-600 leading-relaxed space-y-1">
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  How Customer Feedback works on your menu:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[10.5px]">
                  <li>Paste a <strong>Google Form</strong>, <strong>Typeform</strong>, or survey link.</li>
                  <li>When filled, a &ldquo;💬 Share Dining Feedback&rdquo; button appears on your customer menu.</li>
                  <li>If left blank, no feedback button will be shown to your diners.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full sm:w-auto min-w-[200px] h-11 text-xs font-bold rounded-xl bg-gradient-to-r from-orange-500 to-teal-600 hover:from-orange-600 hover:to-teal-700 text-white shadow-md shadow-orange-500/20 gap-2"
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
          </div>
        </div>
      </form>
    </div>
  );
}
