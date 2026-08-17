'use client';

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function clampPercentage(earned: number, max: number): number {
  if (!Number.isFinite(earned) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(100, Math.max(0, (earned / max) * 100));
}

/** Color by score share of max marks — 80%+ (or full marks) is green. */
export function scoreRingColor(percentage: number): string {
  if (percentage >= 80) return '#10b981';
  if (percentage >= 60) return '#14b8a6';
  if (percentage >= 40) return '#f59e0b';
  if (percentage >= 20) return '#f97316';
  return '#ef4444';
}

interface ScoreRingProps {
  earned: number;
  max: number;
  formatValue?: (value: number) => string;
}

export default function ScoreRing({
  earned,
  max,
  formatValue = (value) => String(value),
}: ScoreRingProps) {
  const percentage = clampPercentage(earned, max);
  const isFull = max > 0 && earned + 1e-6 >= max;
  const color = scoreRingColor(isFull ? 100 : percentage);
  const dashOffset = isFull ? 0 : CIRCUMFERENCE * (1 - percentage / 100);

  return (
    <div className="relative flex-shrink-0">
      <svg className="h-24 w-24 sm:h-28 sm:w-28" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        {percentage > 0 ? (
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap={isFull ? 'butt' : 'round'}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 50 50)"
            className="transition-[stroke-dashoffset,stroke] duration-700 ease-out"
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 sm:text-3xl">{formatValue(earned)}</span>
        <span className="text-xs text-gray-500">of {formatValue(max)}</span>
      </div>
    </div>
  );
}
