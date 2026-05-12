import AttemptResultClient from '@/components/attempt/AttemptResultClient';

interface PageProps {
  params: {
    attemptId: string;
  };
}

export default function AttemptResultPage({ params }: PageProps) {
  return <AttemptResultClient attemptId={params.attemptId} />;
}
