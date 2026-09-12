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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    Promise.all([
      api.get(`/api/restaurant/foods/${id}`),
      api.get('/api/restaurant/categories'),
    ])
      .then(([foodRes, catRes]) => {
        const food = foodRes.data?.food || foodRes.data;
        setItem({
          ...food,
          imageUrl: food.image
            ? food.image.startsWith('http') ? food.image : `${API_URL}${food.image}`
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
  }, [id]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await api.put(`/api/restaurant/foods/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Food item updated!');
      router.push('/menu');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update food item';
      toast.error(msg);
    } finally {
      setSubmitting(false);
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
        <h1 className="text-lg font-bold text-gray-900">Edit Food Item</h1>
      </div>

      {loading ? (
        <div className="p-4 space-y-4 max-w-lg mx-auto w-full">
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
          submitLabel="Update Food Item"
        />
      )}
    </div>
  );
}
