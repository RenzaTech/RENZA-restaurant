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
        setItem({
          ...food,
          imageUrl: rawImg
            ? (rawImg.startsWith('http') ? rawImg : `${API_URL}${rawImg}`)
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
        headers: { 'Content-Type': 'multipart/form-data' },
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Page Heading & Back navigation */}
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-3 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Menu & Stock</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Edit Food Item</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Update dish photography, pricing, culinary details, and live availability.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 w-full">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
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
