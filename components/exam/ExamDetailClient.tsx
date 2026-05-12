'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ExamIntro from './ExamIntro';
import PracticeTestCard from './PracticeTestCard';
import { Button } from '@/components/ui/button';
import { getMockTestsByExam, ApiMockTest, ApiMockTestExam } from '@/lib/api/exams';
import { startMockTestAttempt, resumeAttempt } from '@/lib/api/attempts';
import { ArrowLeft, BookOpen } from 'lucide-react';

const STORAGE_KEY_PREFIX = 'ezp:mockAttempt:';

interface ExamDetailClientProps {
  examId: string;
}

export default function ExamDetailClient({ examId }: ExamDetailClientProps) {
  const router = useRouter();
  const [practiceTests, setPracticeTests] = useState<ApiMockTest[]>([]);
  const [examInfo, setExamInfo] = useState<ApiMockTestExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingTestId, setStartingTestId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    getMockTestsByExam(examId)
      .then((res) => {
        setPracticeTests(res.data);
        if (res.data.length > 0) {
          setExamInfo(res.data[0].exam);
        }
      })
      .catch(() => setError('Failed to load tests. Please try again.'))
      .finally(() => setLoading(false));
  }, [examId]);

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
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {examInfo && (
              <ExamIntro
                name={examInfo.name}
                description={examInfo.description}
              />
            )}

            {/* Daily Practice Tests */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Daily Practice Tests</h2>
                <p className="text-gray-600">Master topics with focused practice tests</p>
              </div>

              {practiceTests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
                  <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Practice Tests Yet</h3>
                  <p className="text-gray-500 text-sm">Practice tests for this exam will be available soon.</p>
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
