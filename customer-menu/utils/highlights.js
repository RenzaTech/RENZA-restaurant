/**
 * Dynamic Restaurant Highlights Utility
 * Automatically resolves 4 tailored highlight badges based on cuisine, category,
 * restaurant name/description, or explicit restaurant configuration.
 */

export const HIGHLIGHT_PRESETS = {
  cafe: [
    { id: 'coffee', label: 'Great Coffee', icon: 'coffee', bg: '#FAF0E6', text: '#8B4513' },
    { id: 'food', label: 'Tasty Food', icon: 'utensils', bg: '#FFF1E6', text: '#EA580C' },
    { id: 'ambience', label: 'Cozy Ambience', icon: 'users', bg: '#F5EBE1', text: '#78350F' },
    { id: 'fresh', label: 'Fresh Ingredients', icon: 'leaf', bg: '#E8F5E9', text: '#16B86A' },
  ],
  biryani: [
    { id: 'dum', label: 'Authentic Dum', icon: 'flame', bg: '#FEF2F2', text: '#DC2626' },
    { id: 'spices', label: 'Rich Flavours', icon: 'utensils', bg: '#FFF1E6', text: '#EA580C' },
    { id: 'family', label: 'Family Dining', icon: 'users', bg: '#F5EBE1', text: '#78350F' },
    { id: 'quality', label: 'Halal & Fresh', icon: 'shield', bg: '#E8F5E9', text: '#16B86A' },
  ],
  veg: [
    { id: 'pureveg', label: '100% Pure Veg', icon: 'leaf', bg: '#E8F5E9', text: '#16B86A' },
    { id: 'taste', label: 'Traditional Taste', icon: 'utensils', bg: '#FFF1E6', text: '#EA580C' },
    { id: 'hygiene', label: 'Hygienic Prep', icon: 'sparkles', bg: '#FEF9C3', text: '#A16207' },
    { id: 'fresh', label: 'Farm Fresh', icon: 'award', bg: '#FAF0E6', text: '#8B4513' },
  ],
  bakery: [
    { id: 'baked', label: 'Freshly Baked', icon: 'sparkles', bg: '#FDF2F8', text: '#BE185D' },
    { id: 'treats', label: 'Artisan Bakes', icon: 'heart', bg: '#FFF1E6', text: '#EA580C' },
    { id: 'butter', label: 'Pure Butter', icon: 'star', bg: '#FEF9C3', text: '#A16207' },
    { id: 'custom', label: 'Custom Cakes', icon: 'award', bg: '#EFF6FF', text: '#1D4ED8' },
  ],
  fastfood: [
    { id: 'hot', label: 'Hot & Fresh', icon: 'flame', bg: '#FEF2F2', text: '#DC2626' },
    { id: 'quick', label: 'Quick Bites', icon: 'clock', bg: '#FEF9C3', text: '#A16207' },
    { id: 'crispy', label: 'Crispy Snacks', icon: 'utensils', bg: '#FFF1E6', text: '#EA580C' },
    { id: 'sips', label: 'Chilled Drinks', icon: 'zap', bg: '#EFF6FF', text: '#1D4ED8' },
  ],
  juice: [
    { id: 'fruit', label: 'Pure Fruit', icon: 'leaf', bg: '#E8F5E9', text: '#16B86A' },
    { id: 'pure', label: 'No Preservatives', icon: 'sparkles', bg: '#FEF9C3', text: '#A16207' },
    { id: 'cold', label: 'Freshly Pressed', icon: 'zap', bg: '#EFF6FF', text: '#1D4ED8' },
    { id: 'vitality', label: 'Natural Health', icon: 'heart', bg: '#FDF2F8', text: '#BE185D' },
  ],
  finedining: [
    { id: 'specials', label: "Chef's Specials", icon: 'award', bg: '#FAF0E6', text: '#8B4513' },
    { id: 'prime', label: 'Prime Ambience', icon: 'users', bg: '#F5EBE1', text: '#78350F' },
    { id: 'gourmet', label: 'Gourmet Flavours', icon: 'utensils', bg: '#FFF1E6', text: '#EA580C' },
    { id: 'hospitality', label: 'Top Hospitality', icon: 'star', bg: '#FEF9C3', text: '#A16207' },
  ],
  general: [
    { id: 'food', label: 'Tasty Food', icon: 'utensils', bg: '#FFF1E6', text: '#EA580C' },
    { id: 'hygiene', label: 'Hygienic Kitchen', icon: 'sparkles', bg: '#E8F5E9', text: '#16B86A' },
    { id: 'ambience', label: 'Warm Ambience', icon: 'users', bg: '#F5EBE1', text: '#78350F' },
    { id: 'quality', label: 'Quality Assured', icon: 'award', bg: '#FAF0E6', text: '#8B4513' },
  ],
};

function guessIconStyle(label = '') {
  const l = label.toLowerCase();
  if (l.includes('coffee') || l.includes('tea') || l.includes('chai') || l.includes('brew')) {
    return { icon: 'coffee', bg: '#FAF0E6', text: '#8B4513' };
  }
  if (l.includes('dum') || l.includes('fire') || l.includes('spic') || l.includes('hot') || l.includes('grill') || l.includes('bbq')) {
    return { icon: 'flame', bg: '#FEF2F2', text: '#DC2626' };
  }
  if (l.includes('veg') || l.includes('leaf') || l.includes('green') || l.includes('organic') || l.includes('fruit')) {
    return { icon: 'leaf', bg: '#E8F5E9', text: '#16B86A' };
  }
  if (l.includes('clean') || l.includes('hygien') || l.includes('fresh') || l.includes('pure')) {
    return { icon: 'sparkles', bg: '#FEF9C3', text: '#A16207' };
  }
  if (l.includes('family') || l.includes('ambience') || l.includes('vibe') || l.includes('crowd') || l.includes('cozy')) {
    return { icon: 'users', bg: '#F5EBE1', text: '#78350F' };
  }
  if (l.includes('fast') || l.includes('quick') || l.includes('time') || l.includes('minute')) {
    return { icon: 'clock', bg: '#FEF9C3', text: '#A16207' };
  }
  if (l.includes('halal') || l.includes('safety') || l.includes('certified')) {
    return { icon: 'shield', bg: '#E8F5E9', text: '#16B86A' };
  }
  if (l.includes('bake') || l.includes('cake') || l.includes('dessert') || l.includes('sweet') || l.includes('love')) {
    return { icon: 'heart', bg: '#FDF2F8', text: '#BE185D' };
  }
  if (l.includes('chef') || l.includes('special') || l.includes('award') || l.includes('top') || l.includes('best')) {
    return { icon: 'award', bg: '#FAF0E6', text: '#8B4513' };
  }
  if (l.includes('star') || l.includes('rating') || l.includes('premium')) {
    return { icon: 'star', bg: '#FEF9C3', text: '#A16207' };
  }
  return { icon: 'utensils', bg: '#FFF1E6', text: '#EA580C' };
}

function normalizeHighlights(list) {
  if (!Array.isArray(list) || list.length === 0) return HIGHLIGHT_PRESETS.general;

  return list.slice(0, 4).map((item, idx) => {
    if (typeof item === 'string') {
      const style = guessIconStyle(item);
      return { id: `custom-${idx}`, label: item, ...style };
    }
    const style = guessIconStyle(item.label || '');
    return {
      id: item.id || `custom-${idx}`,
      label: item.label || item.name || 'Specialty',
      icon: item.icon || style.icon,
      bg: item.bg || item.bgColor || style.bg,
      text: item.text || item.textColor || style.text,
    };
  });
}

/**
 * getRestaurantHighlights — Resolves 4 highlight badges tailored to the restaurant.
 * @param {Object} restaurant
 * @returns {Array<{id: string, label: string, icon: string, bg: string, text: string}>}
 */
export function getRestaurantHighlights(restaurant) {
  if (!restaurant) return HIGHLIGHT_PRESETS.general;

  // 1. Explicit highlights configured by admin or API
  if (Array.isArray(restaurant.highlights) && restaurant.highlights.length > 0) {
    return normalizeHighlights(restaurant.highlights);
  }
  if (Array.isArray(restaurant.features) && restaurant.features.length > 0) {
    return normalizeHighlights(restaurant.features);
  }

  // 2. Smart auto-detection based on cuisineType, name, and description
  const cuisine = (restaurant.cuisineType || '').toLowerCase();
  const name = (restaurant.name || '').toLowerCase();
  const desc = (restaurant.description || '').toLowerCase();
  const text = `${cuisine} ${name} ${desc}`;

  // Biryani / Non-Veg / Grill / Tandoor
  if (
    text.includes('biryani') ||
    text.includes('kebab') ||
    text.includes('tandoor') ||
    text.includes('grill') ||
    text.includes('bbq') ||
    text.includes('mandi') ||
    text.includes('mutton') ||
    text.includes('non-veg') ||
    text.includes('non veg')
  ) {
    return HIGHLIGHT_PRESETS.biryani;
  }

  // Pure Veg / South Indian / Vegetarian / Tiffin
  if (
    text.includes('pure veg') ||
    text.includes('pure-veg') ||
    text.includes('vegetarian') ||
    text.includes('sattvic') ||
    text.includes('jain') ||
    text.includes('brahmin') ||
    text.includes('bhavan') ||
    (text.includes('tiffin') && !text.includes('chicken'))
  ) {
    return HIGHLIGHT_PRESETS.veg;
  }

  // Bakery & Desserts
  if (
    text.includes('bakery') ||
    text.includes('cake') ||
    text.includes('pastry') ||
    text.includes('bake') ||
    text.includes('patisserie') ||
    text.includes('cookies')
  ) {
    return HIGHLIGHT_PRESETS.bakery;
  }

  // Juices & Healthy Sips
  if (
    text.includes('juice') ||
    text.includes('smoothie') ||
    text.includes('shake') ||
    text.includes('fruit salad')
  ) {
    // If cafe is in the name, cafe preset takes higher precedence unless it's strictly a juice bar
    if (!text.includes('cafe') && !text.includes('café') && !text.includes('coffee')) {
      return HIGHLIGHT_PRESETS.juice;
    }
  }

  // Café / Coffee Shop / Tea Room
  if (
    text.includes('cafe') ||
    text.includes('café') ||
    text.includes('coffee') ||
    text.includes('tea') ||
    text.includes('chai') ||
    text.includes('brew')
  ) {
    return HIGHLIGHT_PRESETS.cafe;
  }

  // Fast Food / Pizza / Burgers
  if (
    text.includes('pizza') ||
    text.includes('burger') ||
    text.includes('fast food') ||
    text.includes('fastfood') ||
    text.includes('fried chicken') ||
    text.includes('wrap')
  ) {
    return HIGHLIGHT_PRESETS.fastfood;
  }

  // Fine Dining / Multi-Cuisine
  if (
    text.includes('fine dining') ||
    text.includes('multi-cuisine') ||
    text.includes('multicuisine') ||
    text.includes('continental') ||
    text.includes('lounge') ||
    text.includes('restobar') ||
    text.includes('bar & restaurant')
  ) {
    return HIGHLIGHT_PRESETS.finedining;
  }

  return HIGHLIGHT_PRESETS.general;
}
