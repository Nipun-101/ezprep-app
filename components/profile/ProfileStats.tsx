'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Flame,
  FileText,
  Target,
  CheckCircle2,
  Zap,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getDashboard,
  type DashboardAnalytics,
} from '@/lib/api/analytics';

interface StatCard {
  label: string;
  value: string;
  unit?: string;
  sub: string;
  icon: typeof Flame;
  gradient: string;
  glow: string;
  text: string;
  ring: string;
}

function formatMinutes(minutes: number): { value: string; unit: string } {
  if (!minutes || minutes <= 0) return { value: '0', unit: 'min' };
  if (minutes < 60) {
    const rounded = minutes < 1 ? minutes.toFixed(1) : String(Math.round(minutes));
    return { value: rounded, unit: 'min' };
  }
  const hours = minutes / 60;
  if (hours < 10) return { value: hours.toFixed(1), unit: 'hrs' };
  return { value: String(Math.round(hours)), unit: 'hrs' };
}

function formatAvgPerAttempt(minutes: number): string {
  if (!minutes || minutes <= 0) return 'No attempts yet';
  if (minutes < 1) return `Avg ${(minutes * 60).toFixed(0)}s/attempt`;
  if (minutes < 60) return `Avg ${minutes.toFixed(1)} min/attempt`;
  return `Avg ${(minutes / 60).toFixed(1)} hrs/attempt`;
}

function formatPercent(pct: number): string {
  if (pct == null || Number.isNaN(pct)) return '0%';
  return `${Math.round(pct)}%`;
}

function buildCards(data: DashboardAnalytics): StatCard[] {
  const { streak, testsSummary, scoreAnalytics, accuracy, timeInvestment } =
    data;

  const time = formatMinutes(timeInvestment.totalMinutes);

  return [
    {
      label: 'Study Streak',
      value: `${streak.currentStreak}`,
      unit: 'days',
      sub:
        streak.currentStreak > 0
          ? `Best: ${streak.longestStreak} days`
          : streak.longestStreak > 0
            ? `Best so far: ${streak.longestStreak} days`
            : 'Start your first streak!',
      icon: Flame,
      gradient: 'from-orange-500 to-red-400',
      glow: 'shadow-orange-200',
      text: 'text-orange-500',
      ring: 'ring-orange-100',
    },
    {
      label: 'Tests Attempted',
      value: `${testsSummary.attempted}`,
      sub:
        testsSummary.attempted > 0
          ? `${testsSummary.completed} completed (${Math.round(
              testsSummary.completionRate
            )}%)`
          : 'No tests yet',
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-400',
      glow: 'shadow-blue-200',
      text: 'text-blue-500',
      ring: 'ring-blue-100',
    },
    {
      label: 'Average Score',
      value: formatPercent(scoreAnalytics.averageScorePercent),
      sub:
        scoreAnalytics.totalTestsScored > 0
          ? `Best: ${formatPercent(scoreAnalytics.bestScorePercent)}`
          : 'Take a test to see your average',
      icon: Target,
      gradient: 'from-emerald-500 to-teal-400',
      glow: 'shadow-emerald-200',
      text: 'text-emerald-600',
      ring: 'ring-emerald-100',
    },
    {
      label: 'Accuracy',
      value: formatPercent(accuracy.accuracyPercent),
      sub:
        accuracy.totalAnswered > 0
          ? `${accuracy.totalCorrect}/${accuracy.totalAnswered} correct`
          : 'No answers yet',
      icon: CheckCircle2,
      gradient: 'from-sky-500 to-blue-400',
      glow: 'shadow-sky-200',
      text: 'text-sky-500',
      ring: 'ring-sky-100',
    },
    {
      label: 'Study Time',
      value: time.value,
      unit: time.unit,
      sub: formatAvgPerAttempt(timeInvestment.averageMinutesPerAttempt),
      icon: Zap,
      gradient: 'from-amber-500 to-orange-400',
      glow: 'shadow-amber-200',
      text: 'text-amber-500',
      ring: 'ring-amber-100',
    },
  ];
}

export default function ProfileStats() {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getDashboard();
      setData(result);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
      setError('Could not load your stats.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading) {
    return <StatsSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-sm text-gray-600">{error ?? 'Stats unavailable.'}</p>
        </div>
        <button
          onClick={() => void load()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-all active:scale-95 shadow-md shadow-teal-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const cards = buildCards(data);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={cn(
              'bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4 flex flex-col gap-3 ring-1 group',
              stat.ring
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200',
                stat.gradient,
                stat.glow
              )}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-extrabold text-gray-900 leading-none">
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className={cn('text-xs font-bold ml-1', stat.text)}>
                    {stat.unit}
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-gray-500 mt-1">
                {stat.label}
              </div>
              <div className={cn('text-xs mt-0.5 font-medium', stat.text)}>
                {stat.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100" />
          <div className="space-y-2">
            <div className="h-5 bg-gray-100 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
