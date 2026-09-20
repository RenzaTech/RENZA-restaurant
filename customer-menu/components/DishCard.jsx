import Image from 'next/image';
import { UtensilsCrossed } from 'lucide-react';
import { forwardRef, useState } from 'react';
import { getDishBlurDataUrl } from '../utils/image';

export function VegIndicator({ isVeg }) {
  const isVegetarian = isVeg !== false;
  return <span className={`mt-0.5 flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-sm border-2 ${isVegetarian ? 'border-emerald-600' : 'border-rose-600'}`} title={isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}><span className={`h-1.5 w-1.5 rounded-full ${isVegetarian ? 'bg-emerald-600' : 'bg-rose-600'}`} /></span>;
}

function DietaryBadge({ label, emoji, color }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${color}`}>{emoji && <span>{emoji}</span>}<span>{label}</span></span>;
}

export function DietaryTags({ item }) {
  const tags = [];
  if (item.spicyLevel === 1 || item.spicyLevel === 'mild') tags.push({ emoji: '🌶', label: 'Mild', color: 'bg-orange-50 text-orange-700 border border-orange-200/60' });
  else if (item.spicyLevel === 2 || item.spicyLevel === 'medium') tags.push({ emoji: '🌶🌶', label: 'Spicy', color: 'bg-rose-50 text-rose-700 border border-rose-200/60' });
  else if (item.spicyLevel >= 3 || item.spicyLevel === 'hot') tags.push({ emoji: '🌶🌶🌶', label: 'Extra Spicy', color: 'bg-red-100 text-red-800 font-black' });
  if (item.isJain) tags.push({ emoji: '🪔', label: 'Jain', color: 'bg-purple-50 text-purple-700 border border-purple-200/60' });
  if (item.isVegan) tags.push({ emoji: '🥗', label: 'Vegan', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' });
  if (item.isGlutenFree) tags.push({ emoji: '🌾', label: 'Gluten-Free', color: 'bg-amber-50 text-amber-800 border border-amber-200/60' });
  if (tags.length === 0) return null;
  return <div className="flex flex-wrap gap-1.5">{tags.map((tag) => <DietaryBadge key={tag.label} {...tag} />)}</div>;
}

const DishCard = forwardRef(function DishCard({ item, onSelect, resolveImageUrl, priority = false }, ref) {
  const [imageFailed, setImageFailed] = useState(false);
  const isUnavailable = !item.isAvailable;
  const isVeg = item.isVeg !== false && item.foodType !== 'non-veg';
  const imageUrl = resolveImageUrl(item.imageUrl);
  const initials = item.name?.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'R';

  const placeholder = (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(217,179,108,0.35),_rgba(13,18,27,0.96)_55%)] text-white">
      <UtensilsCrossed className="mb-2 h-8 w-8 text-amber-200/90" strokeWidth={1.5} />
      <span className="font-display text-3xl tracking-wide text-white/90">{initials}</span>
    </div>
  );

  return (
    <article
      ref={ref}
      className={`group overflow-hidden rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,20,27,0.9),rgba(8,11,17,0.94))] shadow-[0_16px_30px_rgba(0,0,0,0.26)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-300/60 focus:ring-offset-2 focus:ring-offset-[#05070b] active:scale-[0.98] motion-reduce:active:scale-100 ${isUnavailable ? 'cursor-default opacity-90' : 'cursor-pointer hover:-translate-y-1 hover:border-amber-200/20 hover:shadow-[0_20px_42px_rgba(0,0,0,0.32)] motion-reduce:hover:translate-y-0'}`}
      onClick={isUnavailable ? undefined : (event) => onSelect(item, event.currentTarget)}
      onKeyDown={isUnavailable ? undefined : (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(item, event.currentTarget); } }}
      tabIndex={isUnavailable ? -1 : 0}
      role="button"
      aria-disabled={isUnavailable}
    >
      <div className={`relative aspect-[4/3] overflow-hidden bg-[#0b1220] ${isUnavailable ? 'grayscale-[0.18]' : ''}`}>
        {imageUrl && !imageFailed ? (
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            sizes="(min-width: 1280px) 31vw, (min-width: 768px) 47vw, calc(100vw - 2rem)"
            placeholder="blur"
            blurDataURL={getDishBlurDataUrl(item.name)}
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            onError={() => setImageFailed(true)}
          />
        ) : placeholder}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/25 to-transparent" aria-hidden="true" />

        <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/60 p-1.5 shadow-[0_10px_18px_rgba(0,0,0,0.2)] backdrop-blur-md">
          <VegIndicator isVeg={isVeg} />
        </div>
        {isUnavailable && <div className="absolute right-3 top-3 rounded-full border border-rose-400/25 bg-rose-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-rose-200">Sold out</div>}
        <span className="absolute bottom-4 right-4 rounded-full border border-amber-200/20 bg-black/50 px-3 py-1.5 text-sm font-black text-amber-100 shadow-[0_12px_20px_rgba(0,0,0,0.22)] backdrop-blur-md">
          ₹{Number(item.price).toFixed(2)}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className={`text-base font-bold leading-snug tracking-[-0.02em] ${isUnavailable ? 'text-slate-400' : 'text-white'}`}>{item.name}</h3>
          {isUnavailable ? <span className="flex-shrink-0 rounded-full border border-rose-400/20 bg-rose-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-rose-200">Sold Out</span> : <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-300">Available</span>}
        </div>
        <div className="min-h-5"><DietaryTags item={item} /></div>
        {item.description && <p className="line-clamp-2 text-xs leading-relaxed text-slate-300">{item.description}</p>}
      </div>
    </article>
  );
});

export default DishCard;