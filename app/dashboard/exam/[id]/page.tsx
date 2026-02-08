import { getAllExams, getExamById } from '@/lib/mockData';
import ExamDetailClient from '@/components/exam/ExamDetailClient';

export function generateStaticParams() {
  const allExams = getAllExams();
  return allExams.map((exam) => ({
    id: exam.id,
  }));
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function ExamDetailPage({ params }: PageProps) {
  const examDetail = getExamById(params.id);
  const allExams = getAllExams();
  const currentExam = allExams.find(e => e.id === params.id);

  return (
    <ExamDetailClient
      examDetail={examDetail}
      currentExam={currentExam}
      examId={params.id}
    />
  );
}
