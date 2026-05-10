'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  StartAttemptData,
  resumeAttempt,
  SubmitAttemptResult,
} from '@/lib/api/attempts';
import MockTestRunner from './MockTestRunner';
import MockTestResults from './MockTestResults';

interface AttemptPageClientProps {
  attemptId: string;
}

const STORAGE_KEY_PREFIX = 'ezp:mockAttempt:';

function readCachedAttempt(attemptId: string): StartAttemptData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${attemptId}`);
    return raw ? (JSON.parse(raw) as StartAttemptData) : null;
  } catch {
    return null;
  }
}

function computeInitialSeconds(startedAt: string, durationInMinutes: number, override?: number): number {
  if (typeof override === 'number') return Math.max(0, override);
  const startMs = new Date(startedAt).getTime();
  if (Number.isNaN(startMs)) return durationInMinutes * 60;
  const elapsedSec = Math.floor((Date.now() - startMs) / 1000);
  return Math.max(0, durationInMinutes * 60 - elapsedSec);
}

export default function AttemptPageClient({ attemptId }: AttemptPageClientProps) {
  const router = useRouter();

  const [attemptData, setAttemptData] = useState<StartAttemptData | null>(null);
  const [initialSeconds, setInitialSeconds] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<SubmitAttemptResult | null>(null);
  const [resultLanguage, setResultLanguage] = useState<'en' | 'ml'>('en');

  useEffect(() => {
    let isMounted = true;

    const cached = readCachedAttempt(attemptId);
    if (cached) {
      const secs = computeInitialSeconds(cached.mockTestData.startedAt, cached.mockTestData.durationInMinutes);
      setAttemptData(cached);
      setInitialSeconds(secs);
      setLoading(false);
      return;
    }

    resumeAttempt(attemptId)
      .then((data) => {
        if (!isMounted) return;
        setAttemptData({
          attemptId: data.attemptId,
          mockTestData: data.mockTestData,
          questions: data.questions,
        });
        setInitialSeconds(data.timeRemaining);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(err);
        setError(
          err?.response?.data?.message ||
            'Unable to load this attempt. It may have already been submitted or expired.'
        );
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [attemptId]);

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
      onSubmitted={(r, lang) => {
        try {
          sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${attemptId}`);
        } catch {
          // ignore
        }
        setResultLanguage(lang);
        setResult(r);
      }}
    />
  );
}
