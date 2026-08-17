import PracticeTestsClient from '@/components/exam/PracticeTestsClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default function PracticeTestsPage({ params }: PageProps) {
  return <PracticeTestsClient examId={params.id} />;
}
