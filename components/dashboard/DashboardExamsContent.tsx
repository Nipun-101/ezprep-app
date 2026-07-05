'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CategorySection from '@/components/dashboard/CategorySection';
import { ApiExamCategory } from '@/lib/api/exams';

interface DashboardExamsContentProps {
  categories: ApiExamCategory[];
}

export default function DashboardExamsContent({ categories }: DashboardExamsContentProps) {
  const router = useRouter();

  useEffect(() => {
    if (categories.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('categoryId');
    if (!categoryId) return;

    const t = window.setTimeout(() => {
      const el = document.getElementById(`dashboard-category-${categoryId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      router.replace('/dashboard', { scroll: false });
    }, 50);

    return () => window.clearTimeout(t);
  }, [categories, router]);

  if (categories.length === 0) {
    return (
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-6 text-center text-gray-500">
        Exam listings will be available soon.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <CategorySection key={category.id} category={category} />
      ))}
    </div>
  );
}
