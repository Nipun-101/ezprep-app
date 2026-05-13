'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getRecentActivity,
  type RecentActivityItem,
  type RecentActivityStatus,
} from '@/lib/api/analytics';

const scoreConfig = (pct: number) => {
  if (pct >= 80)
    return {
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    };
  if (pct >= 60)
    return {
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
    };
  if (pct >= 40)
    return {
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    };
  return {
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-100',
  };
};

const statusConfig = (
  status: RecentActivityStatus
): { label: string; color: string } => {
  switch (status) {
    case 'SUBMITTED':
      return { label: 'Submitted', color: 'text-emerald-600' };
    case 'EXPIRED':
      return { label: 'Expired', color: 'text-amber-600' };
    case 'PAUSED':
      return { label: 'Paused', color: 'text-blue-500' };
    case 'IN_PROGRESS':
      return { label: 'In progress', color: 'text-blue-500' };
    default:
      return { label: String(status).replace(/_/g, ' '), color: 'text-gray-500' };
  }
};

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? '' : 's'} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '< 1 min';
  if (minutes < 1) {
    const secs = Math.max(1, Math.round(minutes * 60));
    return `${secs} sec${secs === 1 ? '' : 's'}`;
  }
  return `${Math.round(minutes)} min`;
}

function toTitleCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProfileActivity() {
  const router = useRouter();
  const [items, setItems] = useState<RecentActivityItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRecentActivity();
      setItems(data);
    } catch (err) {
      console.error('Failed to load recent activity', err);
      setError('Could not load recent activity.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Mock-test attempts will be supported later. For now we only render practice
  // items, identified by `testTitle` being null.
  const practiceItems = (items ?? []).filter((it) => !it.testTitle);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Your latest practice sessions
          </p>
        </div>
        {!isLoading && !error && practiceItems.length > 0 && (
          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
            {practiceItems.length}{' '}
            {practiceItems.length === 1 ? 'session' : 'sessions'}
          </span>
        )}
      </div>

      {isLoading && <ActivitySkeleton />}

      {!isLoading && error && (
        <div className="px-6 py-10 flex flex-col items-center justify-center text-center">
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

      {!isLoading && !error && practiceItems.length === 0 && (
        <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Inbox className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-700">No activity yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Your recent practice sessions will appear here.
          </p>
        </div>
      )}

      {!isLoading && !error && practiceItems.length > 0 && (
        <div className="divide-y divide-gray-50">
          {practiceItems.map((item) => {
            const pct = Math.round(item.scorePercent);
            const score = scoreConfig(pct);
            const status = statusConfig(item.status);
            const rawTitle =
              item.testTitle?.trim() ||
              item.topic?.name?.trim() ||
              item.subject?.name?.trim() ||
              '';
            const title = toTitleCase(rawTitle);
            const subjectLabel = toTitleCase(item.subject?.name?.trim() || '');
            const examLabel = toTitleCase(item.exam?.name?.trim() || '');
            const showSubjectChip =
              !!item.topic?.name &&
              subjectLabel.toLowerCase() !== title.toLowerCase();

            return (
              <button
                key={item.attemptId}
                type="button"
                onClick={() => {
                  const isFinished =
                    item.status === 'SUBMITTED' || item.status === 'EXPIRED';
                  const href = isFinished
                    ? `/dashboard/attempt/${item.attemptId}/result`
                    : `/dashboard/attempt/${item.attemptId}`;
                  router.push(href);
                }}
                className="w-full text-left px-6 py-4 flex items-center gap-4 hover:bg-gray-50/60 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md bg-gradient-to-br from-teal-500 to-emerald-400 shadow-teal-200">
                  <BookOpen className="w-4.5 h-4.5 text-white" size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate group-hover:text-teal-700 transition-colors">
                    {title}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span className="text-xs font-semibold text-teal-500">
                      Practice
                    </span>
                    {showSubjectChip && (
                      <span className="text-xs text-gray-500 px-1.5 py-0.5 bg-gray-100 rounded-md">
                        {subjectLabel}
                      </span>
                    )}
                    {examLabel && (
                      <span className="text-xs text-gray-500 px-1.5 py-0.5 bg-gray-100 rounded-md">
                        {examLabel}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(item.timeConsumedMinutes)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(item.submittedAt)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  <div
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1 rounded-lg border',
                      score.bg,
                      score.border
                    )}
                  >
                    <span className={cn('text-sm font-extrabold', score.color)}>
                      {pct}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span className={cn('font-medium', status.color)}>
                      {status.label}
                    </span>
                    <span>· {item.totalQuestions} Qs</span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="divide-y divide-gray-50 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
          <div className="h-7 w-14 bg-gray-100 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
