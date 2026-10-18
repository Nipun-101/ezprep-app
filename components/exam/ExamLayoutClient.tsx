'use client';

import { useEffect, useRef, useState, createContext, useContext } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getExamById, ApiExamDetail } from '@/lib/api/exams';
import { ArrowLeft, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTargetExams } from '@/lib/hooks/useTargetExams';

interface ExamPageContextValue {
  examId: string;
  exam: ApiExamDetail | null;
  loading: boolean;
  error: string | null;
}

const ExamPageContext = createContext<ExamPageContextValue | null>(null);

export function useExamPage() {
  const ctx = useContext(ExamPageContext);
  if (!ctx) {
    throw new Error('useExamPage must be used within ExamLayoutClient');
  }
  return ctx;
}

interface ExamLayoutClientProps {
  examId: string;
  children: React.ReactNode;
}

export default function ExamLayoutClient({ examId, children }: ExamLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [exam, setExam] = useState<ApiExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetError, setTargetError] = useState<string | null>(null);
  const [targetBusy, setTargetBusy] = useState(false);
  const targets = useTargetExams();

  useEffect(() => {
    setLoading(true);
    setError(null);
    getExamById(examId)
      .then(setExam)
      .catch(() => setError('Failed to load exam. Please try again.'))
      .finally(() => setLoading(false));
  }, [examId]);

  useEffect(() => {
    const active = navRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }, [pathname, examId]);

  const targeted = targets.isTargeted(examId);

  const navItems = [
    { href: `/dashboard/exam/${examId}`, label: 'Overview', exact: true },
    { href: `/dashboard/exam/${examId}/practice`, label: 'Topic Wise', exact: false },
    { href: `/dashboard/exam/${examId}/full-mocks`, label: 'Full Mocks', exact: false },
    { href: `/dashboard/exam/${examId}/sprint-tests`, label: 'Sprint Tests', exact: false },
  ];

  return (
    <ExamPageContext.Provider value={{ examId, exam, loading, error }}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 shrink-0 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="font-medium hidden md:inline">Back to Dashboard</span>
            </button>
            {exam && (
              <h1 className="md:hidden flex-1 min-w-0 text-lg font-bold text-gray-900 leading-tight truncate">
                {exam.name}
              </h1>
            )}
            {exam && targets.isAuthenticated && !targets.loading && (
              <button
                type="button"
                disabled={targetBusy || (!targeted && targets.isFull)}
                onClick={async () => {
                  if (!exam) return;
                  setTargetBusy(true);
                  setTargetError(null);
                  try {
                    if (targeted) {
                      await targets.remove(examId);
                    } else {
                      await targets.add({ id: examId, name: exam.name });
                    }
                  } catch (toggleError) {
                    const apiMessage =
                      axios.isAxiosError(toggleError) &&
                      typeof (toggleError.response?.data as { message?: unknown } | undefined)
                        ?.message === 'string'
                        ? (toggleError.response?.data as { message: string }).message
                        : null;
                    setTargetError(apiMessage ?? 'Could not update your target exams.');
                  } finally {
                    setTargetBusy(false);
                  }
                }}
                className={cn(
                  'ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                  targeted
                    ? 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                )}
              >
                <Star className={cn('h-4 w-4', targeted && 'fill-teal-500 text-teal-500')} />
                <span className="hidden sm:inline">
                  {targeted
                    ? 'In your targets'
                    : targets.isFull
                      ? 'Target list is full'
                      : 'Add to my targets'}
                </span>
              </button>
            )}
          </div>
          {targetError && (
            <p className="text-sm text-red-600">{targetError}</p>
          )}

          <nav
            ref={navRef}
            className="flex gap-1 overflow-x-auto border-b border-gray-200 -mx-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {navItems.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={active ? 'true' : undefined}
                  className={cn(
                    'shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                    active
                      ? 'border-teal-600 text-teal-700'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {children}
        </div>
      </DashboardLayout>
    </ExamPageContext.Provider>
  );
}
