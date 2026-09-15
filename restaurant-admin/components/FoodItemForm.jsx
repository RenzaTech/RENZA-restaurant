'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Flame, Leaf, AlertCircle, X, Sparkles, UtensilsCrossed, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectOption } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import ImageUploader from '@/components/ImageUploader';

const SPICY_LEVELS = [
  { value: 0, label: 'Zero Spice', icon: '—' },
  { value: 1, label: 'Mild', icon: '🌶' },
  { value: 2, label: 'Medium', icon: '🌶🌶' },
  { value: 3, label: 'Spicy', icon: '🌶🌶🌶' },
];

const TAGS_LIST = ['Jain', 'Vegan', 'Gluten-Free'];

export default function FoodItemForm({
  initialData = {},
  categories = [],
  onSubmit,
  submitting = false,
  submitLabel = 'Save Dish to Menu',
  uploadProgress = 0,
}) {
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const initialTags = Array.isArray(initialData.tags)
    ? initialData.tags
    : [
        ...(initialData.isJain ? ['Jain'] : []),
        ...(initialData.isVegan ? ['Vegan'] : []),
        ...(initialData.isGlutenFree ? ['Gluten-Free'] : []),
      ];

  const initialFoodType = initialData.foodType || (initialData.isVeg !== undefined ? (initialData.isVeg ? 'veg' : 'non-veg') : 'veg');
  const initialCategoryId = initialData.categoryId || initialData.category?.id || initialData.category?._id || '';

  const [form, setForm] = useState({
    name: initialData.name || '',
    price: initialData.price || '',
    foodType: initialFoodType,
    description: initialData.description || '',
    categoryId: initialCategoryId,
    ingredients: initialData.ingredients || '',
    spices: initialData.spices || '',
    allergens: initialData.allergens || '',
    portionSize: initialData.portionSize || '',
    prepTime: initialData.prepTime || '',
    calories: initialData.calories || '',
    spicyLevel: initialData.spicyLevel ?? 0,
    tags: initialTags,
    isAvailable: initialData.isAvailable !== undefined ? initialData.isAvailable : true,
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setDirect = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleTagToggle = (tag) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag)
        ? f.tags.filter((t) => t !== tag)
        : [...f.tags, tag],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (imageError) return;
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'tags') {
        formData.append('tags', JSON.stringify(value));
      } else if (key === 'categoryId') {
        if (value && value !== 'null' && value !== 'undefined') {
          formData.append('categoryId', value);
        } else {
          formData.append('categoryId', '');
        }
      } else {
        formData.append(key, value);
      }
    });

    // Explicitly append boolean dietary flags
    const isVeg = form.foodType === 'veg';
    const isJain = form.tags.includes('Jain');
    const isVegan = form.tags.includes('Vegan');
    const isGlutenFree = form.tags.includes('Gluten-Free');

    formData.append('isVeg', String(isVeg));
    formData.append('isJain', String(isJain));
    formData.append('isVegan', String(isVegan));
    formData.append('isGlutenFree', String(isGlutenFree));
    formData.append('specialTags', form.tags.join(', '));

    if (imageFile) {
      formData.append('image', imageFile);
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12 w-full">
      {/* ── CARD 1: PHOTO & ESSENTIAL DETAILS ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 lg:p-8 shadow-xs space-y-4 sm:space-y-6">
        {/* Photo Upload Zone */}
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
            Dish Photography
          </Label>
          <ImageUploader
            dishName={form.name}
            initialImageUrl={initialData.imageUrl || null}
            uploadProgress={uploadProgress}
            onFileChange={setImageFile}
            onValidationChange={setImageError}
          />
        </div>

        {/* Dish Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Dish Name <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g. Hyderabadi Dum Biryani"
            value={form.name}
            onChange={set('name')}
            required
            className="rounded-xl border-slate-200 text-xs h-11 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        {/* Row: Price & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Price (INR) <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm">₹</span>
              <Input
                id="price"
                type="number"
                placeholder="249"
                value={form.price}
                onChange={set('price')}
                required
                min="0"
                step="0.01"
                className="pl-8 rounded-xl border-slate-200 text-xs h-11 focus:ring-orange-500/20 focus:border-orange-500 font-mono font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Category
            </Label>
            <Select
              id="category"
              value={form.categoryId}
              onChange={set('categoryId')}
              className="rounded-xl border-slate-200 text-xs h-11 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <SelectOption value="">Select category...</SelectOption>
              {categories.map((cat) => {
                const catId = cat.id || cat._id;
                return (
                  <SelectOption key={catId} value={catId}>
                    {cat.name}
                  </SelectOption>
                );
              })}
            </Select>
          </div>
        </div>

        {/* Dietary Classification — Veg / Non-Veg */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Dietary Type <span className="text-rose-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {[
              { value: 'veg', label: 'Vegetarian (🌱)', isVeg: true },
              { value: 'non-veg', label: 'Non-Vegetarian (🍗)', isVeg: false },
            ].map(({ value, label, isVeg }) => (
              <button
                key={value}
                type="button"
                onClick={() => setDirect('foodType', value)}
                className={cn(
                  'h-11 sm:h-12 rounded-xl border-2 font-bold text-xs transition-all flex items-center justify-center gap-2',
                  form.foodType === value
                    ? isVeg
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs'
                      : 'border-rose-500 bg-rose-50 text-rose-800 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                )}
              >
                <span className={cn(
                  'w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center',
                  isVeg ? 'border-emerald-600' : 'border-rose-600'
                )}>
                  <span className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                  )} />
                </span>
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Dish Description
          </Label>
          <Textarea
            id="description"
            placeholder="Tell diners about the flavors, cooking style, or key ingredients..."
            value={form.description}
            onChange={set('description')}
            rows={3}
            className="rounded-xl border-slate-200 text-xs focus:ring-orange-500/20 focus:border-orange-500 resize-none"
          />
        </div>

        {/* Availability Toggle */}
        <div className="bg-slate-50/80 rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-900 text-xs">Live Stock Availability</p>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
              {form.isAvailable
                ? 'Dish is available and displayed to diners'
                : 'Dish will show as Sold Out on the digital menu'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={cn('text-[11px] sm:text-xs font-bold uppercase tracking-wider', form.isAvailable ? 'text-emerald-700' : 'text-slate-400')}>
              {form.isAvailable ? 'Available' : 'Sold Out'}
            </span>
            <Switch
              checked={form.isAvailable}
              onCheckedChange={(val) => setDirect('isAvailable', val)}
            />
          </div>
        </div>
      </div>

      {/* ── CARD 2: CULINARY ATTRIBUTES & NUTRITION (COLLAPSIBLE) ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-slate-900 text-xs sm:text-sm block truncate">Culinary Details & Nutrition</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 truncate block">Spice level, allergens, prep time, and dietary tags</span>
            </div>
          </div>
          {showMore ? (
            <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
          )}
        </button>

        {showMore && (
          <div className="p-4 sm:p-6 pt-2 space-y-4 sm:space-y-5 border-t border-slate-100">
            {/* Spicy Level */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Spiciness Meter</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SPICY_LEVELS.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDirect('spicyLevel', value)}
                    className={cn(
                      'flex flex-col items-center justify-center py-2 sm:py-2.5 px-2 rounded-xl border-2 transition-all text-xs font-bold gap-1',
                      form.spicyLevel === value
                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    )}
                  >
                    <span className="text-base leading-none">{icon}</span>
                    <span className="text-[11px] sm:text-xs truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Special Dietary Flags</Label>
              <div className="flex flex-wrap gap-2">
                {TAGS_LIST.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={cn(
                      'px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 text-xs font-bold transition-all',
                      form.tags.includes(tag)
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingredients & Spices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ingredients" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Ingredients
                </Label>
                <Input
                  id="ingredients"
                  placeholder="e.g. Paneer, Cream, Cashews"
                  value={form.ingredients}
                  onChange={set('ingredients')}
                  className="rounded-xl border-slate-200 text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="spices" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Key Spices
                </Label>
                <Input
                  id="spices"
                  placeholder="e.g. Cardamom, Mace, Saffron"
                  value={form.spices}
                  onChange={set('spices')}
                  className="rounded-xl border-slate-200 text-xs h-10"
                />
              </div>
            </div>

            {/* Allergens & Calories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="allergens" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Allergens Warning
                </Label>
                <Input
                  id="allergens"
                  placeholder="e.g. Dairy, Nuts, Gluten"
                  value={form.allergens}
                  onChange={set('allergens')}
                  className="rounded-xl border-slate-200 text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="calories" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Calories (kcal)
                </Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="e.g. 420"
                  value={form.calories}
                  onChange={set('calories')}
                  min="0"
                  className="rounded-xl border-slate-200 text-xs h-10 font-mono"
                />
              </div>
            </div>

            {/* Portion Size & Prep Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="portionSize" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Portion Size
                </Label>
                <Input
                  id="portionSize"
                  placeholder="e.g. 2 Servings / 350g"
                  value={form.portionSize}
                  onChange={set('portionSize')}
                  className="rounded-xl border-slate-200 text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prepTime" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Preparation Time
                </Label>
                <Input
                  id="prepTime"
                  placeholder="e.g. 15-20 mins"
                  value={form.prepTime}
                  onChange={set('prepTime')}
                  className="rounded-xl border-slate-200 text-xs h-10"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── ACTION SUBMIT BUTTON ── */}
      <Button
        type="submit"
        className="w-full h-12 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500 to-teal-600 hover:from-orange-600 hover:to-teal-700 text-white shadow-md shadow-orange-500/20"
        disabled={submitting}
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Uploading & Saving Dish...
          </span>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
