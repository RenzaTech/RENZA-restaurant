'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Check, QrCode, Store } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const slug = new FormData(event.currentTarget)
      .get('slug')
      ?.toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '');

    if (!slug) {
      setError('Enter a restaurant slug to continue.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/menu/${slug}`);
      if (response.status === 404) {
        setError('We could not find that menu. Check the slug and try again.');
        return;
      }
      router.push(`/menu/${slug}`);
    } catch {
      router.push(`/menu/${slug}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative overflow-hidden bg-renza-ink text-renza-cream selection:bg-renza-gold selection:text-renza-ink">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_10%,rgba(201,162,39,0.2),transparent_38%),radial-gradient(ellipse_at_10%_45%,rgba(249,115,22,0.12),transparent_34%),linear-gradient(135deg,#0B0B0F_0%,#16161C_52%,#0B0B0F_100%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E&quot;)]" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-1/4 top-0 h-1/2 w-3/4 rotate-[-18deg] bg-gradient-to-r from-transparent via-renza-gold/10 to-transparent blur-3xl animate-float-slow" aria-hidden="true" />

      <section className="relative z-10 mx-auto flex min-h-[46rem] max-w-[1100px] flex-col items-center justify-center px-6 pb-24 pt-20 text-center sm:min-h-[52rem] sm:pt-28">
        <div className="absolute left-[8%] top-[19%] h-16 w-16 rounded-full bg-renza-gold/25 blur-2xl animate-float-slow" aria-hidden="true" />
        <div className="absolute right-[7%] top-[30%] h-24 w-24 rounded-full bg-renza-ember/20 blur-3xl animate-float-slow [animation-delay:1.2s]" aria-hidden="true" />
        <div className="absolute bottom-[19%] left-[22%] h-10 w-10 rounded-full bg-renza-gold/20 blur-xl animate-float-slow [animation-delay:2s]" aria-hidden="true" />
        <div className="absolute bottom-[24%] right-[18%] h-12 w-12 rounded-full bg-orange-300/10 blur-2xl animate-float-slow [animation-delay:2.8s]" aria-hidden="true" />

        <div className="relative mb-12 h-44 w-64 animate-fade-up sm:mb-14 sm:h-52 sm:w-80" aria-hidden="true">
          <div className="absolute left-1/2 top-[55%] h-32 w-56 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-renza-gold/70 bg-gradient-to-b from-renza-charcoal to-renza-ink shadow-[0_0_45px_rgba(201,162,39,0.3)] sm:h-40 sm:w-72" />
          <div className="absolute left-1/2 top-[48%] h-24 w-44 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-renza-cream/30 bg-renza-charcoal/90 shadow-[inset_0_2px_12px_rgba(250,247,242,0.12)] sm:h-28 sm:w-56" />
          <div className="absolute left-1/2 top-[42%] h-16 w-32 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-renza-gold/35 bg-renza-ink shadow-glow sm:h-20 sm:w-40" />
          <div className="absolute left-1/2 top-[39%] h-8 w-16 -translate-x-1/2 rounded-[50%] bg-renza-gold/25 blur-lg sm:w-24" />
          <div className="absolute left-[35%] top-0 h-16 w-3 -rotate-12 rounded-full border-l border-renza-cream/40 blur-[2px] animate-float-slow" />
          <div className="absolute left-1/2 top-[-14px] h-20 w-3 -rotate-3 rounded-full border-l border-renza-cream/30 blur-[2px] animate-float-slow [animation-delay:0.8s]" />
          <div className="absolute left-[62%] top-1 h-14 w-3 rotate-12 rounded-full border-l border-renza-cream/35 blur-[2px] animate-float-slow [animation-delay:1.5s]" />
        </div>

        <p className="animate-fade-up mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-renza-gold [animation-delay:120ms]">The visual menu for modern dining</p>
        <h1 className="animate-fade-up font-display text-7xl leading-none tracking-tight text-renza-cream [animation-delay:220ms] sm:text-9xl">Renza</h1>
        <p className="animate-fade-up mx-auto mt-7 max-w-lg font-display text-2xl leading-tight text-renza-cream/80 [animation-delay:320ms] sm:text-4xl">See the dish before you order.</p>

        <form onSubmit={handleSubmit} className="animate-fade-up mx-auto mt-12 w-full max-w-xl [animation-delay:440ms] sm:mt-14">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1.5 shadow-glow backdrop-blur-xl focus-within:border-renza-gold focus-within:ring-2 focus-within:ring-renza-gold/30">
            <QrCode className="ml-3 h-5 w-5 flex-shrink-0 text-renza-gold" aria-hidden="true" />
            <label htmlFor="restaurant-slug" className="sr-only">Restaurant slug</label>
            <input id="restaurant-slug" name="slug" type="text" placeholder="Enter restaurant slug" autoComplete="off" onChange={() => error && setError('')} className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-renza-cream outline-none placeholder:text-renza-cream/45 sm:text-base" aria-invalid={Boolean(error)} aria-describedby={error ? 'slug-error' : 'slug-help'} />
            <span id="slug-help" className="hidden whitespace-nowrap text-[11px] text-renza-cream/45 sm:inline">e.g. anbude-cafe</span>
            <button type="submit" disabled={isSubmitting} className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-renza-gold text-renza-ink shadow-lg transition hover:bg-[#d9b337] active:scale-90 disabled:cursor-wait disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-renza-cream" aria-label="Open restaurant menu">
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          {error && <p id="slug-error" className="mt-3 text-left text-xs font-medium text-orange-200" role="alert">{error}</p>}
        </form>
        <p className="animate-fade-up mt-5 text-[11px] text-renza-cream/45 [animation-delay:520ms]">Scan a restaurant QR code or enter its menu address.</p>
      </section>

      <section className="relative z-10 border-t border-white/10 bg-renza-charcoal/45 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-10 max-w-md"><p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-renza-gold">A better way to decide</p><h2 className="mt-3 font-display text-3xl text-white sm:text-4xl">From QR code to craving.</h2></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[['01', 'Scan the QR', 'Open a restaurant menu instantly, with nothing to download.'], ['02', 'Browse the menu', 'Move through categories, ingredients, dietary details, and prices.'], ['03', 'See the real dish photo', 'Know what is coming to your table before you order.']].map(([number, title, description]) => (
              <article key={number} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-card backdrop-blur-sm transition hover:-translate-y-1 motion-reduce:hover:translate-y-0">
                <span className="font-mono text-sm text-renza-gold">{number}</span><div className="my-8 h-px w-10 bg-renza-gold/60" /><h3 className="font-display text-2xl text-white">{title}</h3><p className="mt-3 text-sm leading-relaxed text-renza-cream/55">{description}</p><Check className="mt-8 h-5 w-5 text-renza-gold" />
              </article>
            ))}
          </div>
          <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center"><div><p className="font-display text-xl text-white">Built for restaurants that care about the first impression.</p><p className="mt-1 text-sm text-renza-cream/45">Give every dish the attention it deserves.</p></div><a href="http://localhost:3002" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-renza-gold/40 px-5 py-2.5 text-xs font-bold text-renza-gold transition hover:bg-renza-gold hover:text-renza-ink focus:outline-none focus:ring-2 focus:ring-renza-gold">Restaurant admin <Store className="h-4 w-4" /></a></div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-renza-ink px-6 py-8"><div className="mx-auto flex max-w-[1100px] flex-col items-start justify-between gap-3 text-xs text-renza-cream/40 sm:flex-row sm:items-center"><span className="font-display text-xl text-renza-cream">Renza</span><span>© 2026 Renza. Digital dining, beautifully served.</span></div></footer>
    </main>
  );
}
