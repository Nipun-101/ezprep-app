'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getSubjectTopicBreakdown,
  type SubjectBreakdown,
  type SubjectStrengthLabel,
  type SubjectTopicTrend,
} from '@/lib/api/analytics';

const strengthConfig = (
  label: SubjectStrengthLabel,
  pct: number
): { bar: string; label: string; badge: string; badgeText: string } => {
  switch (label) {
    case 'Strong':
      return {
        bar: 'from-emerald-400 to-teal-400',
        label: 'text-emerald-600',
        badge: 'bg-emerald-50 text-emerald-700',
        badgeText: 'Strong',
      };
    case 'Good':
      return {
        bar: 'from-teal-400 to-cyan-400',
        label: 'text-teal-600',
        badge: 'bg-teal-50 text-teal-700',
        badgeText: 'Good',
      };
    case 'Average':
      return {
        bar: 'from-amber-400 to-yellow-400',
        label: 'text-amber-600',
        badge: 'bg-amber-50 text-amber-700',
        badgeText: 'Average',
      };
    case 'Weak':
      return {
        bar: 'from-red-400 to-rose-400',
        label: 'text-red-500',
        badge: 'bg-red-50 text-red-600',
        badgeText: 'Needs Work',
      };
    default:
      if (pct >= 80)
        return {
          bar: 'from-emerald-400 to-teal-400',
          label: 'text-emerald-600',
          badge: 'bg-emerald-50 text-emerald-700',
          badgeText: 'Strong',
        };
      if (pct >= 60)
        return {
          bar: 'from-teal-400 to-cyan-400',
          label: 'text-teal-600',
          badge: 'bg-teal-50 text-teal-700',
          badgeText: 'Good',
        };
      if (pct >= 40)
        return {
          bar: 'from-amber-400 to-yellow-400',
          label: 'text-amber-600',
          badge: 'bg-amber-50 text-amber-700',
          badgeText: 'Average',
        };
      return {
        bar: 'from-red-400 to-rose-400',
        label: 'text-red-500',
        badge: 'bg-red-50 text-red-600',
        badgeText: 'Needs Work',
      };
  }
};

const trendConfig = (
  trend: SubjectTopicTrend
): { Icon: typeof TrendingUp; color: string; title: string } => {
  switch (trend) {
    case 'improving':
      return {
        Icon: TrendingUp,
        color: 'text-emerald-500 bg-emerald-50',
        title: 'Improving',
      };
    case 'declining':
      return {
        Icon: TrendingDown,
        color: 'text-red-400 bg-red-50',
        title: 'Declining',
      };
    case 'stable':
      return {
        Icon: Minus,
        color: 'text-gray-400 bg-gray-50',
        title: 'Stable',
      };
    case 'insufficient-data':
    default:
      return {
        Icon: Minus,
        color: 'text-gray-300 bg-gray-50',
        title: 'Not enough data',
      };
  }
};

function toTitleCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProfileSubjects() {
  const [subjects, setSubjects] = useState<SubjectBreakdown[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSubjectTopicBreakdown();
      setSubjects(data);
    } catch (err) {
      console.error('Failed to load subject breakdown', err);
      setError('Could not load subject performance.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            Subject Performance
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Based on your recent practice
          </p>
        </div>
        <Link
          href="/analytics"
          className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Brain className="w-3.5 h-3.5" />
          AI Analysis
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading && <SubjectsSkeleton />}

      {!isLoading && error && (
        <div className="px-5 py-10 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-all active:scale-95 shadow-md shadow-teal-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && subjects && subjects.length === 0 && (
        <div className="px-5 py-12 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Inbox className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            No subject data yet
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Attempt a few practice sessions to see your breakdown here.
          </p>
        </div>
      )}

      {!isLoading && !error && subjects && subjects.length > 0 && (
        <div className="px-5 py-4 space-y-5">
          {subjects.map((sub) => {
            const pct = Math.round(sub.averageScorePercent);
            const config = strengthConfig(sub.strengthLabel, pct);
            const trend = trendConfig(sub.trend);
            const TrendIcon = trend.Icon;
            const name = toTitleCase(sub.subjectName);

            return (
              <div key={sub.subjectId}>
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {name}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-semibold px-1.5 py-0.5 rounded-md shrink-0',
                        config.badge
                      )}
                    >
                      {config.badgeText}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center',
                        trend.color
                      )}
                      title={trend.title}
                    >
                      <TrendIcon className="w-3 h-3" />
                    </div>
                    <span
                      className={cn(
                        'text-sm font-extrabold',
                        config.label
                      )}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full bg-gradient-to-r transition-all duration-700',
                      config.bar
                    )}
                    style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                  />
                </div>
                {(sub.topics.length > 0 ||
                  sub.weakTopicCount > 0 ||
                  sub.strongTopicCount > 0) && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-gray-500">
                    <span>
                      {sub.topics.length}{' '}
                      {sub.topics.length === 1 ? 'topic' : 'topics'}
                    </span>
                    {sub.strongTopicCount > 0 && (
                      <span className="text-emerald-600">
                        {sub.strongTopicCount} strong
                      </span>
                    )}
                    {sub.weakTopicCount > 0 && (
                      <span className="text-red-500">
                        {sub.weakTopicCount} weak
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SubjectsSkeleton() {
  return (
    <div className="px-5 py-4 space-y-5 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-2">
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-10" />
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full" />
        </div>
      ))}
    </div>
  );
}
