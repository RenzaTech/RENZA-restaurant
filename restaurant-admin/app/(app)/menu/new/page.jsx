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
    <div className="flex flex-col min-h-full">
      {/* Sub-header */}
      <div className="sticky top-14 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Add Food Item</h1>
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
