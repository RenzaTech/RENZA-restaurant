'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
          <span className="text-white font-bold text-xl">R</span>
        </div>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}
