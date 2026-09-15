'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Pencil, Trash2, UtensilsCrossed, Search, Filter, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const FILTERS = ['All', 'Available', 'Sold Out'];

function FoodItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 sm:p-4 flex gap-3 sm:gap-4">
      <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center gap-2 mt-3 pt-2">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-lg ml-auto" />
          <Skeleton className="h-7 w-7 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function FoodItemCard({ item, onToggle, onEdit, onDelete }) {
  const [toggling, setToggling] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const itemId = item.id || item._id;

  const handleToggle = async () => {
    setToggling(true);
    const newState = !item.isAvailable;
    // Optimistic update
    onToggle(itemId, newState);
    try {
      await api.patch(`/api/restaurant/foods/${itemId}/availability`, {
        isAvailable: newState,
      });
      toast.success(newState ? `${item.name} marked Available` : `${item.name} marked Sold Out`);
    } catch (err) {
      // Revert on failure
      onToggle(itemId, !newState);
      toast.error('Failed to update dish availability');
    } finally {
      setToggling(false);
    }
  };

  const rawImage = item.imageUrl || item.image;
  const imageUrl = rawImage
    ? rawImage.startsWith('http') ? rawImage : `${API_URL}${rawImage}`
    : null;

  const isVeg = item.isVeg === true || item.foodType === 'veg';

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between",
      !item.isAvailable && "bg-slate-50/70 border-slate-200"
    )}>
      <div className="flex gap-3 sm:gap-4 p-3.5 sm:p-4">
        {/* Food Image */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200/80 relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.name}
              fill
              sizes="96px"
              className={cn("object-cover transition-opacity", !item.isAvailable && "opacity-60")}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
              <UtensilsCrossed className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-[9px] text-slate-400 mt-1 font-medium">No photo</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1.5 sm:gap-2 mb-1">
            {/* Veg/Non-veg FSSAI dot */}
            <span
              className={cn(
                'mt-1 w-3.5 h-3.5 rounded-sm border-2 flex-shrink-0 flex items-center justify-center',
                isVeg ? 'border-emerald-600' : 'border-rose-600'
              )}
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                )}
              />
            </span>
            <h3 className={cn("font-bold text-slate-900 text-sm leading-snug truncate", !item.isAvailable && "text-slate-500")}>
              {item.name}
            </h3>
          </div>

          <p className="text-slate-900 font-black text-sm sm:text-base">₹{item.price}</p>

          {item.category?.name && (
            <span className="inline-block text-[10px] sm:text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-1 truncate max-w-full">
              {item.category.name}
            </span>
          )}

          {item.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Bottom bar: Availability Toggle + Actions */}
      <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Availability Toggle */}
        <div className="flex items-center gap-2">
          <Switch
            checked={item.isAvailable}
            onCheckedChange={handleToggle}
            disabled={toggling}
          />
          <span className={cn(
            'text-[11px] sm:text-xs font-bold tracking-wide uppercase',
            item.isAvailable ? 'text-emerald-700' : 'text-rose-600'
          )}>
            {item.isAvailable ? 'Available' : 'Sold Out'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(itemId)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-300 transition-colors shadow-2xs"
            title="Edit dish"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 transition-colors shadow-2xs"
            title="Delete dish"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(() => {
    setLoading(true);
    api.get('/api/restaurant/foods')
      .then((res) => {
        const foods = res.data?.foods || res.data || [];
        setItems(Array.isArray(foods) ? foods : []);
      })
      .catch((err) => {
        if (err.response?.status !== 401) toast.error('Failed to load menu dishes');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleToggleAvailability = (id, newState) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id || item._id === id) ? { ...item, isAvailable: newState } : item)
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id || deleteTarget._id;
    setDeleting(true);
    try {
      await api.delete(`/api/restaurant/foods/${targetId}`);
      setItems((prev) => prev.filter((i) => (i.id !== targetId && i._id !== targetId)));
      toast.success(`"${deleteTarget.name}" deleted from menu`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Failed to delete dish');
    } finally {
      setDeleting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesFilter =
      filter === 'All'
        ? true
        : filter === 'Available'
        ? item.isAvailable
        : !item.isAvailable;
    const matchesSearch = search
      ? item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.name?.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* ── HEADER & TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Menu Dishes & Stock</h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Total {items.length} dishes • {items.filter((i) => i.isAvailable).length} Available •{' '}
            {items.filter((i) => !i.isAvailable).length} Sold Out
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => router.push('/menu/new')}
            className="w-full sm:w-auto justify-center bg-gradient-to-r from-orange-500 to-teal-600 hover:from-orange-600 hover:to-teal-700 text-white font-bold gap-2 shadow-sm rounded-xl px-4 py-2.5 h-auto text-xs"
          >
            <Plus className="w-4 h-4" />
            Add New Dish
          </Button>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes by name or category..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs w-full sm:w-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'flex-1 sm:flex-none py-1.5 px-3 sm:px-3.5 rounded-lg text-xs font-bold transition-all text-center',
                filter === f
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── FOOD ITEMS RESPONSIVE GRID ── */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <FoodItemSkeleton key={i} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
              <UtensilsCrossed className="w-8 h-8 text-orange-400" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">
              {search ? 'No matching dishes found' : filter === 'All' ? 'No food items in menu yet' : `No ${filter.toLowerCase()} dishes`}
            </h3>
            <p className="text-slate-400 text-xs max-w-sm mb-6 leading-relaxed">
              {search
                ? 'Try searching with a different keyword or clear the search input.'
                : 'Start showcasing your food to diners by adding your signature recipes.'}
            </p>
            <Button
              onClick={() => {
                if (search) setSearch('');
                else router.push('/menu/new');
              }}
              className="gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold"
            >
              {search ? 'Clear Search' : <><Plus className="w-4 h-4" /> Add First Dish</>}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <FoodItemCard
                key={item.id || item._id}
                item={item}
                onToggle={handleToggleAvailability}
                onEdit={(id) => router.push(`/menu/${id}/edit`)}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md p-6 bg-white rounded-2xl border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Delete &quot;{deleteTarget?.name}&quot;?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed mt-1">
              This action cannot be undone. This food item will be permanently removed from your digital menu and table QR display.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              {deleting ? 'Deleting...' : 'Delete Dish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
