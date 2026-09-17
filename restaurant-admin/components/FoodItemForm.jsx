'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  UtensilsCrossed,
  Eye,
  Camera,
  Check,
  Flame,
  Clock,
  Scale,
  Zap,
} from 'lucide-react';
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

const TAGS_LIST = [
  { name: 'Jain', emoji: '🪔', color: 'border-purple-200 bg-purple-50 text-purple-800' },
  { name: 'Vegan', emoji: '🥗', color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  { name: 'Gluten-Free', emoji: '🌾', color: 'border-amber-200 bg-amber-50 text-amber-800' },
];

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
  const [livePreviewUrl, setLivePreviewUrl] = useState(initialData.imageUrl || null);
  const [removeFrontImage, setRemoveFrontImage] = useState(false);

  const [topViewImageFile, setTopViewImageFile] = useState(null);
  const [topViewImageError, setTopViewImageError] = useState(false);
  const [liveTopPreviewUrl, setLiveTopPreviewUrl] = useState(initialData.topViewImageUrl || null);
  const [removeTopViewImage, setRemoveTopViewImage] = useState(false);

  const [activeAngleTab, setActiveAngleTab] = useState('front');
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (initialData.imageUrl) {
      setLivePreviewUrl(initialData.imageUrl);
    }
    if (initialData.topViewImageUrl) {
      setLiveTopPreviewUrl(initialData.topViewImageUrl);
    }
  }, [initialData.imageUrl, initialData.topViewImageUrl]);

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
    if (imageError || topViewImageError) return;
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

    // Primary Front View Image
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (removeFrontImage) {
      formData.append('removeImage', 'true');
    }

    // Secondary Top View Image
    if (topViewImageFile) {
      formData.append('topViewImage', topViewImageFile);
    } else if (removeTopViewImage) {
      formData.append('removeTopViewImage', 'true');
    }

    onSubmit(formData);
  };

  const isVeg = form.foodType === 'veg';
  const selectedCategoryName =
    categories.find((c) => (c.id || c._id) === form.categoryId)?.name || '';

  return (
    <form onSubmit={handleSubmit} className="w-full pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ── LEFT COLUMN: DISH DETAILS & CONFIGURATION (7 COLS) ── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Core Dish Details */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Dish Information</h3>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Primary details shown to diners on your digital menu
                </p>
              </div>
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
                className="rounded-xl border-slate-200 text-xs sm:text-sm h-11 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Price (INR) <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <Input
                    id="price"
                    type="number"
                    placeholder="249"
                    value={form.price}
                    onChange={set('price')}
                    required
                    min="0"
                    step="0.01"
                    className="pl-8 rounded-xl border-slate-200 text-xs sm:text-sm h-11 focus:ring-orange-500/20 focus:border-orange-500 font-mono font-bold"
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
                  className="rounded-xl border-slate-200 text-xs sm:text-sm h-11 focus:ring-orange-500/20 focus:border-orange-500"
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

            {/* Dietary Classification */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Dietary Classification <span className="text-rose-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'veg', label: 'Vegetarian', emoji: '🌱', isVegOption: true },
                  { value: 'non-veg', label: 'Non-Vegetarian', emoji: '🍗', isVegOption: false },
                ].map(({ value, label, emoji, isVegOption }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDirect('foodType', value)}
                    className={cn(
                      'h-12 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-2.5 px-3',
                      form.foodType === value
                        ? isVegOption
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs'
                          : 'border-rose-500 bg-rose-50 text-rose-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
                    )}
                  >
                    <span
                      className={cn(
                        'w-4 h-4 rounded-xs border-2 flex items-center justify-center shrink-0',
                        isVegOption ? 'border-emerald-600' : 'border-rose-600'
                      )}
                    >
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          isVegOption ? 'bg-emerald-600' : 'bg-rose-600'
                        )}
                      />
                    </span>
                    <span className="truncate">{label}</span>
                    <span className="text-sm">{emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Dish Description
                </Label>
                <span className="text-[10px] text-slate-400">Optional</span>
              </div>
              <Textarea
                id="description"
                placeholder="Describe flavors, preparation style, or highlight signature ingredients..."
                value={form.description}
                onChange={set('description')}
                rows={3}
                className="rounded-xl border-slate-200 text-xs sm:text-sm focus:ring-orange-500/20 focus:border-orange-500 resize-none"
              />
            </div>
          </div>

          {/* Card 2: Stock & Live Availability */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900 text-xs sm:text-sm">Live Stock Availability</p>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
                    form.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  )}
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      form.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    )}
                  />
                  {form.isAvailable ? 'In Stock' : 'Sold Out'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {form.isAvailable
                  ? 'Dish is available and can be ordered by diners.'
                  : 'Dish is shown as Sold Out on the digital QR menu.'}
              </p>
            </div>
            <div className="shrink-0">
              <Switch
                checked={form.isAvailable}
                onCheckedChange={(val) => setDirect('isAvailable', val)}
              />
            </div>
          </div>

          {/* Card 3: Culinary Details & Nutrition (Accordion) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm block truncate">
                    Culinary Details & Nutrition
                  </span>
                  <span className="text-[11px] text-slate-400 truncate block">
                    Spice level, dietary tags, allergens, and prep time
                  </span>
                </div>
              </div>
              {showMore ? (
                <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
              )}
            </button>

            {showMore && (
              <div className="p-5 sm:p-6 pt-2 space-y-5 border-t border-slate-100">
                {/* Spicy Level */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Spiciness Meter
                    </Label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SPICY_LEVELS.map(({ value, label, icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setDirect('spicyLevel', value)}
                        className={cn(
                          'flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border-2 transition-all text-xs font-bold gap-1',
                          form.spicyLevel === value
                            ? 'border-orange-500 bg-orange-50 text-orange-800 shadow-xs ring-2 ring-orange-500/20'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                        )}
                      >
                        <span className="text-sm leading-none">{icon}</span>
                        <span className="text-[11px] truncate">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Tags */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Special Dietary Tags
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {TAGS_LIST.map(({ name, emoji, color }) => {
                      const isSelected = form.tags.includes(name);
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => handleTagToggle(name)}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 text-xs font-bold transition-all',
                            isSelected
                              ? `${color} ring-2 ring-emerald-500/20 shadow-xs`
                              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                          )}
                        >
                          <span>{emoji}</span>
                          <span>{name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ingredients & Spices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ingredients" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Key Ingredients
                    </Label>
                    <Input
                      id="ingredients"
                      placeholder="e.g. Cottage cheese, Cashew gravy"
                      value={form.ingredients}
                      onChange={set('ingredients')}
                      className="rounded-xl border-slate-200 text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="spices" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Signature Spices
                    </Label>
                    <Input
                      id="spices"
                      placeholder="e.g. Green cardamom, Mace, Saffron"
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
                      Allergens Information
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
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <Label htmlFor="calories" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Calories (kcal)
                      </Label>
                    </div>
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
                    <div className="flex items-center gap-1">
                      <Scale className="w-3 h-3 text-slate-400" />
                      <Label htmlFor="portionSize" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Portion Size
                      </Label>
                    </div>
                    <Input
                      id="portionSize"
                      placeholder="e.g. 2 Servings / 350g"
                      value={form.portionSize}
                      onChange={set('portionSize')}
                      className="rounded-xl border-slate-200 text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <Label htmlFor="prepTime" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Preparation Time
                      </Label>
                    </div>
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

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-xs sm:text-sm font-bold rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-teal-600 hover:from-orange-600 hover:to-teal-700 text-white shadow-md shadow-orange-500/20 transition-all duration-200"
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving Changes...
              </span>
            ) : (
              submitLabel
            )}
          </Button>
        </div>

        {/* ── RIGHT COLUMN: DISH PHOTOGRAPHY & LIVE PREVIEW (5 COLS) ── */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          {/* Card A: Dish Photography (Dual Views: Front & Top) */}
          <div className="space-y-4">
            {/* View Selector Tabs */}
            <div className="flex rounded-2xl bg-white border border-slate-200/80 p-1.5 gap-1.5 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveAngleTab('front')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer',
                  activeAngleTab === 'front'
                    ? 'bg-gradient-to-r from-orange-500 to-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>1. Front View</span>
                {livePreviewUrl ? (
                  <span className={cn('w-2 h-2 rounded-full', activeAngleTab === 'front' ? 'bg-white' : 'bg-emerald-500')} title="Front photo uploaded" />
                ) : (
                  <span className={cn('text-[10px] font-normal opacity-70', activeAngleTab === 'front' ? 'text-white' : 'text-slate-400')}>+ Add</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveAngleTab('top')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer',
                  activeAngleTab === 'top'
                    ? 'bg-gradient-to-r from-orange-500 to-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>2. Top View</span>
                {liveTopPreviewUrl ? (
                  <span className={cn('w-2 h-2 rounded-full', activeAngleTab === 'top' ? 'bg-white' : 'bg-emerald-500')} title="Top photo uploaded" />
                ) : (
                  <span className={cn('text-[10px] font-normal opacity-70', activeAngleTab === 'top' ? 'text-white' : 'text-slate-400')}>+ Add</span>
                )}
              </button>
            </div>

            {/* Active Angle Uploader Slot */}
            {activeAngleTab === 'front' ? (
              <ImageUploader
                key="front-uploader"
                title="Front View (Plating Profile)"
                badge="Primary Photo"
                description="Side/45° angle showcasing plating presentation and dish height."
                dishName={form.name}
                initialImageUrl={initialData.imageUrl || null}
                uploadProgress={uploadProgress}
                onFileChange={(f) => {
                  setImageFile(f);
                  if (f) setRemoveFrontImage(false);
                }}
                onPreviewChange={setLivePreviewUrl}
                onValidationChange={setImageError}
                onRemove={() => {
                  setImageFile(null);
                  setLivePreviewUrl(null);
                  setRemoveFrontImage(true);
                }}
              />
            ) : (
              <ImageUploader
                key="top-uploader"
                title="Top View (Overhead Angle)"
                badge="Aerial Photo"
                description="Bird's-eye angle highlighting garnishes, textures, and ingredient spread."
                dishName={form.name}
                initialImageUrl={initialData.topViewImageUrl || null}
                uploadProgress={uploadProgress}
                onFileChange={(f) => {
                  setTopViewImageFile(f);
                  if (f) setRemoveTopViewImage(false);
                }}
                onPreviewChange={setLiveTopPreviewUrl}
                onValidationChange={setTopViewImageError}
                onRemove={() => {
                  setTopViewImageFile(null);
                  setLiveTopPreviewUrl(null);
                  setRemoveTopViewImage(true);
                }}
              />
            )}
          </div>

          {/* Card B: Real-Time Live Diner Menu Preview */}
          <div className="bg-gradient-to-b from-slate-50/90 to-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Live Customer Preview
                </h4>
              </div>

              {/* Angle Switcher on Preview */}
              {(livePreviewUrl || liveTopPreviewUrl) ? (
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveAngleTab('front')}
                    className={cn(
                      'px-2 py-0.5 rounded-lg transition-all',
                      activeAngleTab === 'front'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    Front View
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAngleTab('top')}
                    className={cn(
                      'px-2 py-0.5 rounded-lg transition-all',
                      activeAngleTab === 'top'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    Top View
                  </button>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  Real-Time
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              Here is how diners will see this dish in their mobile web menu:
            </p>

            {/* Mobile Menu Dish Card Replica */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-200">
              <div className="flex items-start justify-between gap-3">
                {/* Left details */}
                <div className="flex-1 min-w-0 space-y-1.5 pr-1">
                  {/* Veg Indicator & Badges */}
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border-2',
                        isVeg ? 'border-emerald-600' : 'border-rose-600'
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                        )}
                      />
                    </span>

                    {form.isAvailable ? (
                      <span className="text-[10px] font-bold text-emerald-600">
                        {selectedCategoryName || 'Menu Item'}
                      </span>
                    ) : (
                      <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-600">
                        Sold Out
                      </span>
                    )}

                    {/* Dual photo indicator badge */}
                    {(livePreviewUrl && liveTopPreviewUrl) && (
                      <span className="rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 text-[9px] font-bold">
                        2 Angles
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h5 className="text-sm font-black text-slate-900 line-clamp-1 leading-snug">
                    {form.name.trim() || 'Dish Name'}
                  </h5>

                  {/* Dietary Chips */}
                  <div className="flex flex-wrap gap-1">
                    {form.spicyLevel === 1 && (
                      <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.2 text-[9px] font-bold bg-orange-50 text-orange-800 border border-orange-200">
                        🌶 Mild
                      </span>
                    )}
                    {form.spicyLevel === 2 && (
                      <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.2 text-[9px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        🌶🌶 Spicy
                      </span>
                    )}
                    {form.spicyLevel >= 3 && (
                      <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.2 text-[9px] font-bold bg-red-100 text-red-900 border border-red-300">
                        🌶🌶🌶 Extra Spicy
                      </span>
                    )}
                    {form.tags.includes('Jain') && (
                      <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.2 text-[9px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                        🪔 Jain
                      </span>
                    )}
                    {form.tags.includes('Vegan') && (
                      <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.2 text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        🥗 Vegan
                      </span>
                    )}
                    {form.tags.includes('Gluten-Free') && (
                      <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.2 text-[9px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        🌾 Gluten-Free
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {form.description.trim() ||
                      'Flavorful culinary creation made fresh with signature ingredients.'}
                  </p>

                  {/* Price */}
                  <div className="pt-1">
                    <span className="text-sm font-black text-slate-900 font-mono">
                      ₹
                      {Number(form.price) > 0
                        ? Number(form.price).toFixed(2)
                        : '0.00'}
                    </span>
                  </div>
                </div>

                {/* Right Photo Thumbnail with active angle preview */}
                {(() => {
                  const currentPreview =
                    activeAngleTab === 'top'
                      ? (liveTopPreviewUrl || livePreviewUrl)
                      : (livePreviewUrl || liveTopPreviewUrl);
                  const isTopPhotoShowing = currentPreview === liveTopPreviewUrl && Boolean(liveTopPreviewUrl);

                  return (
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 shadow-2xs">
                      {currentPreview ? (
                        <>
                          <Image
                            src={currentPreview}
                            alt={form.name || 'Dish preview'}
                            fill
                            unoptimized={currentPreview.startsWith('blob:')}
                            className={cn(
                              'object-cover transition-transform duration-300',
                              !form.isAvailable && 'grayscale'
                            )}
                          />
                          <span className="absolute bottom-1 left-1 z-10 text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white backdrop-blur-xs">
                            {isTopPhotoShowing ? 'Top View' : 'Front View'}
                          </span>
                        </>
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center text-slate-400 bg-slate-50">
                          <UtensilsCrossed className="w-5 h-5 text-slate-300 mb-1" />
                          <span className="text-[9px] font-bold text-slate-400">
                            No Photo
                          </span>
                        </div>
                      )}

                      {!form.isAvailable && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-2xs">
                          <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              Diners scan the table QR code to view this live card and can toggle between Front &amp; Top views.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
