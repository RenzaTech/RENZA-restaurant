'use client';

import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-renza-ink px-6 py-12 text-renza-cream">
      <div className="pointer-events-none absolute left-1/2 top-[-15%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.18),transparent_68%)] blur-3xl" />
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-renza-gold/30 bg-renza-gold/10 text-renza-gold shadow-glow"><SearchX className="h-9 w-9" strokeWidth={1.5} /></div>
        <p className="font-mono text-6xl font-black tracking-tighter text-white/20">404</p>
        <h1 className="mt-3 font-display text-3xl text-white">Menu not found</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/55">The restaurant menu does not exist or this QR link has expired.</p>
        <Link href="/" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-renza-gold px-6 py-3 text-xs font-bold text-renza-ink shadow-glow transition hover:bg-[#d9b337] focus:outline-none focus:ring-2 focus:ring-renza-gold focus:ring-offset-2 focus:ring-offset-renza-ink"><ArrowLeft className="h-4 w-4" />Return to scanner</Link>
        <p className="mt-16 text-xs text-white/35">Powered by <span className="font-bold text-renza-gold">Renza</span></p>
      </div>
    </main>
  );
}
