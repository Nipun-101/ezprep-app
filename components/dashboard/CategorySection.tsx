'use client';

import { useRouter } from 'next/navigation';
import { ApiExamCategory } from '@/lib/api/exams';
import ExamCardDashboard from './ExamCardDashboard';

interface CategorySectionProps {
  category: ApiExamCategory;
}

export default function CategorySection({ category }: CategorySectionProps) {
  const router = useRouter();

  const handleExamClick = (examId: string) => {
    router.push(`/dashboard/exam/${examId}`);
  };

  return (
    <section id={`dashboard-category-${category.id}`} className="scroll-mt-28">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">
        Popular Exams from {category.name}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
        {category.exams.map((exam) => (
          <ExamCardDashboard
            key={exam.id}
            name={exam.title}
            imageUrl={category.imageUrl}
            trending={exam.trending === true}
            onClick={() => handleExamClick(exam.id)}
          />
        ))}
      </div>
    </section>
  );
}
