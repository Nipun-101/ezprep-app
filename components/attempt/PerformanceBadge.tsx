import {
  resolvePerformanceMessage,
  type PerformanceBand,
} from '@/lib/performance-bands';

interface PerformanceBadgeProps {
  score: number;
  totalScore: number;
  bands?: PerformanceBand[];
  language: 'en' | 'ml';
}

export default function PerformanceBadge({
  score,
  totalScore,
  bands,
  language,
}: PerformanceBadgeProps) {
  const message = resolvePerformanceMessage(score, totalScore, bands, language);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${message.className}`}
    >
      <span aria-hidden>{message.emoji}</span>
      {message.label}
    </span>
  );
}
