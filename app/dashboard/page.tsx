'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CategorySection from '@/components/dashboard/CategorySection';
import { examCategories } from '@/lib/mockData';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {examCategories.map((category) => (
          <CategorySection
            key={category.id}
            title={category.title}
            exams={category.exams}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}
