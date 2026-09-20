import { AlertTriangle, SearchX, Store, UtensilsCrossed } from 'lucide-react';

const stateContent = {
  search: { icon: SearchX, title: 'No dishes found', message: 'Try another search or clear your active filters.', action: 'Clear search' },
  category: { icon: Store, title: 'This menu is being prepared', message: 'There are no dishes in this category yet.', action: 'Browse all dishes' },
  notFound: { icon: SearchX, title: 'Restaurant not found', message: 'We could not locate this restaurant. Check the QR code or ask your server.', action: null },
  suspended: { icon: AlertTriangle, title: 'This menu is temporarily unavailable', message: 'Please check back later or ask your server for assistance.', action: null },
  error: { icon: AlertTriangle, title: 'Connection issue', message: 'The menu could not load. Check your connection and try again.', action: 'Try again' },
};

export default function EmptyState({ variant = 'search', onReset }) {
  const content = stateContent[variant];
  const Icon = content.icon;
  return (
    <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.92),rgba(9,13,20,0.96))] px-6 py-16 text-center shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[2rem] border border-amber-300/20 bg-amber-300/10 text-amber-200 shadow-[0_0_30px_rgba(217,179,108,0.2)]">
        <Icon className="h-9 w-9" strokeWidth={1.5} />
      </div>
      <h2 className="font-display text-2xl text-white">{content.title}</h2>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-300">{content.message}</p>
      {content.action && <button type="button" onClick={onReset} className="mt-6 min-h-11 rounded-full bg-gradient-to-r from-amber-300 to-yellow-200 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-300/70 focus:ring-offset-2 focus:ring-offset-[#05070b]">{content.action}</button>}
    </div>
  );
}