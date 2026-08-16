import FullMockTestsClient from '@/components/exam/FullMockTestsClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default function FullMockTestsPage({ params }: PageProps) {
  return <FullMockTestsClient examId={params.id} />;
}
