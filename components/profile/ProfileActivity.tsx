'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getRecentActivity,
  type RecentActivityItem,
  type RecentActivityPagination,
  type RecentActivityStatus,
} from '@/lib/api/analytics';

const PAGE_SIZE = 10;

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

const statusCardClass = (status: RecentActivityStatus): string => {
  switch (status) {
    case 'SUBMITTED':
      return 'border-emerald-100 bg-emerald-50/90 hover:bg-emerald-50';
    case 'EXPIRED':
      return 'border-rose-100 bg-rose-50/90 hover:bg-rose-50';
    case 'PAUSED':
      return 'border-sky-100 bg-sky-50/90 hover:bg-sky-50';
    case 'IN_PROGRESS':
      return 'border-amber-100 bg-amber-50/90 hover:bg-amber-50';
    default:
      return 'border-gray-100 bg-gray-50 hover:bg-gray-100';
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
  const [pagination, setPagination] = useState<RecentActivityPagination | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (pageVal: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getRecentActivity({ page: pageVal, limit: PAGE_SIZE });
      setItems(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Failed to load recent activity', err);
      setError('Could not load recent activity.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page);
  }, [load, page]);

  const activityItems = items ?? [];
  const totalSessions = pagination?.total ?? activityItems.length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Your latest practice and mock tests
          </p>
        </div>
        {!isLoading && !error && totalSessions > 0 && (
          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
            {totalSessions} {totalSessions === 1 ? 'session' : 'sessions'}
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
            onClick={() => void load(page)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-all active:scale-95 shadow-md shadow-teal-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && activityItems.length === 0 && (
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

      {!isLoading && !error && activityItems.length > 0 && (
        <div className="space-y-2 p-3 sm:p-4">
          {activityItems.map((item) => {
            const pct = Math.round(item.scorePercent);
            const score = scoreConfig(pct);
            const isFullMock = !item.subject;
            const rawTitle =
              item.testTitle?.trim() ||
              item.topic?.name?.trim() ||
              item.subject?.name?.trim() ||
              item.exam?.name?.trim() ||
              'Untitled test';
            const title = toTitleCase(rawTitle);
            const subjectLabel = toTitleCase(item.subject?.name?.trim() || '');
            const examLabel = item.exam?.name?.trim().toUpperCase() || '';
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
                className={cn(
                  'group flex w-full items-start gap-3 rounded-xl border px-3.5 py-3.5 text-left transition-colors sm:items-center sm:gap-4 sm:px-4',
                  statusCardClass(item.status)
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md',
                    isFullMock
                      ? 'bg-gradient-to-br from-indigo-500 to-blue-400 shadow-indigo-200'
                      : 'bg-gradient-to-br from-teal-500 to-emerald-400 shadow-teal-200'
                  )}
                >
                  <BookOpen className="h-[18px] w-[18px] text-white" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-gray-800 transition-colors group-hover:text-teal-700">
                    {title}
                  </div>
                  <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5">
                    {showSubjectChip && (
                      <span
                        title={subjectLabel}
                        className="inline-block max-w-[11rem] shrink-0 truncate rounded-md bg-white/80 px-1.5 py-0.5 text-xs text-gray-600 sm:max-w-[14rem] lg:max-w-[16rem]"
                      >
                        {subjectLabel}
                      </span>
                    )}
                    {examLabel && (
                      <span
                        title={examLabel}
                        className="inline-block max-w-[12rem] shrink-0 truncate rounded-md bg-white/80 px-1.5 py-0.5 text-xs font-medium tracking-wide text-gray-600 sm:max-w-[14rem] lg:max-w-[18rem]"
                      >
                        {examLabel}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(item.timeConsumedMinutes)}
                    </span>
                    <span>{formatRelativeTime(item.submittedAt)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1 pt-0.5 sm:pt-0">
                  <div
                    className={cn(
                      'flex items-center gap-1 rounded-lg border bg-white/80 px-2.5 py-1',
                      score.border
                    )}
                  >
                    <span className={cn('text-sm font-extrabold', score.color)}>
                      {pct}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{item.totalQuestions} Qs</span>
                </div>

                <ChevronRight className="mt-2.5 hidden h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-teal-500 sm:mt-0 sm:block" />
              </button>
            );
          })}
        </div>
      )}

      {!isLoading &&
        !error &&
        pagination != null &&
        pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50/60">
            <p className="text-xs text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPrevPage || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <button
                type="button"
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
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
