'use client';

import { notFound } from 'next/navigation';
import { examDetailMap } from '@/lib/examMaterialsDetail';
import ExamMaterialsDetailView from '@/components/study-materials/ExamMaterialsDetailView';

interface PageProps {
  params: { id: string };
}

export default function ExamStudyMaterialsPage({ params }: PageProps) {
  const data = examDetailMap[params.id];
  if (!data) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-6xl mx-auto py-8 px-4 lg:px-8">
        <ExamMaterialsDetailView data={data} />
      </div>
    </div>
  );
}
