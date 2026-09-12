'use client';

import { QrCode, Sparkles, Smartphone, UtensilsCrossed, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-slate-950 text-slate-100 px-4 py-8 relative overflow-hidden font-sans selection:bg-orange-500 selection:text-white">
      {/* Ambient background light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Renza Logo */}
      <div className="relative z-10 flex items-center gap-2.5 pt-4">
        <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
          <UtensilsCrossed className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-xl font-black text-white tracking-tight">Renza</span>
          <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30 uppercase tracking-wider">
            Digital Dining
          </span>
        </div>
      </div>

      {/* Center Showcase Card */}
      <div className="relative z-10 max-w-sm w-full mx-auto my-auto text-center py-8">
        <div className="w-20 h-20 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6 text-orange-400 shadow-inner">
          <QrCode className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
          Scan Table QR Code
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xs mx-auto mb-8">
          Point your smartphone camera at the QR stand on your restaurant table to explore the live digital menu, dish photos, ingredients, and pricing.
        </p>

        {/* Feature Pills */}
        <div className="space-y-2.5 text-left">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-300 font-medium">No app download or registration required</p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-300 font-medium">Real-time dish availability updated by chef</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-xs text-slate-500 pt-6">
        Powered by{' '}
        <span className="text-orange-400 font-bold">Renza</span>
        {' '}· Digital Menu Platform
      </div>
    </div>
  );
}
