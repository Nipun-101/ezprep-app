'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CategorySection from '@/components/dashboard/CategorySection';
import { getExamsByCategory, ApiExamCategory } from '@/lib/api/exams';

export default function DashboardPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ApiExamCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getExamsByCategory()
      .then(setCategories)
      .catch(() => setError('Failed to load exams. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || categories.length === 0) return;
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('categoryId');
    if (!categoryId) return;

    const t = window.setTimeout(() => {
      const el = document.getElementById(`dashboard-category-${categoryId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      router.replace('/dashboard', { scroll: false });
    }, 50);

    return () => window.clearTimeout(t);
  }, [loading, categories, router]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && categories.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </div>
    </DashboardLayout>
  );
}
