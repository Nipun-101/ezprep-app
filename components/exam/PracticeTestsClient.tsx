'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import PracticeTestCard from './PracticeTestCard';
import TestListPagination from './TestListPagination';
import { useLaunchAttempt } from './useLaunchAttempt';
import { useExamPage } from './ExamLayoutClient';
import {
  getMockTestsByExam,
  ApiMockTest,
  ApiMockTestSubject,
  MockTestsPagination,
} from '@/lib/api/exams';
import { BookOpen, Search, ChevronDown } from 'lucide-react';

interface PracticeTestsClientProps {
  examId: string;
}

const LIMIT = 20;

export default function PracticeTestsClient({ examId }: PracticeTestsClientProps) {
  const { exam } = useExamPage();
  const { startingTestId, startError, start, resume } = useLaunchAttempt();
  const [practiceTests, setPracticeTests] = useState<ApiMockTest[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<MockTestsPagination | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const subjectOptions = useMemo<ApiMockTestSubject[]>(() => {
    const subjects = exam?.subjects ?? [];
    return Array.from(
      new Map(
        subjects
          .filter((s) => s.subject)
          .map((s) => [
            s.subject,
            { id: s.subject, name: s.name?.trim() || 'Subject' },
          ])
      ).values()
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [exam?.subjects]);

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

  return (
    <section ref={sectionRef} className="scroll-mt-28">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Topic Wise Tests</h2>
        <p className="text-gray-600">Master topics with focused practice tests</p>
      </div>

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

      {initialLoading || filtering ? (
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
                    ? () => resume(test.id, test.resumeAttemptId!)
                    : () => start(test.id)
                }
              />
            ))}
          </div>
          {pagination && (
            <TestListPagination page={page} pagination={pagination} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </section>
  );
}
