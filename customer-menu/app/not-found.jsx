'use client';

import Link from 'next/link';
import { UtensilsCrossed, ArrowLeft, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-slate-950 text-slate-100 px-4 py-8 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Renza Logo */}
      <div className="relative z-10 flex items-center gap-2.5 pt-4">
        <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
          <UtensilsCrossed className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-xl font-black text-white tracking-tight">Renza</span>
        </div>
      </div>

      {/* Center 404 Visual */}
      <div className="relative z-10 text-center my-auto py-8 max-w-sm w-full mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6 text-rose-400">
          <SearchX className="w-10 h-10" />
        </div>

        <span className="text-5xl font-black text-slate-700 tracking-tighter block mb-2 font-mono">
          404
        </span>

        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
          Menu Not Found
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed mb-8 max-w-xs mx-auto">
          The restaurant menu you are trying to reach does not exist or the QR link has expired. Please verify with your dining server.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Scanner</span>
        </Link>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-xs text-slate-500">
        Powered by{' '}
        <span className="text-orange-400 font-bold">Renza</span>
        {' '}· Digital Menu Platform
      </div>
    </div>
  );
}
