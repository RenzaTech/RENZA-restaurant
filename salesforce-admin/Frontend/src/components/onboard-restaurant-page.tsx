'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  UtensilsCrossed,
  ShieldCheck,
  QrCode,
  Sparkles,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  MessageSquareText,
  Globe,
  UserCheck,
  Check,
  Award,
  Briefcase,
  AlertCircle,
  Building2,
} from 'lucide-react';
import type { Restaurant, UserAccess } from './app-shell';
import { salesFetch } from '@/lib/api-client';

export type OnboardRestaurantPageProps = {
  currentAccess: UserAccess | null;
  onCancel: () => void;
  onSuccess: (newRestaurant: Restaurant) => void;
  notice: (msg: string) => void;
};

export function OnboardRestaurantPage({
  currentAccess,
  onCancel,
  onSuccess,
  notice,
}: OnboardRestaurantPageProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    name: '',
    cuisineType: '',
    description: '',
    address: '',
    city: currentAccess?.territory?.split(' ')[0] || 'Bengaluru',
    phone: '',
    website: '',
    superAdminFeedbackUrl: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    initialTableCount: '5',
    leadSource: 'Field Visit',
    salesNotes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const getPasswordStrength = () => {
    if (!form.adminPassword) return 0;
    let score = 0;
    if (form.adminPassword.length >= 6) score += 1;
    if (form.adminPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(form.adminPassword)) score += 1;
    if (/[0-9]/.test(form.adminPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(form.adminPassword)) score += 1;
    return score;
  };
  const strength = getPasswordStrength();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Restaurant name is required';
    if (!form.adminName.trim()) errs.adminName = 'Admin full name is required';
    if (!form.adminEmail.trim()) errs.adminEmail = 'Admin email is required';
    else if (!/\S+@\S+\.\S+/.test(form.adminEmail)) errs.adminEmail = 'Invalid email address';
    if (!form.adminPassword) errs.adminPassword = 'Password is required';
    else if (form.adminPassword.length < 6) errs.adminPassword = 'Password must be at least 6 characters';
    if (form.adminPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      notice('Please fix the indicated form errors');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        cuisineType: form.cuisineType.trim() || undefined,
        description: form.description.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        phone: form.phone.trim() || undefined,
        website: form.website.trim() || undefined,
        superAdminFeedbackUrl: form.superAdminFeedbackUrl.trim() || undefined,
        adminName: form.adminName.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword,
        initialTableCount: Number(form.initialTableCount || 5),
        salesNotes: form.salesNotes.trim() || undefined,
        leadSource: form.leadSource || 'Field Visit',
      };

      const res = await salesFetch('/api/admin/restaurants', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const created = res.restaurant || res;
      const newRestaurant: Restaurant = {
        id: created.id,
        name: created.name,
        cuisine: created.cuisineType || (Array.isArray(created.cuisine) ? created.cuisine.join(' · ') : 'Multi-cuisine'),
        email: form.adminEmail,
        phone: created.phone || form.phone,
        address: created.address || form.address,
        website: created.website || form.website,
        description: created.description || form.description,
        status: 'Active',
        dishes: 0,
        tableCount: res.tableCount || Number(form.initialTableCount || 5),
        today: 0,
        total: 0,
        city: created.city || form.city,
        initial: (created.name || 'R').charAt(0).toUpperCase(),
        color: '#0d9488',
        rating: '5.0',
        createdById: currentAccess?.id,
        salesExecutiveName: res.salesExecutiveName || currentAccess?.name,
        salesExecutiveEmail: currentAccess?.email,
        salesExecutiveCode: res.salesExecutiveCode || currentAccess?.employeeId,
        salesExecutivePhone: (currentAccess as any)?.phone || form.phone,
        salesNotes: form.salesNotes,
        leadSource: form.leadSource,
        createdAt: new Date().toISOString(),
      };

      notice(`🎉 Restaurant "${created.name}" onboarded and ${newRestaurant.tableCount} Table QRs provisioned!`);
      onSuccess(newRestaurant);
    } catch (err: any) {
      notice(err.message || 'Could not connect to central backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 0 40px' }}>
      {/* ── BREADCRUMB & HEADER ── */}
      <div style={{ marginBottom: 24 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 700,
            color: '#64748b',
            background: 'none',
            border: 0,
            padding: 0,
            cursor: 'pointer',
            marginBottom: 14,
          }}
        >
          <ChevronLeft size={16} />
          <span>Back to Restaurants</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                  border: '1px solid #fed7aa',
                  color: '#ea580c',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Sparkles size={18} />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', margin: 0 }}>
                Onboard New Restaurant
              </h1>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
              Provision a dedicated tenant workspace, assign partner administrator credentials, and generate instant table QR codes.
            </p>
          </div>

          {/* Active Sales Executive Attribution Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 14,
              padding: '8px 16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: '#f0fdfa',
                border: '1px solid #99f6e4',
                color: '#0d9488',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <UserCheck size={16} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                  {currentAccess?.name || 'Sales Executive'}
                </span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 11,
                    fontWeight: 800,
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    padding: '1px 6px',
                    borderRadius: 6,
                  }}
                >
                  {currentAccess?.employeeId || '—'}
                </span>
              </div>
              <span style={{ fontSize: 11, color: '#0d9488', fontWeight: 600 }}>
                Super Admin Synchronized · {currentAccess?.territory || 'Field Sales'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ── 2-CARD GRID (MATCHING ACTUAL SUPER ADMIN PORTAL) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 24 }}>
          {/* CARD 1: RESTAURANT PROFILE */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 20,
              padding: 28,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {/* Card Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  color: '#ea580c',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <UtensilsCrossed size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>Dining Profile</h2>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Establish restaurant brand details</p>
              </div>
            </div>

            {/* Card Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Restaurant Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <UtensilsCrossed size={14} color="#94a3b8" />
                  <span>Restaurant Name</span>
                  <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="e.g. Royal Spice Garden"
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 14px',
                    borderRadius: 12,
                    background: '#f8fafc',
                    border: errors.name ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                    fontSize: 14,
                    color: '#0f172a',
                    fontWeight: 500,
                    outline: 'none',
                  }}
                />
                {errors.name && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#ef4444', fontWeight: 600 }}>{errors.name}</p>}
              </div>

              {/* Cuisine Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Sparkles size={14} color="#94a3b8" />
                  <span>Cuisine Type</span>
                </label>
                <input
                  type="text"
                  value={form.cuisineType}
                  onChange={set('cuisineType')}
                  placeholder="e.g. South Indian & Chettinad, Biryani"
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 14px',
                    borderRadius: 12,
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    color: '#0f172a',
                    fontWeight: 500,
                    outline: 'none',
                  }}
                />
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                  Separated by commas, e.g. North Indian, Biryani, Tandoori
                </p>
              </div>

              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Restaurant Description
                </label>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Brief tagline or specialty of the kitchen…"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    color: '#0f172a',
                    fontWeight: 500,
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Dining Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <MapPin size={14} color="#94a3b8" />
                  <span>Dining Address</span>
                </label>
                <textarea
                  value={form.address}
                  onChange={set('address')}
                  placeholder="Full street address, area, city, and pincode"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    color: '#0f172a',
                    fontWeight: 500,
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* City and Contact Phone row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <MapPin size={14} color="#94a3b8" />
                    <span>City</span>
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={set('city')}
                    placeholder="e.g. Bengaluru"
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '0 14px',
                      borderRadius: 12,
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      fontSize: 14,
                      color: '#0f172a',
                      fontWeight: 500,
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <Phone size={14} color="#94a3b8" />
                    <span>Contact Phone</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="+91 98765 43210"
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '0 14px',
                      borderRadius: 12,
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      fontSize: 14,
                      color: '#0f172a',
                      fontWeight: 500,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Website */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Globe size={14} color="#94a3b8" />
                  <span>Website / Online Menu (Optional)</span>
                </label>
                <input
                  type="text"
                  value={form.website}
                  onChange={set('website')}
                  placeholder="e.g. royalspice.in"
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 14px',
                    borderRadius: 12,
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    color: '#0f172a',
                    fontWeight: 500,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Renza Platform Feedback Link */}
              <div style={{ paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <MessageSquareText size={14} color="#94a3b8" />
                  <span>Renza Platform Feedback / App Issue URL</span>
                </label>
                <input
                  type="url"
                  value={form.superAdminFeedbackUrl}
                  onChange={set('superAdminFeedbackUrl')}
                  placeholder="https://forms.gle/renza-feedback-form"
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 14px',
                    borderRadius: 12,
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    color: '#0f172a',
                    fontWeight: 500,
                    outline: 'none',
                  }}
                />
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                  Optional Google Form or survey. When added, diners see &quot;[ Report an app issue / Renza Feedback ]&quot; in the footer.
                </p>
              </div>
            </div>
          </div>

          {/* CARD 2: PARTNER ADMIN CREDENTIALS */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 20,
              padding: 28,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {/* Card Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#2563eb',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>Partner Admin Account</h2>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Login credentials for the restaurant manager</p>
              </div>
            </div>

            {/* Card Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Admin Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <User size={14} color="#94a3b8" />
                  <span>Admin Full Name</span>
                  <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.adminName}
                  onChange={set('adminName')}
                  placeholder="e.g. Vikramaditya Rao"
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 14px',
                    borderRadius: 12,
                    background: '#f8fafc',
                    border: errors.adminName ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                    fontSize: 14,
                    color: '#0f172a',
                    fontWeight: 500,
                    outline: 'none',
                  }}
                />
                {errors.adminName && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#ef4444', fontWeight: 600 }}>{errors.adminName}</p>}
              </div>

              {/* Admin Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Mail size={14} color="#94a3b8" />
                  <span>Admin Email</span>
                  <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  value={form.adminEmail}
                  onChange={set('adminEmail')}
                  placeholder="manager@restaurant.com"
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 14px',
                    borderRadius: 12,
                    background: '#f8fafc',
                    border: errors.adminEmail ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                    fontSize: 14,
                    color: '#0f172a',
                    fontWeight: 500,
                    outline: 'none',
                  }}
                />
                {errors.adminEmail && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#ef4444', fontWeight: 600 }}>{errors.adminEmail}</p>}
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                  Used to sign in at the Restaurant Admin Portal (port 3002)
                </p>
              </div>

              {/* Admin Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Lock size={14} color="#94a3b8" />
                  <span>Admin Password</span>
                  <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.adminPassword}
                    onChange={set('adminPassword')}
                    placeholder="Create a secure password"
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '0 40px 0 14px',
                      borderRadius: 12,
                      background: '#f8fafc',
                      border: errors.adminPassword ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                      fontSize: 14,
                      color: '#0f172a',
                      fontFamily: showPassword ? 'inherit' : 'monospace',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: 'absolute',
                      right: 8,
                      background: 'none',
                      border: 0,
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: 6,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.adminPassword && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#ef4444', fontWeight: 600 }}>{errors.adminPassword}</p>}

                {/* Password strength indicator */}
                {form.adminPassword && (
                  <div style={{ marginTop: 4 }}>
                    <div style={{ display: 'flex', gap: 4, height: 5, width: '100%', background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          borderRadius: 99,
                          transition: 'all 0.2s',
                          width: strength <= 2 ? '33%' : strength <= 3 ? '66%' : '100%',
                          background: strength <= 2 ? '#f43f5e' : strength <= 3 ? '#f59e0b' : '#10b981',
                        }}
                      />
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: strength <= 2 ? '#f43f5e' : strength <= 3 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                      {strength <= 2 ? 'Weak password' : strength <= 3 ? 'Medium strength' : 'Strong password'}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Lock size={14} color="#94a3b8" />
                  <span>Confirm Password</span>
                  <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    placeholder="Re-enter password to verify"
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '0 40px 0 14px',
                      borderRadius: 12,
                      background: '#f8fafc',
                      border: errors.confirmPassword ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                      fontSize: 14,
                      color: '#0f172a',
                      fontFamily: showConfirm ? 'inherit' : 'monospace',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    style={{
                      position: 'absolute',
                      right: 8,
                      background: 'none',
                      border: 0,
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: 6,
                    }}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#ef4444', fontWeight: 600 }}>{errors.confirmPassword}</p>}
              </div>

              {/* Initial Table Count */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <QrCode size={14} color="#94a3b8" />
                  <span>Initial Dining Tables Count</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={form.initialTableCount}
                    onChange={set('initialTableCount')}
                    style={{
                      width: 120,
                      height: 44,
                      padding: '0 14px',
                      borderRadius: 12,
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      fontSize: 14,
                      color: '#0f172a',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    Will automatically generate Table 01 to Table {String(Math.max(1, Number(form.initialTableCount || 1))).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Automatic QR Provisioning Box */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                  border: '1px solid #fed7aa',
                  borderRadius: 14,
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginTop: 4,
                }}
              >
                <QrCode size={22} color="#ea580c" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#7c2d12' }}>
                    Automatic QR Provisioning
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9a3412', lineHeight: 1.5 }}>
                    Upon creation, high-resolution QR codes and a dedicated diner menu slug will be generated automatically. You can customize the production domain at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD 3: SALES EXECUTIVE ATTRIBUTION & FIELD AUDIT (FULL WIDTH) ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%)',
            border: '1px solid #99f6e4',
            borderRadius: 20,
            padding: 26,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingBottom: 14, borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: '#ccfbf1',
                  color: '#0f766e',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Award size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                  Sales Executive Attribution & Field Record
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                  Permanent employee audit trail linked and synchronized to Super Admin in real-time
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  borderRadius: 8,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                }}
              >
                EMP ID: {currentAccess?.employeeId || '—'}
              </span>
              <span
                style={{
                  background: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  borderRadius: 8,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Territory: {currentAccess?.territory || 'National'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 18 }}>
            {/* Lead Source */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Lead Source
              </label>
              <select
                value={form.leadSource}
                onChange={set('leadSource')}
                style={{
                  width: '100%',
                  height: 44,
                  padding: '0 12px',
                  borderRadius: 12,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  fontSize: 14,
                  color: '#0f172a',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                <option value="Field Visit">Field Visit (Direct Merchant Visit)</option>
                <option value="Referral">Merchant Referral</option>
                <option value="Inbound Inquiry">Inbound Call / Web Inquiry</option>
                <option value="Cold Outreach">Field Cold Outreach</option>
                <option value="Partner Conference">Hospitality Expo / Event</option>
              </select>
            </div>

            {/* Field Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Sales Executive Field Notes / Meeting Remarks
              </label>
              <input
                type="text"
                value={form.salesNotes}
                onChange={set('salesNotes')}
                placeholder="e.g. Met owner. Demonstrated live digital menu. 5 tables provisioned for immediate dining service."
                style={{
                  width: '100%',
                  height: 44,
                  padding: '0 14px',
                  borderRadius: 12,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  fontSize: 14,
                  color: '#0f172a',
                  fontWeight: 500,
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── ACTION FOOTER BAR ── */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 20,
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13 }}>
            <ShieldCheck size={18} color="#0d9488" />
            <span>Employee attribution is verified and will automatically display in Super Admin.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '11px 22px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                color: '#475569',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 26px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                color: '#ffffff',
                background: 'linear-gradient(135deg, #f97316 0%, #0d9488 100%)',
                border: 0,
                boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <QrCode size={17} />
              <span>{loading ? 'Onboarding & Generating QR...' : 'Create Restaurant & Generate QR'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
