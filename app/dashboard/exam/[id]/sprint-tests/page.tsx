import SprintTestsClient from '@/components/exam/SprintTestsClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default function SprintTestsPage({ params }: PageProps) {
  return <SprintTestsClient examId={params.id} />;
}
