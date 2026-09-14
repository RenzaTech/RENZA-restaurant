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
  return <div className="flex min-h-[24rem] flex-col items-center justify-center px-6 py-16 text-center"><div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[2rem] border border-renza-gold/20 bg-renza-gold/10 text-renza-gold shadow-glow"><Icon className="h-9 w-9" strokeWidth={1.5} /></div><h2 className="font-display text-2xl text-renza-ink">{content.title}</h2><p className="mt-2 max-w-xs text-sm leading-relaxed text-renza-ink/50">{content.message}</p>{content.action && <button type="button" onClick={onReset} className="mt-6 min-h-11 rounded-full bg-renza-ink px-5 py-2.5 text-xs font-bold text-renza-cream transition hover:bg-renza-charcoal focus:outline-none focus:ring-2 focus:ring-renza-gold focus:ring-offset-2">{content.action}</button>}</div>;
}