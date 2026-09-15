'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import FoodItemForm from '@/components/FoodItemForm';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function NewFoodItemPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    api.get('/api/restaurant/categories')
      .then((res) => {
        const cats = res.data?.categories || res.data || [];
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setUploadProgress(0);
    try {
      await api.post('/api/restaurant/foods', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) setUploadProgress(Math.round((event.loaded * 100) / event.total));
        },
      });
      toast.success('Food item added!');
      router.push('/menu');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add food item';
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
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Add Food Item</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Upload dish photography, specify pricing, dietary flags, and nutritional details for diners.
            </p>
          </div>
        </div>
      </div>

      <FoodItemForm
        categories={categories}
        onSubmit={handleSubmit}
        submitting={submitting}
        uploadProgress={uploadProgress}
        submitLabel="Save Food Item"
      />
    </div>
  );
}
