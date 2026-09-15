'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, ChevronRight, LayoutList, Check, X, FolderTree, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

function CategorySkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex items-center gap-4">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="w-8 h-8 rounded-lg" />
      <Skeleton className="w-8 h-8 rounded-lg" />
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const toggleExpand = (catId) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const fetchCategories = useCallback(() => {
    setLoading(true);
    api.get('/api/restaurant/categories')
      .then((res) => {
        const cats = res.data?.categories || res.data || [];
        setCategories(Array.isArray(cats) ? cats.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) : []);
      })
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = async () => {
    const name = newCatName.trim();
    if (!name) return;
    setAdding(true);
    try {
      const res = await api.post('/api/restaurant/categories', { name, sortOrder: categories.length });
      const newCat = res.data?.category || res.data;
      setCategories((prev) => [...prev, newCat]);
      setNewCatName('');
      setShowAddInput(false);
      toast.success('Category created');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to add category');
    } finally {
      setAdding(false);
    }
  };

  const handleEditSave = async (cat) => {
    const name = editName.trim();
    const catId = cat.id || cat._id;
    if (!name || name === cat.name) {
      setEditId(null);
      return;
    }
    setSavingEdit(true);
    try {
      await api.put(`/api/restaurant/categories/${catId}`, { name });
      setCategories((prev) =>
        prev.map((c) => (c.id === catId || c._id === catId) ? { ...c, name } : c)
      );
      toast.success('Category updated');
      setEditId(null);
    } catch (err) {
      toast.error('Failed to update category');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const catId = deleteTarget.id || deleteTarget._id;
    setDeleting(true);
    try {
      await api.delete(`/api/restaurant/categories/${catId}`);
      setCategories((prev) => prev.filter((c) => (c.id !== catId && c._id !== catId)));
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to delete category';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleReorder = async (index, direction) => {
    const newCats = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCats.length) return;
    [newCats[index], newCats[targetIndex]] = [newCats[targetIndex], newCats[index]];
    setCategories(newCats);

    const updates = newCats.map((cat, i) => {
      const catId = cat.id || cat._id;
      return api.put(`/api/restaurant/categories/${catId}`, { sortOrder: i }).catch(() => {});
    });
    await Promise.all(updates);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Menu Categories</h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Organize the sections of your menu (e.g. Starters, Main Course, Biryani, Desserts, Drinks)
          </p>
        </div>
        <Button
          onClick={() => {
            setShowAddInput(true);
            setNewCatName('');
          }}
          className="w-full sm:w-auto justify-center bg-gradient-to-r from-orange-500 to-teal-600 hover:from-orange-600 hover:to-teal-700 text-white font-bold gap-2 shadow-sm rounded-xl px-4 py-2.5 h-auto text-xs"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Add Category Form */}
      {showAddInput && (
        <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-orange-900">Create New Category</h3>
          <Input
            placeholder="Category name (e.g. Tandoori Starters, Biryani, Beverages, Desserts)"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
            className="bg-white rounded-xl border-orange-200 text-xs h-11 focus:ring-orange-500/20 focus:border-orange-500"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleAdd}
              disabled={adding || !newCatName.trim()}
              className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold h-9"
            >
              {adding ? 'Creating...' : 'Save Category'}
            </Button>
            <Button
              variant="outline"
              onClick={() => { setShowAddInput(false); setNewCatName(''); }}
              disabled={adding}
              className="flex-1 sm:flex-none rounded-xl text-xs font-bold h-9 bg-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Category List */}
      <div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <CategorySkeleton key={i} />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
              <FolderTree className="w-7 h-7 sm:w-8 sm:h-8 text-orange-400" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base mb-1">No categories added yet</h3>
            <p className="text-slate-400 text-xs max-w-sm mb-6 leading-relaxed">
              Categories create sticky navigation pills on diners&apos; phones to help them browse easily.
            </p>
            <Button
              onClick={() => setShowAddInput(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-2 text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              Add First Category
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            {categories.map((cat, index) => {
              const catId = cat.id || cat._id;
              const isEditing = editId === catId;
              const foodCount = cat._count?.foodItems || cat.foodCount || 0;

              const isExpanded = expandedCategories.has(catId);
              const foodList = cat.foodItems || [];

              return (
                <div
                  key={catId}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 sm:p-5 hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-center gap-2.5 sm:gap-4">
                    {/* Category icon/badge */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-[11px] sm:text-xs flex-shrink-0 border border-orange-100">
                      #{index + 1}
                    </div>

                    {/* Name or Edit Input */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleEditSave(cat)}
                            autoFocus
                            className="h-8 sm:h-9 text-xs rounded-xl"
                          />
                          <button
                            onClick={() => handleEditSave(cat)}
                            disabled={savingEdit}
                            className="p-1.5 sm:p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="p-1.5 sm:p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleExpand(catId)}
                          className="w-full text-left min-w-0 group"
                        >
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate group-hover:text-orange-600 transition-colors">
                              {cat.name}
                            </h3>
                            <ChevronRight
                              className={cn(
                                'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
                                isExpanded && 'rotate-90 text-orange-500'
                              )}
                            />
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
                            {foodCount} {foodCount === 1 ? 'dish' : 'dishes'} in this section • click to {isExpanded ? 'hide' : 'view'}
                          </p>
                        </button>
                      )}
                    </div>

                    {/* Reorder Up/Down */}
                    <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleReorder(index, 'up')}
                        disabled={index === 0}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-25 disabled:pointer-events-none transition-colors"
                        title="Move up"
                      >
                        <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleReorder(index, 'down')}
                        disabled={index === categories.length - 1}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-25 disabled:pointer-events-none transition-colors"
                        title="Move down"
                      >
                        <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    {/* Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 sm:gap-1.5 pl-1.5 sm:pl-2 border-l border-slate-100 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditId(catId);
                            setEditName(cat.name);
                          }}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                          title="Rename category"
                        >
                          <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded Dish List */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-100">
                      {foodList.length > 0 ? (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Assigned Dishes ({foodList.length})
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {foodList.map((dish) => (
                              <div
                                key={dish.id}
                                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-xs"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={cn(
                                      'w-2 h-2 rounded-full flex-shrink-0',
                                      dish.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                                    )}
                                    title={dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                                  />
                                  <span className="font-semibold text-slate-800 truncate">{dish.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <span className="font-bold text-slate-900">₹{dish.price}</span>
                                  <span
                                    className={cn(
                                      'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider',
                                      dish.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                    )}
                                  >
                                    {dish.isAvailable ? 'Avail' : 'Out'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="py-3 px-4 bg-slate-50 rounded-xl text-center">
                          <p className="text-xs text-slate-400">
                            No dishes assigned to this category yet. Dishes can be assigned when adding or editing in Menu & Stock.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Delete &quot;{deleteTarget?.name}&quot;?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed mt-1">
              Dishes in this category will not be deleted, but will become uncategorized.
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
              {deleting ? 'Deleting...' : 'Delete Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
