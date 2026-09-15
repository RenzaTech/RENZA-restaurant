import Image from 'next/image';
import { UtensilsCrossed, ChevronRight } from 'lucide-react';
import { forwardRef, useState } from 'react';
import { getDishBlurDataUrl } from '../utils/image';

export function VegIndicator({ isVeg }) {
  const isVegetarian = isVeg !== false;
  return (
    <span
      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm border-2 ${
        isVegetarian ? 'border-emerald-600' : 'border-rose-600'
      }`}
      title={isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isVegetarian ? 'bg-emerald-600' : 'bg-rose-600'}`} />
    </span>
  );
}

function DietaryBadge({ label, emoji, color }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-sm ${color}`}>
      {emoji && <span>{emoji}</span>}
      <span>{label}</span>
    </span>
  );
}

export function DietaryTags({ item }) {
  const tags = [];
  if (item.spicyLevel === 1 || item.spicyLevel === 'mild') {
    tags.push({ emoji: '🌶', label: 'Mild', color: 'bg-orange-500/10 text-orange-800 border border-orange-200/60' });
  } else if (item.spicyLevel === 2 || item.spicyLevel === 'medium') {
    tags.push({ emoji: '🌶🌶', label: 'Spicy', color: 'bg-rose-500/10 text-rose-800 border border-rose-200/60' });
  } else if (item.spicyLevel >= 3 || item.spicyLevel === 'hot') {
    tags.push({ emoji: '🌶🌶🌶', label: 'Extra Spicy', color: 'bg-red-500/15 text-red-900 border border-red-300 font-black' });
  }
  if (item.isJain) tags.push({ emoji: '🪔', label: 'Jain', color: 'bg-purple-500/10 text-purple-800 border border-purple-200/60' });
  if (item.isVegan) tags.push({ emoji: '🥗', label: 'Vegan', color: 'bg-emerald-500/10 text-emerald-800 border border-emerald-200/60' });
  if (item.isGlutenFree) tags.push({ emoji: '🌾', label: 'Gluten-Free', color: 'bg-amber-500/10 text-amber-900 border border-amber-200/60' });

  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <DietaryBadge key={tag.label} {...tag} />
      ))}
    </div>
  );
}

const DishCard = forwardRef(function DishCard({ item, onSelect, resolveImageUrl, priority = false }, ref) {
  const [imageFailed, setImageFailed] = useState(false);
  const isUnavailable = !item.isAvailable;
  const isVeg = item.isVeg !== false && item.foodType !== 'non-veg';
  const imageUrl = resolveImageUrl(item.imageUrl);
  const initials =
    item.name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'R';

  const priceFormatted = (Number(item.price) || 0).toFixed(2);

  const placeholder = (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-renza-charcoal via-renza-ink to-renza-ember/60 text-renza-cream">
      <UtensilsCrossed className="mb-2 h-8 w-8 text-renza-gold/80" strokeWidth={1.5} />
      <span className="font-display text-3xl tracking-wide text-white/90">{initials}</span>
    </div>
  );

  return (
    <article
      ref={ref}
      className={`group relative overflow-hidden rounded-3xl border border-white/90 bg-white/85 shadow-card backdrop-blur-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-renza-gold focus:ring-offset-2 active:scale-[0.98] motion-reduce:active:scale-100 ${
        isUnavailable
          ? 'cursor-default opacity-85'
          : 'cursor-pointer hover:-translate-y-1.5 hover:shadow-xl hover:border-renza-gold/40 motion-reduce:hover:translate-y-0'
      }`}
      onClick={isUnavailable ? undefined : (event) => onSelect(item, event.currentTarget)}
      onKeyDown={
        isUnavailable
          ? undefined
          : (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(item, event.currentTarget);
              }
            }
      }
      tabIndex={isUnavailable ? -1 : 0}
      role="button"
      aria-disabled={isUnavailable}
    >
      <div className={`relative aspect-[4/3] overflow-hidden bg-renza-charcoal ${isUnavailable ? 'grayscale' : ''}`}>
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
        ) : (
          placeholder
        )}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
          aria-hidden="true"
        />

        {/* Floating Glass Veg/Non-Veg Badge */}
        <div className="absolute left-3.5 top-3.5 rounded-xl border border-white/80 bg-white/85 p-1.5 shadow-sm backdrop-blur-md">
          <VegIndicator isVeg={isVeg} />
        </div>

        {/* Sold out banner */}
        {isUnavailable && (
          <div className="absolute right-0 top-4 rounded-l-full border-y border-l border-white/20 bg-renza-ink/90 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-renza-cream backdrop-blur-md shadow-md">
            Sold out
          </div>
        )}

        {/* Floating Glass Price Badge */}
        <span className="absolute bottom-3.5 right-3.5 rounded-full border border-white/25 bg-renza-ink/80 px-3.5 py-1.5 text-xs font-black text-white shadow-lg backdrop-blur-xl ring-1 ring-black/10 sm:text-sm">
          ₹{priceFormatted}
        </span>
      </div>

      <div className="p-4 sm:p-4.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className={`text-base font-bold leading-snug tracking-tight sm:text-lg ${isUnavailable ? 'text-slate-500' : 'text-slate-900'}`}>
            {item.name}
          </h3>
          {isUnavailable ? (
            <span className="flex-shrink-0 rounded-full border border-rose-200/60 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-600">
              Sold Out
            </span>
          ) : (
            <span className="flex-shrink-0 inline-flex items-center text-[10px] font-bold text-emerald-700">
              Available
            </span>
          )}
        </div>

        <div className="mt-2 min-h-5">
          <DietaryTags item={item} />
        </div>

        {item.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 sm:text-xs">
            {item.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-renza-ink/5 pt-2.5 text-[11px] font-bold text-renza-gold transition-colors group-hover:text-renza-ember">
          <span>View dish details</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </article>
  );
});

export default DishCard;