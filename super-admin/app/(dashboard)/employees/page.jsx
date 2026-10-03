'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  Plus,
  UserCheck,
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  MapPin,
  Building2,
  Trash2,
  Pencil,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  X,
  Sparkles,
  ExternalLink,
  Store,
  Briefcase,
  AlertCircle
} from 'lucide-react'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [territoryFilter, setTerritoryFilter] = useState('all')

  // Modals state
  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Passwords visibility
  const [showPassword, setShowPassword] = useState(false)
  const [copiedKey, setCopiedKey] = useState('')

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    employeeId: '',
    password: '',
    territory: '',
    phone: '',
    department: 'Sales',
  })

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    employeeId: '',
    newPassword: '',
    territory: '',
    phone: '',
    department: 'Sales',
  })

  // Success credential card after create
  const [issuedCreds, setIssuedCreds] = useState(null)

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/employees')
      setEmployees(res.data || [])
    } catch (err) {
      toast.error('Failed to load sales executives')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  // Auto-generate next employee ID when opening create modal
  const openCreateModal = () => {
    const nextNum = 1000 + employees.length + 1
    setForm({
      name: '',
      email: '',
      employeeId: `EMP-${nextNum}`,
      password: '',
      territory: '',
      phone: '',
      department: 'Sales',
    })
    setShowPassword(false)
    setIssuedCreds(null)
    setCreateModal(true)
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error('Please enter name, work email, and login password')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setSubmitting(true)
    try {
      const res = await api.post('/api/admin/employees', {
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        employeeId: form.employeeId.trim(),
        password: form.password,
        territory: form.territory.trim() || 'National',
        phone: form.phone.trim() || null,
        department: form.department.trim() || 'Sales',
      })

      const created = res.data?.employee
      setIssuedCreds({
        name: created.name,
        email: created.email,
        employeeId: created.employeeId,
        password: form.password,
        territory: created.territory,
      })

      toast.success(`Sales Executive ${created.name} (${created.employeeId}) created!`)
      fetchEmployees()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create sales executive')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (emp) => {
    setEditModal(emp)
    setEditForm({
      name: emp.name || '',
      email: emp.email || '',
      employeeId: emp.employeeId || '',
      newPassword: '',
      territory: emp.territory || '',
      phone: emp.phone || '',
      department: emp.department || 'Sales',
    })
    setShowPassword(false)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editModal) return

    setSubmitting(true)
    try {
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.toLowerCase().trim(),
        employeeId: editForm.employeeId.trim(),
        territory: editForm.territory.trim() || 'Unassigned',
        phone: editForm.phone.trim() || null,
        department: editForm.department.trim() || 'Sales',
      }
      if (editForm.newPassword?.trim()) {
        if (editForm.newPassword.trim().length < 6) {
          toast.error('Password must be at least 6 characters')
          setSubmitting(false)
          return
        }
        payload.password = editForm.newPassword.trim()
      }

      await api.put(`/api/admin/employees/${editModal.id}`, payload)
      toast.success('Sales Executive credentials updated successfully')
      setEditModal(null)
      fetchEmployees()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update employee')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/api/admin/employees/${deleteTarget.id}`)
      toast.success(`Sales Executive ${deleteTarget.name} removed`)
      setEmployees((prev) => prev.filter((x) => x.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete employee')
    } finally {
      setDeleting(false)
    }
  }

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedKey(''), 2500)
  }

  // Filtered employees
  const filtered = employees.filter((emp) => {
    const query = search.toLowerCase()
    const matchesSearch =
      emp.name?.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query) ||
      emp.employeeId?.toLowerCase().includes(query) ||
      emp.territory?.toLowerCase().includes(query) ||
      emp.phone?.toLowerCase().includes(query)

    const matchesTerritory =
      territoryFilter === 'all' ? true : emp.territory === territoryFilter

    return matchesSearch && matchesTerritory
  })

  // Unique territories for filter
  const territories = Array.from(new Set(employees.map((e) => e.territory).filter(Boolean)))

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Sales Executives & Field Operations
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/80">
              Super Admin Issued
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Super Admin exclusively issues and manages all field representative credentials. Employees use these credentials to sign in and onboard restaurants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEmployees}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-teal-600 hover:from-orange-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Sales Credentials</span>
          </button>
        </div>
      </div>

      {/* ── METRICS SUMMARY ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Sales Reps</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{employees.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Territories</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{territories.length || 1}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Restaurants Onboarded</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {employees.reduce((acc, curr) => acc + (curr.onboardedCount || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER BAR ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by representative name, employee ID, email, territory, or phone..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-xs"
          />
        </div>

        {territories.length > 0 && (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs w-full sm:w-auto">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={territoryFilter}
              onChange={(e) => setTerritoryFilter(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Territories</option>
              {territories.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── EMPLOYEES TABLE CARD ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Sales Executive</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Employee ID</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Work Email</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Territory</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Phone</th>
                <th className="text-right px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Restaurants Added</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Issued On</th>
                <th className="text-right px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded-lg animate-pulse" style={{ width: '80%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 px-4">
                    <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-800 font-bold text-base">
                      {search ? 'No sales executives match your search' : 'No sales executives registered yet'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Super Admin issues field credentials for sales executives to access the sales terminal and onboard dining partners.
                    </p>
                    <button
                      onClick={openCreateModal}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Issue First Sales Credentials
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm border border-teal-200/80 flex-shrink-0">
                          {emp.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{emp.name}</p>
                          <p className="text-xs text-slate-400">{emp.department || 'Sales Operations'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md font-mono text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
                        {emp.employeeId || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {emp.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{emp.territory || 'National'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                      {emp.phone || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200/60">
                        {emp.onboardedCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(emp.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit credentials or reset password"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(emp)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Revoke / Delete account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE EMPLOYEE CREDENTIALS MODAL ── */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCreateModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Issue Sales Executive Credentials</h3>
                  <p className="text-xs text-slate-500">Create new login profile for field operations rep</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Issued Credentials Success Callout */}
            {issuedCreds ? (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-teal-800 font-bold text-sm mb-1">
                    <Check className="w-4 h-4 text-teal-600" />
                    <span>Credentials Generated Successfully!</span>
                  </div>
                  <p className="text-xs text-teal-700 leading-relaxed mb-3">
                    Copy and share these login credentials with the sales executive. They can sign in immediately at the Sales Executive portal.
                  </p>

                  <div className="space-y-2 bg-white/90 p-3 rounded-xl border border-teal-100 font-mono text-xs text-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Name:</span>
                      <span className="font-bold">{issuedCreds.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Employee ID:</span>
                      <span className="font-bold text-blue-700">{issuedCreds.employeeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Login Email:</span>
                      <span className="font-bold">{issuedCreds.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Password:</span>
                      <span className="font-bold text-emerald-700">{issuedCreds.password}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Territory:</span>
                      <span className="font-bold">{issuedCreds.territory}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const text = `*SCANZAA SALES EXECUTIVE CREDENTIALS*\nName: ${issuedCreds.name}\nEmployee ID: ${issuedCreds.employeeId}\nEmail: ${issuedCreds.email}\nPassword: ${issuedCreds.password}\nTerritory: ${issuedCreds.territory}\nRole: Sales Executive\nLogin at: Sales Executive Portal`
                      copyToClipboard(text, 'full_creds')
                    }}
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-xs"
                  >
                    {copiedKey === 'full_creds' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'full_creds' ? 'Copied to Clipboard!' : 'Copy Complete Credentials'}</span>
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setCreateModal(false)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Employee Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-900"
                  />
                </div>

                {/* Work Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Employee Work Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@scanzaa.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-900"
                  />
                </div>

                {/* Employee ID & Territory Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Unique Employee ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="EMP-1042"
                      value={form.employeeId}
                      onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono font-bold text-blue-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Assigned Territory / City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bangalore South"
                      value={form.territory}
                      onChange={(e) => setForm({ ...form, territory: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>

                {/* Contact Phone & Department Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>

                {/* Login Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Initial Login Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono font-medium text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Employee will use this password alongside their work email to access the Sales Executive portal.
                  </p>
                </div>

                {/* Modal footer buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCreateModal(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-teal-600 hover:from-orange-600 hover:to-teal-700 rounded-xl transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Issuing Credentials...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Issue Credentials</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── EDIT / RESET PASSWORD MODAL ── */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditModal(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Edit Sales Representative</h3>
                  <p className="text-xs text-slate-500">Update credentials, territory, or reset password</p>
                </div>
              </div>
              <button
                onClick={() => setEditModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.employeeId}
                    onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono font-bold text-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assigned Territory
                  </label>
                  <input
                    type="text"
                    value={editForm.territory}
                    onChange={(e) => setEditForm({ ...editForm, territory: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-900"
                />
              </div>

              {/* Reset Password */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reset Password (Leave blank to keep unchanged)
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password to reset"
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono font-medium text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Revoke Sales Account?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">{deleteTarget.name}</strong> ({deleteTarget.employeeId})? They will no longer be able to log in to the sales portal.
            </p>
            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {deleting ? 'Deleting...' : 'Revoke Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
