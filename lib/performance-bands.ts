export type PerformanceBandKey =
  | 'needs_improvement'
  | 'good'
  | 'very_good'
  | 'excellent';

export interface PerformanceBand {
  key: string;
  minPercent: number;
}

export const DEFAULT_PERFORMANCE_BANDS: { key: PerformanceBandKey; minPercent: number }[] = [
  { key: 'needs_improvement', minPercent: 0 },
  { key: 'good', minPercent: 40 },
  { key: 'very_good', minPercent: 70 },
  { key: 'excellent', minPercent: 85 },
];

const COPY: Record<
  PerformanceBandKey,
  { en: string; ml: string; className: string; emoji: string }
> = {
  needs_improvement: {
    en: 'Needs more improvement',
    ml: 'കൂടുതൽ മെച്ചപ്പെടുത്താം',
    className: 'bg-amber-100 text-amber-800',
    emoji: '😊',
  },
  good: {
    en: 'Good',
    ml: 'നല്ലത്',
    className: 'bg-teal-100 text-teal-800',
    emoji: '😄',
  },
  very_good: {
    en: 'Very good',
    ml: 'വളരെ നല്ലത്',
    className: 'bg-blue-100 text-blue-800',
    emoji: '😁',
  },
  excellent: {
    en: 'Excellent',
    ml: 'മികച്ചത്',
    className: 'bg-green-100 text-green-800',
    emoji: '🤩',
  },
};

function isBandKey(key: string): key is PerformanceBandKey {
  return key in COPY;
}

export function resolvePerformanceMessage(
  score: number,
  totalScore: number,
  bands: PerformanceBand[] | undefined,
  language: 'en' | 'ml'
) {
  const percent = totalScore > 0 ? (score / totalScore) * 100 : 0;
  const known = (bands ?? []).filter(
    (band): band is { key: PerformanceBandKey; minPercent: number } =>
      isBandKey(band.key) && typeof band.minPercent === 'number' && Number.isFinite(band.minPercent)
  );
  const usable = known.length > 0 ? known : DEFAULT_PERFORMANCE_BANDS;
  const sorted = [...usable].sort((a, b) => a.minPercent - b.minPercent);
  let chosen = sorted[0];
  for (const band of sorted) {
    if (percent >= band.minPercent) chosen = band;
  }
  const copy = COPY[chosen.key];
  return {
    label: language === 'ml' ? copy.ml : copy.en,
    className: copy.className,
    emoji: copy.emoji,
  };
}
