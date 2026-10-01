'use client';

import { useEffect, useRef, useState, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getExamById, ApiExamDetail } from '@/lib/api/exams';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

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
          </div>

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
