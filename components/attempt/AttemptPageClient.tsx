'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  StartAttemptData,
  attemptDetailsToRunnerData,
  getMockTestAttempt,
  SubmitAttemptResult,
} from '@/lib/api/attempts';
import { readCachedAttempt, clearCachedAttempt } from '@/lib/attempt-storage';
import { computeAttemptSecondsLeft } from '@/lib/attempt-sessions';
import { loadMathpix } from './MathpixBoundary';
import MockTestRunner from './MockTestRunner';
import MockTestResults from './MockTestResults';

interface AttemptPageClientProps {
  attemptId: string;
}

export default function AttemptPageClient({ attemptId }: AttemptPageClientProps) {
  const router = useRouter();

  const [attemptData, setAttemptData] = useState<StartAttemptData | null>(null);
  const [initialSeconds, setInitialSeconds] = useState<number>(0);
  const [initialPaused, setInitialPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<SubmitAttemptResult | null>(null);
  const [resultLanguage, setResultLanguage] = useState<'en' | 'ml'>('en');

  // The cache only paints the first frame; the server owns the clock, so the
  // timer is always reconciled before the countdown is handed to the runner.
  useEffect(() => {
    void loadMathpix();
    let isMounted = true;

    getMockTestAttempt(attemptId)
      .then((details) => {
        if (!isMounted) return;

        if (details.status === 'SUBMITTED' || details.status === 'EXPIRED') {
          clearCachedAttempt(attemptId);
          router.replace(`/dashboard/attempt/${attemptId}/result`);
          return;
        }

        const data = attemptDetailsToRunnerData(details);
        setAttemptData(data);
        setInitialSeconds(
          details.timeRemaining ?? computeAttemptSecondsLeft(data)
        );
        setInitialPaused(details.status === 'PAUSED');
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(err);

        // Offline or a flaky network: fall back to the payload we launched with
        // so an in-flight test is not lost.
        const cached = readCachedAttempt(attemptId);
        if (cached) {
          setAttemptData(cached);
          setInitialSeconds(computeAttemptSecondsLeft(cached));
          setLoading(false);
          return;
        }

        setError(
          err?.response?.data?.message ||
            'Unable to load this attempt. It may have already been submitted or expired.'
        );
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [attemptId, router]);

  useEffect(() => {
    if (!result && typeof window !== 'undefined') {
      const onBeforeUnload = (e: BeforeUnloadEvent) => {
        if (!attemptData || result) return;
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', onBeforeUnload);
      return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }
  }, [attemptData, result]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !attemptData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Attempt unavailable</h1>
        <p className="text-gray-600 mb-6 max-w-md">{error || 'Something went wrong.'}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-5 py-2.5 rounded-md bg-teal-600 text-white hover:bg-teal-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <MockTestResults
        result={result}
        mockTestData={attemptData.mockTestData}
        questions={attemptData.questions}
        initialLanguage={resultLanguage}
      />
    );
  }

  return (
    <MockTestRunner
      attemptId={attemptData.attemptId}
      mockTestData={attemptData.mockTestData}
      questions={attemptData.questions}
      initialSecondsLeft={initialSeconds}
      initialPaused={initialPaused}
      onSubmitted={(r, lang, sessions) => {
        clearCachedAttempt(attemptId);
        if (sessions?.length) {
          setAttemptData((prev) =>
            prev
              ? {
                  ...prev,
                  mockTestData: { ...prev.mockTestData, sessions },
                }
              : prev
          );
        }
        setResultLanguage(lang);
        setResult(r);
      }}
    />
  );
}
