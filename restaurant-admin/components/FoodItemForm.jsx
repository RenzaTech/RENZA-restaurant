'use client';

import { useState, useRef } from 'react';
import { Camera, ChevronDown, ChevronUp, Flame, Leaf, AlertCircle, X, Sparkles, UtensilsCrossed, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectOption } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

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
}) {
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(initialData.imageUrl || null);
  const [imageFile, setImageFile] = useState(null);
  const [showMore, setShowMore] = useState(false);

  const [form, setForm] = useState({
    name: initialData.name || '',
    price: initialData.price || '',
    foodType: initialData.foodType || 'veg',
    description: initialData.description || '',
    categoryId: initialData.category?._id || initialData.categoryId || '',
    ingredients: initialData.ingredients || '',
    spices: initialData.spices || '',
    allergens: initialData.allergens || '',
    portionSize: initialData.portionSize || '',
    prepTime: initialData.prepTime || '',
    calories: initialData.calories || '',
    spicyLevel: initialData.spicyLevel ?? 0,
    tags: initialData.tags || [],
    isAvailable: initialData.isAvailable !== undefined ? initialData.isAvailable : true,
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setDirect = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

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
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'tags') {
        formData.append('tags', JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });
    if (imageFile) {
      formData.append('image', imageFile);
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* ── CARD 1: PHOTO & ESSENTIAL DETAILS ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Photo Upload Zone */}
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
            Dish Photography
          </Label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'w-full h-52 rounded-2xl flex flex-col items-center justify-center transition-all relative overflow-hidden group',
              imagePreview
                ? 'border border-slate-200 shadow-xs'
                : 'border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-orange-50/50 hover:border-orange-300'
            )}
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Food preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                  <div className="bg-white/95 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
                    <Camera className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-800">Change Photo</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-orange-100/80 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Camera className="w-7 h-7 text-orange-600" />
                </div>
                <p className="text-slate-700 font-bold text-xs">Tap or drop photo here</p>
                <p className="text-slate-400 text-[11px] mt-1">Uploads automatically to Cloudinary WebP</p>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              {categories.map((cat) => (
                <SelectOption key={cat._id || cat.id} value={cat._id || cat.id}>
                  {cat.name}
                </SelectOption>
              ))}
            </Select>
          </div>
        </div>

        {/* Dietary Classification — Veg / Non-Veg */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Dietary Type <span className="text-rose-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'veg', label: 'Vegetarian (🌱)', isVeg: true },
              { value: 'non-veg', label: 'Non-Vegetarian (🍗)', isVeg: false },
            ].map(({ value, label, isVeg }) => (
              <button
                key={value}
                type="button"
                onClick={() => setDirect('foodType', value)}
                className={cn(
                  'h-12 rounded-xl border-2 font-bold text-xs transition-all flex items-center justify-center gap-2',
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
                <span>{label}</span>
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
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900 text-xs">Live Stock Availability</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {form.isAvailable
                ? 'Dish is available and displayed to diners'
                : 'Dish will show as Sold Out on the digital menu'}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className={cn('text-xs font-bold uppercase tracking-wider', form.isAvailable ? 'text-emerald-700' : 'text-slate-400')}>
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
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm block">Culinary Details & Nutrition</span>
              <span className="text-[11px] text-slate-400">Spice level, allergens, prep time, and dietary tags</span>
            </div>
          </div>
          {showMore ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {showMore && (
          <div className="p-6 pt-2 space-y-5 border-t border-slate-100">
            {/* Spicy Level */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Spiciness Meter</Label>
              <div className="grid grid-cols-4 gap-2">
                {SPICY_LEVELS.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDirect('spicyLevel', value)}
                    className={cn(
                      'flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all text-xs font-bold gap-1',
                      form.spicyLevel === value
                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    )}
                  >
                    <span className="text-base leading-none">{icon}</span>
                    <span>{label}</span>
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
                      'px-4 py-2 rounded-xl border-2 text-xs font-bold transition-all',
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        className="w-full h-12 text-xs font-bold rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20"
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
