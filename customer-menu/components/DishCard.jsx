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

  return (
    <article
      ref={ref}
      className={`group relative flex items-center justify-between gap-3 sm:gap-4 overflow-hidden rounded-2xl sm:rounded-3xl border border-white/90 bg-white/85 p-3.5 sm:p-4 shadow-card backdrop-blur-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00d2c4] focus:ring-offset-2 active:scale-[0.99] ${
        isUnavailable
          ? 'cursor-default opacity-80'
          : 'cursor-pointer hover:shadow-md hover:border-[#00d2c4]/40 hover:-translate-y-0.5'
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
      {/* ── Left Content Details ── */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-2 mb-1">
          <VegIndicator isVeg={isVeg} />
          {isUnavailable ? (
            <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-600">
              Sold Out
            </span>
          ) : (
            <span className="text-[10px] font-bold text-emerald-600">
              Available
            </span>
          )}
        </div>

        <h3 className={`font-bold text-sm sm:text-base leading-snug tracking-tight truncate ${isUnavailable ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
          {item.name}
        </h3>

        <p className="mt-0.5 text-sm sm:text-base font-extrabold text-slate-900">
          ₹{priceFormatted}
        </p>

        {item.description && (
          <p className="mt-1 line-clamp-1 sm:line-clamp-2 text-xs leading-relaxed text-slate-500">
            {item.description}
          </p>
        )}

        <div className="mt-2 min-h-4">
          <DietaryTags item={item} />
        </div>
      </div>

      {/* ── Right Thumbnail ── */}
      <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 overflow-hidden rounded-2xl bg-renza-charcoal border border-slate-100 shadow-xs">
        {imageUrl && !imageFailed ? (
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            sizes="(min-width: 640px) 112px, 96px"
            placeholder="blur"
            blurDataURL={getDishBlurDataUrl(item.name)}
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-renza-charcoal via-renza-ink to-[#00d2c4]/20 text-renza-cream">
            <UtensilsCrossed className="h-6 w-6 text-renza-gold/80 mb-1" strokeWidth={1.5} />
            <span className="font-display text-base font-black text-white/90">{initials}</span>
          </div>
        )}

        {isUnavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs text-[10px] font-black uppercase tracking-wider text-white">
            Sold out
          </div>
        )}

        {/* View Details cue on bottom of thumbnail */}
        {!isUnavailable && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-black/75 via-black/40 to-transparent py-1 text-[9px] font-bold text-white">
            <span className="flex items-center gap-0.5">
              Details <ChevronRight className="h-2.5 w-2.5 text-[#00d2c4]" />
            </span>
          </div>
        )}
      </div>
    </article>
  );
});

export default DishCard;