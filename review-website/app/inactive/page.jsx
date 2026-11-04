import { Clock, ShieldCheck, HeartHandshake, Utensils } from 'lucide-react';

export default function InactiveReviewPage({ searchParams }) {
  const restaurantName = searchParams?.r || 'Our Restaurant';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-5 text-teal-400 shadow-inner">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 inline-block mb-3">
          Maintenance Notice
        </span>

        <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-2 tracking-tight">
          {restaurantName}
        </h1>

        <h2 className="text-sm font-semibold text-teal-300 mb-3">
          Review Portal Currently Paused
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          Thank you for dining with us today! Our digital review portal is temporarily paused for scheduled system updates.
          We value your experience—please feel free to share any feedback directly with our management or staff.
        </p>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 text-left space-y-2.5 mb-6">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <HeartHandshake className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span>We appreciate your patronage and support.</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <Utensils className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span>Hope you enjoyed your meal!</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Scanzaa Hospitality Network</span>
        </div>
      </div>
    </div>
  );
}
