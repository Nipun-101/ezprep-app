import AttemptPageClient from '@/components/attempt/AttemptPageClient';

interface PageProps {
  params: {
    attemptId: string;
  };
}

export default function AttemptPage({ params }: PageProps) {
  return <AttemptPageClient attemptId={params.attemptId} />;
}
