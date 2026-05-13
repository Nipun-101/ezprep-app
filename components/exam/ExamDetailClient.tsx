'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ExamIntro from './ExamIntro';
import PracticeTestCard from './PracticeTestCard';
import { Button } from '@/components/ui/button';
import { getMockTestsByExam, ApiMockTest, ApiMockTestExam, ApiMockTestSubject, MockTestsPagination } from '@/lib/api/exams';
import { startMockTestAttempt, resumeAttempt } from '@/lib/api/attempts';
import { ArrowLeft, BookOpen, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const STORAGE_KEY_PREFIX = 'ezp:mockAttempt:';

interface ExamDetailClientProps {
  examId: string;
}

export default function ExamDetailClient({ examId }: ExamDetailClientProps) {
  const router = useRouter();
  const [practiceTests, setPracticeTests] = useState<ApiMockTest[]>([]);
  const [examInfo, setExamInfo] = useState<ApiMockTestExam | null>(null);
  const [subjectOptions, setSubjectOptions] = useState<ApiMockTestSubject[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startingTestId, setStartingTestId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<MockTestsPagination | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const LIMIT = 20;

  const scrollToSection = () => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const fetchTests = (searchVal: string, subjectVal: string, pageVal: number) => {
    setFiltering(true);
    setError(null);
    getMockTestsByExam(examId, {
      limit: LIMIT,
      page: pageVal,
      ...(searchVal ? { search: searchVal } : {}),
      ...(subjectVal ? { subjectId: subjectVal } : {}),
    })
      .then((res) => {
        setPracticeTests(res.data);
        setPagination(res.pagination);
      })
      .catch(() => setError('Failed to load tests. Please try again.'))
      .finally(() => setFiltering(false));
  };

  useEffect(() => {
    getMockTestsByExam(examId, { limit: LIMIT, page: 1 })
      .then((res) => {
        setPracticeTests(res.data);
        setPagination(res.pagination);
        if (res.data.length > 0) {
          setExamInfo(res.data[0].exam);
          const unique = Array.from(
            new Map(res.data.map((t) => [t.subject.id, t.subject])).values()
          );
          setSubjectOptions(unique);
        }
      })
      .catch(() => setError('Failed to load tests. Please try again.'))
      .finally(() => setInitialLoading(false));
  }, [examId]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTests(value, subjectId, 1);
    }, 400);
  };

  const handleSubjectChange = (value: string) => {
    setSubjectId(value);
    setPage(1);
    fetchTests(search, value, 1);
    scrollToSection();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchTests(search, subjectId, newPage);
    scrollToSection();
  };

  const handleStartTest = async (testId: string) => {
    if (startingTestId) return;
    setStartingTestId(testId);
    setStartError(null);
    try {
      const data = await startMockTestAttempt(testId);
      try {
        sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${data.attemptId}`, JSON.stringify(data));
      } catch {
        // ignore quota / unavailable
      }
      router.push(`/dashboard/attempt/${data.attemptId}`);
    } catch (err: any) {
      setStartError(
        err?.response?.data?.message || 'Could not start the test. Please try again.'
      );
      setStartingTestId(null);
    }
  };

  const handleResumeTest = async (testId: string, attemptId: string) => {
    if (startingTestId) return;
    setStartingTestId(testId);
    setStartError(null);
    try {
      const data = await resumeAttempt(attemptId);
      try {
        sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${data.attemptId}`, JSON.stringify(data));
      } catch {
        // ignore quota / unavailable
      }
      router.push(`/dashboard/attempt/${data.attemptId}`);
    } catch (err: any) {
      setStartError(
        err?.response?.data?.message || 'Could not resume the test. Please try again.'
      );
      setStartingTestId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3 md:block">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 shrink-0 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="font-medium hidden md:inline">Back to Dashboard</span>
          </button>
          {examInfo && (
            <h1 className="md:hidden flex-1 min-w-0 text-lg font-bold text-gray-900 leading-tight truncate">
              {examInfo.name}
            </h1>
          )}
        </div>

        {initialLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
          </div>
        )}

        {!initialLoading && error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center text-red-600">
            {error}
          </div>
        )}

        {!initialLoading && (
          <>
            {examInfo && (
              <ExamIntro
                name={examInfo.name}
                description={examInfo.description}
              />
            )}

            {/* Daily Practice Tests */}
            <section ref={sectionRef} className="scroll-mt-28">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Daily Practice Tests</h2>
                <p className="text-gray-600">Master topics with focused practice tests</p>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={scrollToSection}
                    placeholder="Search topics..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  />
                </div>
                {subjectOptions.length > 0 && (
                  <div className="relative">
                    <select
                      value={subjectId}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      className="appearance-none w-full sm:w-52 pl-3 pr-9 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-gray-700"
                    >
                      <option value="">All Subjects</option>
                      {subjectOptions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                )}
              </div>

              {filtering ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-7 w-7 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
                </div>
              ) : error ? (
                <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center text-red-600">
                  {error}
                </div>
              ) : practiceTests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
                  <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {search || subjectId ? 'No matching tests found' : 'No Practice Tests Yet'}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {search || subjectId
                      ? 'Try a different search term or subject filter.'
                      : 'Practice tests for this exam will be available soon.'}
                  </p>
                </div>
              ) : (
                <>
                  {startError && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                      {startError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {practiceTests.map((test) => (
                      <PracticeTestCard
                        key={test.id}
                        test={test}
                        isActing={startingTestId === test.id}
                        disabled={startingTestId !== null && startingTestId !== test.id}
                        onAction={
                          test.userAttemptAction === 'RESUME' && test.resumeAttemptId
                            ? () => handleResumeTest(test.id, test.resumeAttemptId!)
                            : () => handleStartTest(test.id)
                        }
                      />
                    ))}
                  </div>

                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1 mt-8">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => {
                        const isNearCurrent = Math.abs(p - page) <= 1 || p === 1 || p === pagination.totalPages;
                        const showEllipsisBefore = p === page - 2 && page - 2 > 1;
                        const showEllipsisAfter = p === page + 2 && page + 2 < pagination.totalPages;

                        if (!isNearCurrent && !showEllipsisBefore && !showEllipsisAfter) return null;
                        if (showEllipsisBefore || showEllipsisAfter) {
                          return (
                            <span key={`ellipsis-${p}`} className="px-1 text-gray-400 text-sm select-none">
                              …
                            </span>
                          );
                        }
                        return (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium border transition ${
                              p === page
                                ? 'bg-gray-700 text-white border-gray-700'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={!pagination.hasNextPage}
                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Full Mock Tests - Coming Soon */}
            <section className="opacity-60 pointer-events-none select-none">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">Full Mock Tests</h2>
                  <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
                <p className="text-gray-600">Complete exam simulation for better preparation</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg border-2 border-gray-200 p-6 h-44 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                    <Button disabled className="w-full bg-gray-200 text-gray-400 cursor-not-allowed">
                      Coming Soon
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
