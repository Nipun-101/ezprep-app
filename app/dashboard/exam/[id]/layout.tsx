import { Suspense } from 'react';
import ExamLayoutClient from '@/components/exam/ExamLayoutClient';

interface LayoutProps {
  children: React.ReactNode;
  params: {
    id: string;
  };
}

export default function ExamLayout({ children, params }: LayoutProps) {
  return (
    <Suspense fallback={null}>
      <ExamLayoutClient examId={params.id}>{children}</ExamLayoutClient>
    </Suspense>
  );
}
