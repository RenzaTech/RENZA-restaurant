import Link from 'next/navigation';
import { Sparkles, Radio, ShieldCheck, ArrowRight, Smartphone, QrCode } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Ambient background lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full text-center space-y-6 relative z-10">
        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold tracking-wide">
          Scanzaa Hospitality Platform
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Smart NFC Google <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-teal-200 to-emerald-400">
            Review Gateway
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
          Dynamic link controller and in-browser NFC card programming engine. Protect your recurring subscriptions with instant remote redirection control.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-left">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <Radio className="w-5 h-5 text-teal-400 mb-2" />
            <h3 className="font-bold text-xs text-slate-200">Instant Tap Redirect</h3>
            <p className="text-[11px] text-slate-400 mt-1">Directs happy diners to Google in under 50ms.</p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <Smartphone className="w-5 h-5 text-teal-400 mb-2" />
            <h3 className="font-bold text-xs text-slate-200">Web-NFC 1-Tap Writer</h3>
            <p className="text-[11px] text-slate-400 mt-1">Program physical chips directly in mobile Chrome.</p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <ShieldCheck className="w-5 h-5 text-teal-400 mb-2" />
            <h3 className="font-bold text-xs text-slate-200">Remote Kill Switch</h3>
            <p className="text-[11px] text-slate-400 mt-1">Deactivate review cards instantly for unpaid accounts.</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6">
          <a
            href="/admin"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-teal-500/20 active:scale-95"
          >
            <span>Open Generator & Card Manager</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <p className="text-xs text-slate-600 pt-8">
          Connected to Scanzaa Super Admin &bull; Port 3005
        </p>
      </div>
    </div>
  );
}
