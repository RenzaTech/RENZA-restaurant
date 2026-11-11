'use client'

import { useState, useEffect } from 'react'
import {
  X,
  QrCode,
  Download,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Eye,
  Pencil,
  Link2,
} from 'lucide-react'
import QRCode from 'qrcode'
import api, { apiFetch } from '@/lib/api'
import { getCustomerMenuBaseUrl } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function QRStudioModal({
  isOpen,
  onClose,
  restaurant,
  table,
  initialEditMode = false,
  onTableUpdated,
}) {
  const [dataUrl, setDataUrl] = useState('')
  const [currentToken, setCurrentToken] = useState('')
  const [currentCustomUrl, setCurrentCustomUrl] = useState('')
  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [customUrlInput, setCustomUrlInput] = useState('')
  const [savingUrl, setSavingUrl] = useState(false)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const restaurantId = restaurant?._id || restaurant?.id || ''
  const restaurantName = restaurant?.name || 'Restaurant'
  const tableId = table?.id || ''
  const tableLabel = table?.label || 'Table'
  const initialToken = table?.qrCode?.token || table?.qrToken || table?.id || ''
  const initialCustom = table?.customUrl || table?.qrCode?.customUrl || null

  const customerBase = getCustomerMenuBaseUrl()

  useEffect(() => {
    setCurrentToken(initialToken)
    setCurrentCustomUrl(initialCustom || '')
    const defaultUrl = initialToken ? `${customerBase}/menu/${initialToken}` : ''
    const initialUrl = (initialCustom || table?.qrCode?.url || defaultUrl).replace(/https?:\/\/[^/]*vercel\.app/, customerBase)
    setCustomUrlInput(initialUrl)
    setIsEditingUrl(Boolean(initialEditMode))
  }, [table, initialToken, initialCustom, customerBase, initialEditMode, isOpen])

  const defaultUrl = currentToken ? `${customerBase}/menu/${currentToken}` : ''
  const rawUrl = currentCustomUrl && !currentCustomUrl.includes('vercel.app')
    ? currentCustomUrl
    : table?.qrCode?.url && !table.qrCode.url.includes('vercel.app')
    ? table.qrCode.url
    : defaultUrl
  const menuUrl = (rawUrl || defaultUrl).replace(/https?:\/\/[^/]*vercel\.app/, customerBase)

  useEffect(() => {
    if (!menuUrl) return
    QRCode.toDataURL(menuUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: '#0b1730',
        light: '#ffffff',
      },
    })
      .then(setDataUrl)
      .catch((err) => {
        console.error('Failed to generate QR code', err)
        toast.error('Failed to render table QR code')
      })
  }, [menuUrl])

  if (!isOpen || !table) return null

  const handleDownload = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    const safeRest = restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const safeTable = tableLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    a.download = `scanzaa-${safeRest}-${safeTable}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success(`Downloaded QR for ${tableLabel}!`)
  }

  const handleCopyUrl = async () => {
    if (!menuUrl) return
    try {
      await navigator.clipboard.writeText(menuUrl)
      setCopied(true)
      toast.success('Menu URL copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy URL')
    }
  }

  const handleSaveUrl = async () => {
    if (!restaurantId || !tableId) {
      toast.error('Missing restaurant or table information')
      return
    }
    const val = customUrlInput.trim()
    if (!val) {
      toast.error('Please enter a destination URL')
      return
    }

    setSavingUrl(true)
    try {
      const res = await apiFetch(`/api/admin/restaurants/${restaurantId}/tables/${tableId}/qr-url`, {
        method: 'PATCH',
        body: JSON.stringify({ customUrl: val }),
      })
      const savedUrl = res?.table?.customUrl || res?.customUrl || val
      setCurrentCustomUrl(savedUrl)
      setIsEditingUrl(false)
      toast.success(`Target URL updated for ${tableLabel}!`)
      if (onTableUpdated && res?.table) {
        onTableUpdated(res.table)
      }
    } catch (err) {
      console.error('Failed to update table QR URL:', err)
      toast.error(err?.message || 'Failed to update table QR URL')
    } finally {
      setSavingUrl(false)
    }
  }

  const handleResetUrl = async () => {
    if (!restaurantId || !tableId) return
    setSavingUrl(true)
    try {
      const res = await apiFetch(`/api/admin/restaurants/${restaurantId}/tables/${tableId}/qr-url`, {
        method: 'PATCH',
        body: JSON.stringify({ customUrl: '' }),
      })
      setCurrentCustomUrl('')
      const def = defaultUrl || `${customerBase}/menu/${currentToken}`
      setCustomUrlInput(def)
      setIsEditingUrl(false)
      toast.success(`Reset ${tableLabel} QR to default menu URL!`)
      if (onTableUpdated && res?.table) {
        onTableUpdated(res.table)
      }
    } catch (err) {
      console.error('Failed to reset table QR URL:', err)
      toast.error(err?.message || 'Failed to reset table QR URL')
    } finally {
      setSavingUrl(false)
    }
  }

  const handleRegenerate = async () => {
    if (!restaurantId || !tableId) {
      toast.error('Missing restaurant or table information')
      return
    }

    setBusy(true)
    try {
      const resData = await apiFetch(`/api/admin/restaurants/${restaurantId}/tables/${tableId}/qr`, {
        method: 'POST',
      })
      const newToken = resData?.qrCode?.token || resData?.table?.qrToken
      if (newToken) {
        setCurrentToken(newToken)
        if (!currentCustomUrl) {
          setCustomUrlInput(`${customerBase}/menu/${newToken}`)
        }
        toast.success(`QR token refreshed for ${tableLabel}!`)
        if (onTableUpdated && resData?.table) {
          onTableUpdated(resData.table)
        }
      } else {
        toast.error('Could not regenerate token')
      }
    } catch {
      toast.error('Failed to regenerate table QR')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md flex flex-col overflow-hidden my-auto z-10 animate-in fade-in zoom-in-95 duration-150 text-center">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="text-left">
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Table QR Studio
            </h2>
            <p className="text-xs text-slate-500">
              High-resolution instant dining QR asset.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Card Content */}
        <div className="p-6 space-y-4">
          {/* Brand Header */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <img
                src="/scanzaa-icon.png"
                alt="SCANZAA"
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span className="text-lg font-black tracking-wider text-slate-900">
                SCANZ<span className="text-teal-600">AA</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              powered by <strong className="text-slate-700">Renza</strong>
            </p>
          </div>

          {/* QR Canvas Box */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-inner inline-block mx-auto">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt={`QR code for ${restaurantName} - ${tableLabel}`}
                className="w-64 h-64 object-contain rounded-xl"
              />
            ) : (
              <div className="w-64 h-64 flex flex-col items-center justify-center text-xs text-slate-400">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-2" />
                Rendering QR code...
              </div>
            )}
          </div>

          {/* Restaurant & Table Info */}
          <div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <strong className="text-base font-extrabold text-slate-900">
                {restaurantName}
              </strong>
              <span className="text-slate-300">•</span>
              <span className="text-sm font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                {tableLabel}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200" title="Total customer QR views for this table">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {(() => {
                    const v = table?.views ?? table?.scansTotal ?? table?.scansCount ?? table?.qrCode?.scansTotal ?? 0
                    return `${v} ${v === 1 ? 'view' : 'views'}`
                  })()}
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Scan with any mobile camera to launch the digital menu.
            </p>
          </div>

          {/* Destination URL Box */}
          {!isEditingUrl ? (
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Target Customer URL
                  </span>
                  {currentCustomUrl && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Custom
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 truncate font-mono" title={menuUrl}>
                  {menuUrl}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCustomUrlInput(menuUrl)
                  setIsEditingUrl(true)
                }}
                className="p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-200/60 rounded-lg transition-colors flex-shrink-0"
                title="Edit Target URL"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-200/60 rounded-lg transition-colors flex-shrink-0"
                title="Copy URL"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-200/60 rounded-lg transition-colors flex-shrink-0"
                title="Open menu"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-xl text-left space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1">
                  <Pencil className="w-3 h-3 text-teal-600" />
                  <span>Edit Target Customer URL</span>
                </span>
                {currentCustomUrl && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Custom override
                  </span>
                )}
              </div>

              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder={defaultUrl || 'https://customermenu.scanzaa.in/menu/...'}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 shadow-2xs"
                />
              </div>

              <p className="text-[10px] text-slate-500">
                The table QR code image will regenerate immediately to route to this URL.
              </p>

              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <button
                  type="button"
                  disabled={savingUrl}
                  onClick={handleSaveUrl}
                  className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 shadow-2xs disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{savingUrl ? 'Updating...' : 'Save & Regenerate QR'}</span>
                </button>

                {currentCustomUrl && (
                  <button
                    type="button"
                    disabled={savingUrl}
                    onClick={handleResetUrl}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-2xs disabled:opacity-50"
                    title="Reset to default table menu URL"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={savingUrl}
                  onClick={() => {
                    setIsEditingUrl(false)
                    setCustomUrlInput(menuUrl)
                  }}
                  className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors ml-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={handleRegenerate}
              className="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50 inline-flex items-center gap-1.5 shadow-2xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />
              <span>{busy ? 'Regenerating...' : 'Regenerate'}</span>
            </button>

            {!isEditingUrl && (
              <button
                type="button"
                onClick={() => {
                  setCustomUrlInput(menuUrl)
                  setIsEditingUrl(true)
                }}
                className="px-3 py-2 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Pencil className="w-3.5 h-3.5 text-teal-600" />
                <span>Edit URL</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              disabled={!dataUrl}
              onClick={handleDownload}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-xl transition-all shadow-md shadow-teal-500/20 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
