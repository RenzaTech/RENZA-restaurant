'use client';

export function getCategoryImageUrl(name = '') {
  const lower = name.toLowerCase().trim();

  if (lower.includes('snack') || lower.includes('samosa') || lower.includes('sandwich') || lower.includes('toast') || lower.includes('omelette')) {
    return '/categories/snacks.png';
  }
  if (lower.includes('combo') || lower.includes('meal')) {
    return '/categories/combos.png';
  }
  if (lower.includes('wrap') || lower.includes('burrito')) {
    return '/categories/wrap.png';
  }
  if (lower.includes('nugget') || lower.includes('roll')) {
    return '/categories/roll-nuggets.png';
  }
  if (lower.includes('fries')) {
    return '/categories/fries.png';
  }
  if (lower.includes('maggi') || lower.includes('noodle')) {
    return '/categories/maggi.png';
  }
  if (lower.includes('momo') || lower.includes('dumpling')) {
    return '/categories/momos.png';
  }
  if (lower.includes('puff') || lower.includes('pastry')) {
    return '/categories/puffs.png';
  }
  if (lower.includes('shake')) {
    return '/categories/ice-cream-shake.png';
  }
  if (lower.includes('ice') || lower.includes('cream')) {
    return '/categories/ice-cream.png';
  }
  if (lower.includes('fruit') || lower.includes('salad')) {
    return '/categories/fruit-salad.png';
  }
  if (lower.includes('lassi')) {
    return '/categories/lassi.png';
  }
  if (lower.includes('falooda')) {
    return '/categories/falooda.png';
  }
  if (lower.includes('juice') || lower.includes('mojito') || lower.includes('soda') || lower.includes('cooler') || lower.includes('beverage') || lower.includes('drink')) {
    return '/categories/fresh-juice.png';
  }

  return '/categories/snacks.png';
}

export default function CategoryIcon({ name = '', className = 'w-full h-full' }) {
  const imageUrl = getCategoryImageUrl(name);

  return (
    <img
      src={imageUrl}
      alt={name || 'Category'}
      className={`${className} object-cover select-none`}
      loading="lazy"
    />
  );
}

