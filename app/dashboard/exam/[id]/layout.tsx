import ExamLayoutClient from '@/components/exam/ExamLayoutClient';

interface LayoutProps {
  children: React.ReactNode;
  params: {
    id: string;
  };
}

export default function ExamLayout({ children, params }: LayoutProps) {
  return <ExamLayoutClient examId={params.id}>{children}</ExamLayoutClient>;
}
