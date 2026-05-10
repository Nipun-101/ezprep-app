import ExamDetailClient from '@/components/exam/ExamDetailClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ExamDetailPage({ params }: PageProps) {
  return <ExamDetailClient examId={params.id} />;
}
