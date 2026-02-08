'use client';

import { useRouter } from 'next/navigation';
import { Exam } from '@/lib/mockData';
import ExamCardDashboard from './ExamCardDashboard';

interface CategorySectionProps {
  title: string;
  exams: Exam[];
}

export default function CategorySection({ title, exams }: CategorySectionProps) {
  const router = useRouter();

  const handleExamClick = (examId: string, isActive: boolean) => {
    if (isActive) {
      router.push(`/dashboard/exam/${examId}`);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
        {exams.map((exam) => (
          <ExamCardDashboard
            key={exam.id}
            name={exam.name}
            iconType={exam.iconType}
            isActive={exam.isActive}
            onClick={() => handleExamClick(exam.id, exam.isActive)}
          />
        ))}
      </div>
    </section>
  );
}
