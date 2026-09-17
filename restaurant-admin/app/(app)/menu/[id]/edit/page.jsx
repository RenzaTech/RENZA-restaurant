'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import FoodItemForm from '@/components/FoodItemForm';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function EditFoodItemPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [item, setItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    Promise.all([
      api.get(`/api/restaurant/foods/${id}`),
      api.get('/api/restaurant/categories'),
    ])
      .then(([foodRes, catRes]) => {
        const food = foodRes.data?.food || foodRes.data;
        const rawImg = food.imageUrl || food.image;
        const rawTopImg = food.topViewImageUrl || food.top_view_image_url;
        setItem({
          ...food,
          imageUrl: rawImg
            ? (rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`)
            : null,
          topViewImageUrl: rawTopImg
            ? (rawTopImg.startsWith('http') ? rawTopImg : `${API_URL}${rawTopImg}`)
            : null,
        });
        const cats = catRes.data?.categories || catRes.data || [];
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch(() => {
        toast.error('Failed to load item');
        router.back();
      })
      .finally(() => setLoading(false));
  }, [API_URL, id, router]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setUploadProgress(0);
    try {
      await api.put(`/api/restaurant/foods/${id}`, formData, {
        onUploadProgress: (event) => {
          if (event.total) setUploadProgress(Math.round((event.loaded * 100) / event.total));
        },
      });
      toast.success('Food item updated!');
      router.push('/menu');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to update food item';
      toast.error(msg);
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Page Heading & Breadcrumb navigation */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Menu & Stock</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                {item?.name ? `Edit: ${item.name}` : 'Edit Food Item'}
              </h2>
              {item && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    item.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  {item.isAvailable ? 'Live on Menu' : 'Sold Out'}
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
              Update dish photography, pricing, culinary details, and live diner availability.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-7 space-y-5">
            <Skeleton className="h-72 w-full rounded-3xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-5 space-y-5">
            <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
            <Skeleton className="h-48 w-full rounded-3xl" />
          </div>
        </div>
      ) : (
        <FoodItemForm
          initialData={item}
          categories={categories}
          onSubmit={handleSubmit}
          submitting={submitting}
          uploadProgress={uploadProgress}
          submitLabel="Update Food Item"
        />
      )}
    </div>
  );
}
