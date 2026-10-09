'use client';

import { useEffect, useState } from 'react';
import FullMockTestCard from './FullMockTestCard';
import TestListPagination from './TestListPagination';
import AccessErrorBanner from './access/AccessErrorBanner';
import { useLaunchAttempt } from './useLaunchAttempt';
import { getFullMockTests, ApiFullMockTest } from '@/lib/api/full-mock-tests';
import { MockTestsPagination } from '@/lib/api/exams';
import { FileText } from 'lucide-react';

interface FullMockTestsClientProps {
  examId: string;
}

const LIMIT = 12;

export default function FullMockTestsClient({ examId }: FullMockTestsClientProps) {
  const { startingTestId, startError, start, resume } = useLaunchAttempt();
  const [tests, setTests] = useState<ApiFullMockTest[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<MockTestsPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTests = (pageVal: number) => {
    setLoading(true);
    setError(null);
    getFullMockTests({ examId, page: pageVal, limit: LIMIT })
      .then((res) => {
        setTests(res.data);
        setPagination(res.pagination);
      })
      .catch(() => setError('Failed to load full mock tests. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTests(1);
  }, [examId]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchTests(newPage);
  };

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Full Mock Tests</h2>
        <p className="text-gray-600">Complete exam simulation for better preparation</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center text-red-600">
          {error}
        </div>
      ) : tests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Full Mock Tests Yet</h3>
          <p className="text-gray-500 text-sm">Full mock tests for this exam will be available soon.</p>
        </div>
      ) : (
        <>
          <AccessErrorBanner error={startError} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test) => (
              <FullMockTestCard
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
