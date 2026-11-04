'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, QrCode as QrIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QrCodeViewer({ url, code, restaurantName }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!url || !canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      url,
      {
        width: 240,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      },
      (error) => {
        if (error) console.error('[QR] Error rendering canvas:', error);
      }
    );
  }, [url]);

  const handleDownload = async () => {
    try {
      // Generate ultra high-res image (1024x1024) for crisp commercial printing
      const highResDataUrl = await QRCode.toDataURL(url, {
        width: 1024,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });

      const link = document.createElement('a');
      const filename = `${(restaurantName || 'card').toLowerCase().replace(/\s+/g, '-')}-${code}-qr.png`;
      link.download = filename;
      link.href = highResDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('High-resolution QR Code downloaded!');
    } catch (err) {
      console.error('[QR] Download error:', err);
      toast.error('Failed to download QR code');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('NFC Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center text-center">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        <QrIcon className="w-4 h-4 text-teal-600" />
        Print-Ready Table Stand QR
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner mb-3">
        <canvas ref={canvasRef} className="rounded-xl w-48 h-48 block" />
      </div>

      <div className="mb-4">
        <span className="font-mono text-sm font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-200">
          {code}
        </span>
        <p className="text-xs text-slate-500 mt-1.5 font-medium truncate max-w-[220px]">
          {restaurantName}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 w-full">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Download QR
        </button>
      </div>
    </div>
  );
}
