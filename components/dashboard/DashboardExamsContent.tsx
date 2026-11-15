'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import CategorySection from '@/components/dashboard/CategorySection';
import TargetExamsSection from '@/components/dashboard/TargetExamsSection';
import { ApiExamCategory } from '@/lib/api/exams';
import { useTargetExams } from '@/lib/hooks/useTargetExams';
import { orderCategoriesByTargets } from '@/lib/target-exams';

interface DashboardExamsContentProps {
  /** Categories shown in Popular Exams sections. */
  categories: ApiExamCategory[];
  /**
   * Categories used to resolve target exam logos/names.
   * Pass central + state so mixed targets still show images.
   */
  targetLookupCategories?: ApiExamCategory[];
  /** Marks exam links so back returns to this surface (e.g. state-psc). */
  examFrom?: string;
}

export default function DashboardExamsContent({
  categories,
  targetLookupCategories,
  examFrom,
}: DashboardExamsContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const targetExams = useTargetExams();
  const lookupCategories = targetLookupCategories ?? categories;

  useEffect(() => {
    if (categories.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('categoryId');
    if (!categoryId) return;

    const t = window.setTimeout(() => {
      const el = document.getElementById(`dashboard-category-${categoryId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      router.replace(pathname || '/dashboard', { scroll: false });
    }, 50);

    return () => window.clearTimeout(t);
  }, [categories, pathname, router]);

  const ordered = orderCategoriesByTargets(
    categories,
    targetExams.targets.map((exam) => exam.id)
  ).filter((category) => category.exams?.length);

  return (
    <div className="space-y-8">
      <TargetExamsSection
        categories={lookupCategories}
        targetExams={targetExams}
        examFrom={examFrom}
      />
      {ordered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
          Exam listings will be available soon.
        </div>
      ) : (
        ordered.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            examFrom={examFrom}
          />
        ))
      )}
    </div>
  );
}
